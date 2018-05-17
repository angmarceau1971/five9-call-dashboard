/**
 * -- Currently sales tracker only. --
 *
 * This widget allows manually-entering items to a tracker -- such as sales
 * or retentions trackers.
 *
 * Tracker accepts a prop called `visible` that determines whether the modal /
 * pop-up form is visible. An `exit` event is emitted when the user exits (via
 * save or cancel) the form.
 *
 * Entries are posted to the server, where they are saved in the database.
 */
<template>
<div
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler"
>

    <div class="tracker-form-wrapper"
        :style="positionStyle"
        v-show="visible"
    >
        <form class="tracker-form">
            <h1>Add a Sale</h1>
            <p v-if="message">{{ message }}</p>

            <div class="button-wrapper">
                <button class="save" @click="save">Save</button>
                <button class="cancel" @click="cancel">Cancel</button>
            </div>

            <select v-model="saleType" :class="{complete: saleType}">
                <option disabled value="">Sale Type</option>
                <option v-for="type in saleTypes" :value="type">{{ type }}</option>
            </select>

            <select v-model="dtvSaleMade" :class="{complete: dtvSaleMade!==''}">
                <option disabled value="">DTV Sale Made</option>
                <-- bind false/true to use actual Boolean values, not strings -->
                <option :value="false">No</option>
                <option :value="true">Yes</option>
            </select>

            <input v-model="accountNumber" placeholder="Account Number"
                :class="{complete: accountNumber}"
            />
        </form>

    </div>
</div>
</template>

<script>
'use strict';
import WidgetBase from './widget-base.vue';
import * as api from '../javascript/api';

export default {
    extends: WidgetBase,
    props: ['type', 'visible'],
    data: function() {
        return {
            // Default all fields to empty string, for later validation
            accountNumber: '',
            saleType: '',
            dtvSaleMade: '',
            // List of possible sale types
            saleTypes: [
                'NC - New Connect', 'RS - Restart / Reconnect', 'TR - Transfer',
                'UP - Upgrade', 'VO - Video Only', 'Reseller'
            ],
            message: ''
        }
    },
    computed: {
        positionStyle: function() {
            return this.position
                ? { top: -this.position.top +'px',
                    left: -this.position.left + 'px' }
                : { };
        }
    },
    methods: {
        save: async function(event) {
            event.preventDefault();


            if (!this.accountNumber || !this.saleType
                || this.dtvSaleMade === '') {
                let field = !this.accountNumber ? 'Account Number'
                            : !this.saleType ? 'Sale Type'
                            : 'DTV Sale Made';
                this.message = `Please enter a value for ${field}. :)`;
                return;
            }
            this.message = 'Saving...'
            let response = await api.addToTracker({
                accountNumber: this.accountNumber,
                saleType: this.saleType,
                dtvSaleMade: this.dtvSaleMade || false
            });
            this.message = '';
            console.log(response);
            this.clearAndExit();
        },
        cancel: function(event) {
            event.preventDefault();
            this.clearAndExit();
        },
        clearAndExit: function() {
            this.accountNumber = '';
            this.saleType = '';
            this.dtvSaleMade = '';
            this.message = '';
            this.$emit('exit');
        }
    }
}

</script>


<style scoped>
.tracker {
    display: flex;
    flex-direction: column;
}

.tracker-form-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: hsla(0, 0%, 73%, 0.4);
}
.tracker-form {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: hsla(207, 100%, 50%, 0.9);
    width: 500px;
    height: 80%;
    margin: 3rem auto;
    border-radius: 4px;
}
.tracker-form > * {
    margin: auto;
    width: 85%;
}

.tracker-form h1 {
    color: aliceblue;
}
.tracker-form input, .tracker-form select, .tracker-form button {
    font-size: 1.5rem;
    height: 3.3rem;
    cursor: pointer;
    transition: 0.25s all;
    border-radius: 4px;
}
.tracker-form input:focus, .tracker-form select:focus, .tracker-form button:focus {
    filter: drop-shadow(0 3px 10px aliceblue);
}
.tracker-form .button-wrapper {
    display: flex;
    justify-content: space-between;
}
.tracker-form button {
    width: 45%;
}
.tracker-form button.save {
    background-color: hsl(120, 100%, 52%);
    color: hsl(0, 0%, 20%);
}
.tracker-form button:hover {
    filter: drop-shadow(0 5px 20px aliceblue) brightness(1.2);
}
/* Border for filled-in fields */
.complete {
    border: 2px solid hsl(120, 100%, 52%);
}
</style>
