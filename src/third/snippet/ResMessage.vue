<template>
    <div class="alert w-100" :class="type + ' ' + align" role="alert" v-if="msg2.length > 0" v-html="msg2"></div>
</template>
<script setup>
import { watch, ref } from 'vue';
const props = defineProps({
    msg: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'alert-danger', // alert-success, alert-info
    },
    align: {
        type: String,
        default: 'text-center', // alert-success, alert-info
    },
    delay: {
        type: Number,
        default: 1000,
    },
    autoClose: {
        type: Boolean,
        default: false,
    },
});
const msg2 = ref(props.msg);
watch(()=>props.msg, (nV, oV)=>{
    msg2.value = nV;
    if (nV && props.autoClose) {
        setTimeout(()=>msg2.value='', props.delay);
    }
});
</script>