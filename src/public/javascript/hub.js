/**
 * - THE HUB in the MIDDLE of IT ALL -
 *
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access.
 */
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as api from './api';
import * as filters from './filters';

const clone = require('ramda/src/clone');
const intersection = require('ramda/src/intersection');
const isEmpty = require('ramda/src/isEmpty');
const uniq = require('ramda/src/uniq');
const sift = require('sift');


/**
 * This Vuex store is the ultimate source of truth. It handles all access to
 * data and interactions with the server.
 *
 * Also included here are global-impacting settings like Edit Mode and user
 * data.
 *
 * @type {Vuex}
 */
export const store = new Vuex.Store({
    state: {
        data: {},
        datasources: {},
        editMode: false,
        fields: [],
        goals: [],
        links: [],
        skillGroups: [],
        supMode: 'individual', // team or individual: default to indie (agents)
        timeoutId: null,
        currentUser: '', // username. TODO: is this used?
        selectedUsers: [],
        user: {},
        userList: [], // list of all users for supervisor views
        layouts: [], // list of available layouts
        layout: {}, // currently selected layout
    },

    // Helper functions to retrieve data
    getters: {
        /**
         * Return field object matching the field name.
         * @param  {String} fieldName name in `source.name` or just `name` format
         * @return {Object}  field object
         */
        field: (state) => (fieldName) => {
            return state.fields.find((f) => f.fullName == fieldName)
                || state.fields.find((f) => f.name == fieldName);
        },
        layout: (state) => (layoutName) => {
            return state.layouts.find((l) => l.name == layoutName);
        },
        rawFieldName: (state) => (fullFieldName) => {
            let [source, field] = fullFieldName.split('.');
            if (!field) throw new Error(`Hub.rawFieldName: "${fullFieldName}" is not a valid full field name!`);
            return field;
        },
        getData: (state) => (filter, datasource) => {
            if (!state.data[datasource]) {
                console.log(`getData: datasource ${datasource} doesn't exist.`);
                return [];
            }
            if (!filter) {
                console.log(`getData: filter not defined.`);
                return [];
            }
            const filt = filters.clean(filter, state.currentUser);
            let data = sift(filt, state.data[datasource]);
            return data.map((datum) => {
                delete datum._id;
                return datum;
            });
        },
        goalForField: (state) => (field) => {
            return state.goals.filter((goal) =>
                goal.field == field.name
            )[0];
        },
        getDatasource: (state) => (datasourceName) => {
            let ds = Object.entries(state.datasources).find(([id, ds]) => {
                return ds.name == datasourceName;
            })[1];
            return ds;
        },
        // Returns current user for agent, or selected users in supervisor team
        // mode
        currentUsers: (state) => {
            if (state.selectedUsers.length > 0) return state.selectedUsers;
            else return [state.user];
        },
        currentSkills: (state, getters) => {
            return usersToSkills(state.skillGroups, getters.currentUsers)
        },
        nameFromUsername: (state) => (username) => {
            let user = state.userList.find((u) => u.username == username);
            return `${user.firstName} ${user.lastName}`;
        }
    },

    // Functions to modify the store's state (all synchronous)
    mutations: {
        toggleEditMode(state) {
            state.editMode = !state.editMode;
        },
        updateData(state, { newData, frontendDatasourceName }) {
            Vue.set(state.data, frontendDatasourceName, newData);
        },
        /**
         * Set a group of selected users for supervisor mode
         * @param {Object} state
         * @param {Array} usersList array of objects with fields username, firstName, lastName
         */
        setSelectedUsers(state, usersList) {
            state.selectedUsers = usersList;
        },
        /**
         * Set the current username and user information
         * @param  {Object} state
         * @param  {String} user new user object
         */
        setUser(state, user) {
            state.currentUser = user.username;
            state.user = clone(user);
        },
        setUserList(state, users) {
            state.userList = users;
        },
        setTimeoutId(state, id) {
            state.timeoutId = id;
        },
        setSupMode(state, newMode) {
            state.supMode = newMode;
        },
        setFields(state, fields) {
            state.fields = fields;
        },
        setSkillGroups(state, skillGroups) {
            state.skillGroups = skillGroups;
        },
        setGoals(state, goals) {
            state.goals = goals;
        },
        setLinks(state, links) {
            state.links = links.sort((a, b) => a.name > b.name);
        },
        // Update list of available layouts
        setLayouts(state, layouts) {
            state.layouts = layouts;
        },
        // Update currently chosen layout
        setLayout(state, layout) {
            state.layout = layout;
        },
        changeDatasourceLastUpdated(state, { datasourceId, lastUpdated }) {
            let ds = clone(state.datasources[datasourceId]);
            ds.lastUpdated = lastUpdated;
            Vue.set(state.datasources, datasourceId, ds);
        },
        /**
         * Store datasources. Saved in { id: {Object} } form, in contrast to array of
         * datasource objects stored in database.
         * @param {Object} state
         * @param {Array}  datasources array of datasource objects from server
         */
        setDatasources(state, datasources) {
            state.datasources = clone(datasources).reduce((newObj, source) => {
                newObj[source.id] = source;
                return newObj;
            }, {});
        }
    },

    // Asynchronous actions
    actions: {
        // Call when page first loads
        async updateUser(context, username) {
            let user = await api.getUserInformation(username);
            context.commit('setUser', user);
            context.dispatch('updateGoals');
        },
        // Load the dashboard up. Assumes `updateUser` has already completed.
        async startProcess(context) {
            // Load configuration and set layout
            await context.dispatch('loadAssets');
            context.dispatch('updateLayout', context.state.layouts[0]);
            // Start updating based on data sources
            context.dispatch('nextUpdate');
        },

        async loadAssets(context) {
            // load layout
            let agentGroups = extractValues(context.getters.currentUsers, 'agentGroups');
            let layouts = await api.getLayouts(agentGroups, context.state.supMode);
            context.commit('setLayouts', layouts);
            // load fields and helpful links from server
            context.commit('setFields', await api.getFieldList());
            context.commit('setSkillGroups', await api.getSkillGroups());
            context.commit('setLinks', await api.getLinkList());
            // load in goals
            context.dispatch('updateGoals');
        },

        // Refresh data and layout. Used after changing agent selection in sup
        // views.
        async forceRefresh(context, layout=null) {
            let newLayout = layout || context.state.layouts[0];
            clearTimeout(context.state.timeoutId);
            // load assets and new layout 
            await context.dispatch('loadAssets');
            context.dispatch('updateLayout', newLayout);
            // Refresh data
            context.dispatch('nextUpdate');
        },

        async updateGoals(context) {
            let groups = extractValues(context.getters.currentUsers, 'agentGroups');
            let goals = await api.getGoalsForAgentGroups(groups);
            context.commit('setGoals', goals);
        },

        updateLayout(context, layout) {
            // Then update to the passed-in layout
            context.commit('setLayout', layout);
            context.commit('setDatasources', layout.datasources);
        },

        // Refresh data based on current datasources every 290 seconds.
        // This will trigger all the widgets to refreshing, hitting the getData
        // method of the "hub".
        async nextUpdate(context, refreshRateMs=290000) {
            console.log(`Refresh at ${moment()}`);
            if (!context.state.currentUser) {
                console.log('No current user assigned. Skipping update.');
                return;
            }

            // Array of result objects with keys `data`, `meta`, and
            // `datasourceName`
            let newData = [];

            // Create list of parameters and datasource information for requests
            // to server
            let parametersList = Object.entries(context.state.datasources).map(
                ([id, datasource]) => {
                    return Object.assign(
                        { frontendSourceName: datasource.name },
                        clone(datasource),
                        getParams(datasource)
                    );
                }
            );

            // Load data from server
            try {
                let response = await loadData(parametersList);
                // update the datas real quick
                for (let dataset of response) {
                    context.commit('updateData', {
                        newData: dataset.data,
                        frontendDatasourceName: dataset.source.frontendSourceName
                    });
                    if (!isEmpty(dataset.meta)) {
                        context.commit('changeDatasourceLastUpdated', {
                            datasourceId: dataset.source.id, lastUpdated: dataset.meta.lastUpdated
                        });
                    }
                }
            } catch (err) {
                console.log(`Error while loading data: ${err}`);
            }

            // and schedule the next update
            let timeout = setTimeout(function next() {
                context.dispatch('nextUpdate', refreshRateMs);
            }, refreshRateMs);
        },

        // Save a new theme to server
        async updateTheme(context, newTheme) {
            await api.updateUserTheme(context.state.currentUser, newTheme);
            let updatedUser = clone(context.state.user);
            updatedUser.theme = newTheme;
            context.commit('setUser', updatedUser);
        }
    }
});

export const getField = store.getters.field;


function getParams(datasource) {
    const params = {
        filter: filters.clean(datasource.filter, store.state.currentUser),
        fields: datasource.fields,
        groupBy: datasource.groupBy,
        source: datasource.source
    };
    return params;
}

export async function loadData(params) {
    let res = await api.getStatistics(params);
    // convert date strings to values
    res = res.map((set) => {
        set.data = set.data.map((d) => {
            if (d['dateDay']) d['dateDay'] = moment(d['dateDay']).toDate();
            if (d['date']) d['date'] = moment(d['date']).toDate();
            return d;
        });
        return set;
    });
    return res;
}

function usersToSkills(skillGroups, users) {
    let agentGroups = extractValues(users, 'agentGroups');
    return extractValues(
        skillGroups.filter((skillGroup) =>
            intersection(skillGroup.agentGroups, agentGroups).length > 0
        ),
        'skills'
    );
}

/**
 * This function takes a list of objects, each of which has a property which is
 * an array, and returns all of the unique values in the given property's arrays.
 * @param  {Array} objectArray
 * @param  {String} prop
 * @return {Array} array of unique values in each object's @param prop
 */
export function extractValues(objectArray, prop) {
    return uniq(
        objectArray.reduce((resultArr, el) => resultArr.concat(el[prop]), [])
    );
}
