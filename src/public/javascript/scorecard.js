import Vue from 'vue';
import Dashboard from '../components/dashboard.vue';
import * as hub from './hub';
import { formatValue } from './scorecard-format';
import EditorTable from '../components/editor-table.vue';


// NPM libraries
const isEmpty = require('ramda/src/isEmpty');
const clone = require('ramda/src/clone');
const debounce = require('debounce');


const aht = {
    title: 'Average Handle Time',
    id: 'card:1',
    layoutOrder: 2,
    columns: 1
};
aht.data = [];
aht.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'Calculated.aht',
        'subFields': [
            'Calculated.talk',
            'Calculated.acw',
            'Calculated.hold'
        ],
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
        'subFields': [
            'Calculated.talk',
            'Calculated.acw',
            'Calculated.hold'
        ],
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
    layoutOrder: 3,
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
    layoutOrder: 1,
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
        },
        'statsType': 'team'
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
            'sum': ['notReadyTime'],
            'display': 'notReadyTime',
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
            'sum': ['notReadyTime', 'handleTime', 'loginTime'],
            'display': 'notReadyTime',
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
                    "talkTime",
                    "acwTime",
                    "holdTime"
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
            "refreshRate": 60,
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


const store = hub.store;
const vm = new Vue({
    el: '#app',
    store: store,

    data: {
        layout: layout,
        datasourceMessage: '',
        isLoaded: false,
        showMenu: false,
        showMenuThemes: false
    },

    components: {
        'dashboard': Dashboard,
        'editor-table': EditorTable
    },

    async beforeMount() {
        store.commit('setDatasources', this.layout.datasources);
        // load user's data
        await store.dispatch('updateUser', '');
        await store.dispatch('startProcess');
        this.isLoaded = true;
    },

    computed: {
        username: {
            get() {
                return store.state.currentUser;
            },
            set(value) {
                store.dispatch('updateUser', value);
                this.refresh();
            }
        },
        user: {
            get() {
                return store.state.user;
            }
        },
        // Get name of theme that isn't currently selected
        otherTheme: function() {
            return this.theme.color == 'dark' ? 'light' : 'dark';
        },
        userGreeting: function() {
            if (this.user.firstName) {
                return `Hi, ${this.user.firstName}!`
            } else {
                return '';
            }
        },
        theme: {
            get() {
                return this.user.theme ? this.user.theme : {};
            },
            set(newTheme) {
                store.dispatch('updateTheme', newTheme);
            }
        },
        backgroundStyles: function() {
            let bgUrl = this.theme.color == 'dark'
                        ? this.theme.darkBackgroundImageUrl
                        : this.theme.lightBackgroundImageUrl;
            if (this.theme.useBackgroundImage && bgUrl.length > 1) {
                return {
                    background: `url("${bgUrl}") no-repeat center center fixed`
                };
            }
            else {
                return {};
            }
        }
    },

    watch: {
        // When the current user changes, make any needed adjustments
        user: {
            handler: function(newUser) {
                this.updateThemeStyles(newUser.theme);
            },
            deep: true
        }
    },

    methods: {
        ///////////////////////////
        // UI / interactions
        refresh: async function() {
            store.dispatch('forceRefresh');
        },

        changeTheme: function(attribute, value) {
            let newTheme = clone(this.user.theme);
            newTheme[attribute] = value;
            store.dispatch('updateTheme', newTheme);
        },

        saveTheme: function() {
            let newTheme = clone(this.user.theme);
            store.dispatch('updateTheme', newTheme);
        },

        updateThemeStyles: function(theme) {
            document.getElementById('theme_css').href =
                                    `styles/theme-${theme.color}.css`;
        },

        mouseleaveThemeSubMenu: function(event) {
            if (!event.relatedTarget) return;
            let elMenu = this.$refs.themeSubMenu;
            let classList = Array.from(event.relatedTarget.classList);
            if (elMenu === event.relatedTarget
                || classList.includes('submenu-button')
                || isDescendant(elMenu, event.relatedTarget)) {
                event.stopPropagation();
                return;
            }
            else {
                this.showMenuThemes = false;
            }
        },

        ///////////////////////////
        // Handle import & export of layouts
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

        ///////////////////////////
        // Dashboard modifications
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

let buffer = function(func, wait, scope) {
    var timer = null;
    return function() {
        if (timer) clearTimeout(timer);
        var args = arguments;
        timer = setTimeout(function() {
            timer = null;
            func.apply(scope, args);
        }, wait);
    };
};

function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}
