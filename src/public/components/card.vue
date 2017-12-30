<template>
<div class="card metric-wrapper stats-box"
    v-bind:style="{ order: layoutOrder }"
    @dragover="dragWidgetHandler" @drop="dropWidgetHandler">

    <!-- Card is draggable by the title -->
    <h2 class="title descriptor" :draggable="$store.state.editMode"
        @dragstart="dragstartHandler">{{ title }}</h2>

    <button v-if="this.$store.state.editMode"
        class="edit-button"
        @click="$emit('edit-card', id)"
    >&#9776;</button>
    <button v-if="this.$store.state.editMode"
        class="add-button"
        @click="addWidget"
    >+</button>


    <single-value
        v-for="(widget, i) in widgetsOfType('single-value')"
        v-bind="widget"
        :id="i"
        :key="i"
        @dragstart-widget="dragstartWidgetHandler"
        ></single-value>


    <line-graph
        v-for="(widget, i) in widgetsOfType('line-graph')"
        :data="data"
        :x-field="widget.fieldNames.x"
        :y-field="widget.fieldNames.y"
        :key="widget.id"
    ></line-graph>

    <data-table
        v-for="(widget, i) in widgetsOfType('data-table')"
        @hoverDate="hoverDate"
        @unhoverDate="unhoverDate"
        :data="data"
        :highlightedDate="highlightedDate"
        :key="i"
    ></data-table>
</div>
</template>


<script>

import DataTable from './data-table.vue';
import LineGraph from './line-graph.vue';
import { formatValue } from '../javascript/scorecard-format';
import WidgetBase from './widget-base.vue';

const singleValue = {
    extends: WidgetBase,
    props: ['value', 'title', 'fieldName'],
    template: `
        <div class="single-value"
            :draggable="$store.state.editMode"
            @dragstart="dragstartHandler"
            >
            <h3>{{ title }}</h3>
            <p class="metric"
              :class="formatted.styleClass">
                {{ formatted.value }}
            </p>
        </div>
    `,
    computed: {
        field: function() {
            return this.$store.getters.field(this.fieldName);
        },
        formatted: function() {
            return formatValue(this.value, this.field);
        }
    }
};

export default {
    props: ['title', 'widgets', 'data', 'meta', 'layoutOrder', 'id'],
    components: {
        'single-value': singleValue,
        'data-table': DataTable,
        'line-graph': LineGraph
    },
    data: function() {
        return {
            highlightedDate: null,
            draggingWidget: true
        }
    },
    methods: {
        // add a new widget to the cardj
        addWidget: function() {

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
            console.log('dragging card');
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
            console.log('dragWidget');
        },
        dragWidgetHandler: function(event) {
            if (!this.$store.state.editMode) return;
            event.preventDefault();
            console.log('dragoverCard');
        },
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

            console.log('this is it')


        },
        dropWidget: function(event) {
            console.log('widget dropped!')
            console.log(event);
        }
    }
}
</script>


<style>
.card > * {
    margin: 2em 0;
}
.card {
    transition: all 1s;
}

.card button {
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
.card button:hover {
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
