// TODO: move jQuery to Vue
import * as api from './api';
const json2csv = require('json2csv').parse;

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
        },
        downloadLog: async function() {
            let logs = await api.getLogs({category:'request'});
            console.log(logs);
            download('dashboard-log.csv', json2csv(logs, {flatten: true}));
        }
    }
});


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
