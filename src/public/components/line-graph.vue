/**
Line graph widget. Uses D3 to render an SVG based on data and fields props.

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
                <path class="line" :d="paths.line" :style="{ stroke: lineColor }" />
                <path class="selector" :d="paths.selector" />
                <circle v-for="point in points"
                    class="data-circle"
                    :r="circleRadius"
                    :cx="point.x"
                    :cy="point.y"
                    :style="{ fill: lineColor }"
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
        >
            {{ infoBox.message }}
        </div>
    </div>

    <data-table
        v-if="showTable"
        v-bind="tableProps"
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
    },
    statsType: { // `individual` or `team`
        type: String,
        default: 'individual'
    },
    summarize: { // whether to summarize data in table
        type: Boolean,
        default: true
    },
    // options to pass to child data-table
    tableOptions: {
        type: Object,
        default: () => ({}) // default to empty object
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
                selector: ''
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

    mounted() {
        // Remove title tooltip, as it gets in the way of the infoBox popup
        this.$el.removeAttribute('title');
        // Update everything when screen size changes
        window.addEventListener('resize', this.onResize);
    },

    computed: {
        data() {
            // Get data from hub
            let raw = this.$store.getters.getData(this.filter, this.datasource);
            // Summarize by displayed field(s)
            let yFields = [this.fields.y];
            if (this.fields.y2) yFields.push(this.fields.y2);
            let grouped = parse.summarize(raw, this.fields.x, yFields);
            // Sort along X axis
            grouped.sort((a, b) =>
                a[this.fields.x] < b[this.fields.x] ? -1 : 1
            );
            // Remove infinite or NaN values
            return grouped.filter((d) => {
                return isFinite(d[this.fields.y]) && !isNaN(d[this.fields.y]);
            });
        },
        padded() {
            const width = this.width - this.margin.left - this.margin.right;
            const height = this.height - this.margin.top - this.margin.bottom;
            return { width, height };
        },
        ceil() {
            return d3.max(this.data, (d) => d[this.fields.y]);
        },
        lineColor() {
            if (this.statsType == 'team') {
                return 'hsl(345, 91%, 48%)';
            } else {
                return 'steelblue';
            }
        },
        // Return array of fields to be displayed by data-table
        tableFields() {
            if (this.tableOptions.fields) return this.tableOptions.fields;
            // if no specific field given, default to those displayed in graph
            let fields = [this.fields.x, this.fields.y];
            if (this.fields.y2) fields.push(this.fields.y2);
            if (this.fields.y3) fields.push(this.fields.y3);
            return fields;
        },
        tableProps() {
            let initialOptions = {
                datasource: this.datasource,
                filter: this.filter,
                fields: this.tableFields,
                summarize: this.summarize,
                isChild: true,
            }
            return Object.assign(initialOptions, this.tableOptions);
        }
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
            this.onResize();
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

        // When hovering over graph, display a line at the point nearest to the
        // mouse position. Also, show `infobox` with relevent data.
        mouseover({ offsetX, offsetY, clientX, screenX }) {
            if (this.points.length > 0) {
                let x = offsetX - this.margin.left;
                let y = offsetY - this.margin.top;
                let closestPoint = this.getClosestPoint(x);

                if (this.lastHoverPoint.index !== closestPoint.index) {
                    let point = this.points[closestPoint.index];
                    this.paths.selector = this.createValueSelector([point]);
                    this.$emit('select', this.data[closestPoint.index]);
                    this.lastHoverPoint = closestPoint;
                    // InfoBox coords are slightly to the lower-right of mouse
                    let dataPoint = this.data[closestPoint.index];
                    this.infoBox.message = `
                        ${this.fieldDisplayName(this.fields.x)}: ${formatValue(dataPoint[this.fields.x], this.fields.x).value}
                        ${this.fieldDisplayName(this.fields.y)}: ${formatValue(dataPoint[this.fields.y], this.fields.y).value}
                    `;
                    // Put infobox at mouse x & y. If x would hang off edge of
                    // screen, scoot it left by 400px.
                    if (this.$el.getBoundingClientRect().left + x + 400
                        > screen.width) {
                        x -= 250;
                    }
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
        stroke-linejoin: round;
        stroke-linecap: round;
        stroke-width: 1.5;
    }
    .axis {
        font-size: 0.5em;
    }
    .selector {
        stroke: hsla(207, 99%, 80%, 0.7);
        stroke-width: 1.0;
        fill: none;
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
