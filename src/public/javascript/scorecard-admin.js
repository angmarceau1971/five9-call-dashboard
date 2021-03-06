import * as api from './api.js';
import Vue from 'vue';
import EditorTable from '../components/editor-table.vue';
const clone = require('ramda/src/clone');

const vm = new Vue({
    el: '#admin-app',

    components: {
        'editor-table': EditorTable
    },

    data: {
        message: '',
        showTables: {
            goals: false,
            links: false,
            saleMessages: false,
            layouts: false,
            fields: false,
        },
    },

    methods: {
        ////////////////////////////
        // General UI
        toggleTable: function (tableName) {
            this.showTables[tableName] = !this.showTables[tableName];
        },
        showingTable: function (tableName) {
            return this.showTables[tableName];
        },



        ///////////////////////////////////////////////////////
        // Goal functions
        goalUpdater: async function (goal) {
            let clean = clone(goal);
            try {
                clean.agentGroups = JSON.parse(clean.agentGroups);
                clean.skillGroups = JSON.parse(clean.skillGroups);
                clean.thresholds = JSON.parse(clean.thresholds);
            } catch (err) {
                return `Unable to save: ${err}.`;
            }
            return api.updateGoal(clean);
        },
        goalLoader: async function () {
            let goals = await api.getGoalList();
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function (goal) {
                goal.agentGroups = str(goal.agentGroups);
                goal.skillGroups = str(goal.skillGroups);
                goal.thresholds = str(goal.thresholds);
                return goal;
            }
            return goals.map(stringin);
        },
        goalAdder: function () {
            return {
                name: '',
                agentGroups: [],
                skillGroups: [],
                comparator: '<',
                thresholds: [],
                field: ''
            }
        },
        goalRemover: function (goal) {
            return api.deleteGoal(goal);
        },


        ///////////////////////////////////////////////////////
        // Helpful Link functions
        linkUpdater: async function (link) {
            let clean = clone(link);
            try {
                clean.agentGroups = JSON.parse(clean.agentGroups);
            } catch (err) {
                return `Unable to save: ${err}.`;
            }
            return api.updateLink(clean);
        },
        linkLoader: async function () {
            let links = await api.getLinkList();
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function (link) {
                link.agentGroups = str(link.agentGroups);
                return link;
            }
            return links.map(stringin);
        },
        linkAdder: function () {
            return {
                name: '',
                url: '',
                agentGroups: [],
            }
        },
        linkRemover: function (link) {
            return api.deleteLink(link);
        },


        ///////////////////////////////////////////////////////
        //-Made-the-Sale Messages!
        saleMessageUpdater: async function (saleMessage) {
            let clean = clone(saleMessage);
            return api.updateSaleMessage(clean);
        },
        saleMessageLoader: async function () {
            let saleMessages = await api.getSaleMessageList();
            return saleMessages;
        },
        saleMessageAdder: function () {
            return {
                message: '',
            }
        },
        saleMessageRemover: function (saleMessage) {
            return api.deleteSaleMessage(saleMessage);
        },


        ///////////////////////////////////////////////////////
        // Layout functions
        layoutUpdater: async function(layout) {
            let clean = clone(layout);
            try {
                clean.defaultForAgentGroups = JSON.parse(clean.defaultForAgentGroups);
                clean.optionalForAgentGroups = JSON.parse(clean.optionalForAgentGroups);
                clean.cards = JSON.parse(clean.cards);
                clean.datasources = JSON.parse(clean.datasources);
            } catch (err) {
                return `Unable to save: ${err}.`;
            }
            return api.updateLayout(clean);
        },
        layoutLoader: async function() {
            let layouts = await api.getLayoutList();
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function(layout) {
                layout.defaultForAgentGroups = str(layout.defaultForAgentGroups);
                layout.optionalForAgentGroups = str(layout.optionalForAgentGroups);
                layout.cards = str(layout.cards);
                layout.datasources = str(layout.datasources);
                return layout;
            }
            return layouts.map(stringin);
        },
        layoutAdder: function() {
            return {
                name: '',
                layoutType: 'individual',
                defaultForAgentGroups: [],
                optionalForAgentGroups: [],
                cards: [],
                datasources: [],
                columns: 4
            }
        },
        layoutRemover: function(layout) {
            return api.deleteLayout(layout);
        },

        ///////////////////////////////////////////////////////
        // Field functions
        fieldUpdater: async function(field) {
            let clean = clone(field);
            clean.name = field.name.trim();
            clean.displayName = field.displayName.trim();
            return api.updateField(clean);
        },
        fieldLoader: async function() {
            let fields = await api.getFieldList();
            // Sort by source then name
            return fields.sort((a, b) => {
                if (a.source == b.source) {
                    return a.name < b.name ? -1 : 1;
                } else {
                    return a.source < b.source ? -1 : 1;
                }
            });
        },
        updateMessage: function(msg) {
            this.message = msg;
        },
        fieldAdder: function() {
            return {
                name: '',
                displayName: '',
                defaultRefreshRate: 0,
                format: {
                    type: '',
                    string: ''
                },
                calculatedField: true,
                calculation: ''
            }
        },
        fieldRemover: function(field) {
            return api.deleteField(field);
        },

    }
});
