<template>
    <div class="canvas-function-target">
        <div class="frame-content" :class="frame.type" @mousedown.stop="" @mousemove.stop="" >
            <img v-if="frame.type === 'image'" :src="frame.url" />
            <iframe v-if="frame.type === 'cbct'" width="100%" height="100%" :id="frame.id" :src="frame.url" sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation" />
            <canvas v-else :ref="el => frame.canvasRef = el" class="mesh-canvas"></canvas>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import ResMessage from '../third/snippet/ResMessage.vue';
import { inTwoDate } from '../utils/helpDateTime';
import { vTipInfo } from '../../config';
const props = defineProps({
    frame: {
        type: Object,
        required: true,
    },
});
const ud = reactive({
    tipList: [],
})
const refForm = ref(null)
onMounted(() => {
    ud.tipList = [];
    vTipInfo.forEach(one=>{
        one.show = inTwoDate(one.begin, one.end);
        if (one.show) {
            ud.tipList.push(one);
        }
    })
})
</script>
<style lang="scss" scoped>
.canvas-function-target {
    .frame-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        &.image {
            display: block;
        }
    }
}
</style>
