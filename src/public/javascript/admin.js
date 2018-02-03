// TODO: move jQuery to Vue
import * as api from './api';

$(document).ready(() => {
    // Listen for server reboot request
    $('.reboot-server').click(async (event) => {
        $('.message').text(`Computing....`);
        const msg = await api.rebootServer();
        $('.message').text(msg);
    });

    // Listen for data reload requests
    $('.reload-data').click(async (event) => {
        $('.message').text(`Computing....`);
        const time = { start: $('.start-time').val(), end: $('.end-time').val() };
        const body = { time: time };
        const msg = await api.reloadData(body);
        $('.message').text(msg);
    });
});


// Handle Vue form
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
        adminUpdater: async function(user) {
            return api.updateAdminUser(user);
        },
        adminLoader: async function() {
            const admins = await api.getAdminUsers();
        },
        adminAdder: function() {
            return {
                username: ''
            };
        },
        adminRemover: async function(job) {
            return api.deleteAdmin(job);
        },
        updateMessage: function(msg) {
            $('.message').text(msg);
            this.message = msg;
        }
    }
});
