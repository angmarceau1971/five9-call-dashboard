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

            // determine what order the cards should be in
            let newLayout = [];
            Object.assign(newLayout, this.layout);
            let getLeft = (card) => this.$refs[card.id][0].$el.offsetLeft;
            console.log(`---------_______________--------`);
            newLayout.cards.sort((a, b) => {
                let leftA = a.id == id ? event.clientX : getLeft(a);
                let leftB = b.id == id ? event.clientX : getLeft(b);
                console.log(`-      -      -`);
                console.log(`${a.id}: ${leftA}`);
                console.log(`${b.id}: ${leftB}`);
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
