<template>
<div class="modal">
    <h1>{{ newCard.title }}</h1>
    <input v-model="newCard.title" />

    <button
        @click="$emit('exit-edit', newCard.id, newCard)"
    >Done</button>
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
.modal {
    position: fixed;
    width: 500px;
    height: 400px;
    background-color: rgba(100,100,100,0.95);
}
.modal button {
    color: #333;
}
</style>
