import Vue from 'vue';
import Dashboard from '../components/dashboard.vue';
import * as hub from './hub';
import * as api from './api';
import { formatValue } from './scorecard-format';
import EditorTable from '../components/editor-table.vue';


// NPM libraries
const isEmpty = require('ramda/src/isEmpty');
const clone = require('ramda/src/clone');
const uniq = require('ramda/src/uniq');
const intersection = require('ramda/src/intersection');
const debounce = require('debounce');


const store = hub.store;
const vm = new Vue({
    el: '#app',
    store: store,

    data: {
        layout: {},
        isLoaded: false,
        showMenu: false, // show main menu
        showMenuThemes: false, // show themes submenu
        showLinks: false, // show helpful links / bookmarks
        theme: {},
        // Supervisor controls
        userList: [],
        agentGroups: [],
        selectedUsernames: [],
        selectedAgentGroups: [],
        showFilters: true,
        datasourceMessage: '',
    },

    components: {
        'dashboard': Dashboard,
        'editor-table': EditorTable
    },

    async beforeMount() {
        // load user's data
        await store.dispatch('updateUser', '');
        this.layout = await store.dispatch('startProcess');
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
            async set(value) {
                await store.dispatch('updateUser', value);
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
        },
    },

    methods: {
        ///////////////////////////
        // UI / interactions
        refresh: async function() {
            this.layout = {};
            this.isLoading = true;
            this.layout = await store.dispatch('forceRefresh');
            this.isLoading = false;
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

        //////////////////////////////////////////////////
        // Supervisor view controls
        loadUsersList: async function() {
            let userList = await api.getUsers();
            userList.sort((a, b) => a.lastName < b.lastName ? -1 : +1);
            this.userList = userList;
        },
        selectUsers: async function(usernames) {
            this.selectedUsernames = usernames;
            let users = usernames.map((username) =>
                this.userList.find((user) => user.username == username)
            );
            store.commit('setSelectedUsers', users);
        },
        // Supervisor view
        supervisorMode: async function() {
            console.log('sup mode!');
            await this.loadUsersList();
            this.agentGroups = this.getAgentGroupsFromUsers(this.userList);
        },
        selectAgentGroups: async function(agentGroup) {
            store.commit('setSelectedUsers', this.filterUsersInGroup(this.userList));
        },
        getAgentGroupsFromUsers: function(users) {
            return hub.extractValues(users, 'agentGroups').sort();
        },
        filterUsersInGroup: function(users) {
            if (this.selectedAgentGroups.length == 0) return users;
            return users.filter((user) =>
                intersection(user.agentGroups, this.selectedAgentGroups).length > 0
            )
        },
        changeSupMode: function(newMode) {
            store.commit('setSupMode', newMode);
        },
        getUserSelectionString: function(user) {
            let groupString = '';
            if (user.agentGroups.length > 1) {
                groupString = ` - ${user.agentGroups.join(', ')}`;
            }
            return `${user.lastName}, ${user.firstName}${groupString}`;
        },
        //////////////////////////////////////////////////
        // Handle menus and theme
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
