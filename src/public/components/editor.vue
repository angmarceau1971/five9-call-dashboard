/**
 * Editor for widgets.
 */
<template>
    <div class="modal-wrapper">
        <!-- Buttons to begin editing -->
        <button
            class="edit-button"
            @click="edit"
        >&#9776;</button>

        <!-- Modal form to modify the object -->
        <div class="edit-form modal"
            v-if="editingNow">

            <h1>{{ newObject.title }}</h1>
            <h3>Title</h3>
            <input v-model="newObject.title" />

            <h3>Data Source</h3>
            <select name="datasource-dropdown"
                v-model="newObject.datasource">
                <option
                    v-for="source in $store.state.datasources"
                    :value="source.name"
                >{{ source.name }}</option>
            </select>

            <h3>Field</h3>
            <select name="field-dropdown"
                v-model="newObject.fieldName">
                <option
                    v-for="field in $store.state.fields"
                    :value="field.fullName"
                >{{ field.displayName || field.name }}
                 {{ field.source=='N/A' ? '' : ` - ${field.source}`}}</option>
            </select>

            <h3>Date</h3>
            <select name="date-dropdown"
                v-model="newObject.filter.dateDay">
                <option
                    v-for="option in dateOptions"
                    :value="option"
                >{{ option }}</option>
            </select>

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
import * as filters from '../javascript/filters'; // TODO: dropdown for date types

const clone = require('ramda/src/clone');

export default {
    props: ['initialObject'],
    data: function() {
        return {
            editingNow: false,
            newObject: {},
            dateOptions: filters.dateOptions()
        }
    },
    // Create a copy of the passed-in object on creation
    mounted() {
        this.newObject = clone(this.initialObject);
    },
    methods: {
        edit: function() {
            this.editingNow = true;
            // close modal on click outside window
            document.documentElement.addEventListener('click', function(ev) {
                if (!this.$el.contains(ev.target)) this.exit();
            }.bind(this), false);
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
.modal-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

.edit-form {
    top: -100px;
}

/* Buttons to edit card and/or add widgets */
.modal-wrapper .edit-button,
.modal-wrapper .add-button {
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
.modal-wrapper .edit-button:hover,
.modal-wrapper .add-button:hover {
    background-color: rgba(100,100,100,0.3);
}
.modal-wrapper .edit-button {
    top: 0;
    left: 0;
}
.modal-wrapper .add-button {
    top: 0;
    right: 0;
}
</style>
