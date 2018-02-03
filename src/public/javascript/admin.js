// TODO: move jQuery to Vue
import './interactions';
import * as api from './api';
import { API_URL } from './local_settings';
import { getAuthString } from './utility';

// Handles UI interaction for login form

$(document).ready(() => {
    // show Login form
    $('.credentials-cover-toggle').click(() => {
        $('.admin-panel-wrapper').addClass('out-of-the-way');
    });

    // listen for sign-in button press
    $('.begin-session').click(async (event) => {
        $('.admin-panel-wrapper').removeClass('out-of-the-way');
    });

    // Listen for server reboot request
    $('.reboot-server').click(async (event) => {
        const auth = getAuthString($('.username').val(), $('.password').val());
        const body = { authorization: auth };
        const apiURL = API_URL + 'reboot-server'; // defined in api_url.js

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        $('.message').text(`Computing....`);

        fetch(apiURL, requestOptions)
            .then(async (response) => {
                let bodyText = await response.text();
                $('.message').text(`Response: ${response.status} ${bodyText}`);
            }).catch((err) => {
                $('.message').text(`Whoops! that got a: ${err}. Server down much?`);
            });
    });


    // Listen for data reload requests
    $('.reload-data').click(async (event) => {
        const auth = getAuthString($('.username').val(), $('.password').val());
        const time = { start: $('.start-time').val(), end: $('.end-time').val() };
        const body = { authorization: auth, time: time };
        const apiURL = API_URL + 'reload-data'; // defined in api_url.js

        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/text',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        $('.message').text(`Computing....`);

        fetch(apiURL, requestOptions)
            .then(async (response) => {
                let bodyText = await response.text();
                $('.message').text(`Response: ${response.status} ${bodyText}`);
            }).catch((err) => {
                $('.message').text(`Whoops! ${err}`);
            });
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
