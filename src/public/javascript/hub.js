/**
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access.
 */

 import * as api from './api';
 import * as filters from './filters';
 import * as parse from './parse';
 const sift = require('sift');

 const static_fields = [
     // Date
     {
         displayName: 'Date',
         name: 'Date',
         hasGoal: false,
         goal: 0,
         goalThresholds: [],
         comparator: '',
         descriptor: '',
         format: {
             type: 'Time',
             string: 'M/D/YYYY'
         }
     },
     // Sales close rate
     {
         displayName: 'Close Rate',
         name: 'Close Rate',
         hasGoal: true,
         goal: 0.55,
         goalThresholds: [
             0.45,
             0.50,
             0.55
         ],
         comparator: '>=',
         descriptor: 'See these tips for greatest close rates!',
         format: {
             type: 'Number',
             string: '.2%'
         }
     },
     // DIRECTV sales count
     {
         displayName: 'DIRECTV Sales',
         name: 'DIRECTV Sales',
         hasGoal: true,
         goal: 1,
         goalThresholds: [],
         comparator: '>=',
         descriptor: 'See these tips for greatest DTV Sales!',
         format: {
             type: 'Number',
             string: 'd'
         }
     },
     // AHT - Average Handle Time
     {
         displayName: 'AHT',
         name: 'AHT',
         calculation: '{handleTime} / {calls}',
         hasGoal: true,
         goal: 600,
         goalThresholds: [

         ],
         comparator: '<=',
         descriptor: 'See these tips for ways to lower handle time!',
         format: {
             type: 'Time',
             string: 'm:ss'
         }
     },
     // ACW - After Call Work
     {
         displayName: 'ACW',
         name: 'ACW',
         calculation: '{acwTime} / {calls}',
         hasGoal: true,
         goal: 30,
         goalThresholds: [

         ],
         comparator: '<=',
         descriptor: 'See these tips for ways to lower ACW!',
         format: {
             type: 'Time',
             string: 'm:ss'
         }
     }
];


/**
 * Vuex is used to see if app is in edit mode (editMode Boolean), and store
 * field (meta) data.
 * @type {Vuex}
 */
export const store = new Vuex.Store({
    state: {
        fields: [],
        editMode: true,
        ahtData: [],
        currentUser: '',
        timeoutId: 0,
        subscriptions: [],
        loaders: [],
    },
    getters: {
        /**
         * Return field object from
         * @param  {String} fullFieldName name in `source.name` format
         * @return {Object}  field object
         */
        field: (state) => (fullFieldName) => {
            return state.fields.find((f) => f.fullName == fullFieldName);
        },
        getData: (state) => (filter, field) => {
            const filt = filters.clean(filter, state.currentUser);
            let data = sift(filt, state.ahtData.map((d) =>
                Object.assign({}, d, d._id)
            ));
            return data;
        }
    },
    mutations: {
        toggleEditMode(state) {
            state.editMode = !state.editMode;
        },
        updateData(state, newData) {
            state.ahtData = newData;
        },
        /**
         * Set the current user
         * @param  {Object} state
         * @param  {String} newUsername
         */
        updateUser(state, newUsername) {
            state.currentUser = newUsername;
        },
        setTimeoutId(state, id) {
            state.timeoutId = id;
        },
        setFields(state, fields) {
            state.fields = fields;
        },
        subscribeTo(state, parameters) {
            state.subscriptions.push(parameters);
        },

    },
    actions: {
        // Call when page first loads
        async startProcess(context) {
            // load fields from server
            const fields = await api.getFieldList();
            context.commit('setFields', fields);
            context.dispatch('makeSubscriptions');
            // context.dispatch('nextUpdate');
        },

        async makeSubscriptions(context) {
            context.state.subscriptions.map((sub) => {
                context.dispatch('makeSubscription', sub);
            })
            // const loaders = context.state.subscriptions
            // .map(function({ fieldNames, filter, groupBy }) {
            //     const fieldsInitial = fieldNames.map(function(name) {
            //                     return state.fields.find((f) => f.fullName == name)
            //                 });
            //     const fields = parse.fieldsToServer(fieldsInitial);
            //     const loader = {
            //         refreshRate: 0,
            //         parameters: {
            //             fields: fields,
            //             filter: filters.clean(filter),
            //             groupBy: groupBy
            //         }
            //     };
            //     loader.refreshRate = state.fields.reduce((min, f) =>
            //                     Math.min(min, f.refreshRate), Infinity);
            //     return loader;
            // });
            // loaders.forEach((loader) => {
            //     state.commit('')
            // });
        },

        async makeSubscription(context, { fieldNames, filter, groupBy}) {
            const fieldsInitial = fieldNames.map(function(name) {
                        return context.state.fields.find((f) => f.fullName == name)
                    });
            const params = {
                filter: filters.clean(filter, context.state.currentUser),
                groupBy: groupBy,
                fields: {
                    sum: parse.fieldsToServer(fieldsInitial)
                }
            }
            console.log(params);
            context.commit('updateData', await loadData(params));


            // const params = {
            //     filter: {
            //         // agentGroup: {
            //         //     $in: ['Customer Care', 'Sales'],
            //         // },
            //         agentUsername: {
            //             $eq: store.state.currentUser.trim()
            //         },
            //         date: {
            //             start: moment().startOf('month').format(),
            //             end:   moment().endOf('month').format(),
            //         },
            //     },
            //     fields: {
            //         sum: ['calls', 'handleTime', 'acwTime']
            //     },
            //     groupBy: ['agentUsername', 'skill', 'dateDay']
            // };
        },

        async repeatingUpdate(context, ms) {
            console.log(`Refresh at ${moment()}`);
            // Load data from server
            const data = await loadData();
            console.log(data);
            context.commit('updateData', data);

            // and schedule the next update
            let timeout = setTimeout(function next() {
                context.dispatch('repeatingUpdate', ms);
            }, ms);
            context.commit({
                type: 'setTimeoutId',
                amount: timeout
            });
        },

        // Call for each update from server
        async nextUpdate(context) {
            console.log(`Refresh at ${moment()}`);
            // Load data from server
            const data = await loadData();
            console.log(data);
            context.commit('updateData', data);

            // and schedule the next update
            const frequencySeconds = 60;
            let timeout = setTimeout(function next() {
                context.dispatch('nextUpdate');
            }, frequencySeconds * 1000);
            context.commit({
                type: 'setTimeoutId',
                amount: timeout
            });
        }
    }
});

export const getField = store.getters.field;

export async function loadData(params) {


    const data = await api.getStatistics(params);
    const cleaned = data.map((d) => {
        d['dateDay'] = moment(d['dateDay']).toDate();
        d._id.dateDay = moment(d._id.dateDay).toDate();
        return d;
    });
    console.log(cleaned);
    return cleaned;
}
