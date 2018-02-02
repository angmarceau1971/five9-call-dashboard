/**
 * Creates a table used to modify data through API functions.
 *
 * The parent template is responsible for rendering table fields. See:
 *  https://vuejs.org/v2/guide/components.html#Scoped-Slots
 * for documentation, or ../scorecard-admin.html for example usage.
 *
 * A "Save Changes" button is included with each item's row.
 *
 *  Component properties:
 * @prop {Function} updater(item: new object) - API function to update an item on server
 * @prop {Function} loader() - API function to load items from server
 * @prop {Array} headers - array of string header names.
 */

<template>
    <div class="editor-wrapper">
        <table class="editor-list">
            <thead>
                <tr>
                    <th v-for="header in headers">
                        {{ header }}
                    </th>
                    <th>Save Changes</th>
                </tr>
            </thead>
            <tr class="row" v-for="(item, i) in items">
                <slot name="item" :item="item">
                    <p>
                        This is just a dang filler! Use <a href="https://vuejs.org/v2/guide/components.html#Scoped-Slots">slot-scope</a>
                        to render `td` elements in parent.
                    </p>
                </slot>

                <td>
                    <button @click="update(item)"
                    >Save</button>
                </td>
            </tr>
        </table>
    </div>
</template>


<script>
export default {
    props: ['updater', 'loader', 'headers'],

    data: function() {
        return {
            items: []
        }
    },

    components: {},

    beforeMount: function() {
        this.load();
    },

    methods: {
        update: async function(item) {
            this.$emit('message', `Updating ${item.name}...`);
            const message = await this.updater(item);
            this.$emit('message', message);
        },
        load: async function() {
            this.items = await this.loader();
        }
    }
}
</script>


<style>
.editor-wrapper {
    width: 100%;
    overflow-x: scroll;
}
.editor-list {
    display: table;
    border-collapse: collapse;
    width: 100%;
    justify-content: space-between;
    flex-direction: row;
    margin: 1em;
}
.editor-list .row {
    height: 50px;
}
th, td {
    padding: 0 0.5rem;
    min-width: 120px;
}
th {
    text-align: left;
}
td {
    border-bottom: 1px solid hsl(211, 8%, 72%);
    align-items: center;
}
.editor-list button {
    color: black;
}
.editor-list button:hover {
    background-color: white;
}
</style>
