import Vue from 'vue';
import * as api from './api';
import EditorTable from '../components/editor-table.vue';

const clone = require('ramda/src/clone');

const vm = new Vue({
    el: '#upload-app',

    components: {
        'editor-table': EditorTable
    },

    data: {
        message: '',
        selectedDatasourceName: ''
    },

    methods: {
        updateMessage: function(msg) {
            this.message = msg;
        },

        // Data source manipulation
        datasourceUpdater: async function(datasource) {
            let clean = clone(datasource);
            try {
                clean.fields = JSON.parse(clean.fields);
            } catch (err) {
                return `Unable to save: ${err}.`;
            }
            return api.updateDatasource(clean);
        },
        datasourceLoader: async function() {
            let datasources = await api.getDatasources();
            const str = (s) => JSON.stringify(s, null, 2);
            const stringin = function(datasource) {
                datasource.fields = str(datasource.fields);
                return datasource;
            }
            return datasources.map(stringin);
        },
        datasourceAdder: function() {
            return {
                name: '',
                fields: [],
                defaultUpdateType: 'addTo',
                lastUpdated: ''
            }
        },
        datasourceRemover: function(datasource) {
            return api.deleteDatasource(datasource);
        },

        // Utility functions
        uploadFile: async function(event) {
            return this.handleFileUpload(event, this.selectedDatasourceName);
        },
        uploadSkillGroupFile: async function(event) {
            return this.handleFileUpload(event, 'SkillGroup')
        },
        handleFileUpload: async function(event, datasourceName) {
            const file = event.target.files[0];
            if (!file) {
                this.updateMessage('No file selected.')
                return;
            }
            const reader = new FileReader();
            reader.onload = async function(e) {
                const params = {
                    csv: e.target.result,
                    datasourceName: datasourceName,
                    confirmedChanges: false
                };
                const response = await api.uploadData(params);
                this.updateMessage(response);
                // clear input file
                this.$refs['fileInput'].value = '';
            }.bind(this);
            reader.readAsText(file);
        },

        formatDateTime: function(d) {
            if (!d) return 'N/A';
            return moment(d).tz('America/Denver').format('MMM DD YY, h:mm:ss a');
        },
    }
});
