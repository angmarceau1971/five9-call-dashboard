/**
 * Data table widget.
 */
<template>
<div class="data-table-wrapper"
    :style="styles"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler">

    <button
        title="Download data as CSV"
        @click="downloadData">
        <i class="fas fa-download"></i>
    </button>

    <h3 v-if="showTitle">{{ title }}</h3>
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
'use strict';

import WidgetBase from './widget-base.vue';
import * as parse from '../javascript/parse';
import { formatValue } from '../javascript/scorecard-format.js';

/**
 * @prop {Array} fields to display. The first field will be the one that data
 *               is summarized by if the `summarizeBy` prop isn't given.
 * @prop {Array} summarizeBy - which fields to summarize data by
 * @prop {Array} headers - optional headers to use. If not specified, will use keys in Object.
 * @prop {String} datasource - name of datasource being used
 * @prop {Object} filter to apply to data
 * @prop {Boolean} isChild - defaults to false
 */
export default {
    extends: WidgetBase,
    props: {
        fields: Array,
        summarize: {
            type: Boolean,
            default: true
        },
        summarizeBy: {
            type: Array,
            default: null
        },
        headers: Array,
        datasource: String,
        filter: Object,
        isChild: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        sortByField: String,
        sortAscending: {
            type: Boolean,
            default: true
        },
        // Optional data from parent to be used instead of retrieving data via
        // filters & datasource
        dataFromParent: {
            type: Array,
            default: null
        },
        // Additional CSS styling
        styles: {
            type: Object,
            default: () => { return {} }
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
            // Get data from hub unless passed in by parent
            let data;
            if (!this.dataFromParent) {
                data = this.$store.getters.getData(this.filter, this.datasource);
            } else {
                data = this.dataFromParent;
            }
            // Summarize
            if (this.summarize == true) {
                if (this.summarizeBy) {
                    data = parse.summarizeByMultiple(data, this.summarizeBy, this.fields);
                } else { // default to summarizing by first field
                    data = parse.summarize(data, this.fields[0], this.fields.slice(1));
                }
            }
            // TODO: take care of this case in the parse module
            if (this.fields[0] == 'reasonCode')
                return getNotReadyPercentage(data).sort((a,b) => a['reasonCode'] < b['reasonCode'] ? -1 : 1);
            // Sort by sortByField, or first field if none given
            let sortField = this.sortByField || this.fields[0];
            data.sort((a, b) => {
                if (this.sortAscending)
                    return a[sortField] < b[sortField] ? -1 : 1;
                else
                    return a[sortField] > b[sortField] ? -1 : 1;
            });
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
        },
        showTitle: function() {
            return (!this.isChild && this.title);
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
            let res = formatValue(val, fieldName, this.skillGroup(this.filter));
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


function getNotReadyPercentage(data) {
    let loginTimeTotal = parse.sum(data, 'loginTime');
    return data
        .map((d) => {
            return {
                'reasonCode': d.reasonCode,
                'notReadyPercentage': d.notReadyTime / loginTimeTotal
            }
        })
        // Remove blank reason code
        .filter((d) => d.reasonCode.trim() != '');
}

</script>

<style scoped>
</style>
