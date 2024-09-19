<template>
    <div ref="elRoot" class="image-compare-container">
        <div class="image-compare-wrap">
            <img class="img-compare" :src="src" :style="style" />
        </div>
        <div ref="elSlider" class="image-compare-slider" :class="clsSlider">
            <div class="d-flex justify-content-center">
                <SvgIcon class="text-white" name="b5CaretLeft" width="16" height="16"/>
                <SvgIcon class="text-white" name="b5CaretRight" width="16" height="16"/>
            </div>
        </div>
        <div ref="elOverlay" class="image-compare-wrap image-compare-overlay">
            <img class="img-compare" :src="dst" :style="style" />
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import SvgIcon from '../svgs/SvgIcon.vue';
const props = defineProps({
    src: {
        required: true,
    },
    dst: {
        required: true,
    },
    bottom: {
        type: Number,
        default: 0,
    },
    style: {
        type: String,
        default: '',
    },
    clsSlider: {
        type: String,
        default: '',
    },
})
const elRoot = ref(null);
const elSlider = ref(null);
const elOverlay = ref(null);
let gImgWidth = 0, gImgHeight = 0;
/**
 * https://www.w3schools.com/howto/howto_js_image_comparison.asp
 * 参考
 */
function compareTheImage(elImg) {
    let clicked = 0;
    /** get the width  and heigot of the img element */
    elImg.style.width = `${gImgWidth / 2}px`;
    
    if (props.bottom > 0) {
        elSlider.value.style.bottom = `${ props.bottom - (elSlider.value.offsetHeight / 2)}px`;
    } else {
        elSlider.value.style.top = `${(gImgHeight / 2) - (elSlider.value.offsetHeight / 2)}px`;
    }
    elSlider.value.style.left = `${(gImgWidth / 2) - (elSlider.value.offsetWidth / 2)}px`;

    elSlider.value.addEventListener('mousedown', funcSlideReady);
    window.addEventListener('mouseup', funcSlideFinish);
    elSlider.value.addEventListener('touchstart', funcSlideReady);
    window.addEventListener('touchend', funcSlideFinish);

    function funcSlideReady(event) {
        event.preventDefault();
        clicked = 1;
        window.addEventListener('mousemove', funcSlideMove);
        window.addEventListener('touchmove', funcSlideMove);
    }
    function funcSlideFinish() {
        clicked = 0;
    }
    function getCursorPosition(event) {
        let xPos = 0;
        event = (event.changedTouches) ? event.changedTouches[0] : event;
        /* get the x positions of the image: */
        const rect = elImg.getBoundingClientRect();
        /*calculate the cursor's x coordinate, relative to the image:*/
        xPos = event.pageX - rect.left;
        /*consider any page scrolling:*/
        xPos = xPos - window.pageXOffset;
        return xPos;
    }
    function doSlide(xPos) {
        elImg.style.width = `${xPos}px`;
        elSlider.value.style.left = `${elImg.offsetWidth - (elSlider.value.offsetWidth / 2)}px`;
    }
    function funcSlideMove(event) {
        if (clicked == 0) return false;
        let pos = getCursorPosition(event);
        if (pos < 0) pos = 0;
        if (pos > gImgWidth) pos = gImgWidth;
        doSlide(pos);
    }
}
function updateCompareImage(width, height) {
    gImgWidth = width;
    gImgHeight = height;
    elRoot.value.style.width = `${width}px`;
    elRoot.value.style.height = `${height}px`;
    // 等待图片加载后再处理
    if (elOverlay.value.children[0].complete) {
        compareTheImage(elOverlay.value);
    } else {
        elOverlay.value.children[0].addEventListener('load', () => compareTheImage(elOverlay));
    }
}
defineExpose({
    updateCompareImage,
});
</script>