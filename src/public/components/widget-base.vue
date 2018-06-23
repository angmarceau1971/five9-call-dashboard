/**
 * Base Component that should be extended by all widgets.
 *
 * Allows users to download "data" attribute of child components in a CSV file.
 *
 * @TODO: Implement drag & drop functionality.
 *
 */
<script>
'use strict';
import Editor from './editor.vue';
import * as util from '../javascript/utility';

export default {
    props: {
        'id': {
            type: String
        },
        'datasource': {
            type: String
        },
        'filter': {
            type: Object,
            default: () => { return {} }
        }
    },
    components: {
        'editor': Editor
    },
    methods: {
        dragstartHandler: function(event) {
            this.$emit('dragstart-widget', event, this.$props);
        },
        skillGroup: function(filter) {
            return filter.skillGroup || null;
        },
        downloadData: function() {
            // Attempt to use 'rawData' field; default to 'data' field if not.
            let data = this.rawData || this.data;
            if (data) {
                console.log(data);
                util.downloadJsonAsCsv(data, 'dash-download.csv');
            }
        }
    },
    // Utility to return a blank widget
    newObject: function(type) {
        return {
            id: 'widget:' + uuidv4(),
            component: type,
            title: 'Hello World',
            fieldName: '',
            filter: { },
            datasource: ''
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
