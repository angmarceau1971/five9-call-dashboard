import * as api from './api.js';


const vm = new Vue({
    el: '#admin-app',

    data: {
        fields: [
            { name: 'calls', defaultRefreshRate: 60 * 5 },
            { name: 'handleTime', defaultRefreshRate: 60 * 5 }
        ],
        calculatedFields: [
            { name: 'AHT', calculation: '{calls} / {handleTime}' }
        ],
        message: ''
    },

    components: {},


    methods: {
        updateField: function(field) {
            console.log(field);
            this.message = `Updating ${field.name}...`;
        }
    }
});
