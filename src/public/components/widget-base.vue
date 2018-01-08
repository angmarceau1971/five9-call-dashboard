/**
 * Base Component that should be extended by all widgets.
 */
<script>
import Editor from './editor.vue';

export default {
    props: ['id'],
    components: {
        'editor': Editor
    },
    methods: {
        dragstartHandler: function(event) {
            this.$emit('dragstart-widget', event, this.$props);
        }
    }
};
</script>
