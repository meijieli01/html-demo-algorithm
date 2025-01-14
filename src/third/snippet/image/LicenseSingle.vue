<template>
    <div class="license-single-image" :title="notImage?'点击查看':''">
        <div class="row file-area" :class="styleA()" @click="clickEventByName($event, 'clickOpen')">
            <div class="images position-relative" v-if="showImg || showOther">
                <div class="w-100 h-100 d-flex flex-column justify-content-center" v-if="showOther">
                    <div class="filename overflow-hidden" v-html="filename"></div>
                    <label form="col-form-label" v-html="title"></label>
                </div>
                <div class="w-100 h-100" v-else>
                    <img class="h-100 w-100 m-auto" v-if="imgUrl" :class="imgStyle" :src="imgUrl" alt="">
                </div>
                <div class="position-absolute op-area top-0 end-0" v-if="canRemove"><SvgIcon class="op-delete text-danger" name="b5XCircleFill" width="16" height="16" @click="clickEventByName($event, 'opDeleteImage')"/></div>
            </div>
            <div class="images def" v-else>
                <div><SvgIcon name="b5Plus" width="22" height="22" /></div>
                <div><span v-html="prefix+title"></span></div>
                <div v-if="tip && tip.length > 0"><span v-html="tip"></span></div>
            </div>                        
        </div>
        <input ref="elInputFile" type="file" class="form-control" @input="inputFiles" accept="image/*," hidden />
    </div>                    
</template>

<script setup>
import { ref, watch } from 'vue';
import SvgIcon from '../svgs/SvgIcon.vue';
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    prefix: {
        type: String,
        default: '请上传',
    },
    type: {
        type: String,
        default: '',
    },
    url: {
        type: String,
        default: '',
    },
    onlyShow: { // 如果只是展示，必须设置true
        type: Boolean,
        default: false,
    },
    notImage: { // 非图像文件
        type: Boolean,
        default: false,
    },
    otherFname: {
        type: String,
        default: '',
    },
    pickFile: {
        type: Boolean,
        default: false,
    },
    onlyImage: {
        type: Boolean,
        default: false,
    },
    imgStyle: {
        type: String,
        default: '',
    },
    tip: {
        type: String,
        default: '',
    },
    rootStyle: {
        type: String,
        default: '',
    },
    prefixPath: {
        type: String,
        default: 'license',
    },
    template: {
        type: Boolean,
        default: false,
    },
    canRemove: {
        type: Boolean,
        default: false,
    },
    modeEdit: {
        type: Boolean,
        default: false,
    },
    info: {
        type: Object,
        default: {},
    },
});
const emit = defineEmits(['update','error','pdf']);
const elInputFile = ref(null);
const showImg = ref(props.onlyShow);
const showOther = ref(props.notImage); // 非图像文件
const filename = ref(props.otherFname);
const imgUrl = ref(props.onlyShow ? props.url : '');
function styleA() {
    const { rootStyle } = props;
    let res = '';
    if (!showImg.value) res += ' dash';
    if (rootStyle.length > 0) res += rootStyle;
    return res;
}
function inputFiles(event) {
    let file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('image')) {
            showImg.value = !props.template;
            showOther.value = false;
        } else {
            if (props.onlyImage) {
                emit('error', 'error-only-image');
                return;
            }
            showOther.value = !props.template;
            showImg.value = false;
            filename.value = file.name;
        }
        imgUrl.value = URL.createObjectURL(file);
        const d = new Date();
        const path = props.prefixPath=='license' ? `license/${d.getFullYear()}${d.getMonth()}/${d.getTime()}.${file.name}` : `${props.prefixPath}/${d.getTime()}.${file.name}`;        
        emit('update', props.type, imgUrl.value, path, file.name);
    } else {
        showImg.value = false;
    }
    event.target.value = '';
}
function clickEventByName(event, type) {
    const { notImage, onlyShow, pickFile, canRemove, modeEdit } = props;
    if (!onlyShow) {
        event.stopPropagation();
        event.preventDefault();
    }
    if (type == 'clickOpen') {        
        if (canRemove) {
            // 可删除的，不能直接替换
            if (showImg.value || showOther.value) return;
        }
        // 不是编辑模式
        if (modeEdit) {
        } else {
            if (notImage && !modeEdit) {
                // if (props.info.openUrl4Show && window.navigator.pdfViewerEnabled) {
                //     props.info.openUrl4Show(props.url, {useBase64: true});
                // } else {
                //     window.open(props.url, '_blank');
                // }
                emit('pdf', props.url);
                return;
            }
            if (!pickFile) return;
        }
        if (['avatarUrl','image'].includes(props.type)) {
            elInputFile.value.accept = 'image/*,';
        } else {
            elInputFile.value.accept = null;
        }
        elInputFile.value.click();
    } else if (type == 'opDeleteImage') {
        emit('update', 'remove', imgUrl.value);
    }
}
watch(()=>props.notImage, ()=>showOther.value = props.notImage);
watch(()=>props.otherFname, ()=>filename.value = props.otherFname);
watch(()=>props.url, ()=>imgUrl.value = props.url);
defineExpose({

});
</script>