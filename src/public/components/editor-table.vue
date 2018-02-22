/**
 * Creates a table used to modify data through API functions.
 *
 * The parent template is responsible for rendering table fields. See:
 *  https://vuejs.org/v2/guide/components.html#Scoped-Slots
 * for documentation, or ../scorecard-admin.html for example usage.
 *
 * Save buttons are included with each item's row. A Delete button is included
 * if a "remover" prop function is passed in.
 *
 *  Component properties:
 * @prop {Function} updater(item: new object) - API function to update an item on server
 * @prop {Function} loader() - API function to load items from server
 * @prop {Function} adder(item: new object) - API function to add new item to server
 * @prop {Function} remover(item: old object) - optional API function to delete item
 * @prop {Array} headers - array of string header names.
 */

<template>
    <div class="editor-wrapper">
        <table class="editor-list">
            <thead>
                <tr>
                    <th v-for="(header, i) in completeHeaders"
                        ref="headerRow">
                        {{ header }}
                    </th>
                    <th v-if="!!remover">Delete</th>
                </tr>
            </thead>
            <div class="table-body-wrapper">
                <tr class="row" v-for="(item, i) in items" ref="bodyRows">
                    <slot name="item" :item="item">
                        <p>
                            This is just a dang filler! Use
                            <a target="_blank"
                            href="https://vuejs.org/v2/guide/components.html#Scoped-Slots">
                              slot-scope</a>
                            to render `td` elements in parent.
                        </p>
                    </slot>

                    <td>
                        <button class="save-button" title="Save changes"
                            @click="update(item)"
                        >Save</button>
                    </td>
                    <td v-if="!!remover">
                        <button class="delete-button" title="Permanently delete row"
                            @click="remove(item)"
                        >Delete</button>
                    </td>
                </tr>
            </div>
        </table>

        <button class="add-button" title="Add a new row"
            @click="addRow"
        >+</button>
    </div>
</template>


<script>
const clone = require('ramda/src/clone');

export default {
    props: ['updater', 'loader', 'adder', 'remover', 'headers'],

    data: function() {
        return {
            items: []
        }
    },

    computed: {
        completeHeaders: function() {
            return this.headers.concat(['Save']);
        }
    },

    components: {},

    beforeMount: function() {
        this.load();
    },

    updated() {
        let headerRow = this.$refs.headerRow;
        let bodyRow = this.$refs.bodyRows[0].children;
        let i = 0;
        for (let cell of bodyRow) {
            let cellStyles = getComputedStyle(cell);
            headerRow[i].style.width = cellStyles.width;
            i++;
        }
    },

    methods: {
        update: async function(item) {
            this.$emit('message', `Updating ${item.name}...`);
            const message = await this.updater(item);
            this.$emit('message', message);
        },
        load: async function() {
            this.items = clone(await this.loader());
        },
        addRow: function() {
            let newItem = this.adder();
            this.items.push(newItem);
        },
        remove: async function(item) {
            this.$emit('message', `Deleting ${item.name}...`);
            const message = await this.remover(item);
            this.$emit('message', message);
            // Remove item from array
            this.items = this.items.filter((el) => el !== item);
        }
    }
}
</script>


<style scoped>
.editor-wrapper {
    width: 100%;
    overflow-x: scroll;
}
.editor-list {
    display: table;
    transform: translateX(0);
    width: 100%;
}
.table-body-wrapper {
    max-height: 450px;
    overflow-y: scroll;
    margin-top: 4em;
}
.editor-list thead {
    position: fixed;
}
.editor-list .row {
    height: 3em;
}
th, td {
    padding: 0 0.5em;
    min-width: 120px;
    vertical-align: middle;
}
th {
    text-align: left;
}
td {
    border-bottom: 1px solid hsl(225, 2%, 64%);
    align-items: center;
    height: 3em;
}
td input[type="text"] {
    width: 8em;
}
td input[type="number"] {
    width: 4em;
}
.editor-wrapper button {
    box-sizing: border-box;
    color: black;
    border: 4px solid #444;
    border-radius: 6px;
    min-width: 80px;
}
.editor-wrapper button:hover {
    background-color: white;
}
.editor-wrapper .add-button {
    font-size: 2em;
    font-weight: lighter;
    color: hsl(208, 57%, 62%);
}
</style>
