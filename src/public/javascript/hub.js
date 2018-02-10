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
 const clone = require('ramda/src/clone');

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
        currentUser: '',
        timeoutId: 0,
        subscriptions: [],
        loaders: [],
        data: {},
        datasources: {}
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
        getData: (state) => (filter, datasource) => {
            if (!state.data[datasource]) {
                console.log(`getData: datasource ${datasource} doesn't exist.`);
                return [];
            }
            const filt = filters.clean(filter, state.currentUser);
            let data = sift(filt, state.data[datasource].map((d) =>
                Object.assign({}, d, d._id)
            ));
            return data;
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
        changeDatasource(state, datasource) {
            const ds = clone(datasource);
            state.datasources[datasource.name] = datasource;
        },
        setDatasources(state, datasources) {
            state.datasources = clone(datasources);
        }
    },
    actions: {
        // Call when page first loads
        async startProcess(context) {
            // load fields from server
            const fields = await api.getFieldList();
            context.commit('setFields', fields);
            context.dispatch('nextUpdate', 10 * 1000);
        },

        async nextUpdate(context, ms) {
            console.log(`Refresh at ${moment()}`);
            // Load data from server
            context.state.datasources.forEach(async function(source) {
                const data = await loadData(getParams(source));
                console.log(data);
                context.commit('updateData', {
                    newData: data, datasource: source.name
                });
            });

            // and schedule the next update
            let timeout = setTimeout(function next() {
                context.dispatch('nextUpdate', ms);
            }, ms);
            context.commit({
                type: 'setTimeoutId',
                amount: timeout
            });
        }
    }
});

export const getField = store.getters.field;


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

function getParams(datasource) {
    const params = {
        filter: filters.clean(datasource.filter, store.state.currentUser),
        fields: datasource.fields,
        groupBy: datasource.groupBy
    };
    const paramsOld = {
        filter: {
            // agentGroup: {
            //     $in: ['Customer Care', 'Sales'],
            // },
            agentUsername: {
                $eq: store.state.currentUser.trim()
            },
            date: {
                start: moment().startOf('month').format(),
                end:   moment().endOf('month').format(),
            },
        },
        fields: {
            sum: ['calls', 'handleTime', 'acwTime']
        },
        groupBy: ['agentUsername', 'skill', 'dateDay']
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
    console.log(cleaned);
    return cleaned;
}
