<template>
    <div class="spinner-grow text-primary" role="status" v-if="show">
        <span class="visually-hidden">In the effort...</span>
    </div>
</template>
<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        require: true,
    },
});
</script>