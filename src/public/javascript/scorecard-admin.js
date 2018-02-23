import * as api from './api.js';
import ApiEditorTable from '../components/editor-table.vue';
const clone = require('ramda/src/clone');


const vm = new Vue({
    el: '#admin-app',

    components: {
        'editor-table': ApiEditorTable
    },

    data: {
        message: ''
    },

    methods: {
        fieldUpdater: async function(field) {
            let clean = clone(field);
            clean.name = field.name.trim();
            clean.displayName = field.displayName.trim();
            return api.updateField(clean);
        },
        fieldLoader: function() {
            return api.getFieldList();
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

        // Goal functions
        goalUpdater: async function(goal) {
            let clean = clone(goal);
            try {
                clean.agentGroups = JSON.parse(clean.agentGroups);
                clean.thresholds = JSON.parse(clean.thresholds);
                clean.fields = JSON.parse(clean.fields);
            } catch (err) {
                return `Unable to save: ${err}.`;
            }
            return api.updateGoal(clean);
        },
        goalLoader: async function() {
            let goals = await api.getGoalList();
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function(goal) {
                goal.agentGroups = str(goal.agentGroups);
                goal.thresholds = str(goal.thresholds);
                goal.fields = str(goal.fields);
                return goal;
            }
            return goals.map(stringin);
        },
        goalAdder: function() {
            return {
                name: '',
                agentGroups: [],
                comparator: '<',
                goalThresholds: []
            }
        },
        goalRemover: function(goal) {
            return api.deleteGoal(goal);
        }
    }
});
