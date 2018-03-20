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

import * as parse from '../javascript/parse';

/**
 *
 * @prop {Array} fields to display
 * @prop {Array} headers - optional headers to use. If not specified, will use keys in Object.
 * @prop {String} datasource - name of datasource being used
 * @prop {Object} filter to apply to data
 */
export default {
    extends: WidgetBase,
    props: ['fields', 'headers', 'datasource', 'filter'],
    components: {
        'data-table-row': DataTableRow
    },
    computed: {
        data: function() {
            let data = this.$store.getters.getData(this.filter, this.datasource);
            let grouped = parse.summarize(data, this.fields[0],
                    this.fields.slice(1),
                );
            // Sort by first field
            grouped.sort((a, b) =>
                a[this.fields[0]] < b[this.fields[0]] ? -1 : 1
            );
            return grouped;
        },
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
