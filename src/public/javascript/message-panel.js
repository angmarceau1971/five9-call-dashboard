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
        send: async function (toString, subject, body) {
            let users = toString.split(',').map(username => {
                return { username: username }
            });
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
