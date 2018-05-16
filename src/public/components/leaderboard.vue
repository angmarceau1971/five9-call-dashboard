/**
 * -- Currently Sales leaderboard only --
 */
<template>
    <div class="leaderboard">
        <button @click="openTracker">Add a Sale</button>
        <tracker
            :visible="showTracker"
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
import Tracker from './tracker.vue';

export default {
    extends: WidgetBase,
    props: ['datasourceSales', 'datasourceCalls'],
    components: {
        'tracker': Tracker,
        'data-table': DataTable
    },
    data: function() {
        return {
            showTracker: false
        }
    },
    computed: {
        tableProps: function() {
            // Combine sales tracker data with ACD log data
            let sales = this.$store.getters.getData({}, this.datasourceSales);
            let calls = this.$store.getters.getData({}, this.datasourceCalls);
            let data = calls
                .map((datum) => {
                    datum.username = datum.agentUsername;
                    return datum;
                })
                .concat(sales);

            // Pass to table
            return {
                dataFromParent: data,
                sortByField: 'estimatedCloseRate',
                fields: ['username', 'saleMade', 'calls', 'estimatedCloseRate', 'dtvSaleMade'],
                filter: {},
                sortAscending: false // sort highest to lowest
            }
        }
    },
    methods: {
        openTracker: function() {
            this.showTracker = true;
        },
        closeTracker: function() {
            this.showTracker = false;
        }
    }
}
</script>

<style scoped>
.leaderboard {
    height: 600px;
}
</style>
