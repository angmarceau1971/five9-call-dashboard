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
            let data = this.$store.getters.getData(this.filter, this.fieldName);
            if (this.fieldName == 'AHT') {
                return sum(data, 'handleTime') / sum(data, 'calls');
            }
            else if (this.fieldName == 'ACW') {
                return sum(data, 'acwTime') / sum(data, 'calls');
            }
            else if (this.fieldName == 'calls') {
                return sum(data, 'calls');
            }
            else {
                throw new Error(`SingleValue component isn't expecting the field name: ${this.fieldName}`);
            }
        }
    },
    methods: {
        modify: function(newWidget) {
            this.$emit('modify-widget', newWidget, this.id);
        }
    }
};
</script>
