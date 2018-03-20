/**
 * Component to display a single table row of data. Child of DataTable widgets.
 */
<template>
    <div>
        {{ lastUpdateMessage }}
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
            let time = this.$store.getters.datasourceLastUpdated(this.datasource);
            if (!time) return 'Last updated time not available';
            return `Last updated ${time}`;
        }
    }
}
</script>
