/**
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
const sift = require('sift');
const clone = require('ramda/src/clone');
const isEmpty = require('ramda/src/isEmpty');


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
        fields: [],
        editMode: false,
        currentUser: '',
        user: {},
        data: {},
        datasources: {},
        timeoutIds: {},
        goals: [],
        links: []
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
        }
    },

    // Functions to modify the store's state (all synchronous)
    mutations: {
        toggleEditMode(state) {
            state.editMode = !state.editMode;
        },
        updateData(state, { newData, datasource }) {
            Vue.set(state.data, datasource, newData);
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
        setTimeoutId(state, { datasourceName, id }) {
            state.timeoutIds[datasourceName] = id;
        },
        setFields(state, fields) {
            state.fields = fields;
        },
        setGoals(state, goals) {
            state.goals = goals;
        },
        setLinks(state, links) {
            state.links = links.sort((a, b) => a.name > b.name);
        },
        changeDatasource(state, datasource) {
            const ds = clone(datasource);
            Vue.set(state.datasources, ds.id, ds);
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
            let goals = await api.getGoalsForAgentGroups(user.agentGroups);
            context.commit('setGoals', goals);
        },
        async startProcess(context) {
            // load fields and helpful links from server
            context.commit('setFields', await api.getFieldList());
            context.commit('setLinks', await api.getLinkList());
            // Start updating based on data sources
            return context.dispatch('nextUpdate', null);
        },

        // Force a refresh. For testing purposes.
        async forceRefresh(context) {
            for (const [sourceName, id] of Object.entries(context.state.timeoutIds)) {
                clearTimeout(id);
            }
            context.dispatch('startProcess');
        },

        // Refresh data based on current datasources
        async nextUpdate(context, ms) {
            console.log(`Refresh at ${moment()}`);
            if (!context.state.currentUser) {
                console.log('No current user assigned. Skipping update.');
                return;
            }

            for (const [id, source] of Object.entries(context.state.datasources)) {
                // Load data from server
                try {
                    let res = await loadData(getParams(source));
                    let data = res.data;
                    let meta = res.meta;
                    context.commit('updateData', {
                        newData: data, datasource: source.name
                    });
                    if (!isEmpty(meta)) {
                        let ds = clone(source);
                        ds.lastUpdated = meta.lastUpdated;
                        context.commit('changeDatasource', ds);
                    }
                } catch (err) {
                    console.log(`Error while loading data: ${err}`);
                }

                // and schedule the next update
                clearTimeout(context.state.timeoutIds[source.name]); // clear old timeout
                let timeout = setTimeout(function next() {
                    context.dispatch('nextUpdate', source.refreshRate * 1000);
                }, source.refreshRate * 1000);
                context.commit('setTimeoutId', {
                        datasourceName: source.name,
                        id: timeout
                });
            };
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
    res.data = res.data.map((d) => {
        if (d['dateDay']) d['dateDay'] = moment(d['dateDay']).toDate();
        if (d['date']) d['date'] = moment(d['date']).toDate();
        return d;
    });
    return res;
}
