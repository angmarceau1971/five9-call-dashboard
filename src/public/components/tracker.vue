/**
 * -- Currently sales tracker only. --
 *
 * This widget allows manually-entering items to a tracker -- such as sales
 * or retentions trackers.
 *
 * Entries are posted via the API to be saved on the server database.
 */
<template>
<div
    :draggable="$store.state.editMode"
    @dragstart="dragstartHandler"
>
    <label class="checkbox-wrapper">Sale Made
        <input type="checkbox" />
        <span class="checkmark"></span>
    </label>
    <br />
    <label class="checkbox-wrapper">DTV Sale Made
        <input type="checkbox" />
        <span class="checkmark"></span>
    </label>
</div>
</template>

<script>
import WidgetBase from './widget-base.vue';

import * as api from '../javascript/api';

export default {
    extends: WidgetBase,
    props: ['type'],
    methods: {
        save: async function() {
            let response = await api.addToTracker();
            console.log(response);
        }
    }
}

</script>


<style scoped>
.tracker {
    display: flex;
    flex-direction: column;
    height: 400px;
}

.checkbox-wrapper {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    user-select: none;
}

.checkbox-wrapper input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.checkbox-wrapper label {
    font-size: 1.5rem;
}

.checkbox-wrapper .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: #eee;
}

.checkbox-wrapper:hover input ~ .checkmark {
    background-color: #ccc;
}
.checkbox-wrapper input:checked ~ .checkmark {
    background-color: hsl(115, 100%, 47%);
}
.checkbox-wrapper .checkmark:after {
    content: "";
    position: absolute;
    display: none;
}
.checkbox-wrapper input:checked ~ .checkmark:after {
    display: block;
}
.checkbox-wrapper .checkmark:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
}

/* .checkbox-wrapper {
    width: 30px;
    height: 30px;
    background: #ddd;
    position: relative;
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.checkbox-wrapper label {
    display: block;
    width: 25px;
    height: 25px;
    border-radius: 100px;
    cursor: pointer;
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
    background: #333;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
} */
</style>
