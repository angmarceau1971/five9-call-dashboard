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
        'datasource': 'Agent Call Stats',
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
        'datasource': 'Agent Call Stats',
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
        'datasource': 'Agent Call Stats',
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
calls.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'AcdFeed.calls',
        'datasource': 'Agent Call Stats',
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
        'datasource': 'Agent Call Stats',
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
        'datasource': 'Agent Call Stats',
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

const qa = {
    title: 'QA',
    id: 'card:5',
    layoutOrder: 6,
    columns: 1
};
qa.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Month to Date',
        'fieldName': 'QA.score',
        'datasource': 'QA',
        'filter': {
            date: '<month-to-date>'
        }
    },
    {
        'id': 'widget:1',
        'component': 'line-graph',
        'title': 'QA by Day',
        'fields': {
            'x': 'date',
            'y': 'QA.score'
        },
        'datasource': 'QA',
        'filter': {
            date: '<last 3 months>'
        },
        'summarize': false
    },
    {
        'id': 'widget:2',
        'component': 'datasource-last-updated',
        'datasource': 'QA'
    }
];


const attendance = {
    title: 'Attendance Points',
    id: 'card:6',
    layoutOrder: 7,
    columns: 2
};
attendance.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Current Points',
        'fieldName': 'Calculated.attendancePoints',
        'datasource': 'Attendance Points',
        'filter': {}
    },
    {
        'id': 'widget:1',
        'component': 'data-table',
        'title': 'Points',
        'summarize': false,
        'filter': {},
        'fields': [
            'date',
            'code',
            'pointsAdded',
            'pointsRolledOff'
        ],
        'datasource': 'Attendance Points'
    },
    {
        'id': 'widget:2',
        'component': 'datasource-last-updated',
        'datasource': 'Attendance Points'
    }
];

const closeRate = {
    title: 'Sales Close Rate',
    id: 'card:7',
    layoutOrder: 5,
    columns: 1
};
closeRate.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Sales!',
        'fieldName': 'Calculated.closeRate',
        'datasource': 'Close Rate',
        'filter': {},
        'subFields': [
            'Close Rate.orders',
            'Close Rate.calls'
        ]
    },
    {
        'id': 'widget:1',
        'component': 'line-graph',
        'title': 'Sales by Day',
        'fields': {
            'x': 'date',
            'y': 'Calculated.closeRate',
            'y2': 'Close Rate.orders',
            'y3': 'Close Rate.calls',
        },
        'datasource': 'Close Rate',
        'filter': {
            date: '<month-to-date>'
        }
    },
    {
        'id': 'widget:2',
        'component': 'datasource-last-updated',
        'datasource': 'Close Rate'
    }
];


const layout = {
    cards: [
        aht,
        calls,
        sla,
        state,
        qa,
        attendance,
        closeRate
    ],
    datasources: [
        {
            "id": "1",
            "name": "Agent Call Stats",
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
                    $in: ["<current skill group>"]
                }
            },
            "groupBy": [
                "dateDay",
                "agentUsername",
                "skill"
            ],
            "refreshRate": 180,
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
                    $in: ["<current skill group>"]
                }
            },
            "groupBy": [
                "dateDay"
            ],
            "refreshRate": 180,
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
            "refreshRate": 180,
            "source": "AgentLogin"
        },
        {
            "id": "4",
            "name": "QA",
            "fields": {},
            "filter": {
                "agentName": {
                    $in: ["<current user's full name>"]
                },
                "date": "<last 3 months>"
            },
            "groupBy": [],
            "refreshRate": 21600, // update every 6 hours
            "source": "QA"
        },
        {
            "id": "5",
            "name": "Attendance Points",
            "fields": {},
            "filter": {
                "agentName": {
                    $in: ["<current user's full name>"]
                }
            },
            "groupBy": [],
            "refreshRate": 7200, // update every 2 hours
            "source": "Attendance Points"
        },
        {
            "id": "6",
            "name": "Close Rate",
            "fields": {},
            "filter": {
                "agentUsername": {
                    $in: ["<current user>"]
                }
            },
            "groupBy": [],
            "refreshRate": 7200, // update every 2 hours
            "source": "Close Rate"
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
        showMenu: false, // show main menu
        showMenuThemes: false, // show themes submenu
        showLinks: false, // show helpful links / bookmarks
        theme: {}
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
        // Hack to make sure data loads in cases where first round is blank
        // TODO: fix bug causing data to be blank after first `startProcess`
        setTimeout(this.refresh.bind(this), 5000);
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
                return `Hi, ${this.user.firstName}!`;
            } else {
                return '';
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
                this.theme = clone(newUser.theme);
                this.updateThemeStyles(this.theme);
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
            this.theme[attribute] = value;
            this.updateThemeStyles(this.theme);
        },

        saveTheme: function() {
            if (this.theme.useBackgroundImage === undefined) throw new Error('saving theme with undefined useBackgroundImage!');
            store.dispatch('updateTheme', this.theme);
            this.showMenuThemes = false;
            this.showMenu = false;
        },

        updateThemeStyles: function(theme) {
            document.getElementById('theme_css').href =
                                    `styles/theme-${theme.color}.css`;
        },

        mouseleaveThemeSubMenu: function(event) {
            if (!event.relatedTarget) return;
            let classList = Array.from(event.relatedTarget.classList);
            if (event.relatedTarget == this.$refs.themeSubMenu
                || classList.includes('submenu-button')
                || isDescendant(this.$refs.themeSubMenu, event.relatedTarget)) {
                event.stopPropagation();
                return;
            }
            else {
                this.showMenuThemes = false;
            }
        },
        mouseleaveMenu: function(event) {
            if (!event.relatedTarget) return;
            if (event.relatedTarget === this.$refs.menuButton
                || isDescendant(this.$refs.menu, event.relatedTarget)) {
                event.stopPropagation();
                return;
            }
            else {
                this.showMenu = false;
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
