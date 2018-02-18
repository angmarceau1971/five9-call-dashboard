/**
 * Container for widget components.
 * Contains various functionality:
 *  - Handles drag and drop events for each widget within it
 *  - Can be dragged around other cards by dragging the title h2 (this is handled
 *      in the Dashboard component, Card's parent)
 *  - When widgets are modified, Card receives `modify-widget` events and bubbles
 *      them up to the parent Dashboard
 */

<template>
<div class="card metric-wrapper stats-box"
    :id="id"
    :style="gridPositioning"
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
    <single-value class="widget"
        v-for="(widget, i) in widgetsOfType('single-value')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="{ order: widget.layoutOrder }"
        @dragstart-widget="dragstartWidgetHandler"
        @modify-widget="modifyWidget"
    ></single-value>

    <line-graph class="widget"
        v-for="(widget, i) in widgetsOfType('line-graph')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="{ order: widget.layoutOrder }"
        @dragstart-widget="dragstartWidgetHandler"
    ></line-graph>

    <pie-chart class="widget"
        v-for="(widget, i) in widgetsOfType('pie-chart')"
        v-bind="widget"
        :key="widget.id"
        :ref="widget.id"
        :style="{ order: widget.layoutOrder }"
        @dragstart-widget="dragstartWidgetHandler"
    ></pie-chart>

    <data-table class="widget"
        v-for="(widget, i) in widgetsOfType('data-table')"
        v-bind="widget"
        :data="data"
        :highlightedDate="highlightedDate"
        :key="widget.id"
        :ref="widget.id"
        :style="{ order: widget.layoutOrder }"
        @hoverDate="hoverDate"
        @unhoverDate="unhoverDate"
        @dragstart-widget="dragstartWidgetHandler"
    ></data-table>
</div>
</template>


<script>
import WidgetBase from './widget-base.vue';
import DataTable from './data-table.vue';
import LineGraph from './line-graph.vue';
import SingleValue from './single-value.vue';
import PieChart from './pie-chart.vue';

import { formatValue } from '../javascript/scorecard-format';
import { sortOrder } from './drag-n-drop-sort.js';

export default {
    props: ['title', 'widgets', 'data', 'meta', 'layoutOrder', 'id', 'columns'],
    components: {
        'single-value': SingleValue,
        'data-table': DataTable,
        'line-graph': LineGraph,
        'pie-chart': PieChart
    },
    data: function() {
        return {
            highlightedDate: null,
            draggingWidget: true,
            // CSS Grid positioning
            gridPositioning: {
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
    grid-gap: 3em;
}

/* Since the card's grid determines margins, remove margins from the first
 * child of each widget.
*/
.card > .widget > *:first-child {
    margin-top: 0em;
}
.card {
    transition: all 1s;
    padding: 0.5em;
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

</style>
