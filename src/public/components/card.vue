<template>
<div class="card metric-wrapper stats-box"
        v-bind:style="{ order: layoutOrder }"
        :draggable="$store.state.editMode"
        @dragstart="dragstartHandler">

    <h2 class="descriptor">{{ title }}</h2>

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
        :key="i"
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


const singleValue = {
    props: ['value', 'title', 'fieldName'],
    template: `
        <div>
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
            highlightedDate: null
        }
    },
    methods: {
        //
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
        // Drag and drop handling
        dragstartHandler(event) {
            if (!this.$store.state.editMode) return;
            event.dataTransfer.setData('text/plain', this.id);
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
