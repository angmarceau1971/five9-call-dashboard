import * as api from './api.js';
import ApiEditorTable from '../components/api-editor-table.vue';
const clone = require('ramda/src/clone');


const vm = new Vue({
    el: '#admin-app',

    components: {
        'api-editor-table': ApiEditorTable
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
        }
    }
});
