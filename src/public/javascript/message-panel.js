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
        usersTo: [],
        sentMessages: []
    },

    mounted: async function() {
        this.loadSentMessages();
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
            this.loadSentMessages();
        },
        clearMessage: function() {
            this.to = '';
            this.subject = '';
            this.body = '';
        },
        loadSentMessages: async function() {
            this.sentMessages = (await api.getSentMessages())
                                .sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
        },
        getDate: function(message) {
            return moment(message.timestamp).format('M/D h:mm A');
        }
    }
});
