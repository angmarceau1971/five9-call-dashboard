/**
 * Dashboard component. Contains a list of Card components.
 *
 * Listens for events to modify cards and widgets, and bubbles up to app instance.
 *
 * Handles dragging and dropping of child cards to move them around.
 *
 */
<template>
<div class="dashboard scorecard-wrapper"
    @dragover="dragoverHandler" @drop="dropHandler">
    <card
        v-for="(card, i) in layout.cards"
        v-bind="card"
        :key="i"
        :ref="card.id"
        @edit-card="editCard"
        @modify-widget="modifyWidget"
        @update-widgets="updateWidgets"
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
import { sortOrder } from './drag-n-drop-sort.js';

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

        /**
         * Modify a single widget.
         * @param  {Object} newWidget object to replace old widget with
         * @param  {String} widgetId  id of widget within card
         * @param  {String} cardId    id of card containing widget
         * @emits  modify-widget event to app Vue instance
         */
        modifyWidget: function(newWidget, widgetId, cardId) {
            this.$emit('modify-widget', newWidget, widgetId, cardId);
        },

        /**
         * Update all widgets. Used to change order of widgets after drag and
         * drop actions.
         * @param  {Array}  newWidgets all of the new widgets
         * @param  {String} cardId     card that is being modified
         * @emits  update-card Event to app's Vue instance
         */
        updateWidgets: function(newWidgets, cardId) {
            let newCard = {};
            Object.assign(newCard, this.layout.cards[cardId]);
            newCard.widgets = newWidgets;
            this.$emit('update-card', cardId, newCard);
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

            // Determine what order the cards should be in
            let el = (card) => this.$refs[card.id][0].$el;
            newLayout.cards.sort((a, b) =>
                sortOrder(a, b, event, id, el)
            );

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
