
<script>
export default {
    props: ['id'],
    methods: {
        dragstartHandler: function(event) {
            this.$emit('dragstart-widget', event, this.$props);
        }
    }
}
</script>
