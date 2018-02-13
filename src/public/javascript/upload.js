import * as api from './api.js';

const vm = new Vue({
    el: '#upload-app',

    components: {
    },

    data: {
        message: ''
    },

    methods: {
        updateMessage: function(msg) {
            this.message = msg;
        },
        uploadFile: async function(event) {
            const file = event.target.files[0];
            if (!file) {
                this.updateMessage('No file selected.')
                return;
            }
            const reader = new FileReader();
            reader.onload = async function(e) {
                const response = await api.uploadData(e.target.results);
                this.updateMessage(response);
            }.bind(this);
            reader.readAsText(file);
        }
    }
});
