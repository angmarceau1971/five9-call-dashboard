
<script>
export default {
    methods: {
        dragstartHandler: function(event) {
            this.$emit('dragstart-widget', event, this.$props);
        }
    }
}
</script>
