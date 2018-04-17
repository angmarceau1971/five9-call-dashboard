<template>
<div class="inbox-wrapper">
    <div class="header-wrapper">
        <h1><i class="far fa-envelope"></i> Inbox</h1>
        <button @click="$emit('close')"
            title="Close inbox" class="close-button"
            ><i class="fas fa-times"></i>
        </button>
    </div>
    <div class="message-wrapper-column-headers">
        <p class="date">
            Date
        </p>
        <p class="from">
            From
        </p>
        <p class="body">
            Message
        </p>
    </div>
    <div class="messages-wrapper">
        <div class="message-wrapper"
            v-for="(message, i) in messageList">
            <p class="date">
                {{ dateText(message) }}
            </p>
            <p class="from">
                {{ message.fromName }}
            </p>
            <p class="body">
                {{ message.body }}
            </p>
        </div>
    </div>
</div>
</template>

<script>

export default {
    props: {
        messages: {
            type: Array
        }
    },
    computed: {
        // messages sorted by time
        messageList: function() {
            return this.messages.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
        }
    },
    methods: {
        // Returns text for date next to message. Includes hour if within the last
        // 24 hours
        dateText: function(message) {
            if (Math.abs(
                    new Date(message.timestamp).getDate() - new Date().getDate()
                ) < 1) {
                return moment(message.timestamp).format('M/D h A');
            }
            return moment(message.timestamp).format('M/D');
        }
    }
}
</script>

<style scoped>
.inbox-wrapper {
    position: fixed;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    width: calc(100vw - 3em);
    margin: 0.5em 1em;
    padding: 1em;
    border-radius: 12px;
    background-color: hsl(207, 100%, 50%);
    z-index: 100;
}
.header-wrapper {
    display: flex;
    justify-content: space-between;
    margin: 0 0 2em 0;
}
h1 {
    color: white;
    margin: 0;
}
.messages-wrapper {
    overflow-y: scroll;
}
.close-button {
    font-size: 2em;
    display: inline;
    color: white;
    background-color: inherit;
}
.close-button:hover {
    cursor: pointer;
    color: #ddd;
}
.date {
    width: 15%;
}
.from {
    width: 23%;
}
.body {
    width: 62%;
}
.message-wrapper-column-headers {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}
</style>
