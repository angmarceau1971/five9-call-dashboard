<template>
<div class="dashboard scorecard-wrapper" @dragover="dragoverHandler" @drop="dropHandler">
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

export default {
    props: ['layout'],

    components: {
        'card': Card
    },

    methods: {
        // Drag and drop to move cards
        dragoverHandler: function(event) {
            if (!this.$store.state.editMode) return;
            event.preventDefault();
        },
        dropHandler: function(event) {
            if (!this.$store.state.editMode) return;

            const id = event.dataTransfer.getData('text');
            const thisCard = this.$refs[id][0];
            let newLayout = [];
            Object.assign(newLayout, this.layout);
            let getLeft = (card) => this.$refs[card.id][0].$el.offsetLeft;

            // determine what order the cards should be in
            newLayout.cards.sort((a, b) => {
                // Each card's position is the mouse X if this is the card being
                // dropped; otherwise, use the left side of the element
                let leftA = a.id == id ? event.clientX : getLeft(a);
                let leftB = b.id == id ? event.clientX : getLeft(b);
                return leftA < leftB ? -1 : +1;
            });

            // Update the layoutOrder property for each card
            newLayout.cards.forEach((card, i) => {
                card.layoutOrder = i;
            });

            // Update the layout
            this.$emit('update-layout', newLayout);
        }
    }
};
</script>
