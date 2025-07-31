<template>
    <div class="canvas-function-target" @mousemove="handleEvt($event,'mmove4Root')">
        <div class="frame-content" :class="frame.type" @mousedown.stop="" @mousemove.stop="" >
            <div v-if="frame.type === 'image'" class="image-container">
                <img class="p-2" :src="frame.url" />
            </div>
            <iframe v-else-if="frame.type === 'iframe'" width="100%" height="100%" :id="frame.id" :src="frame.url" sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation" />
            <div v-else class="canvas-container">
                <canvas :ref="el => frame.canvasRef = el" class="mesh-canvas"></canvas>
            </div>
        </div>
        <div class="title-content" @mousedown="handleEvt($event,'mdown4Title')" @mouseup="handleEvt($event,'mup4Title')">
            <span class="type mx-3" v-html="parse(frame, 1)"></span><span v-html="frame.name"></span>
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
const emit = defineEmits(['op']);
const ud = reactive({
    tipList: [],
    mouseMove: false,
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
function handleEvt(evt, type) {
    if (type == 'mdown4Title') {
        ud.mouseMove = true;
        emit('op', props.frame, 'active');
    } else if (type == 'mup4Title') {
        ud.mouseMove = false;
        emit('op', props.frame, 'deactive');
    } else if (type == 'mmove4Root') {
        //if (ud.mouseMove) evt.stopPropagation();
    }
}
function parse(frame, code) {
    let res = '';
    if (code == 1) {
        frame.type=='image' ? res = 'PHOTO' : frame.type=='cbct' ? res = 'CBCT' : res = '3D';
    }
    console.log(res);
    return res;
}
</script>
<style lang="scss" scoped>
.canvas-function-target {
    --img-margin: 5px;
    width: 100%;
    height: 100%;
    position: relative;
    .frame-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        width: 100%;
        height: 100%;
    }
    .title-content {
        position: absolute;
        top: -1.5rem;
        cursor: grabbing;
        span.type {
            border-radius: 20%;
            border: 1px solid;
            color: lightblue;
            display: inline-block;
            text-align: center;
        }
    }
    .image {
        display: block;
        width: 100%;
        height: 100%;
        .image-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            img {
                height: calc(100% - var(--img-margin) - var(--img-margin));
                margin: var(--img-margin);
            }
        }
    }
    .canvas-container {
        width: 100%;
        height: 100%;
    }
}
</style>
