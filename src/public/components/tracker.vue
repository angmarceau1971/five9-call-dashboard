/**
 * -- Currently sales tracker only. --
 *
 * This widget allows manually-entering items to a tracker -- such as sales
 * or retentions trackers.
 *
 * Tracker accepts a prop called `visible` that determines whether the modal /
 * pop-up form is visible. An `exit` event is emitted when the user exits (via
 * save or cancel) the form. `message` events are emitted to signal successful
 * saves to the server.
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

            <select v-model="saleType" :class="{complete: saleType}">
                <option disabled value="">Sale Type</option>
                <option v-for="type in saleTypes" :value="type" :key="type">{{ type }}</option>
            </select>

            <div class="sale-made-wrapper">
                <label>DTV Sale Made:</label>
                <div>
                    <label>
                        YES
                        <input type="radio" name="dtv_sale" value="true" v-model="dtvSaleMade" />
                    </label>
                    <label>
                        NO
                        <input type="radio" name="dtv_sale" value="false" v-model="dtvSaleMade" />
                    </label>
                </div>
            </div>

            <div class="sale-made-wrapper">
                <label>Viasat Sale Made:</label>
                <div>
                    <label>
                        YES
                        <input type="radio" name="viasat_sale" value="true" v-model="viasatSaleMade" />
                    </label>
                    <label>
                        NO
                        <input type="radio" name="viasat_sale" value="false" v-model="viasatSaleMade" />
                    </label>
                </div>
            </div>

            <div class="sale-made-wrapper">
                <label>VoIP Sale Made:</label>
                <div>
                    <label>
                        YES
                        <input type="radio" name="voip_sale" value="true" v-model="voipSaleMade" />
                    </label>
                    <label>
                        NO
                        <input type="radio" name="voip_sale" value="false" v-model="voipSaleMade" />
                    </label>
                </div>
            </div>


            <input v-model="accountNumber" placeholder="Account Number (Optional)"
                :class="{ complete: true }"
            />

            <div class="button-wrapper">
                <button class="save" @click="save">Save</button>
                <button class="cancel" @click="cancel">Cancel</button>
            </div>
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
            dtvSaleMade: false,
            viasatSaleMade: false,
            voipSaleMade: false,
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
        },
    },
    methods: {
        save: async function(event) {
            event.preventDefault();

            // Form validation - Check that required fields are complete (right
            // now, this is only Sale Type)
            let isFieldMissing = {
                'Sale Type': !this.saleType,
            }
            let missingFieldNames = Object.keys(isFieldMissing).filter((key) => {
                return isFieldMissing[key];
            })
            if (missingFieldNames.length > 0) {
                let fieldName = missingFieldNames[0];
                this.message = `Please enter a value for ${fieldName}. :)`;
                return;
            }

            // Send the sale to the server
            this.message = 'Saving...'
            try {
                let response = await api.addToTracker({
                    accountNumber: this.accountNumber,
                    saleType: this.saleType,
                    dtvSaleMade: this.dtvSaleMade,
                    viasatSaleMade: this.viasatSaleMade,
                    voipSaleMade: this.voipSaleMade,
                });
                this.$emit('message', response);
            } catch (err) {
                this.$emit('message', err.message);
            }
            this.clearAndExit();
        },
        cancel: function(event) {
            event.preventDefault();
            this.clearAndExit();
        },
        clearAndExit: function() {
            this.accountNumber = '';
            this.saleType = '';
            this.dtvSaleMade = false;
            this.viasatSaleMade = false;
            this.voipSaleMade = false;
            this.message = '';
            this.$emit('exit');
        },
    },
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
    font-size: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: hsla(206, 39%, 14%, 0.97);
    width: 500px;
    margin: 3rem auto;
    border-radius: 4px;
}
.tracker-form > * {
    margin: 2rem auto;
    width: 85%;
}

.tracker-form h1 {
    font-size: 2rem;
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
    filter: drop-shadow(0 3px 6px aliceblue);
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
    filter: drop-shadow(0 5px 12px aliceblue) brightness(1.2);
}
.tracker-form .sale-made-wrapper {
    display: flex;
    justify-content: space-between;
}
.tracker-form input[type="radio"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    border: 3px solid white;
    transition: 0.2s all linear;
    outline: none;
    margin-right: 15px;
}
.tracker-form input[type="radio"]:checked {
    background-color: hsl(120, 100%, 52%);
}

/* Border for filled-in fields */
.complete {
    border: 2px solid hsl(120, 100%, 52%);
}
</style>
