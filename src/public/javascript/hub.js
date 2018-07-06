/**
 * - THE HUB in the MIDDLE of IT ALL -
 *
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access. The `getData` "getter" method returns data based on a
 * given filter & datasource requested.
 */
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as api from './api';
import * as filters from './filters';

const clone = require('ramda/src/clone');
const intersection = require('ramda/src/intersection');
const isEmpty = require('ramda/src/isEmpty');
const moment = require('moment');
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
        chosenLayoutName: '',
        selectedDate: ''
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
        goalForField: (state) => (field, skillGroup=null) => {
            function match(goal) {
                if (skillGroup) {
                    return (goal.field == field.name
                            && goal.skillGroups.includes(skillGroup));
                } else {
                    return (goal.field == field.name);
                }
            }
            return state.goals.filter(match)[0];
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
            if (user) return `${user.firstName} ${user.lastName}`;
            return username;
        },
        // Determine what layout should be displayed
        getCurrentLayout: (state) => {
            // If a layout has been selected, return it
            if (state.supMode == 'team' && state.chosenLayoutName != '') {
                return state.layouts.find(l => l.name == state.chosenLayoutName);
            // Default to first layout in list
            } else {
                return state.layouts[0];
            }
        },
        // Returns user's selected "as of" date, or null if none has been chosen
        getSelectedDate: (state) => () => {
            return state.selectedDate ? moment(state.selectedDate) : null;
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
        setChosenLayoutName(state, name) {
            state.chosenLayoutName = name;
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
        },
        //
        /**
         * Select a given date
         * @param {Object} state
         * @param {String} date in `yyyy-mm-dd` format
         */
        setSelectedDate(state, date) {
            state.selectedDate = date;
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
            // determine initial layout
            let layout;
            let format = (name) => name.replace(/ /g, '-').toLowerCase();
            let name = getInitialLayout();
            if (name) {
                let matches = context.state.layouts.filter((l) => {
                    return format(l.name) == format(name);
                });
                layout = matches[0] || context.state.layouts[0];
            } else {
                layout = context.state.layouts[0];
            }
            context.dispatch('updateLayout', layout);
            context.commit('setChosenLayoutName', layout.name);
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
            // load user list
            context.commit('setUserList', await api.getUsers());
        },

        // Refresh data and layout. Used after changing agent selection in sup
        // views.
        async forceRefresh(context, layout=null) {
            // load assets and new layout
            await context.dispatch('loadAssets');
            context.dispatch('updateLayout', context.getters.getCurrentLayout);
            // Refresh data
            context.dispatch('nextUpdate');
        },

        async updateGoals(context) {
            // Load all goals for team views, or filter by agent group for individuals
            let goals;
            if (context.state.layout.layoutType == 'team') {
                goals = await api.getGoalList();
            } else {
                let groups = extractValues(context.getters.currentUsers, 'agentGroups');
                goals = await api.getGoalsForAgentGroups(groups);
            }
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
            clearTimeout(context.state.timeoutId);
            let timeout = setTimeout(function next() {
                context.dispatch('nextUpdate', refreshRateMs);
            }, refreshRateMs);
            context.commit('setTimeoutId', timeout);
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

/**
 * Get data from server.
 * @param  {Array} params list of requests
 * @return {Array} array of data (including metadata about sources)
 */
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

/**
 * Given a list of users, return array of all skills that are within their groups.
 * @param  {Array} skillGroups array of skillGroup definitions
 * @param  {Array} users
 * @return {Array} list of skills taken by anyone in @param users
 */
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

/**
 * Return initial layout if passed in as a URL parameter. Otherwise, blank string.
 * @return {String}
 */
export function getInitialLayout() {
    let q = document.location.search.replace('?', '');
    return q.split('&').reduce((layout, current) => {
        let [key, val] = current.split('=');
        if (key == 'layout') return val;
        return layout;
    }, '');
}
