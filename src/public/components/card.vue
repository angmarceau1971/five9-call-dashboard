/**
 * Container for widget components.
 * Contains various functionality:
 *  - Custom styling for widgets through props `styles`, `styleClasses`, and
 *      `widgetStyles`.
 *  - Handles drag and drop events for each widget within it.
 *  - Can be dragged around other cards by dragging the title h2 (this is handled
 *      in the Dashboard component, Card's parent).
 *  - When widgets are modified, Card receives `modify-widget` events and bubbles
 *      them up to the parent Dashboard.
 */

<template>
<div class="card metric-wrapper stats-box"
    :class="styleClasses"
    :id="id"
    :style="calculatedStyles"
    @dragover="dragWidgetHandler" @drop="dropWidgetHandler">

    <!-- Card is draggable by the title -->
    <h2 class="title descriptor"
        :draggable="$store.state.editMode"
        @dragstart="dragstartHandler">{{ title }}</h2>

    <button v-if="$store.state.editMode"
        class="edit-button"
        @click="$emit('edit-card', id)"
    >&#9776;</button>
    <button v-if="$store.state.editMode"
        class="add-button"
        @click="addWidget"
    >+</button>


    <!-- Widget components -->
    <!-- TODO: make less repetitive! -->
    <single-value class="widget"
        v-for="(widget, i) in widgetsOfType('single-value')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
        @modify-widget="modifyWidget"
    ></single-value>

    <line-graph class="widget"
        v-for="(widget, i) in widgetsOfType('line-graph')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
    ></line-graph>

    <pie-chart class="widget"
        v-for="(widget, i) in widgetsOfType('pie-chart')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
    ></pie-chart>

    <data-table class="widget"
        v-for="(widget, i) in widgetsOfType('data-table')"
        v-bind="widget"
        :highlightedDate="highlightedDate"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @hoverDate="hoverDate"
        @unhoverDate="unhoverDate"
        @dragstart-widget="dragstartWidgetHandler"
    ></data-table>

    <datasource-last-updated class="widget"
        v-for="(widget, i) in widgetsOfType('datasource-last-updated')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
        @modify-widget="modifyWidget"
    ></datasource-last-updated>

    <leaderboard class="leaderboard"
        v-for="(widget, i) in widgetsOfType('leaderboard')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
        @modify-widget="modifyWidget"
    ></leaderboard>

    <queue-list class="queue-list"
        v-for="(widget, i) in widgetsOfType('queue-list')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="getWidgetStyles(widget)"
        @dragstart-widget="dragstartWidgetHandler"
        @modify-widget="modifyWidget"
    ></queue-list>
</div>
</template>


<script>
import WidgetBase from './widget-base.vue';
import DataTable from './data-table.vue';
import LineGraph from './line-graph.vue';
import SingleValue from './single-value.vue';
import PieChart from './pie-chart.vue';
import DatasourceLastUpdated from './datasource-last-updated.vue';
import Leaderboard from './leaderboard.vue';
import QueueList from './queue-list.vue';

import { formatValue } from '../javascript/scorecard-format';
import { sortOrder } from './drag-n-drop-sort.js';

export default {
    props: {
        title: String,
        widgets: Array,
        layoutOrder: Number,
        id: String,
        columns: Number,
        // styles to apply to card
        styles: {
            type: Object,
            default: () => { return {} }
        },
        styleClasses: {
            type: Array,
            default: () => { return [] }
        },
        // styles to apply to widgets
        widgetStyles: {
            type: Object,
            default: () => { return {} }
        }
    },
    components: {
        'single-value': SingleValue,
        'data-table': DataTable,
        'line-graph': LineGraph,
        'pie-chart': PieChart,
        'datasource-last-updated': DatasourceLastUpdated,
        'leaderboard': Leaderboard,
        'queue-list': QueueList
    },
    data: function() {
        return {
            highlightedDate: null,
            draggingWidget: true,
        }
    },

    computed: {
        // Return styles given as parameters, as well as position within grid
        calculatedStyles: function() {
            return Object.assign({}, this.styles, this.gridPositioning);
        },
        // Make CSS grid position a computed property, so that it will change
        // when a different layout is loaded
        gridPositioning: function() {
            return {
                'order': this.layoutOrder,
                // number of columns wide
                'grid-column': `span ${this.columns}`
            }
        }
    },

    methods: {
        // add a new widget to the card
        addWidget: function() {
            let o = WidgetBase.newObject('prompt user for widget type');
            console.log(o);
        },
        /**
         * Update a widget in this card
         * @param  {Object} newWidget object to replace with
         * @param  {String} id        for widget being modified
         * @return
         */
        modifyWidget: function(newWidget, id) {
            this.$emit('modify-widget', newWidget, id, this.id);
        },
        // Return widgets of a given type (data-table, line-graph, etc.)
        widgetsOfType: function(type) {
            return this.widgets.filter((widget) => widget['component'] == type);
        },

        // Returns object of CSS styles (such as layout position) for the widget
        getWidgetStyles: function(widget) {
            return Object.assign(
                { order: widget.layoutOrder },
                this.widgetStyles
            );
        },

        // React to user hovering over a day
        hoverDate: function(date) {
            this.highlightedDate = date;
        },
        unhoverDate: function(date) {
            this.highlightedDate = null;
        },

        // Card drag and drop handling
        dragstartHandler: function(event) {
            if (!this.$store.state.editMode) return;
            event.dataTransfer.setData('text/plain', this.id);
        },

        // Widget drag and drop handling
        dragstartWidgetHandler: function(event, widget) {
            if (!this.$store.state.editMode) return;
            this.draggingWidget = true;
            const dragData = {
                cardId: this.id,
                widgetId: widget.id
            };
            event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        },
        dragWidgetHandler: function(event) {
            if (!this.$store.state.editMode) return;
            event.preventDefault();
        },

        /**
         * Handles dropping a widget on this card, sorting all the widgets.
         * @param  {Event} event for window drop action
         * @emits  update-widget event to Dashboard component
         */
        dropWidgetHandler: function(event) {
            if (!this.$store.state.editMode) return;
            let dragData;
            try {
                // Try to parse dragData as JSON and prevent other drag/drop
                // effects
                dragData = JSON.parse(
                    event.dataTransfer.getData('text/plain'));
                event.preventDefault();
                event.stopPropagation();
            // If dragData isn't JSON, move along
            } catch (err) {
                if (err instanceof SyntaxError) {
                    return;
                }
            }

            // If this widget is being dropped in a different card, ignore
            if (dragData.cardId != this.id) return;

            // Otherwise sort widgets and update the dashboard
            let newWidgets = [];
            Object.assign(newWidgets, this.widgets);

            let el = (widget) => this.$refs[widget.id][0].$el;
            newWidgets.sort((a, b) =>
                sortOrder(a, b, event, dragData.widgetId, el)
            );
            // assign a layout order based on sort
            newWidgets.forEach((widget, i) => {
                widget.layoutOrder = i;
            });

            this.$emit('update-widgets', newWidgets, this.id);
        }
    }
}
</script>


<style>
.card {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2.5em;
    border-radius: 2px;
    align-content: space-between;
}

/* Since the card's grid determines margins, remove margins from the first
 * child of each widget.
*/
.card > .widget > *:first-child {
    margin-top: 0em;
}
.card {
    transition: all 1s;
    padding: 0.5em 0;
}

/* Buttons to edit card and/or add widgets */
.card .edit-button,
.card .add-button {
    display: inline;
    text-decoration: none;
    position: absolute;
    font-size: 1.25em;
    color: #fff;
    margin: 4%;
    width: 2em;
    height: 2em;
    align-content: center;
    justify-content: center;
    background-color: rgba(100,100,100,0.5);
    border-radius: 2em;
}
.card .edit-button:hover,
.card .add-button:hover {
    background-color: rgba(100,100,100,0.3);
}
.card .edit-button {
    top: 0;
    left: 0;
}
.card .add-button {
    top: 0;
    right: 0;
}

/********************************************/
/* Special styles from custom style classes */
.card.compact {
    grid-gap: 2.0em;
}
.card.compact > .widget {
    min-height: auto;
}
.card.compact > .widget > h3 {
    font-weight: normal;
    font-size: 1em;
}
</style>
