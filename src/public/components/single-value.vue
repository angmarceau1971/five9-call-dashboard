/**
 * Widget that displays a single value with a title, and optionally sub-values.
 * @prop {String} fieldName
 * @prop {Array} subFields - optional
 * ... and other base widget props (filter, datasource,...)
 */
<template>
<div class="single-value"
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler"
    >
    <h3>{{ title }}</h3>
    <p class="metric"
      :class="formatted.styleClass"
      :title="hoverText"
    >{{ formatted.value }}
    </p>

    <div class="subvalue-wrapper">
        <p class="subvalue"
            v-if="subFields"
            v-for="v in subValues"
            :title="v.fieldName"
            :class="v.styleClass"
        >{{ v.value }}</p>
    </div>

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
import * as parse from '../javascript/parse';


export default {
    extends: WidgetBase,
    props: ['title', 'fieldName', 'subFields'],
    computed: {
        field: function() {
            return this.$store.getters.field(this.fieldName);
        },
        formatted: function() {
            return formatValue(this.value, this.field);
        },
        data: function() {
            return this.$store.getters.getData(this.filter, this.datasource);
        },
        value: function() {
            return parse.getValueForField(this.data, this.fieldName);
        },
        subValues: function() {
            if (!this.subFields) return [];
            return this.subFields.map((field) => {
                let formatted = formatValue(
                    parse.getValueForField(this.data, field),
                    field
                );
                return {
                    value: formatted.value,
                    styleClass: formatted.styleClass,
                    fieldName: this.$store.getters.field(field).displayName
                }
            });
        },
        hoverText: function() {
            let field = this.$store.getters.field(this.fieldName);
            if (!field) return this.title;
            let goal = this.$store.getters.goalForField(field);
            if (!goal) return this.title;
            return `${this.title} - Goal: ${formatValue(goal.thresholds[0], field).value}`;
        }
    },
    methods: {
        modify: function(newWidget) {
            this.$emit('modify-widget', newWidget, this.id);
        }
    }
};

</script>


<style scoped>
.single-value {
    min-height: 110px;
}
.subvalue-wrapper {
    display: flex;
    justify-content: center;
}
.subvalue {
    margin: 1em 1.5em 0.5em 1.5em;
}
</style>
