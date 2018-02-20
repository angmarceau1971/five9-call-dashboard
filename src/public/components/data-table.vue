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
                <th v-for="header in displayHeaders"
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

/**
 *
 * @prop {Array} data to display
 * @prop {Array} headers - optional headers to use. If not specified, will use keys in Object.
 */
export default {
    extends: WidgetBase,
    props: ['data', 'headers'],
    components: {
        'data-table-row': DataTableRow
    },
    computed: {
        displayHeaders: function() {
            if (this.data.length == 0) return [];
            if (this.headers) return this.headers;
            // Determine headers based on object keys
            return Object.keys(this.data[0])
                .map((fieldName) => {
                        let f = this.$store.getters.field(fieldName);
                        if (f && f.displayName) return f.displayName;
                        else return fieldName;
                    }
                );
        }
    }
}
</script>

<style>
</style>
