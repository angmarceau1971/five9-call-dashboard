/**
 * Dashboard component. Contains a list of Card components.
 */
<template>
<div class="dashboard scorecard-wrapper"
    :style="columnsStyle"
    >
        <card
            v-for="(card, i) in layout.cards"
            v-bind="card"
            :key="i"
            :ref="card.id"
        ></card>
</div>
</template>


<script>
import Card from './card.vue';
import { sortOrder } from './drag-n-drop-sort.js';

export default {
    props: ['layout'],

    components: {
        'card': Card
    },

    computed: {
        columnsStyle: function() {
            if (this.layout.columns) {
                return `grid-template-columns: repeat(${this.layout.columns}, 1fr);`;
            } else {
                return '';
            }
        }
    }
};
</script>
