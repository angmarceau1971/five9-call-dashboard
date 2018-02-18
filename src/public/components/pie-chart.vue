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
    <div @click="toggleTable" ref="graph-wrap" class="graph-wrap">
        <svg @mousemove="mouseover" @mouseleave="mouseleave"
                :width="width" :height="height">

        </svg>
        <div>
            {{ dataSummary }}
        </div>
        <div v-if="infoBox.message" class="info-box"
            :style="{transform: `translate(${infoBox.x}px, ${infoBox.y}px)`}"
        >{{ infoBox.message }}</div>
    </div>

    <data-table
        v-if="showTable"
        @hoverDate="hoverDate"
        @unhoverDate="unhoverDate"
        :data="data"
        :highlightedDate="highlightedDate"
    ></data-table>
</div>
</template>

<script>

import DataTable from './data-table.vue';
import WidgetBase from './widget-base.vue';

import * as parse from '../javascript/parse';
import { formatValue } from '../javascript/scorecard-format';

const props = {
    margin: {
        type: Object,
        default: () => ({
            left: 30,
            right: 20,
            top: 20,
            bottom: 25,
        }),
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
            width: 0,
            height: 0,
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
        };
    },

    computed: {
        data() {
            // Get data from hub
            return this.$store.getters.getData(this.filter, this.datasource);

        },
        dataSummary() {
            let data = this.data;
            return data;
        },
        padded() {
            const width = this.width - this.margin.left - this.margin.right;
            const height = this.height - this.margin.top - this.margin.bottom;
            return { width, height };
        },
        ceil() {
            return d3.max(this.data, (d) => d[this.fields.y]);
        }
    },

    mounted() {
        // Update everything when screen size changes
        // window.addEventListener('resize', this.onResize);
        // this.onResize();
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },

    watch: {
        width: function(newWidth) { this.update(); },
        data: function(newData) { this.updateChart(newData); }
    },

    methods: {
        toggleTable: function() {

        },
        updateChart: function(data) {

        },
        mouseover: function(event) {
        },
        mouseleave: function(event) {

        }
    }
};
</script>


<style scoped>
    .line-graph {
        max-width: 100%;
        min-height: 200px;
    }
    .graph-wrap:hover {
        cursor: pointer;
    }
    .graph-wrap {
        height: 175px;
        width: 100%;
    }
    .graph-wrap text, .data-dropdown-title {
        text-anchor: middle;
        font-size: 0.8em;
        fill: #ddd;
    }
    .data-dropdown-title {
        font-size: 0.6em;
        color: #ddd;
        text-align: left;
        margin-left: 30px;
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

    .line {
        fill: none;
        stroke: steelblue;
        stroke-linejoin: round;
        stroke-linecap: round;
        stroke-width: 1.5;
    }
    .goal-line {
        fill: none;
        stroke: lightgrey;
        stroke-opacity: 0.7;
        stroke-width: 1.0;
    }
    .axis {
        font-size: 0.5em;
    }
    .selector {
        stroke: hsla(207, 84%, 85%, 0.7);
        stroke-width: 1.0;
        fill: none;
    }
    .data-circle {
        fill: steelblue;
    }
    .info-box {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        background-color: hsla(0, 0%, 40%, 0.75);
        color: inherit;
        border-radius: 2px;
        padding: 0.5em;
        z-index: 100000;
    }
</style>
