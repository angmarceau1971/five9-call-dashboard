import Dashboard from '../components/dashboard.vue';
import * as hub from './hub';
import { formatValue } from './scorecard-format';

// Node libraries
const isEmpty = require('ramda/src/isEmpty');


const aht = {
    title: 'Average Handle Time',
    id: 'card:1',
    layoutOrder: 1,
    columns: 1
};
aht.data = [];
aht.widgets = [
    {
        'id': 'widget:0',
        'component': 'single-value',
        'title': 'Today',
        'fieldName': 'Calculated.aht',
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
        'fieldName': 'Calculated.aht',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            date: '<month-to-date>'
        }
    },
    {
        'id': 'widget:2',
        'component': 'single-value',
        'title': 'ACW Today',
        'fieldName': 'Calculated.acw',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            date: '<today>'
        }
    },
    {
        'id': 'widget:3',
        'component': 'single-value',
        'title': 'ACW Month to Date',
        'fieldName': 'Calculated.acw',
        'filter': {
            agentUsername: {
                $in: ['<current user>']
            },
            date: '<month-to-date>'
        }
    }
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
        'fieldName': 'AcdFeed.calls',
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
        aht,
        calls
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



const dataValues = {
    'AHT': []
};


Vue.use(Vuex);
const store = hub.store;

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

    beforeMount() {
        return store.dispatch('startProcess');
    },

    methods: {
        postAcd: async function() {
            return store.dispatch('makeSubscriptions');
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


window.vm = vm;

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(text, null, 2)], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
