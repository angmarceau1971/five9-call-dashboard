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
                    ref="headerRow"
                >{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <tr ref="bodyRows"
                v-for="(datum, i) in data"
                :key="i"
                :class="{ highlight: isHighlighted(i) }"
            >
                <td
                  v-for="(val, key) in datum"
                  v-on:mouseover="highlight(i)"
                  v-on:mouseleave="unhighlight(i)"
                  :class="formatted(val, key).styleClass">
                    {{ formatted(val, key).value }}
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
import WidgetBase from './widget-base.vue';

import * as parse from '../javascript/parse';
import { formatValue } from '../javascript/scorecard-format.js';

/**
 *
 * @prop {Array} fields to display
 * @prop {Array} headers - optional headers to use. If not specified, will use keys in Object.
 * @prop {String} datasource - name of datasource being used
 * @prop {Object} filter to apply to data
 * @prop {Boolean} isChild - defaults to false
 */
export default {
    extends: WidgetBase,
    props: {
        fields: Array,
        headers: Array,
        datasource: String,
        filter: Object,
        summarize: {
            type: Boolean,
            default: true
        },
        isChild: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            highlightedRow: null
        };
    },

    /**
     * Any time an update occurs, the headers' width needs to be matched to the
     * body's width (because the header is contained in its own fixed div).
     */
    updated() {
        this.alignColumns();
    },
    mounted() {
        this.alignColumns();
    },

    computed: {
        data: function() {
            let data = this.$store.getters.getData(this.filter, this.datasource);
            if (this.summarize) {
                data = parse.summarize(data, this.fields[0],
                        this.fields.slice(1),
                    );
            }
            // Sort by first field
            data.sort((a, b) =>
                a[this.fields[0]] < b[this.fields[0]] ? -1 : 1
            );
            // Leave only fields that are defined in widget
            return data.map(parse.filterFields(this.fields));
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
    },

    methods: {
        highlight: function(i) {
            this.highlightedRow = i;
        },
        unhighlight: function() {
            this.highlightedRow = null;
        },
        isHighlighted: function(i) {
            return this.highlightedRow == i;
        },
        formatted: function (val, fieldName) {
            let res = formatValue(val, fieldName);
            return res;
        },
        alignColumns: function() {
            if (this.data.length == 0) return;
            let headerRow = this.$refs.headerRow;
            let bodyRow = this.$refs.bodyRows[0].children;
            let i = 0;
            for (let cell of bodyRow) {
                let cellStyles = getComputedStyle(cell);
                headerRow[i].style.width = cellStyles.width;
                i++;
            }
        }
    }
}
</script>

<style>
</style>
