<template>
<div class="modal">
    <h1>{{ newCard.title }}</h1>
    <h3>Title</h3>
    <input v-model="newCard.title" />


    <div class="button-wrapper">
        <button
            @click="$emit('exit-edit', true, newCard.id, newCard)"
        >Save</button>

        <button
            @click="$emit('exit-edit', false)"
        >Cancel</button>

        <button
            class="delete"
            @click="$emit('delete-card', id)"
        >Delete</button>
    </div>
</div>

</template>

<script>

export default {
    props: ['id', 'title'],
    data: function() {
        return {
            newCard: {
                id: this.id,
                title: this.title
            }
        }
    }
}
</script>


<style>

</style>
