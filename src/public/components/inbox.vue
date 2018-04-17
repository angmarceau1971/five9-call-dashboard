<template>
<div class="inbox-wrapper">
    <h1><i class="far fa-envelope"></i> Inbox</h1>
</div>
</template>

<script>

export default {
    props: {
        messages: {
            type: Array
        }
    }
}
</script>

<style scoped>
.inbox-wrapper {
    position: fixed;
    height: 80vh;
    width: calc(100vw - 3em);
    margin: 0.5em 1em;
    padding: 1em;
    border-radius: 12px;
    background-color: hsla(121, 12%, 34%, 0.97);
    z-index: 100;
}
h1 {
    color: hsl(120, 100%, 56%);
}
</style>
