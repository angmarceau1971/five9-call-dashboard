/**
 * Wrapper for table showing call types in queue.
 *
 * The table is collapsed by default, showing only the "Queue List" toggle
 * button.
 */
<template>
<div>
    <button class="list-toggle"
        :class="{ 'list-toggle-selected': showTable }"
        @click="toggleTable"
    >Queue List</button>

    <data-table
        v-if="showTable"
        v-bind="tableProps"
    ></data-table>
</div>
</template>

<script>
'use strict';
import WidgetBase from './widget-base.vue';
import DataTable from './data-table.vue';

export default {
    extends: WidgetBase,
    name: 'queue-list',

    props: {
        filter: Object,
        tableOptions: {
            type: Object,
            default: () => { return {} }
        }
    },

    components: {
        'data-table': DataTable
    },

    data () {
        return {
            showTable: false
        };
    },

    computed: {
        data: function() {
            let data = this.$store.getters.getData(this.filter, this.datasource);
            return data.filter((d) => d.CurrentLongestQueueTime > 0);
        },

        tableProps: function() {
            return Object.assign({
                dataFromParent: this.data,
                fields: ['SkillName', 'CallsInQueue', 'CurrentLongestQueueTime'],
                sortByField: 'CurrentLongestQueueTime',
                sortAscending: false,
            }, this.tableOptions);
        }
    },

    methods: {
        toggleTable: function() {
            this.showTable = !this.showTable;
        }
    }
}

</script>

<style scoped>
button.list-toggle {
    height: 1em;
}
.list-toggle {
    margin: 0 auto;
    color: #888;
    background-color: transparent;
    border-radius: 4px;
    cursor: pointer;
}
.list-toggle-selected {
    filter: invert(100%);
    background-color: rgba(250, 250, 250, 0.5);
}
</style>
