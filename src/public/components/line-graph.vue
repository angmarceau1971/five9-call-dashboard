/**
Line graph widget. Uses D3 to render an SVG based on data and fields props.

Accepts data prop with structure:
{
  'yyyy-mm-dd': 1,
  'yyyy-mm-dd': 2, ...
}
 */

<template>
<div class="line-graph"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler">
    <div @click="toggleTable" ref="graph-wrap" class="graph-wrap">
        <svg @mousemove="mouseover" @mouseleave="mouseleave"
                :width="width" :height="height">
            <text class="title" :x="55" :y="10">{{ fieldDisplayName(fields.y) }}</text>
            <g class="axis" ref="yaxis" :style="{transform: `translate(${margin.left}px,${margin.top}px)`}"></g>
            <g class="axis" ref="xaxis" :style="{transform: `translate(${margin.left}px,${height-margin.bottom}px)`}"></g>
            <g :style="{transform: `translate(${margin.left}px, ${margin.top}px)`}">
                <path class="area" :d="paths.area" />
                <path class="goal-line" :d="paths.goalLine" />
                <path class="line" :d="paths.line" />
                <path class="selector" :d="paths.selector" />
                <circle v-for="point in points"
                    class="data-circle"
                    :r="circleRadius"
                    :cx="point.x"
                    :cy="point.y"
                ></circle>
            </g>
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
        :data="data"
    ></data-table>
</div>
</template>

<script>

import DataTable from './data-table.vue';
import WidgetBase from './widget-base.vue';

import * as parse from '../javascript/parse';
import { formatValue } from '../javascript/scorecard-format';

const props = {
    fields: {
        type: Object
    },
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
    name: 'line-graph',

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
            circleRadius: 3,
            lastHoverPoint: {},
            scaled: {
                x: null,
                y: null,
            },
            points: [],
            circles: [],
            // Box to display printed data points when hovering
            infoBox: {
                message: '',
                x: 0,
                y: 0
            }
        };
    },

    computed: {
        data() {
            // Get data from hub
            let raw = this.$store.getters.getData(this.filter, this.datasource);
            // Summarize by displayed field(s)
            let grouped = parse.summarize(raw, this.fields.x, [this.fields.y]);
            // Sort along X axis
            grouped.sort((a, b) =>
                a[this.fields.x] < b[this.fields.x] ? -1 : 1
            );
            return grouped;
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
        // Remove title tooltip, as it gets in the way of the infoBox popup
        this.$el.removeAttribute('title');
        // Update everything when screen size changes
        window.addEventListener('resize', this.onResize);
        this.onResize();
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },

    watch: {
        width: function(newWidth) { this.update(); },
        data: function(newData) { this.update(); }
    },

    methods: {
        fieldDisplayName(fieldName) {
            return this.$store.getters.field(fieldName).displayName
                || fieldName;
        },
        toggleTable() {
            if (this.data.length > 0 && this.showTable == false) {
                this.showTable = true;
            } else {
                this.showTable = false;
            }
        },
        onResize() {
            // Set width equal to card -- grandparent element
            this.width = this.$refs['graph-wrap'].parentElement.parentElement.offsetWidth;
            this.height = this.$refs['graph-wrap'].offsetHeight;
        },
        createArea: d3.area().x(d => d.x).y0(d => d.max).y1(d => d.y),
        createLine: d3.line().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX),
        createValueSelector(point) {
            return d3.area().x(d => d.x).y0(this.padded.height).y1(0)(point);
        },
        initialize() {
            this.scaled.x = d3.scaleTime().rangeRound([0, this.padded.width]);
            this.scaled.y = d3.scaleLinear().range([this.padded.height, 0]);
            d3.axisLeft().scale(this.scaled.x);
            d3.axisBottom().scale(this.scaled.y);
        },
        update() {
            this.initialize();
            for (let d of this.data) {
                d[this.fields.y] *= 1;
                if (isNaN(d[this.fields.y])) d[this.fields.y] = 0;
            }

            this.scaled.x.domain(d3.extent(this.data, (d) => d[this.fields.x]));
            this.scaled.y.domain([0, this.ceil]);
            this.points = [];

            // Draw goal line
            const field = this.$store.getters.field(this.fields.y);
            if (field.goal) {
                let goalPoints = this.scaled.x.domain().map((xVal) =>
                    ({
                        x: this.scaled.x(xVal),
                        y: this.scaled.y(field.goal)
                    })
                );
                this.paths.goalLine = this.createLine(goalPoints);
            }

            // Create graph points
            for (let d of this.data) {
                this.points.push({
                    x: this.scaled.x(d[this.fields.x]),
                    y: this.scaled.y(d[this.fields.y]),
                    max: this.height,
                });
            }
            // this.paths.area = this.createArea(this.points);
            this.paths.line = this.createLine(this.points);

            // draw axes
            const yField = this.$store.getters.field(this.fields.y);
            d3.select(this.$refs.yaxis)
                .call(d3.axisLeft(this.scaled.y)
                        .tickFormat((d) => formatValue(d, yField).value))
                .selectAll('path, .tick line')
                .attr('stroke', '#ccc');
            d3.select(this.$refs.yaxis).selectAll('text').attr('fill', '#ddd');
            d3.select(this.$refs.xaxis)
                .call(d3.axisBottom(this.scaled.x).tickFormat(d3.timeFormat('%m-%d')))
                .selectAll('path, .tick line')
                .attr('stroke', '#ccc');
            d3.select(this.$refs.xaxis)
                .selectAll('text')
                // .attr('fill', '#ddd')
                .attr('dx', '-1em')
                .attr('transform', 'rotate(-45)');
        },

        mouseover({ offsetX, offsetY }) {
            if (this.points.length > 0) {
                const x = offsetX - this.margin.left;
                const y = offsetY - this.margin.top;
                const closestPoint = this.getClosestPoint(x);

                if (this.lastHoverPoint.index !== closestPoint.index) {
                    const point = this.points[closestPoint.index];
                    this.paths.selector = this.createValueSelector([point]);
                    this.$emit('select', this.data[closestPoint.index]);
                    this.lastHoverPoint = closestPoint;
                    // InfoBox coords are slightly to the lower-right of mouse
                    const dataPoint = this.data[closestPoint.index];
                    this.infoBox.message = `
                        ${this.fieldDisplayName(this.fields.x)}:
                        ${formatValue(dataPoint[this.fields.x], this.fields.x).value}
                        \n${this.fieldDisplayName(this.fields.y)}:
                        ${formatValue(dataPoint[this.fields.y], this.fields.y).value}
                    `;
                    this.infoBox.x = x + 30;
                    this.infoBox.y = y + 40;
                }
            }
        },
        mouseleave() {
            this.paths.selector = '';
            this.infoBox.message = '';
        },
        getClosestPoint(x) {
            return this.points
                .map((point, index) => ({
                    x: point.x,
                    diff: Math.abs(point.x - x),
                    index,
                }))
                .reduce((least, val) => (least.diff < val.diff ? least : val));
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
    }
    .data-dropdown-title {
        font-size: 0.6em;
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
        stroke: hsla(207, 99%, 80%, 0.7);
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
        color: inherit;
        border-radius: 2px;
        padding: 0.5em;
        z-index: 100000;
    }
</style>
