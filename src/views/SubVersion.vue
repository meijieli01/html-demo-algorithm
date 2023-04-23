<template>
    <label class="my-auto"  v-html="`${vInfo[tag].version ? 'version ' + vInfo[tag].version : ''}`"></label>
</template>
<script setup>
import { vInfo } from '../../config';
const props = defineProps({
    tag: {
        type: String,
        require: true,
    },
});
</script>