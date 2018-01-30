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
    },
    // Utility to return a blank widget
    newObject: function(type) {
        return {
            id: 'widget:' + uuidv4(),
            component: type,
            title: 'Hello World',
            field: '',
            filter: { }
        };
    }
};


/**
 * Returns unique ID number
 * @return {String} 16-bit UUID
 */
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)
            .toString(16)
    );
}

</script>
