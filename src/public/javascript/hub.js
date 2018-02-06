/**
 * This module controls interaction with the server.
 *
 * Data is made accessible through the `store` Vuex object, which all Vue
 * components can access.
 */

 import * as api from './api';
 import * as filters from './filters';
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
        fields: static_fields,
        editMode: true,
        ahtData: [],
        currentUser: '',
        timeoutId: 0
    },
    getters: {
        field: (state) => (name) => {
            return state.fields.find((f) => f.name == name);
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
        }
    },
    actions: {
        // Call when page first loads
        async startProcess(context) {
            // load fields from server
            const fields = await api.getFieldList();
            console.log(fields);
            context.commit('setFields', fields);
            context.dispatch('nextUpdate');
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


export async function loadData() {
    const params = {
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

    const data = await api.getStatistics(params);
    const cleaned = data.map((d) => {
        d['dateDay'] = moment(d['dateDay']).toDate();
        d._id.dateDay = moment(d._id.dateDay).toDate();
        return d;
    });

    return cleaned;
}
