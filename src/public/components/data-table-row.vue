/**
 * Component to display a single table row of data. Child of DataTable widgets.
 */
<template>
    <tr v-bind:class="{ highlight: isHighlighted }">
        <td
          v-for="(val, key) in datum"
          v-on:mouseover="highlight"
          v-on:mouseleave="unhighlight"
          v-bind:class="formatted(val, key).styleClass">
            {{ formatted(val, key).value }}
        </td>
    </tr>
</template>

<script>
import { formatValue } from '../javascript/scorecard-format.js';

export default {
    props: ['datum', 'headers'],
    data () {
        return {
            isHighlighted: false
        };
    },
    methods: {
        highlight: function() {
            this.isHighlighted = true;
        },
        unhighlight: function() {
            this.isHighlighted = false;
        },
        formatted: function (val, fieldName) {
            let res = formatValue(val, this.$store.getters.field(fieldName));
            return res;
        }
    }
}
</script>
