<template>
    <div class="profile-wrapper">
        hi
        <div class="fortune-wrapper"
            v-for="(fortune, i) in fortuneCookies"
        >
            {{ fortune.proverb }}
        </div>
    </div>
</template>


<script>
import * as api from '../javascript/api';

export default {
    data: function () {
        return {
            fortuneCookies: []
        }
    },

    async beforeMount() {
        let fortunes = await api.getFortuneCookies(false);
        this.fortuneCookies = fortunes.sort((a, b) =>
            a.timestamp > b.timestamp ? -1 : 1
        );
    },


}

</script>


<style scoped>
.profile-wrapper {
    position: fixed;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    width: calc(100vw - 3em);
    margin: 0.5em 1em;
    padding: 1em;
    border-radius: 12px;
    background-color: hsla(207, 100%, 50%, 0.92);
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
.fortune-wrapper {
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
    color: #eaeaea;
}
</style>
