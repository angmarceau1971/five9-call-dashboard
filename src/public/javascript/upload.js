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
        // Manual uploads & data removal
        message: '',
        selectedDatasourceName: '',
        updateType: '',
        clearDatasourceName: '',
        clearStartDate: '',
        clearStopDate: '',
        // Looker test
        lookerTestId: '',
        lookerTestData: {},
    },

    computed: {
        lookerTestDataString: function() {
            return JSON.stringify(this.lookerTestData, null, 2);
        }
    },

    methods: {
        // Manual data updates
        updateMessage: function(msg) {
            this.message = msg;
        },

        uploadFile: async function(event) {
            return this.handleFileUpload(event, this.selectedDatasourceName,
                this.updateType
            );
        },

        clearData: async function() {
            console.log(`Clearing data for ${this.clearStartDate} through
                ${this.clearStopDate}.`);
            let message = await api.clearCustomData({
                datasourceName: this.clearDatasourceName,
                clearStartDate: this.clearStartDate,
                clearStopDate:  this.clearStopDate
            });
            console.log(message);
            this.message = message;
        },

        // Looker test
        pullLookerData: async function(lookId) {
            let data = await api.getLookerData(lookId);
            this.lookerTestData = data;
        },

        // Data source manipulation
        datasourceUpdater: async function(datasource) {
            let clean = clone(datasource);
            try {
                clean.fields = JSON.parse(clean.fields);
                clean.lookerFieldLookup = JSON.parse(clean.lookerFieldLookup);
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
                datasource.lookerFieldLookup = str(datasource.lookerFieldLookup);
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
        uploadSkillGroupFile: async function(event) {
            return this.handleFileUpload(event, 'SkillGroup', 'overwrite');
        },
        handleFileUpload: async function(event, datasourceName, updateType) {
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
                    updateType: updateType
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
