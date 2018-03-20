/**
 * Component to display a single table row of data. Child of DataTable widgets.
 */
<template>
    <div>
        <p class="font-color-secondary">
            {{ lastUpdateMessage }}
        </p>
    </div>
</template>

<script>
import { formatValue } from '../javascript/scorecard-format.js';

export default {
    props: ['datasource'],
    data () {
        return {
            isHighlighted: false
        };
    },
    computed: {
        lastUpdateMessage: function() {
            let time = this.$store.getters.getDatasource(this.datasource).lastUpdated;
            if (!time) return 'Last updated time not available';
            return `Last updated ${moment(time).format('MM/DD/YY')}`;
        }
    }
}
</script>


<style scoped>
div {
    text-align: center;
}
p {
    margin: 0;
    font-size: 0.8em;
}
</style>
