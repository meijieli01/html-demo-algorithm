<template>
    <div v-if="vInfo[tag].changelog.length > 0">
        <div class="alert alert-info p-1 m-1" role="alert">Update Notes</div>
        <div v-for="(str,i) in vInfo[tag].changelog" :key="i">
            <p class="alert alert-light p-1 m-1" role="alert" v-html="`${i+1}. ${str}`"></p>
        </div>
    </div>  
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