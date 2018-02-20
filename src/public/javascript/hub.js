/**
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access.
 */

import * as api from './api';
import * as filters from './filters';
const sift = require('sift');
const clone = require('ramda/src/clone');


/**
 * Vuex is used to see if app is in edit mode (editMode Boolean), and store
 * field (meta) data.
 * @type {Vuex}
 */
export const store = new Vuex.Store({
    state: {
        fields: [],
        editMode: true,
        currentUser: '',
        userInformation: {},
        data: {},
        datasources: {},
        timeoutIds: {},
    },
    getters: {
        /**
         * Return field object matching the full field name.
         * @param  {String} fullFieldName name in `source.name` format
         * @return {Object}  field object
         */
        field: (state) => (fullFieldName) => {
            if (fullFieldName == 'dateDay' || fullFieldName == 'date') {
                return state.fields.find((f) => f.name == 'dateDay');
            }
            return state.fields.find((f) => f.fullName == fullFieldName);
        },
        /**
         * Return field object matching the raw field name (without source).
         * @param  {String} fullFieldName name in `source.name` format
         * @return {Object}  field object
         */
        fieldFromRawName: (state) => (rawFieldName) => {
            return state.fields.find((f) => f.name == rawFieldName);
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
        }
    },
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
            state.userInformation = clone(user);
        },
        setTimeoutId(state, { datasourceName, id }) {
            state.timeoutIds[datasourceName] = id;
        },
        setFields(state, fields) {
            state.fields = fields;
        },
        changeDatasource(state, datasource) {
            const ds = clone(datasource);
            Vue.set(state.datasources, ds.id, ds);
        },
        /**
         * Store datasources. Saved in { id: {Object} } form, in contrast to array of
         * datasource objects stored in database.
         * @param {Object} state
         * @param {Array}  datasources array of datasource objects
         */
        setDatasources(state, datasources) {
            state.datasources = clone(datasources).reduce((newObj, source) => {
                newObj[source.id] = source;
                return newObj;
            }, {});
        }
    },
    actions: {
        // Call when page first loads
        async startProcess(context) {
            // load fields from server
            const fields = await api.getFieldList();
            context.commit('setFields', fields);
            return context.dispatch('nextUpdate', null);
        },

        async forceRefresh(context) {
            for (const [sourceName, id] of Object.entries(context.state.timeoutIds)) {
                clearTimeout(id);
                console.log(`cleared ${id} for ${sourceName}`);
            }
            context.dispatch('startProcess');
        },

        async updateUser(context, username) {
            context.commit('setUser', await api.getUserInformation(username));
        },

        async nextUpdate(context, ms) {
            console.log(`Refresh at ${moment()}`);
            if (!context.state.currentUser) {
                console.log('No current user assigned. Skipping update.');
                return;
            }

            // Load data from server
            for (const [id, source] of Object.entries(context.state.datasources)) {
                const data = await loadData(getParams(source));
                console.log(data);
                context.commit('updateData', {
                    newData: data, datasource: source.name
                });

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
    console.log(params);
    const data = await api.getStatistics(params);
    const cleaned = data.map((d) => {
        d['dateDay'] = moment(d['dateDay']).toDate();
        d._id.dateDay = moment(d._id.dateDay).toDate();
        return d;
    });
    return cleaned;
}
