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
                :key="i"
                :datum="datum"
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
    props: ['data'],
    components: {
        'data-table-row': DataTableRow
    },
    computed: {
        headers: function() {
            if (this.data.length == 0) return [];
            return Object.keys(this.data[0])
                .map((fullFieldName) => {
                        let f = this.$store.getters.field(fullFieldName);
                        if (f && f.displayName) return f.displayName;
                        else return fullFieldName;
                    }
                );
        }
    }
}
</script>

<style>
</style>
