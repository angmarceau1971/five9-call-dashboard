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

export default {
    extends: WidgetBase,
    props: ['value', 'title', 'fieldName'],
    computed: {
        field: function() {
            return this.$store.getters.field(this.fieldName);
        },
        formatted: function() {
            return formatValue(this.value, this.field);
        }
    },
    methods: {
        modify: function(newWidget) {
            this.$emit('modify-widget', newWidget, this.id);
        }
    }
};
</script>
