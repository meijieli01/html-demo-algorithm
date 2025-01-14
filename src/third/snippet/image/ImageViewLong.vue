<template>
    <div class="image-view-long">
        <div class="image-arrow-item" v-if="arrow">
            <SvgIcon :class="ud.showArrowUp?'text-white':'text-black-50'" name="b5ChevronUp" width="16" height="16" @click="eventHandler($event, 'arrowUp')"/>
        </div>
        <div ref="elCoat" class="img-coat m-auto" :style="ud.style1">
            <img :src="src" :style="ud.style2"/>
            <div class="img-cover" v-for="(sub,i) in max" :class="`pos${i} ${classStyle(1, i)}`" :key="i" 
                @mouseenter="eventHandler($event, 'enterHover', i)" @mouseleave="eventHandler($event, 'leaveHover', i)" @click="eventHandler($event, 'clickSelect', i)">
            </div>
        </div>
        <div class="image-arrow-item" v-if="arrow">
            <SvgIcon :class="ud.showArrowDown?'text-white':'text-black-50'" name="b5ChevronDown" width="16" height="16" @click="eventHandler($event, 'arrowDown')"/>
        </div>
        <div class="d-flex w-100 justify-content-evenly my-2 px-5" v-if="cursor">
            <div class="image-indicator-item" v-for="(sub,j) in yCount" :key="j" :class="classStyle(2, j)"></div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import SvgIcon from '../svgs/SvgIcon.vue';
const props = defineProps({
    type: {
        type: String,
        default: '',
    },
    src: {
        type: String,
        required: true,
    },
    max: {
        type: Number,
        default: 3,
    },
    yCount: {
        type: Number,
        default: 10,
    },
    xCount: {
        type: Number,
        default: 1,
    },
    select: {
        type: Number,
        default: 0,
    },
    xOffset: {
        type: Number,
        default: 0,
    },
    cursor: {
        type: Boolean,
        default: true,
    },
    arrow: {
        type: Boolean,
        default: true,
    },
});
const emit = defineEmits(['update']);
const elCoat = ref(null);
const slideWindow = ref(props.yCount - props.max);
const ud = reactive({
    content: [],
    imgW: 0,
    imgH: 0,
    oneW: 0,
    oneH: 0,
    style1: '',
    style2: '',
    where: 0,
    selIdx: 0,
    hoverIdx: 0,
    showArrowUp: false,
    showArrowDown: true,
});
function classStyle(id, idx) {
    let res = '';
    if (id == 1) {
        if (ud.selIdx==idx+ud.where) res = 'active';
    } else if (id == 2) {
        if (ud.selIdx == idx) res = ' select-on';
        if (ud.hoverIdx + ud.where == idx) res += ' hover-on';
    }
    return res;
}
function eventHandler(evt, type, idx) {
    if (type == 'clickSelect') {
        ud.selIdx = ud.where + idx;
        emit('update', props.type, ud.selIdx);
    } else if (type == 'enterHover') {
        ud.hoverIdx = idx;
        updateArrow();
    } else if (type == 'leaveHover') {
        
    } else if (type == 'arrowUp') {
        ud.where -= 3;
        updateStyle2();
    } else if (type == 'arrowDown') {
        ud.where += 3;
        updateStyle2();
    }
}
function updateArrow() {
    const idxHover = ud.hoverIdx + ud.where;
    ud.showArrowUp = ud.where > 0;
    ud.showArrowDown = idxHover + 1 < props.yCount;
}
function updateStyle2() {    
    if (props.xCount < 2) {
        // 单行单列
        ud.where = Math.min(slideWindow.value, Math.max(ud.where, 0));
        ud.style2 = `transform: translateY(-${ ud.where * ud.oneH + ud.oneH * 0}px);`;
    } else {
        // 多行多列
        ud.where = Math.min(slideWindow.value, Math.max(ud.where, 0));
        ud.style2 = `transform: translate(-${props.xOffset * ud.oneW}px ,-${ ud.where * ud.oneH + ud.oneH * 0}px);`;
    }
    updateArrow();
}
function imageLoaded(elImg) {
    ud.imgW = elImg.width;
    ud.imgH = elImg.height;        
    ud.oneW = elImg.width / props.xCount;
    ud.oneH = elImg.height / props.yCount;
    ud.style1 = `width:${ud.oneW}px;height:${ud.oneH * props.max}px;`;
    updateStyle2();
}
onMounted(()=>{
    ud.selIdx = props.select;
    const elImg = elCoat.value.children[0];
    if (elImg.complete) {
        imageLoaded(elImg);
    } else {
        elImg.addEventListener('load', () => imageLoaded(elImg))
    }
    elCoat.value.addEventListener('wheel', (evt)=>{
        if (evt.deltaY > 0) {
            // 往下
            ud.where += 1;
        } else {
            // 往上
            ud.where -= 1;
        }
        updateStyle2();
    });
});
defineExpose({
    
});
</script>