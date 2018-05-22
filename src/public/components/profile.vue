<template>
    <div class="profile-wrapper">
        <div class="header-wrapper">
            <h1><i class="fas fa-trophy"></i> Profile</h1>
            <button @click="$emit('close')"
                title="Close profile" class="close-button"
                ><i class="fas fa-times"></i>
            </button>
        </div>

        <hr />

        <div class="profile-content">
            <div class="fortune-wrapper">
                <div v-for="(fortune, i) in fortuneCookies">
                    <!-- Hide fortune if it hasn't been read yet -->
                    <button class="fortune unread-cover"
                        v-if="!fortune.read"
                        @click="readFortune(fortune)">
                        Read Fortune!
                    </button>
                    <!-- If fortune has been read, show it! -->
                    <div class="fortune" v-else>
                        <div class="top-section">
                            <img src="https://pbs.twimg.com/profile_images/737359467742912512/t_pzvyZZ_400x400.jpg" />
                            <div class="proverb">
                                {{ fortune.proverb }}
                            </div>
                        </div>
                        <br /><hr /><br />
                        <div class="bottom-section">
                            <p> {{ fortune.reason }} </p>
                        </div>
                    </div>
                </div>
            </div>
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
        this.fortuneCookies = await this.loadFortunes();
    },

    methods: {
        loadFortunes: async function() {
            let fortunes = await api.getFortuneCookies(false);
            return fortunes.sort((a, b) =>
                a.timestamp > b.timestamp ? -1 : 1
            );
        },
        readFortune: async function(fortune) {
            fortune.read = true;
            // this.fortuneCookies = this.loadFortunes();
        },
    }
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
.profile-content {
    overflow-y: auto;
}
.header-wrapper {
    display: flex;
    justify-content: space-between;
    margin: 0;
}
h1 {
    color: white;
    margin: 0;
}


.fortune-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    padding: 1rem;
}
.fortune {
    width: 18rem;
    overflow: auto;
    height: 12rem;
    background-color: white;
    color: #333;
    margin: 1rem;
    padding: 0.25rem;
    border-radius: 2px;
}
.fortune .top-section {
    display: flex;
}
.fortune .bottom-section p {
    margin: 0;
    color: hsl(207, 95%, 41%);
    font-style: italic;
}
.fortune .top-section img {
    height: 64px;
    border-radius: 50%;
}
.fortune .top-section * {
    margin: auto 0.25rem;
}
.fortune.unread-cover {
    cursor: pointer;
    font-size: 1rem;
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
.message-wrapper-column-headers {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    color: #eaeaea;
}
</style>
