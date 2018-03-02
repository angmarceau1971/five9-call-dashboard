/**
Line graph widget. Uses D3 to render an SVG based on data and fields props.

Accepts data prop with structure:
{
  'yyyy-mm-dd': 1,
  'yyyy-mm-dd': 2, ...
}
 */

<template>
<div class="pie-chart"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler">
    <h3>{{ title }}</h3>

    <div @click="toggleTable" ref="graph-wrap" class="graph-wrap">
        <svg
            :width="width" :height="height">
        </svg>

        <!-- "Play" symbol &#9658; -->
        <div class="data-dropdown-title"
            title="Click to show or hide data table">
            <span class="rotating-play-icon"
                :class="{ 'rotate-90deg': showTable }"
            >
                &#9658;
            </span>
            Data
        </div>

        <div v-if="infoBox.message" class="info-box"
            :style="{transform: `translate(${infoBox.x}px, ${infoBox.y}px)`}"
        >{{ infoBox.message }}</div>
    </div>

    <data-table
        v-if="showTable"
        :data="tableData"
        :headers="tableHeaders"
    ></data-table>
</div>
</template>

<script>

import DataTable from './data-table.vue';
import WidgetBase from './widget-base.vue';

import * as parse from '../javascript/parse';
import { formatValue } from '../javascript/scorecard-format';

const clone = require('ramda/src/clone');

const reasonCodeColors = {
    'Lunch': 'hsl(204, 54%, 52%)',
    'One on One': 'hsl(206, 54%, 63%)',
    'Break': 'hsl(209, 56%, 73%)',
    'Training': 'hsl(205, 56%, 82%)',
    'After Call Work': 'hsl(345, 85%, 51%)',
    'Not Ready': 'hsl(345, 90%, 62%)',
    'Outbound': 'hsl(345, 90%, 82%)',
};
const reasonCodeSortOrder = [
    'Lunch', 'One on One', 'Break', 'Training',
    'After Call Work', 'Not Ready', 'Outbound',
];

const props = {
    fields: {
        type: Object
    },
    margin: {
        type: Object,
        default: () => ({
            left: 30,
            right: 20,
            top: 0,
            bottom: 0,
        }),
    },
    title: {
        type: String
    }
};

export default {
    extends: WidgetBase,
    name: 'pie-chart',

    props,

    components: {
        'data-table': DataTable
    },

    data () {
        return {
            showTable: false,
            width: 180,
            height: 180,
            radius: 90,
            paths: {
                area: '',
                line: '',
                selector: '',
                goalLine: ''
            },
            scaled: {
                x: null,
                y: null,
            },
            // Box to display printed data points when hovering
            infoBox: {
                message: '',
                x: 0,
                y: 0
            },
            // D3 objects
            color: null,
            pie: null,
            path: null,
            label: null,
            svg: null,
            g: null
        };
    },

    computed: {
        data() {
            // Get data from hub
            let raw = this.$store.getters.getData(this.filter, this.datasource);
            // Summarize by displayed field(s)
            let grouped = parse.summarize(raw, this.fields.groupBy, this.fields.sum);
            return grouped;
        },
        // Data with only fields needed to display chart
        chartData() {
            return this.data
                .map((d) => {
                    return {
                        [this.fields.groupBy]: d[this.fields.groupBy],
                        [this.fields.display]: d[this.fields.display]
                    }
                })
                .filter((d) => d[this.fields.groupBy].trim() != '');
        },
        // Clean up data for data table
        tableData() {
            if (this.fields.groupBy != 'reasonCode') return this.data;
            let additionalRows = [];
            return this.data
                .map((d) => {
                    return {
                        'reasonCode': d.reasonCode,
                        'notReadyTime': d.notReadyTime
                    }
                })
                // Remove blank reason code
                .filter((d) => d.reasonCode.trim() != '')
                // Add in Login and Handle Time rows
                .concat(additionalRows);
        },
        tableHeaders() {
            if (this.fields.groupBy != 'reasonCode') return this.data;
            return ['Reason Code', 'Time'];
        },
        padded() {
            const width = this.width - this.margin.left - this.margin.right;
            const height = this.height - this.margin.top - this.margin.bottom;
            return { width, height };
        },
    },

    mounted() {
        // Remove title tooltip, as it gets in the way of the infoBox popup
        this.$el.removeAttribute('title');

        // Set up D3
        this.svg = d3.select(this.$el).select('svg');
        this.g = this.svg.append('g').attr('transform',
                                `translate(${this.width/2}, ${this.height/2})`);
        // this.colorScale = d3.scaleOrdinal(d3.schemeDark2);
        this.colorScale = d3.scaleOrdinal(d3.schemeBlues[8]);
        this.pie = d3.pie()
            .padAngle(.05)
            .sort(this.sortValues)
            .value((d) => d[this.fields.display]);
        this.path = d3.arc()
            .outerRadius(this.radius - 10)
            .innerRadius((this.radius - 10) * 0.6);
        this.label = d3.arc()
            .outerRadius(this.radius - 40)
            .innerRadius(this.radius - 40);
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },

    watch: {
        width: function(newWidth) { this.updateChart(this.data); },
        chartData: function(newData) { this.updateChart(newData); }
    },

    methods: {
        toggleTable: function() {
            if (this.data && !this.showTable) {
                this.showTable = true;
            } else {
                this.showTable = false;
            }
        },
        updateChart: function(data) {
            this.g.selectAll('.arc, .path').remove().exit();

            let arc = this.g.selectAll('arc')
                .data(this.pie(data))
                .enter().append('g')
                  .attr('class', 'arc')
                  .on('mouseover', this.hoverOverPieSlice)
                  .on('mouseout', this.stopHoveringOverPieSlice);
            arc.append('path')
                .attr('d', this.path)
                .attr('fill', this.getColor);
        },
        hoverOverPieSlice: function(d, i) {
            this.infoBox.message = `
                ${d.data.reasonCode}:
                ${formatValue(d.data[this.fields.display], this.fields.display).value}
            `;
        },
        stopHoveringOverPieSlice: function(d, i) {
            setTimeout(function() {
                this.infoBox.message = '';
            }.bind(this), 1000);
        },
        getColor: function(d) {
            // If this is a reason code pie chart, try to use custom colors
            if (this.fields.groupBy == 'reasonCode'
                && reasonCodeColors.hasOwnProperty(d.data.reasonCode)) {
                return reasonCodeColors[d.data.reasonCode]
            // Default to blues scale
            } else {
                return this.colorScale(d.data[this.fields.groupBy]);
            }
        },
        sortValues: function (a, b) {
            if (this.fields.groupBy == 'reasonCode') {
                return reasonCodeSortOrder.indexOf(a.reasonCode)
                    <  reasonCodeSortOrder.indexOf(b.reasonCode)
                    ?  -1 : 1
            } else {
                return 0;
            }
        }
    }
};
</script>


<style scoped>
    .pie-chart {
        max-width: 100%;
        min-height: 180px;
    }
    .graph-wrap:hover {
        cursor: pointer;
    }
    .graph-wrap {
        height: 180px;
        width: 100%;
        position: relative;
    }
    .graph-wrap text, .data-dropdown-title {
        text-anchor: middle;
        font-size: 0.8em;
    }

    .data-dropdown-title {
        position: absolute;
        bottom: 10px;
        font-size: 0.6em;
        text-align: left;
        margin-left: 1em;
    }
    .rotating-play-icon {
        font-size: 0.75em;
        display: inline-block;
        transition: 0.2s all ease-in;
    }
    .rotating-play-icon.rotate-90deg {
        transform: rotate(90deg);
    }


    h1, .content {
      margin-left: 20px;
    }
    label {
      display: inline-block;
      width: 150px;
    }

    .info-box {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        color: inherit;
        border-radius: 2px;
        padding: 0.5em;
        z-index: 100000;
    }



</style>
