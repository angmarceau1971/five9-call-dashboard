import LineGraph from '../components/line-graph.vue';
import DataTable from '../components/data-table.vue';
import Dashboard from '../components/dashboard.vue';
import * as api from './api';
import { formatValue } from './scorecard-format';
import { API_URL } from './local_settings';
import * as filters from './filters';

// Node libraries
const isEmpty = require('ramda/src/isEmpty');
const sift = require('sift');

let ahtData = [
  {
    "_id": {
      "skill": "DISPATCH_IVR_OPT_OUT_APPT_MT",
      "agentUsername": "user@example.com"
    },
    "calls": 1,
    "handleTime": 154
  },
  {
    "_id": {
      "skill": "SALES_RES_TRANSFER_NONCOM",
      "agentUsername": "user@example.com"
    },
    "calls": 2,
    "handleTime": 1046
  },
  {
    "_id": {
      "skill": "RESELLER_RES_SALES_COM",
      "agentUsername": "user@example.com"
    },
    "calls": 1,
    "handleTime": 63
  },
  {
    "_id": {
      "skill": "SALES_RES_VENDOR_TRANSFER_NONCOM",
      "agentUsername": "user@example.com"
    },
    "calls": 1,
    "handleTime": 524
  },
  {
    "_id": {
      "skill": "DISPATCH_IVR_OPT_OUT_APPT_CT",
      "agentUsername": "user@example.com"
    },
    "calls": 2,
    "handleTime": 471
  },
  {
    "_id": {
      "skill": "SALES_RES_COM",
      "agentUsername": "user@example.com"
    },
    "calls": 16,
    "handleTime": 7790
  },
  {
    "_id": {
      "skill": "SALES_RES_SCHEDULE_FUTURE_NONCOM",
      "agentUsername": "user@example.com"
    },
    "calls": 1,
    "handleTime": 10
  },
  {
    "_id": {
      "skill": "SALES_SMB_COM",
      "agentUsername": "user@example.com"
    },
    "calls": 1,
    "handleTime": 226
  },
  {
    "_id": {
      "skill": "SALES_RES_FUTURE_NONCOM",
      "agentUsername": "user@example.com"
    },
    "calls": 4,
    "handleTime": 1200
  },
  {
    "_id": {
      "skill": "CARE_QUESTIONS",
      "agentUsername": "user@example.com"
    },
    "calls": 3,
    "handleTime": 1151
  }
];

let productivityData = [{"Date": "2017-11-01","Productivity": "0.86"}, {"Date": "2017-11-02","Productivity": "0.86"}, {"Date": "2017-11-03","Productivity": "0.86"}, {"Date": "2017-11-04","Productivity": "0.92"}, {"Date": "2017-11-05","Productivity": "0.84"}, {"Date": "2017-11-06","Productivity": "N/A"}, {"Date": "2017-11-07","Productivity": "N/A"}, {"Date": "2017-11-08","Productivity": "0.86"}, {"Date": "2017-11-09","Productivity": "0.93"}, {"Date": "2017-11-10","Productivity": "0.93"}, {"Date": "2017-11-11","Productivity": "0.87"}, {"Date": "2017-11-12","Productivity": "0.86"}, {"Date": "2017-11-13","Productivity": "N/A"}, {"Date": "2017-11-14","Productivity": "N/A"}, {"Date": "2017-11-15","Productivity": "0.86"}, {"Date": "2017-11-16","Productivity": "0.84"}, {"Date": "2017-11-17","Productivity": "0.93"}, {"Date": "2017-11-18","Productivity": "0.92"}, {"Date": "2017-11-19","Productivity": "0.84"}, {"Date": "2017-11-20","Productivity": "N/A"}, {"Date": "2017-11-21","Productivity": "N/A"}, {"Date": "2017-11-22","Productivity": "0.86"}, {"Date": "2017-11-23","Productivity": "0.79"}, {"Date": "2017-11-24","Productivity": "0.88"}, {"Date": "2017-11-25","Productivity": "0.90"}, {"Date": "2017-11-26","Productivity": "0.80"}, {"Date": "2017-11-27","Productivity": "N/A"}, {"Date": "2017-11-28","Productivity": "N/A"}, {"Date": "2017-11-29","Productivity": "0.83"}, {"Date": "2017-11-30","Productivity": "0.83"}]


let dtvData = [{"Date": "2017-11-01","DIRECTV Sales": "2","Rolling Total": "2","Pacing": "1.36","Delta": "1"}, {"Date": "2017-11-02","DIRECTV Sales": "0","Rolling Total": "2","Pacing": "2.73","Delta": "-1"}, {"Date": "2017-11-03","DIRECTV Sales": "1","Rolling Total": "3","Pacing": "4.09","Delta": "-1"}, {"Date": "2017-11-04","DIRECTV Sales": "4","Rolling Total": "7","Pacing": "5.45","Delta": "2"}, {"Date": "2017-11-05","DIRECTV Sales": "4","Rolling Total": "11","Pacing": "6.82","Delta": "4"}, {"Date": "2017-11-06","DIRECTV Sales": "N/A","Rolling Total": "11","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-07","DIRECTV Sales": "N/A","Rolling Total": "11","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-08","DIRECTV Sales": "3","Rolling Total": "14","Pacing": "8.18","Delta": "6"}, {"Date": "2017-11-09","DIRECTV Sales": "3","Rolling Total": "17","Pacing": "9.55","Delta": "7"}, {"Date": "2017-11-10","DIRECTV Sales": "0","Rolling Total": "17","Pacing": "10.91","Delta": "6"}, {"Date": "2017-11-11","DIRECTV Sales": "4","Rolling Total": "21","Pacing": "12.27","Delta": "9"}, {"Date": "2017-11-12","DIRECTV Sales": "0","Rolling Total": "21","Pacing": "13.64","Delta": "7"}, {"Date": "2017-11-13","DIRECTV Sales": "N/A","Rolling Total": "21","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-14","DIRECTV Sales": "N/A","Rolling Total": "21","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-15","DIRECTV Sales": "2","Rolling Total": "23","Pacing": "15","Delta": "8"}, {"Date": "2017-11-16","DIRECTV Sales": "4","Rolling Total": "27","Pacing": "16.36","Delta": "11"}, {"Date": "2017-11-17","DIRECTV Sales": "0","Rolling Total": "27","Pacing": "17.73","Delta": "9"}, {"Date": "2017-11-18","DIRECTV Sales": "0","Rolling Total": "27","Pacing": "19.09","Delta": "8"}, {"Date": "2017-11-19","DIRECTV Sales": "1","Rolling Total": "28","Pacing": "20.45","Delta": "8"}, {"Date": "2017-11-20","DIRECTV Sales": "N/A","Rolling Total": "28","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-21","DIRECTV Sales": "N/A","Rolling Total": "28","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-22","DIRECTV Sales": "0","Rolling Total": "28","Pacing": "21.82","Delta": "6"}, {"Date": "2017-11-23","DIRECTV Sales": "3","Rolling Total": "31","Pacing": "23.18","Delta": "8"}, {"Date": "2017-11-24","DIRECTV Sales": "0","Rolling Total": "31","Pacing": "24.55","Delta": "6"}, {"Date": "2017-11-25","DIRECTV Sales": "4","Rolling Total": "35","Pacing": "25.91","Delta": "9"}, {"Date": "2017-11-26","DIRECTV Sales": "2","Rolling Total": "37","Pacing": "27.27","Delta": "10"}, {"Date": "2017-11-27","DIRECTV Sales": "N/A","Rolling Total": "37","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-28","DIRECTV Sales": "N/A","Rolling Total": "37","Pacing": "N/A","Delta": "N/A"}, {"Date": "2017-11-29","DIRECTV Sales": "2","Rolling Total": "39","Pacing": "28.64","Delta": "10"}, {"Date": "2017-11-30","DIRECTV Sales": "2","Rolling Total": "41","Pacing": "30","Delta": "11"}]


let closeRateData = [{"Date": "2017-11-01","Close Rate": "0.59","Sales": "24","Calls": "62"}, {"Date": "2017-11-02","Close Rate": "0.50","Sales": "25","Calls": "68"}, {"Date": "2017-11-03","Close Rate": "0.40","Sales": "17","Calls": "42"}, {"Date": "2017-11-04","Close Rate": "0.40","Sales": "25","Calls": "62"}, {"Date": "2017-11-05","Close Rate": "0.37","Sales": "20","Calls": "53"}, {"Date": "2017-11-06","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-07","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-08","Close Rate": "0.51","Sales": "24","Calls": "54"}, {"Date": "2017-11-09","Close Rate": "0.58","Sales": "16","Calls": "28"}, {"Date": "2017-11-10","Close Rate": "0.44","Sales": "20","Calls": "45"}, {"Date": "2017-11-11","Close Rate": "0.57","Sales": "17","Calls": "30"}, {"Date": "2017-11-12","Close Rate": "0.41","Sales": "17","Calls": "41"}, {"Date": "2017-11-13","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-14","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-15","Close Rate": "0.56","Sales": "23","Calls": "41"}, {"Date": "2017-11-16","Close Rate": "0.35","Sales": "18","Calls": "51"}, {"Date": "2017-11-17","Close Rate": "0.41","Sales": "17","Calls": "41"}, {"Date": "2017-11-18","Close Rate": "0.58","Sales": "20","Calls": "35"}, {"Date": "2017-11-19","Close Rate": "0.59","Sales": "15","Calls": "25"}, {"Date": "2017-11-20","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-21","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-22","Close Rate": "0.58","Sales": "25","Calls": "43"}, {"Date": "2017-11-23","Close Rate": "0.44","Sales": "22","Calls": "51"}, {"Date": "2017-11-24","Close Rate": "0.50","Sales": "23","Calls": "46"}, {"Date": "2017-11-25","Close Rate": "0.51","Sales": "22","Calls": "43"}, {"Date": "2017-11-26","Close Rate": "0.36","Sales": "15","Calls": "41"}, {"Date": "2017-11-27","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-28","Close Rate": "N/A","Sales": "0","Calls": "0"}, {"Date": "2017-11-29","Close Rate": "0.38","Sales": "16","Calls": "42"}, {"Date": "2017-11-30","Close Rate": "0.47","Sales": "26","Calls": "55"}]


const closeRate = {
    title: 'Close Rate',
    id: 'card:0',
    layoutOrder: 0,
    columns: 1
};
closeRate.data = closeRateData;
closeRate.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'Close Rate',
        'value': 0.5561
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'Close Rate',
        'value': 0.5047
    },
    {
        'id': 'widget:2',
        'component': 'line-graph',
        'fields': {
            x: 'Date',
            y: 'Close Rate'
        }
    }
];

const dtv = {
    title: 'DIRECTV Sales',
    id: 'card:1',
    layoutOrder: 1,
    columns: 2
};
dtv.data = dtvData;
dtv.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'DIRECTV Sales',
        'value': 1
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'DIRECTV Sales',
        'value': 23
    },
    {
        'id': 'widget:2',
        'component': 'line-graph',
        'fields': {
            x: 'Date',
            y: 'DIRECTV Sales'
        }
    },
];

const aht = {
    title: 'Average Handle Time',
    id: 'card:2',
    layoutOrder: 2,
    columns: 1,
    datasources: ['AHT']
};
aht.data = ahtData;
aht.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'AHT',
        'value': 599,
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            date: '<today>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'AHT',
        'value': 650,
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            date: '<month-to-date>'
        }
    }
];

const layout = {
    cards: [
        // closeRate,
        // dtv,
        aht
    ]
};


const datasources = {
    'DIRECTV': {
        fields: [ 'DTV Sales', 'Rolling Total', 'Pacing', 'Delta' ],
        refreshRate: 24*3600 // daily
    },
    'AHT': {
        fields: ['handleTime', 'calls']
    }
};

const fields = [
    // Date
    {
        displayName: 'Date',
        fieldName: 'Date',
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
        fieldName: 'Close Rate',
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
        fieldName: 'DIRECTV Sales',
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
        fieldName: 'AHT',
        calculation: 'handleTime / calls',
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
    }
];


/**
 * Vuex is used to see if app is in edit mode (editMode Boolean), and store
 * field (meta) data.
 * @type {Vuex}
 */
Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        fields: fields,
        editMode: true,
        ahtData: ahtData,
        currentUser: ''
    },
    getters: {
        field: (state) => (fieldName) => {
            return state.fields.find((f) => f.fieldName == fieldName);
        },
        getData: (state) => (filter, field) => {
            const filt = filters.clean(filter, state.currentUser);
            let result = sift(filt, state.ahtData.map((d) =>
                Object.assign({}, d, d._id)
            ));
            console.log(result);
            return result;
        }
    },
    mutations: {
        toggleEditMode(state) {
            state.editMode = !state.editMode;
        },
        updateData(state, newData) {
            state.ahtData = newData;
        },
        updateUser(state, newUsername) {
            state.currentUser = newUsername;
        }
    }
});


const dataValues = {
    'AHT': ahtData
};

const vm = new Vue({
    el: '#app',
    store,

    data: {
        layout: layout,
        datasources: datasources,
        dataValues: dataValues
    },

    components: {
        'dashboard': Dashboard
    },

    computed: {
        user: {
            get() {
                return this.$store.state.currentUser
            },
            set(value) {
                this.$store.commit('updateUser', value)
            }
        }
    },

    methods: {
        updateData: function() {

        },


        postAcd: async function() {
            const params = {
                filter: {
                    // agentGroup: {
                    //     $in: ['Customer Care', 'Sales'],
                    // },
                    agentUsername: {
                        $eq: this.$store.state.currentUser.trim()
                    },
                    date: {
                        start: '2018-01-01T00:00:00',
                        end: '2018-02-01T00:00:00',
                    },
                },
                fields: {
                    sum: ['calls', 'handleTime']
                },
                groupBy: ['agentUsername', 'skill']
            };
            const data = await api.getStatistics(params);
            let cleaned = data.map((d) => {
                d['dateDay'] = moment(d['dateDay']).toDate();
                d._id.dateDay = moment(d._id.dateDay).toDate()
                return d;
            });
            console.log(cleaned);
            this.$store.commit('updateData', cleaned);
        },

        clickImport: function() {
            this.$refs.fileInput.click();
        },
        importLayout: function(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = JSON.parse(e.target.result);
                console.log(contents);
                this.layout = Object.assign({}, contents);
            }.bind(this);
            reader.readAsText(file);
        },
        exportLayout: function() {
            download(layout, 'test.json', 'text/plain');
        },
        addCard: function() {
            const newCard = {
                title: 'card:' + this.layout.cards.length,
                id: 'card:' + this.layout.cards.length,
                layoutOrder: -1,
                data: [],
                widgets: []
            };
            console.log(newCard);
            this.layout.cards.push(newCard);
        },
        updateLayout: function(newLayout) {
            Object.assign(this.layout, newLayout);
        },
        updateCard: function(cardId, newCard) {
            let oldCardIndex =
                this.layout.cards.findIndex((card) => card.id == cardId);
            let oldCard = this.layout.cards[oldCardIndex];

            // Create a new card object that has all properties from the
            // new card and the old one (to include properties that aren't
            // defined in `newCard`)
            let newCardComplete = Object.assign({}, oldCard, newCard);

            // Use `Vue.set` to trigger reactivity
            // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
            Vue.set(this.layout.cards, oldCardIndex, newCardComplete);
        },
        deleteCard: function(cardId) {
            let cardIndex =
                this.layout.cards.findIndex((card) => card.id == cardId);
            Vue.delete(this.layout.cards, cardIndex);
        },
        /**
         * Update a widget. If newWidget is an empty object ({}), delete the
         * old widget.
         * @param  {Object} newWidget object to replace old widget with
         * @param  {String} widgetId
         * @param  {String} cardId    ID for container card
         * @return
         */
        modifyWidget: function(newWidget, widgetId, cardId) {
            let card = this.layout.cards.find((c) => c.id == cardId);
            let oldWidgetIndex = card.widgets.findIndex((w) => w.id == widgetId);
            let oldWidget = card.widgets[oldWidgetIndex];

            if (isEmpty(newWidget)) {
                Vue.delete(card.widgets, oldWidgetIndex);
            } else {
                // see updateCard function for explanation
                let newWidgetComplete = Object.assign({}, oldWidget, newWidget);
                Vue.set(card.widgets, oldWidgetIndex, newWidgetComplete);
            }
        }
    }
});



function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(text, null, 2)], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
