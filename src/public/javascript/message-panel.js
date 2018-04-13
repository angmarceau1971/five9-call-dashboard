import Vue from 'vue';
import * as api from './api.js';

const vm = new Vue({
    el: '#app',

    data: {
        statusMessage: '',
        to: '',
        subject: '',
        body: ''
    },

    methods: {
        send: async function (to, subject, body) {
            let users = to.split(',').map(user => user.trim());
            let message = {
                to: users,
                subject: subject,
                body: body
            };
            let response = await api.sendMessage(message);
            this.statusMessage = response;
            setTimeout(() => this.statusMessage = '', 5000);
            this.clearMessage();
        },
        clearMessage: function() {
            this.to = '';
            this.subject = '';
            this.body = '';
        }
    }
});
