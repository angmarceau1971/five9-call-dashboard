/**
 * -- Currently Sales leaderboard only --
 */
<template>
    <div class="leaderboard">
        <p v-if="message" class="message">
            {{ message }}
        </p>

        <div class="top-row-wrapper">
            <single-value class="overall-value" v-bind="overallProps"></single-value>
            <button class="open-tracker" @click="openTracker">Add a Sale</button>
        </div>

        <tracker
            :visible="showTracker"
            @message="updateMessage"
            @exit="closeTracker"
        ></tracker>

        <data-table
            v-bind="tableProps"
        ></data-table>
    </div>
</template>

<script>
'use strict';
import WidgetBase from './widget-base.vue';
import DataTable from './data-table.vue';
import SingleValue from './single-value.vue';
import Tracker from './tracker.vue';

export default {
    extends: WidgetBase,
    props: ['datasourceSales', 'datasourceCalls'],
    components: {
        'tracker': Tracker,
        'data-table': DataTable,
        'single-value': SingleValue
    },
    data: function() {
        return {
            showTracker: false,
            message: ''
        };
    },
    computed: {
        data: function() {
            // Combine sales tracker data with ACD log data
            let sales = this.$store.getters.getData({}, this.datasourceSales);
            let calls = this.$store.getters.getData({}, this.datasourceCalls);
            return calls
                .map((datum) => {
                    datum.username = datum.agentUsername;
                    return datum;
                })
                .concat(sales);
        },
        tableProps: function() {
            // Pass data to table
            return {
                dataFromParent: this.data,
                sortByField: 'estimatedCloseRate',
                fields: ['username', 'saleMade', 'calls', 'estimatedCloseRate', 'dtvSaleMade'],
                filter: {},
                sortAscending: false, // sort highest to lowest
                styles: {
                    'max-height': '100%'
                }
            };
        },
        overallProps: function() {
            return {
                dataFromParent: this.data,
                fieldName: 'estimatedCloseRate',
                subFields: ['saleMade', 'calls'],
                title: 'Overall Close Rate'
            };
        }
    },
    methods: {
        openTracker: function() {
            this.showTracker = true;
        },
        closeTracker: function() {
            this.showTracker = false;
        },
        // update message, clearing after 5 seconds
        updateMessage: function(message) {
            this.message = `${message} ${goodJobPhrase()}`;
            setTimeout(function clearMessage() {
                this.message = '';
            }.bind(this), 10000);
        }
    }
}

function goodJobPhrase() {
    let phrases = [
        'Good job!', 'Nice work!', 'Well done!', 'Perfecto!', `You're on fuego!`,
        '🐱', 'Far out!', 'Great work!', 'Your wallet thanks you!',
        'Adding to that savings account!', 'Cha-ching!'
    ];
    let i = Math.floor(Math.random() * phrases.length);
    return phrases[i];
}
</script>

<style scoped>
.leaderboard {
    overflow: auto;
}
.top-row-wrapper {
    display: flex;
    flex-direction: row;
}
.overall-value {
    width: 50%;
}
button.open-tracker {
    width: 15rem;
    height: 4rem;
    margin: auto 0;
    font-size: 1.25rem;
    background-color: hsl(207, 60%, 41%);
    color: white;
    cursor: pointer;
}
button.open-tracker:hover {
    filter: brightness(1.7);
    box-shadow: 0 0 5px 0 #eee;
}
.leaderboard .message {
    color: hsl(123, 100%, 50%);
    margin-top: 0;
}
</style>
