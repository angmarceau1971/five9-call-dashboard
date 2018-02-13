import * as api from './api.js';

const vm = new Vue({
    el: '#upload-app',

    components: {
    },

    data: {
        message: '',
        selectedTableName: 'SkillGroup'
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
                const params = {
                    csv: e.target.result,
                    tableName: this.selectedTableName,
                    confirmedChanges: false
                };
                const response = await api.uploadData(params);
                this.updateMessage(response);
            }.bind(this);
            reader.readAsText(file);
        }
    }
});
