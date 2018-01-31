import * as api from './api.js';
import ApiEditorTable from '../components/api-editor-table.vue';

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
            return api.updateField(field);
        },
        fieldLoader: function() {
            return api.getFieldList();
        },
        updateMessage: function(msg) {
            this.message = msg;
        }
    }
});
