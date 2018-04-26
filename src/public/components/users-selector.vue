<template>
<div>
    <div class="message" v-if="message">
        <p>
            {{ message }}
        </p>
    </div>
    <div v-if="userList.length > 0" class="section agent-selectors">
        <div class="agentgroup-list">
            <select multiple size="30" v-model="selectedAgentGroups"
                    @change="selectAgentGroups(selectedAgentGroups)">
                <option v-for="(agentGroup, i) in agentGroups"
                    :value="agentGroup">
                    {{ agentGroup }}
                </option>
            </select>
        </div>
        <div class="user-list">
            <select multiple size="30" v-model="selectedUsernames"
                @change="selectUsers(getUsers(selectedUsernames))">
                <option v-for="(userAgent, i) in filterUsersInGroup(userList)"
                    :value="userAgent.username">
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
const intersection = require('ramda/src/intersection');

export default {
    name: 'users-selector',


    props: {
        showRefresh: {
            default: true
        }
    },


    data () {
        return {
            userList: [],
            selectedUsernames: [],
            selectedAgentGroups: [],
            agentGroups: [],
            message: ''
        }
    },


    mounted: async function() {
        this.userList = await this.loadUsersList();
        this.agentGroups = this.getAgentGroupsFromUsers(this.userList);
        this.$emit('users-loaded', this.userList);
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
        loadUsersList: async function() {
            let userList = await api.getUsers();
            userList.sort((a, b) => a.lastName < b.lastName ? -1 : +1);
            return userList;
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
