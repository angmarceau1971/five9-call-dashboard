<template>
<div>
    <div class="message" v-if="message">
        <p>
            {{ message }}
        </p>
    </div>
    <div v-if="userList" class="section agent-selectors">
        <div class="agentgroup-list">
            <select multiple size="30" v-model="selectedAgentGroups"
                    @change="selectAgentGroups(selectedAgentGroups)">
                <option v-for="agentGroup in agentGroups"
                    :value="agentGroup"
                    :key="agentGroup">
                    {{ agentGroup }}
                </option>
            </select>
        </div>
        <div class="user-list">
            <select multiple size="30" v-model="selectedUsernames"
                @change="selectUsers(getUsers(selectedUsernames))">
                <option v-for="userAgent in filterUsersInGroup(userList)"
                    :value="userAgent.username"
                    :key="userAgent.username">
                    {{ getUserSelectionString(userAgent) }}
                </option>
            </select>
        </div>

        <div class="refresh-button-wrapper" v-if="showRefresh">
            <button class="refresh-button" @click="clickRefresh">
                <i class="fas fa-sync-alt"></i> Refresh
            </button>
        </div>
    </div>
</div>
</template>


<script>
import * as api from '../javascript/api';
import { extractValues } from '../javascript/hub';
const clone = require('ramda/src/clone');
const intersection = require('ramda/src/intersection');


export default {
    name: 'users-selector',

    props: {
        userList: {
            type: Array,
            default: null
        },
        showRefresh: {
            type: Boolean,
            default: true
        }
    },

    data () {
        return {
            selectedUsernames: [],
            selectedAgentGroups: [],
            agentGroups: [],
            message: ''
        }
    },

    mounted: async function() {
        // Load user list if not passed in
        let users = clone(this.userList);
        if (!this.userList) {
            users = await this.loadUsersList();
            this.$emit('users-loaded', users);
        }
        this.agentGroups = this.getAgentGroupsFromUsers(users);
    },


    methods: {
        clickRefresh: function() {
            if (this.$store.state.supMode == 'individual'
                && this.selectedUsernames.length > 1) {
                this.message = `Change to TEAM mode to view multiple users, ya turkey!`
            } else {
                this.message = '';
                this.$emit('refresh');
            }
        },

        // Load list of users
        loadUsersList: function() {
            return api.getUsers();
        },

        // Return users who are within the selectedAgentGroups
        filterUsersInGroup: function(users) {
            if (this.selectedAgentGroups.length == 0) return users;
            return users.filter((user) =>
                intersection(user.agentGroups, this.selectedAgentGroups).length > 0
            )
        },

        // If a user is part of multiple groups, list them next to user's name
        getUserSelectionString: function(user) {
            let groupString = '';
            if (user.agentGroups.length > 1) {
                groupString = ` - ${user.agentGroups.join(', ')}`;
            }
            return `${user.lastName}, ${user.firstName}${groupString}`;
        },

        // From the passed-in users, return array of agent groups
        getAgentGroupsFromUsers: function(users) {
            return extractValues(users, 'agentGroups').sort();
        },

        // Filter for agents within an agent group
        selectAgentGroups: async function(agentGroups) {
            this.selectedAgentGroups = agentGroups;
            this.selectUsers(this.filterUsersInGroup(this.userList));
        },

        // Get users from usernames
        getUsers: function(usernames) {
            return usernames.map((username) =>
                this.userList.find((user) => user.username == username)
            );
        },

        selectUsers: function(users) {
            this.$emit('select-users', users);
            // Make sure these cats are in the selectedUsernames list
            this.selectedUsernames = users.map((u) => u.username);
        }

    }

}
</script>


<style scoped>
.message {
    background-color: #333;
    border-radius: 2px;
    color: white
}
.agent-selectors {
    display: grid;
    grid-gap: 2em;
    grid-template-columns: repeat(3, 1fr);
}
.agent-selectors .toggle-buttons {
    grid-column: 2 / 4;
    grid-row: 1;
    margin: 1em;
}
.agent-selectors .user-list select,
.agent-selectors .agentgroup-list select {
    width: 100%;
}
.agent-selectors .refresh-button-wrapper {
    display: flex;
}
.agent-selectors .refresh-button {
    height: 150px;
    width: 100%;
    font-size: 2em;
    align-self: center;
}
.agent-selectors .refresh-button:hover {
    background-color: hsl(345, 100%, 42%);
}
</style>
