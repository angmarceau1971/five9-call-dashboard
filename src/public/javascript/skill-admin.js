import * as api from './api.js';
import ApiEditorTable from '../components/api-editor-table.vue';

const vm = new Vue({
    el: '#skill-app',

    components: {
        'api-editor-table': ApiEditorTable
    },

    data: {
        message: ''
    },

    methods: {
        jobUpdater: async function(job) {
            return api.updateSkillJob(job);
        },
        jobLoader: function() {
            return api.getSkillJobs();
        },
        updateMessage: function(msg) {
            this.message = msg;
        },
        formatDateTime: function(d) {
            return moment(d).tz('America/Denver').format('MMM DD YY, h:mm:ss a');
        }
    }
});
