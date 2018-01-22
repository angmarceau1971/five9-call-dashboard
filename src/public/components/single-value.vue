/**
 * Widget that displays a single value with a (optional) title.
 */
<template>
<div class="single-value"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler"
    >
    <h3>{{ title }}</h3>
    <p class="metric"
      :class="formatted.styleClass">
        {{ formatted.value }}
    </p>

    <editor
        v-if="$store.state.editMode"
        :initialObject="$props"
        @modify-widget="modify"
    ></editor>
</div>
</template>

<script>
import WidgetBase from './widget-base.vue';

import { formatValue } from '../javascript/scorecard-format';

function sum(obj, key) {
    return obj.reduce((sum, item) => sum + item[key], 0);
}

export default {
    extends: WidgetBase,
    props: ['title', 'fieldName', 'filter'],
    computed: {
        field: function() {
            return this.$store.getters.field(this.fieldName);
        },
        formatted: function() {
            return formatValue(this.value, this.field);
        },
        value: function() {
            if (!this.filter) return 50; // @todo - git rid of!
            let data = this.$store.getters.getData(this.filter, this.fieldName);
            return sum(data, 'handleTime') / sum(data, 'calls');
        }
    },
    methods: {
        modify: function(newWidget) {
            this.$emit('modify-widget', newWidget, this.id);
        }
    }
};
</script>
