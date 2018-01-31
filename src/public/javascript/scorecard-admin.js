import * as api from './api.js';


const vm = new Vue({
    el: '#admin-app',

    data: {
        fields: [
            // { name: 'calls', defaultRefreshRate: 60 * 5 },
            // { name: 'handleTime', defaultRefreshRate: 60 * 5 }
        ],
        calculatedFields: [
            { name: 'AHT', calculation: '{calls} / {handleTime}' }
        ],
        message: ''
    },

    components: {},

    beforeMount: function() {
        this.loadFields();
    },

    methods: {
        updateField: async function(field) {
            this.message = `Updating ${field.name}...`;
            this.message = await api.updateField(field);
        },
        loadFields: async function() {
            let fields = await api.getFieldList();
            this.fields = fields;
        }
    }
});
