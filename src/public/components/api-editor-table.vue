<template>
    <div class="field-wrapper">
        <table class="field-list">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Default Refresh Rate (sec)</th>
                    <th>Save Changes</th>
                </tr>
            </thead>
            <tr class="row" v-for="(field, i) in fields">
                <td>
                    {{ field.name }}
                </td>
                <td>
                    <input v-model="field.defaultRefreshRate"
                        type="number"
                    />
                </td>
                <td>
                    <button @click="updateField(field)"
                    >Save</button>
                </td>
            </tr>
        </table>
    </div>
</template>


<script>
/**
 * @prop {Function} update - function to update field
 * @prop {Function} load - function to load fields
 * @type {Array}
 */
export default {
    props: ['update', 'load'],

    data: function() {
        return {
            fields: [],
            calculatedFields: [
                { name: 'AHT', calculation: '{calls} / {handleTime}' }
            ]
        }
    },

    components: {},

    beforeMount: function() {
        this.loadFields();
    },

    methods: {
        updateField: async function(field) {
            this.$emit('message', `Updating ${field.name}...`);
            const message = await this.update(field);
            this.$emit('message', message);
        },
        loadFields: async function() {
            let fields = await this.load();
            this.fields = fields;
        }
    }
}
</script>


<style>

</style>
