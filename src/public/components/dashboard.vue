<template>
<div class="dashboard scorecard-wrapper" @dragover="dragoverHandler" @drop="dropHandler">
    <card
        v-for="(card, i) in layout.cards"
        v-bind="card"
        :key="i"
        :ref="card.id"
        @edit-card="editCard"
    ></card>

    <card-editor
        v-if="editingCard"
        v-bind="editedCard"
        @exit-edit="exitEdit"
        @delete-card="deleteCard"
    ></card-editor>
</div>
</template>


<script>
import Card from './card.vue';
import CardEditor from './card-editor.vue';

export default {
    props: ['layout'],

    components: {
        'card': Card,
        'card-editor': CardEditor
    },

    data: function() {
        return {
            editingCard: false,
            editedCard: null
        }
    },

    methods: {
        // Edit or delete a card
        editCard: function(cardId) {
            this.editingCard = true;
            this.editedCard = this.layout.cards.find((card) => card.id == cardId);
        },
        exitEdit: function(saveChanges, cardId, card) {
            this.editingCard = false;
            this.editedCard = '';
            if (!saveChanges) return;

            this.$emit('update-card', cardId, card);
        },
        deleteCard: function(cardId) {
            this.exitEdit(false);
            this.$emit('delete-card', cardId);
        },

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
            let left = (card) => this.$refs[card.id][0].$el.offsetLeft;
            let top  = (card) => this.$refs[card.id][0].$el.offsetTop;
            let bottom = (card) => top(card) + this.$refs[card.id][0].$el.clientHeight;

            // Determine what order the cards should be in
            newLayout.cards.sort((a, b) => {
                // If neither element is the dropped card, compare positions
                if (a.id != id && b.id != id) {
                    if (top(a) < top(b)) {
                        return -1;
                    }
                    else if (top(b) < top(a)) {
                        return +1;
                    }
                    return left(a) < left(b) ? -1 : +1;
                }
                // If card `a` is selected...
                if (a.id == id) {
                    // move forward if it's below the bottom of `b`
                    if (event.pageY > bottom(b)) {
                        return 1;
                    }
                    // move forward if it's below the top of `b` and to the
                    // of `b`
                    if (event.pageY > top(b) && event.pageX > left(b)) {
                        return 1;
                    }
                    // otherwise, let card `b` move ahead
                    return -1;
                }
                // ...If card `b` was selected, do the same.
                if (b.id == id) {
                    if (event.pageY > bottom(a)) {
                        return -1;
                    }
                    if (event.pageY > top(a) && event.pageX > left(a)) {
                        return -1;
                    }
                    return 1;
                }
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
