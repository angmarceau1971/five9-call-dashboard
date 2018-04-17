import Vue from 'vue';
import UsersSelector from '../components/users-selector.vue';
import * as api from './api.js';

const vm = new Vue({
    el: '#app',

    components: {
        'users-selector': UsersSelector
    },

    data: {
        statusMessage: '',
        to: '',
        subject: '',
        body: '',
        usersTo: []
    },

    computed: {
        toNameList: function() {
            return this.usersTo.reduce((str, user) =>
                `${str ? str + ', ' : ''}${user.firstName} ${user.lastName}`
            , '');
        }
    },

    methods: {
        selectUsers: function(users) {
            this.usersTo = users;
        },
        send: async function (toString, subject, body) {
            let users = this.usersTo.map(user => {
                return { username: user.username }
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
