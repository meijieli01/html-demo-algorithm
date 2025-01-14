<template>
    <svg>
        <use :xlink:href="`${urlSvgList}#${name}`"></use>
    </svg>
</template>
<script setup>
import urlSvgList from './svgList.svg?url';
const props = defineProps({
    name: {
        type:String,
        required: true,
    },
});
</script>