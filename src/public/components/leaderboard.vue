/**
 * -- Currently Sales leaderboard only --
 */
<template>
    <div>
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
    props: [],
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
            return {
                datasource: this.datasource,
                filter: this.filter,
                fields: ['']
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
</style>
