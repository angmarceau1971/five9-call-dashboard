import Dashboard from '../components/dashboard.vue';
import * as hub from './hub';
import { formatValue } from './scorecard-format';
import EditorTable from '../components/editor-table.vue';

// Node libraries
const isEmpty = require('ramda/src/isEmpty');
const clone = require('ramda/src/clone');
const debounce = require('debounce');

const aht = {
    title: 'Average Handle Time',
    id: 'card:1',
    layoutOrder: 1,
    columns: 2
};
aht.data = [];
aht.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'Calculated.aht',
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<today>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'Calculated.aht',
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<month-to-date>'
        }
    },
    {
        'id': 'widget:4',
        'component': 'line-graph',
        'title': 'Month to Date',
        'fields': {
            'x': 'dateDay',
            'y': 'Calculated.aht'
        },
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<month-to-date>'
        }
    },
];


const calls = {
    title: 'Calls Handled',
    id: 'card:2',
    layoutOrder: 2,
    columns: 1
};
calls.data = [];
calls.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'AcdFeed.calls',
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<today>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'AcdFeed.calls',
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<month-to-date>'
        }
    },
    {
        'id': 'widget:2',
        'component': 'line-graph',
        'title': 'Calls by Day',
        'fields': {
            'x': 'dateDay',
            'y': 'AcdFeed.calls'
        },
        'datasource': 'Agent Stats',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            dateDay: '<month-to-date>'
        }
    },
];


const sla = {
    title: 'Service Level',
    id: 'card:3',
    layoutOrder: 3,
    columns: 1
};
sla.data = [];
sla.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'Calculated.serviceLevel',
        'datasource': 'Department Stats',
        'filter': {
            dateDay: '<today>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'Calculated.serviceLevel',
        'datasource': 'Department Stats',
        'filter': {
            dateDay: '<month-to-date>'
        }
    },
    {
        'id': 'widget:2',
        'component': 'line-graph',
        'title': 'Calls by Day',
        'fields': {
            'x': 'dateDay',
            'y': 'Calculated.serviceLevel'
        },
        'datasource': 'Department Stats',
        'filter': {
            dateDay: '<month-to-date>'
        }
    },
];

const state = {
    title: 'Time Summary',
    id: 'card:4',
    layoutOrder: 4,
    columns: 1
};
state.data = [];
state.widgets = [
    {
        'id': 'widget:0',
        'component': 'pie-chart',
        'title': 'Today',
        'datasource': 'Agent State Data',
        'fields': {
            'groupBy': 'reasonCode',
            'sum': ['notReadyTime', 'handleTime'],
            'total': 'loginTime'
        },
        'filter': {
            dateDay: '<today>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'pie-chart',
        'title': 'Month to Date',
        'datasource': 'Agent State Data',
        'fields': {
            'groupBy': 'reasonCode',
            'sum': ['notReadyTime', 'handleTime'],
            'total': 'loginTime'
        },
        'filter': {
            dateDay: '<month-to-date>'
        }
    }
];

const layout = {
    cards: [
        aht,
        calls,
        sla,
        state
    ],
    datasources: [
        {
            "id": "1",
            "name": "Agent Stats",
            "fields": {
                "sum": [
                    "calls",
                    "handleTime",
                    "acwTime"
                ]
            },
            "filter": {
                "agentUsername": {
                    "$eq": "<current user>"
                },
                "date": "<month-to-date>",
                "skillGroup": {
                    $in: ["<current user group>"]
                }
            },
            "groupBy": [
                "dateDay",
                "agentUsername",
                "skill"
            ],
            "refreshRate": 20,
            "source": "AcdFeed"
        },
        {
            "id": "2",
            "name": "Department Stats",
            "fields": {
                "sum": [
                    "calls",
                    "serviceLevel"
                ]
            },
            "filter": {
                "date": "<month-to-date>",
                "skillGroup": {
                    $in: ["<current user group>"]
                }
            },
            "groupBy": [
                "dateDay"
            ],
            "refreshRate": 60,
            "source": "AcdFeed"
        },
        {
            "id": "3",
            "name": "Agent State Data",
            "fields": {
                "sum": [
                    "notReadyTime",
                    "handleTime",
                    "loginTime"
                ]
            },
            "filter": {
                "date": "<month-to-date>",
                "agentUsername": {
                    $in: ["<current user>"]
                }
            },
            "groupBy": [
                "dateDay",
                "reasonCode"
            ],
            "refreshRate": 60,
            "source": "AgentLogin"
        }
    ]
};



Vue.use(Vuex);
const store = hub.store;

const vm = new Vue({
    el: '#app',
    store,

    data: {
        layout: layout,
        datasourceMessage: '',
        isLoaded: false
    },

    components: {
        'dashboard': Dashboard,
        'editor-table': EditorTable
    },

    computed: {
        user: {
            get() {
                return store.state.currentUser
            },
            set(value) {
                this.updateUserDebounced(value);
            }
        }
    },

    async beforeMount() {
        store.commit('setDatasources', this.layout.datasources);
        await store.dispatch('startProcess');
        this.isLoaded = true;
    },

    methods: {
        updateUserDebounced: debounce(async function(username) {
            store.dispatch('updateUser', username);
            this.refresh();
        }, 250),

        refresh: async function() {
            store.dispatch('forceRefresh');
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
        },
        ///////////////////////
        // Data Sources
        updateDatasourceMessage: function(message) {
            console.log(`updateDatasourceMessage: ${message}`);
            this.datasourceMessage = message;
        },
        datasourceLoader: function() {
            let sources = clone(this.layout.datasources);
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function(ds) {
                ds.fields = str(ds.fields);
                ds.filter = str(ds.filter);
                ds.groupBy = str(ds.groupBy);
                return ds;
            }
            return sources.map(stringin);
        },
        datasourceAdder: function() {
            return {
                name: '',
                fields: '',
                filter: '{}',
                groupBy: '',
                refreshRate: 10
            };
        },
        datasourceUpdater: function(datasource) {
            try {
                let obj = parseDatasource(datasource);

                let oldIndex = this.layout.datasources.findIndex((ds) =>
                                                ds.name == obj.name);
                if (oldIndex == -1) {
                    this.layout.datasources.push(obj);
                } else {
                    Vue.set(this.layout.datasources, oldIndex, obj);
                }
                this.$store.commit('changeDatasource', obj);
            } catch (err) {
                console.log(err);
                this.updateDatasourceMessage(`Error parsing data source: ${err}.`);
            }
        },
        datasourceRemover: function(datasource) {
            try {
                let obj = getVueObject(datasource);
                let oldIndex = this.layout.datasources.findIndex((ds) =>
                                                ds.name == obj.name);
                Vue.delete(this.layout.datasources, oldIndex);
                this.$store.commit('deleteDatasource', obj);
            } catch (err) {
                this.updateDatasourceMessage(`Error removing data source: ${err}.`);
            }
        }
    }
});


window.vm = vm;
/*
  Convert vue object
*/
const getVueObject = obj => {
  return JSON.parse(JSON.stringify( obj ));
};

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(text, null, 4)], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function parseDatasource(input) {
    function objectify(value) {
        try {
            return JSON.parse(value);
        } catch (err) {
            if (err instanceof SyntaxError) return value;
            else throw err;
        }
    }
    return objectMap(input, objectify);
}

function objectMap(object, fun) {
    return Object.keys(object).reduce((newObj, key) => {
        newObj[key] = fun(object[key]);
        return newObj;
    }, {})
}
