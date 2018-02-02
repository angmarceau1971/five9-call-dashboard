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
        jobLoader: async function() {
            const jobs = await api.getSkillJobs();
            return jobs.map((job) => {
                if (!job.data) {
                    job.data = {
                        userProfile: '', addSkills: '', removeSkills: ''
                    };
                }
                return job;
            });
        },
        jobAdder: function() {
            return {
                name: '',
                repeatInterval: '',
                data: {
                    userProfile: '',
                    addSkills: '',
                    removeSkills: ''
                }
            };
        },
        jobRemover: async function(job) {
            return api.deleteSkillJob(job);
        },
        updateMessage: function(msg) {
            this.message = msg;
        },
        formatDateTime: function(d) {
            if (!d) return 'N/A';
            return moment(d).tz('America/Denver').format('MMM DD YY, h:mm:ss a');
        }
    }
});
