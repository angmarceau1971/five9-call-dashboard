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
import EditorTable from '../components/editor-table.vue';

const vm = new Vue({
    el: '#admin-app',

    components: {
        'editor-table': EditorTable
    },

    data: {
        message: ''
    },

    methods: {
        updateMessage: function(msg) {
            $('.message').text(msg);
            this.message = msg;
        },
        // Supervisor users
        supervisorUpdater: async function(user) {
            return api.updateSupervisorUser(user);
        },
        supervisorLoader: async function() {
            return api.getSupervisorUsers();
        },
        supervisorAdder: function() {
            return {
                username: ''
            };
        },
        // Administrator users
        adminUpdater: async function(user) {
            return api.updateAdminUser(user);
        },
        adminLoader: async function() {
            return api.getAdminUsers();
        },
        adminAdder: function() {
            return {
                username: ''
            };
        }
    }
});
