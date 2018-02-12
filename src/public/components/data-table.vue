/**
 * Data table widget.
 */
<template>
<div class="data-table-wrapper"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler">
    <table class="data-table">
        <thead>
            <tr>
                <th v-for="header in headers"
                >{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <tr is="data-table-row"
                v-for="(datum, i) in data"
                @hoverDate="hoverDate"
                @unhoverDate="unhoverDate"
                :key="i"
                :datum="datum"
                :isHighlighted="highlightedDate==datum.dateDay"
            ></tr>
        </tbody>
    </table>
</div>
</template>

<script>
import DataTableRow from './data-table-row.vue';
import WidgetBase from './widget-base.vue';

export default {
    extends: WidgetBase,
    props: ['data', 'highlightedDate'],
    components: {
        'data-table-row': DataTableRow
    },
    computed: {
        headers: function() {
            return Object.keys(this.data[0])
                .map((fullFieldName) =>
                    this.$store.getters.field(fullFieldName).displayName
                    || fullFieldName
                );
        }
    },
    methods: {
        hoverDate: function(date) {
            this.$emit('hoverDate', date);
        },
        unhoverDate: function(date) {
            this.$emit('unhoverDate', date);
        }
    }
}
</script>

<style>
</style>
