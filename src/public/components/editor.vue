/**
 * Editor for widgets.
 */
<template>
    <div class="editor-wrapper">
        <!-- Buttons to begin editing -->
        <button
            class="edit-button"
            @click="edit"
        >&#9776;</button>
        <button
            class="add-button"
            @click="add"
        >+</button>

        <!-- Modal form to modify the object -->
        <div class="edit-form modal"
            v-if="editingNow">

            <h1>{{ newObject.title }}</h1>
            <h3>Title</h3>
            <input v-model="newObject.title" />

            <div class="button-wrapper">
                <button
                    @click="exit(true)"
                >Save</button>

                <button
                    @click="exit(false)"
                >Cancel</button>

                <button
                    class="delete"
                    @click="deleteObject"
                >Delete</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['initialObject'],
    data: function() {
        return {
            editingNow: false,
            newObject: {}
        }
    },
    // Create a copy of the passed-in object on creation
    mounted() {
        Object.assign(this.newObject, this.initialObject);
    },
    methods: {
        edit: function() {
            this.editingNow = true;
        },
        add: function() {

        },
        exit: function(saveChanges) {
            this.editingNow = false;
            if (saveChanges) {
                this.$emit('modify-widget', this.newObject);
            }
        },
        deleteObject: function() {
            this.editingNow = false;
            this.$emit('modify-widget', {});
        }
    }
}
</script>

<style>
.editor-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

/* Buttons to edit card and/or add widgets */
.editor-wrapper .edit-button,
.editor-wrapper .add-button {
    display: inline;
    text-decoration: none;
    position: absolute;
    font-size: 1.25em;
    color: #fff;
    margin: 4%;
    width: 2em;
    height: 2em;
    align-content: center;
    justify-content: center;
    background-color: rgba(100,100,100,0.5);
    border-radius: 2em;
}
.editor-wrapper .edit-button:hover,
.editor-wrapper .add-button:hover {
    background-color: rgba(100,100,100,0.3);
}
.editor-wrapper .edit-button {
    top: 0;
    left: 0;
}
.editor-wrapper .add-button {
    top: 0;
    right: 0;
}
</style>
