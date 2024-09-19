<template>
    <div ref="elRoot" class="smile-index-page">
        <div class="smile-title"><label class="w-100 text-center m-auto">Veneesmile Design</label></div>
        <div ref="elMenuTool" class="smile-menu-tool px-3" @click="clickEventByName($event, 'selectSmileMenuCode')">
            <div class="menu-tool-item sub-code-0 active begin">
                <label>照片上传</label>
            </div>
            <div class="menu-tool-item sub-code-1">
                <label>微笑编辑</label>
            </div>
            <div class="menu-tool-item sub-code-2">
                <label>微笑选择</label>
            </div>
            <div class="menu-tool-item sub-code-3">
                <label>精准微调</label>
            </div>
            <div class="menu-tool-item sub-code-4 end">
                <label>前后对比</label>
            </div>
        </div>
        <div class="smile-main-content">
            <div class="content-sub-menu mx-3" :class="menuShow?'show-menu':''">
                <div class="btn-group btn-group-sm m-2" role="group" @click="clickEventByName($event, 'selectSubMenuType')" v-if="subCode==3">
                    <button type="button" class="btn theme1 sub-type-1" :class="subMenuType==1?'active':''">模板</button>
                    <button type="button" class="btn theme1 sub-type-2" :class="subMenuType==2?'active':''">形态</button>
                    <button type="button" class="btn theme1 sub-type-3" :class="subMenuType==3?'active':''">牙色</button>
                </div>
                <div class="w-100 d-flex flex-column" v-if="subCode==3 && (subMenuType==1 || subMenuType==3)">
                    <div class="sub-menu-row">
                        <label class="ms-2" v-html="subMenuType==3?'颜色':'模板'"></label>
                    </div>
                    <div class="sub-menu-row flex-column">
                        <ImageViewLong type="1" v-if="subMenuType==3" :src="imgTemplate" :yCount="7" :xCount="10" :select="ud.idxTemplateColor" :xOffset="ud.idxTemplateStroke" @update="updateViewLongIndex"/>
                        <ImageViewLong type="2" v-else :src="imgTemplateStroke" :yCount="10" :select="ud.idxTemplateStroke" @update="updateViewLongIndex"/>
                    </div>
                    <div class="sub-menu-row" v-if="subMenuType==1">
                        <label class="ms-2">视图</label>
                        <div class="form-check form-switch"></div>
                    </div>                    
                    <div class="sub-menu-row" v-if="subMenuType==3">
                        <label class="ms-2">色调</label>
                        <div class="d-flex">
                            <input class="theme1" type="range" :min="ConfigColor.hueMin" :max="ConfigColor.hueMax" :step="ConfigColor.unit" :title="infoColor.hue" v-model="infoColor.hue" @input="clickEventByName($event, 'change2ColorValue')">
                            <label class="range-per"></label>
                        </div>
                    </div>                    
                    <div class="sub-menu-row" v-if="subMenuType==3">
                        <label class="ms-2">亮度</label>
                        <div class="d-flex">
                            <input class="theme1" type="range" :min="ConfigColor.brightnessMin" :max="ConfigColor.brightnessMax" :step="ConfigColor.unit" :title="infoColor.brightness" v-model="infoColor.brightness" @input="clickEventByName($event, 'change2ColorValue')">
                            <label class="range-per"></label>
                        </div>
                    </div>                    
                    <div class="sub-menu-row" v-if="subMenuType==3">
                        <label class="ms-2">饱和度</label>
                        <div class="d-flex">
                            <input class="theme1" type="range" :min="ConfigColor.saturationMin" :max="ConfigColor.saturationMax" :step="ConfigColor.unit" :title="infoColor.saturation" v-model="infoColor.saturation" @input="clickEventByName($event, 'change2ColorValue')">
                            <label class="range-per"></label>
                        </div>
                    </div>                    
                    <!-- <div class="sub-menu-row" v-if="subMenuType==3">
                        <label>色温</label>
                        <div class="d-flex">
                            <input class="theme1" type="range" :min="ConfigColor.kelvinMin" :max="ConfigColor.kelvinMax" :step="ConfigColor.kelvinStep" v-model="infoColor.kelvin" @input="clickEventByName($event, 'change2ColorValue')">
                        </div>
                    </div> -->
                </div>
                <div class="w-100 d-flex flex-column" v-if="subCode==1 || (subCode==3 && subMenuType==2)">
                    <div class="sub-menu-row">
                        <label class="ms-2">对称调整</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox"  v-model="ud.symmetry" @change="clickEventByName($event, 'change2Symmetry')">
                        </div>
                    </div>
                    <div class="sub-menu-row" v-if="subCode===1">
                        <label class="ms-2">面部定点</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox"  v-model="ud.keyPoint" @change="clickEventByName($event, 'change2KeyPoint')">
                        </div>
                    </div>
                    <div class="sub-menu-row">
                        <label class="ms-2">笑窗</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox"  v-model="ud.smileWindow" @change="clickEventByName($event, 'change2SmileWindow')">
                        </div>
                    </div>
                    <div class="sub-menu-row">
                        <label class="ms-2">笑线</label>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox"  v-model="ud.smileCurve" @change="clickEventByName($event, 'change2SmileCurve')">
                        </div>
                    </div>
                    <div class="sub-menu-row">
                        <label class="d-flex text-white ms-2">图片旋转<input v-if="isDev" type="number" class="form-control form-control-sm" style="width:6rem;" v-model="ud.degree" :step="ud.step"/></label>
                        <div class="rotate-theme1" >
                            <svg class="wh-16" @click="clickEventByName($event, 'clickToRotateLeft')"><use :xlink:href="`${svgList}#b5ArrowCCW`"></use></svg>
                        </div>
                        <div class="rotate-theme1 me-3">
                            <svg class="wh-16" @click="clickEventByName($event, 'clickToRotateRight')"><use :xlink:href="`${svgList}#b5ArrowCW`"></use></svg>
                        </div>
                    </div>
                    <div class="sub-menu-row" v-if="isDev">
                        <label class="d-flex text-white ms-2">牙齿轮廓平移<input type="number" class="form-control form-control-sm" style="width:6rem;" v-model="ud.unit" step="0.01" @change="clickEventByName($event, 'inputChange2unit')" /></label>
                    </div>
                    <div class="sub-menu-row">
                        <label class="ms-2">长度</label>
                        <div class="d-flex">
                            <label class="range-per"></label>
                            <input ref="elHeight" class="theme1" type="range" :min="infoHeight.min" :max="infoHeight.max" :step="infoHeight.unit" v-model="infoHeight.value" @input="clickEventByName($event, 'change2TeethHeight')">
                            <label class="range-per"></label>
                        </div>
                    </div>
                    <div class="sub-menu-row justify-content-center">
                        <div class="">
                            <svg class="wh-24" :class="infoHeight.lockRatio ? 'text-white' : 'text-secondary'"  @click="clickEventByName($event, 'lockWidthHeightRatio')"><use :xlink:href="`${svgList}#Lock`"></use></svg>
                        </div>
                    </div>
                    <div class="sub-menu-row">
                        <label class="ms-2" v-html="ud.symmetry?'宽长比':'宽长比左'"></label>
                        <div class="d-flex">
                            <label class="range-per" v-html="gConfigSmile.ratioDown+'%'"></label>
                            <input ref="elRatioLeft" class="theme1" type="range" :min="gConfigSmile.ratioMin" :max="gConfigSmile.ratioMax" :step="infoHeight.unit" v-model="infoHeight.lvalue" :disabled="infoHeight.lockRatio" @input="clickEventByName($event, 'change2TeethHeight', 1)">
                            <label class="range-per" v-html="gConfigSmile.ratioUp+'%'"></label>
                        </div>
                    </div>
                    <div class="sub-menu-row" v-if="!ud.symmetry">
                        <label class="ms-2">宽长比右</label>
                        <div class="d-flex">
                            <label class="range-per" v-html="gConfigSmile.ratioDown+'%'"></label>
                            <input ref="elRatioRight" class="theme1" type="range" :min="gConfigSmile.ratioMin" :max="gConfigSmile.ratioMax" :step="infoHeight.unit" v-model="infoHeight.rvalue" :disabled="infoHeight.lockRatio" @input="clickEventByName($event, 'change2TeethHeight', 2)">
                            <label class="range-per" v-html="gConfigSmile.ratioUp+'%'"></label>
                        </div>
                    </div>
                    <div class="sub-menu-row">
                        <label class="ms-2" v-html="ud.symmetry?'颊囊':'颊囊左'"></label>
                        <div class="d-flex">
                            <label class="range-per"></label>
                            <input ref="elCorridorLeft" class="theme1" type="range" :min="infoCorridor.min" :max="infoCorridor.max" :step="infoCorridor.unit" v-model="infoCorridor.lvalue" @input="clickEventByName($event, 'change2Corridor', 1)">
                            <label class="range-per"></label>
                        </div>
                    </div>                
                    <div class="sub-menu-row" v-if="!ud.symmetry">
                        <label class="ms-2">颊囊右</label>
                        <div class="d-flex">
                            <label class="range-per"></label>
                            <input ref="elCorridorRight" class="theme1" type="range" :min="infoCorridor.min" :max="infoCorridor.max" :step="infoCorridor.unit" v-model="infoCorridor.rvalue" @input="clickEventByName($event, 'change2Corridor', 2)">
                            <label class="range-per"></label>
                        </div>
                    </div>
                    <button v-if="subCode==1" type="button" class="btn btn-secondary btn-sm text-white w-auto my-1 mx-2 bg3" @click="clickEventByName($event, 'clickToGenerateSmile')" >生成微笑</button>
                </div>
                <div class="w-100 d-flex flex-column" v-if="subCode==4" @click="clickEventByName($event, 'selectSub4Type')">
                    <button type="button" class="btn btn-sm theme1 my-1 mx-2 sub4-type-1" :class="sub4Type==1?'active':''">图片对比</button>
                    <button type="button" class="btn btn-sm theme1 my-1 mx-2 sub4-type-2" :class="sub4Type==2?'active':''">动态对比</button>
                    <button type="button" class="btn btn-sm theme1 my-1 mx-2 sub4-type-3" :class="sub4Type==3?'active':''" v-if="showVideo">视频对比</button>
                    <button type="button" class="btn btn-sm theme1 my-1 mx-2 sub4-type-4" v-if="sub4Type==1">下载</button>
                    <button type="button" class="btn btn-sm theme1 my-1 mx-2 sub4-type-5">存档</button>
                </div>
                <div class="w-100 d-flex flex-column" v-if="subCode==3" @click="clickEventByName($event, 'selectSub3Type')">
                    <button type="button" class="btn theme1 btn-sm text-white w-auto my-1 mx-2 sub3-type-1" v-if="subMenuType==2">调整更新</button>
                    <button type="button" class="btn theme1 btn-sm text-white w-auto my-1 mx-2 sub3-type-2">生成效果</button>
                </div>
                <div class="my-3 text-white" id="idLog" v-if="isDev">
                    <p></p>
                </div>
            </div>
            <div ref="elContainer" class="content-main" :class="menuShow?' show-menu':''"  v-show="subCode!=4">
                <canvas ref="elCanvas"></canvas>
                <div class="content-sub-code-0" v-if="subCode==0">
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn btn-outline-primary theme1" @click="clickEventByName($event, 'clickToPickFile')">点击此处上传微笑照片</button>
                    </div>
                </div>
                <div class="content-sub-code-2" v-if="subCode==2">
                    <div ref="elImgParent" class="image-wrap">
                        <div class="image-wrap-single mx-3" v-for="(item,i) in ud.genImgUrl" :class="((i+1)%2)==0?'place-start':'place-end'" :key="i">
                            <div class="image-content" :class="ud.selIdx == i ? ' active':''" @mouseenter="ud.selIdx=i" @click="clickEventByName($event, 'clickToShowImage', item)">
                                <img :src="item.url" :style="`transform:${ud.imgStyleTransform}`" />
                                <label class="" v-html="ConfigColor.shapeInfo[i].label"></label>
                                <button type="button" class="btn btn-sm text-white w-auto my-1" :class="ud.selIdx==i?'active':''" @click="clickEventByName($event, 'clickToSelectOneFromFour', i)" >选择</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-main show-menu" v-show="subCode==4">
                <ImageCompare v-if="sub4Type==2" ref="elImgCmp" :bottom="150" clsSlider="smile" :style="`transform:${ud.imgStyleTransform}`" :src="ud.imgUrl" :dst="ud.imgUrl1" />
                <div class="smile-compare-image-result" :class="UiConfig.className" v-if="sub4Type==1">
                    <div class="smile-compare-image-item mx-2"><img :src="ud.imgUrl2" @click="clickEventByName($event, 'showImageResultCompare')"/></div>
                </div>
            </div>
        </div>
        <div class="position-fixed bottom me-3" style="bottom:10px;right:0;height:30px;">
            <img class="w-100 h-100" :src="imgLogoOrange" alt="logo" />
        </div>
        <input ref="elInputFile" type="file" accept="image/*" @change="changeInputFile" hidden/>
    </div>
</template>
<script setup>
import { onMounted, ref, reactive, nextTick, toRaw } from 'vue';
import { useStore } from 'vuex';
import { signPath, uploadFileList } from '../third/snippet/toolOss';
import ImageCompare from '../third/snippet/image/ImageCompare.vue';
import ImageViewLong from '../third/snippet/image/ImageViewLong.vue';
import imgLogoOrange from '../assets/logo-orange.png?url';
import svgList from '../third/smile/svgList.svg?url';
import imgTemplate from '../assets/template.png?url';
import imgTemplateStroke from '../assets/templateStroke.png?url';
import { bindCanvasPanZoom, DomToolkit, bitmap2ImageUrl, save2File } from '../third/smile/domLib';
import { ImgHandleType } from '../third/smile/faceBaseData';
import { ImageFaceData } from '../third/smile/faceData';
import { isSupportRecorder } from '../third/smile/video';
import { ConfigColor } from '../third/smile/color';
import { ClosureCanvasUpdateImage } from '../third/smile/h5Image';
import { ConfigTemplateImage, gConfigSmile } from '../third/smile/helpConstant';
import { imageToBitmapWithHandle } from '../third/smile/helpCanvas';
import { returnChineseFonts } from '../third/smile/h5font';
import { testUiAdapter, UiConfig } from '../third/smile/ui';
import { bindImage2Body } from '../third/snippet/domLib';
import { polling } from '../third/snippet/polling';
import { registerAiSmile1, registerAiSmile2, registerAiSmile4 } from '../api/register';
import { smileInQueue, smileGetResult, smileRelease } from '../api/smile';
// import { caseSmileOrderEdit } from '../api/case';
import elLoading from '../third/snippet/loading';
const store = useStore();
const elRoot = ref(null);
const elInputFile = ref(null);
const elContainer = ref(null);
const elCanvas = ref(null);
const elHeight = ref(null);
const elRatioLeft = ref(null);
const elRatioRight = ref(null);
const elCorridorLeft = ref(null);
const elCorridorRight = ref(null);
const elMenuTool = ref(null);
const elTemplateImg = ref(null);
const elImgCmp = ref(null);
const elImgParent = ref(null);
const subCode = ref(0); // 子页面标记 0上传页面-1-2-3-4
const subCodePrev = ref(-1); // 
const subMenuType = ref(1); // 子页面标记 0上传页面-1-2-3-4
const sub4Type = ref(1);
const sub3Type = ref(1);
const menuShow = ref(false); // 左边得子菜单
const showVideo = import.meta.env.DEV;
const isDev = ref(import.meta.env.DEV);
const ud = reactive({
    hasImage: false,
    imgUrl: '', // 原图
    imgUrl1: '', // 调整下的结果
    imgUrl2: '', // 生成的图片包含三张
    file: null,
    imgEvent: true,
    degree: 0,
    scale: import.meta.env.DEV ? 1 : 1,
    step: 0.1,
    unit: 0.2,
    symmetry: true, // 对称
    keyPoint: true, // 表情捕捉
    smileCurve: true, // 笑线
    smileWindow: false, // 笑窗
    teethRatio: 1, // 长宽比
    buccalCorridor: 1,
    buccalCorridorLeft: 1,
    buccalCorridorRight: 1,
    id: '',
    idService: '',
    idxService: 0,
    foretooth: {}, // 门牙数据
    genImgUrl: [], // 生成图片的数据
    selIdx: 0, // 第一个
    idxTemplateStroke: 0,
    idxTemplateColor: 0,
    ctx: null,
    shapes: [],
    info: {}, // 患者信息
    imgStyleTransform: '',
});
const infoHeight = reactive({    
    value: 0,
    min: 0,
    max: 0,
    unit: gConfigSmile.unitLength,
    lockRatio: false,
    lvalue: 0.5, // 左边
    rvalue: 0.5, // 右边
});
const infoColor = reactive({    
    hue: 1,
    saturation: 1,
    brightness: 1,
    kelvin: 0,
});
const infoCorridor = {
    unit: gConfigSmile.unitCorridor,
    lvalue: 0,
    rvalue: 0,
    min: 0,
    max: 0,
}
let faceData = null;
let closureImageData = null;
document.title = `Veneesmile Design`;
function getImageFilename() {
    const d = new Date();
    const str = `患者姓名-${ud.info.patientName}-医生姓名-${ud.info.doctorName}-${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日.jpg`;
    return str;     
}
function clickEventByName(event, type, code) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (type == 'clickToPickFile') {
        elInputFile.value.dispatchEvent(new MouseEvent('click'));
    } else if (['clickToRotateLeft','clickToRotateRight'].includes(type)) {
        const dir = type === 'clickToRotateLeft' ? -1 : 1;
        ud.degree = Number.parseFloat(parseFloat(ud.degree) + ud.step * dir).toFixed(3);
        elCanvas.value.style.transform = DomToolkit.rotate(parseFloat(ud.degree), ud.scale);
        ud.info.degree = ud.degree;
    } else if (type == 'inputChange2unit') {
        faceData.setUnit(ud.unit);
    } else if (type == 'selectSmileMenuCode') {
        // 切换菜单
        let target = event.target;
        if (target instanceof HTMLLabelElement ) target = target.parentNode;
        const clsName = DomToolkit.clsName(target, 'sub-code-');
        if (clsName.length > 0) {
            const nextCode = parseInt(clsName[0].split('-')[2]);
            if (nextCode === 0) {
                // 直接跳转到第一个
                subCode.value = nextCode;
                subCodePrev.value = -1;
                updateMenu();
            } else {
                // 只能退后不能超前
                if (nextCode < subCode.value) {
                    subCodePrev.value = subCode.value;
                    subCode.value = nextCode;
                    updateMenu();
                } else {
                    elLoading.show(document.body, {zIndex: 2002, message: `当前未执行，不能跳到后面步骤`, type: 'text-danger'});
                }
            }
            if (faceData.ctx) {
                faceData.ctx.reset();
            }
        }
    } else if (type == 'selectSubMenuType') {
        const clsName = DomToolkit.clsName(event.target, 'sub-type-');
        if (clsName.length > 0) {
            subMenuType.value = parseInt(clsName[0].split('-')[2]);      
            faceData.updateToolPan(subMenuType.value === 2, elContainer.value);
        }
    } else if (type == 'selectSub4Type') {
        const clsName = DomToolkit.clsName(event.target, 'sub4-type-');
        if (clsName.length > 0) {
            const theSub4Type = parseInt(clsName[0].split('-')[2]);
            if ([1, 2].includes(theSub4Type)) {
                sub4Type.value = theSub4Type;
            }
            if (theSub4Type === 1) {
                ud.imgUrl2 = '';
                elLoading.show(document.body, {zIndex: 2002, message: `Generate Compare Image`});
                closureImageData.genImageCompare(faceData.getCompareInfo(), ud.info).then(url=>{
                    ud.imgUrl2 = url;
                    elLoading.hide(0);
                });
            } else if (theSub4Type === 2) {                
                nextTick(()=> {            
                    elImgCmp.value.updateCompareImage(faceData.wReal, faceData.hReal);
                });
            } else if (theSub4Type === 4) {
                fetch(ud.imgUrl2).then(res=>res.arrayBuffer()).then(buffer=>{
                    save2File(buffer, getImageFilename());
                })
            } else if (theSub4Type === 5) {
                // elLoading.show(document.body, {zIndex: 2002, message: `存档中...`});
                // store.dispatch('oss/getClient').then(({client})=>{
                //     return Promise.all([
                //         fetch(ud.imgUrl).then(res=>res.arrayBuffer()),
                //         fetch(ud.imgUrl1).then(res=>res.arrayBuffer()),
                //         closureImageData.genImageCompare(faceData.getCompareInfo(), ud.info, false),
                //     ]).then(arr=>{
                //         const timestamp = Date.now();
                //         const fileList = [];
                //         fileList.push({file: new Blob([arr[0]]), path: `${ud.info.caseNo}/smile/origin.${timestamp}.png`});
                //         fileList.push({file: new Blob([arr[1]]), path: `${ud.info.caseNo}/smile/effect.${timestamp}.png`});
                //         fileList.push({file: arr[2], path: `${ud.info.caseNo}/smile/compare.${timestamp}.png`});
                //         return uploadFileList(fileList, client).then(()=>{
                //             return caseSmileOrderEdit({
                //                 caseNo: ud.info.caseNo,
                //                 originFile: fileList[0].path,
                //                 effectFile: fileList[1].path,
                //                 compareFile: fileList[2].path,
                //             }).then((res)=>{
                //                 if (res.code == 200) {
                //                     elLoading.update('保存成功', 'text-success');
                //                     elLoading.hide();
                //                 } else {
                //                     elLoading.update(res.message, 'text-danger');
                //                 }
                //             });
                //         });
                //     });
                // });
            }
        }
    } else if (type == 'selectSub3Type') {
        const clsName = DomToolkit.clsName(event.target, 'sub3-type-');
        if (clsName.length > 0) {
            sub3Type.value = parseInt(clsName[0].split('-')[2]);
            if (sub3Type.value === 1) {
                fetchSubImageData(ImgHandleType.stroke, ()=>{});
            } else if (sub3Type.value === 2) {   
                elLoading.show(document.body, {zIndex: 2002, message: `Generate Final Effect Image`});
                nextTick(()=>{
                    generateFinalEffect();
                });
                // elLoading.show(document.body, {zIndex: 2002, message: `Generate Effect Image`});
                // nextTick(()=>{
                //     updateImageDataWithColor(ImgHandleType.final, toRaw(infoColor), ()=>{
                //         closureImageData.genImageByBitmap(faceData.bitmap).then(url=>{
                //             elLoading.hide(0);
                //             ud.imgUrl1 = url;
                //             subCode.value = 4;
                //             updateMenu();
                //         });
                //     })
                // })
            }
        }
    } else if (type == 'showImageResultCompare') {        
        bindImage2Body(ud.imgUrl2, {filename:getImageFilename()});
    } else if (type == 'change2Symmetry') {
        faceData.curveProxy.setSymmetry(ud.symmetry);
    } else if (type == 'change2KeyPoint') {
        faceData.showKeyPoint(ud.keyPoint);
    } else if (type == 'change2SmileWindow') {
        faceData.showSmileWindow(ud.smileWindow);
    } else if (type == 'change2SmileCurve') {
        // 是否是精调中
        if (subCode.value === 3) {
            faceData.setAgainCurve(ud.smileCurve);
            // 关闭时，需要恢复
            if (!ud.smileCurve) fetchSubImageData(ImgHandleType.stroke);
        } else {
            faceData.showSmileCurve(ud.smileCurve);
        }
    } else if (type == 'change2TeethHeight') {
        const { curveProxy : curve } = faceData;
        infoHeight.code = code ? code : 3; // 3 是调整长度,1.2调整宽高比    
        curve.applyTeethHeight(toRaw(infoHeight));
        if (infoHeight.code == 3 && !infoHeight.lockRatio) {
            infoHeight.lvalue = curve.ratio11;
            infoHeight.rvalue = curve.ratio21;
        }
        faceData.updateFrame();
    } else if (type == 'change2Corridor') {
        faceData.curveProxy.applyBuccalCorridor(toRaw(infoCorridor), code);
        faceData.updateFrame();
    } else if (type == 'clickToGenerateSmile') {
        ud.imgStyleTransform = elCanvas.value.style.transform;
        fetchSubImageData(ImgHandleType.oneFromFour);
    } else if (type == 'clickToSelectOneFromFour') {
        const vKey = ud.genImgUrl[code].key;
        const keyInfo = vKey.split('_');        
        ud.idxTemplateStroke = ConfigColor.shapes.indexOf(keyInfo[0]);        
        ud.idxTemplateColor = parseInt(keyInfo[1]);
        const elImgTarget = elImgParent.value.children[code].children[0].children[0];
        createImageBitmap(elImgTarget).then(res=>{
            faceData.updateBitmap(res, true, closureImageData.getNewTeethCouter(vKey, faceData.info.cropped_loc));
            ud.selIdx = code;
            subCode.value = 3;
            updateMenu();
            // 选中后加模糊和阴影，手动调用一次
            updateImageDataWithColor(ImgHandleType.stroke, null);
        });
    } else if (type == 'change2ColorValue') {
        updateImageDataWithColor(ImgHandleType.color, toRaw(infoColor));
    } else if (type == 'lockWidthHeightRatio') {
        infoHeight.lockRatio = !infoHeight.lockRatio;
    } else if (['clickToPanUp','clickToPanLeft','clickToPanRight','clickToPanDown'].includes(type)) {
    } else if (type == 'clickToShowImage') {
        bindImage2Body(code.url);
    }
}
function generateFinalEffect(callback = ()=>{}) {
    new Promise((resolve)=>{
        return closureImageData.saveData(faceData.bitmap, {
            idxStroke: ud.idxTemplateStroke,
            idxColor: ud.idxTemplateColor,
            rect: faceData.rectWindow,
            info: toRaw(infoColor),
        }).then((data)=>{
            resolve(data);
        })
    }).then((data)=>{
        // updateImageDataWithColor(ImgHandleType.final, toRaw(infoColor), (bitmap)=>{
        //     closureImageData.genImageByBitmap(bitmap).then(url=>{
        //         elLoading.hide(10);
        //         ud.imgUrl1 = url;
        //         if (import.meta.env.DEV) {
        //             console.log('image-compare-dst', url);
        //         }
        //         subCode.value = 4;
        //         updateMenu();
        //     });
        // });
        fetchFinalImageData(data, (bitmap)=>{
            closureImageData.genImageByBitmap(bitmap).then(url=>{
                elLoading.hide(100);
                ud.imgUrl1 = url;
                subCode.value = 4;
                updateMenu();
            });
        })
    })
}
async function updateImageDataWithColor(imgHType, dataColor, callback = undefined) {
    await closureImageData.updateImageColorInfo(faceData.bitmapBk, imgHType, dataColor, {
        idxStroke: ud.idxTemplateStroke,
        idxColor: ud.idxTemplateColor,
        rect: faceData.rectWindow,
    }).then(bitmap=>{
        faceData.updateBitmap(bitmap);
        if (callback) callback(bitmap);
    });
}
function updateMenu() {
    menuShow.value = [1,3,4].includes(subCode.value);
    for (let idx = 0; idx < elMenuTool.value.children.length; idx++) {
        const child = elMenuTool.value.children[idx];
        if (idx == subCode.value) {
            child.classList.add('active');
        } else {
            child.classList.remove('active');    
        }
    }
    faceData.updateToolPan(subCode.value === 1 || (subCode.value === 3 && subMenuType.value===2), elContainer.value);
    // ui更新
    if ([1,3].includes(subCode.value)) {
        nextTick(()=>{
            if (elHeight.value) {
                elHeight.value.min = infoHeight.min;
                elHeight.value.max = infoHeight.max;
                elHeight.value.value = infoHeight.value;
            }
            if (elRatioLeft.value) {
                elRatioLeft.value.value = infoHeight.lvalue;
            }
            if (elRatioRight.value) {
                elRatioRight.value.value = infoHeight.rvalue;
            }
            if (elCorridorLeft.value) {
                elCorridorLeft.value.min = infoCorridor.min;
                elCorridorLeft.value.max = infoCorridor.max;
                elCorridorLeft.value.value = infoCorridor.lvalue;
            }
            if (elCorridorRight.value) {
                elCorridorRight.value.min = infoCorridor.min;
                elCorridorRight.value.max = infoCorridor.max;
                elCorridorRight.value.value = infoCorridor.rvalue;
            }
        })
    }
    if (subCode.value == 2) {
        // 重新计算高度百分比
        nextTick(()=>{
            const width = elImgParent.value.offsetWidth;
            // 算最高高度比
            const per = Math.min(parseInt(((Math.floor(width - 20 * 8) / 4) / faceData.imgRatio) / faceData.hReal * 100), 100);
            elRoot.value.style.setProperty('--smile-max-height', `${per}%`);
        })
    }
    if (subCode.value == 3) {
        subMenuType.value = 1;
        // 默认关闭
        ud.keyPoint = false;
        faceData.showKeyPoint(ud.keyPoint);
        ud.smileCurve = false;
        faceData.showSmileCurve(ud.smileCurve);
        ud.smileWindow = false;
        faceData.showSmileWindow(ud.smileWindow);
    }
    if (subCode.value == 4) {
        sub4Type.value = 2;
        setTimeout(() => {
            elImgCmp.value.updateCompareImage(faceData.wReal, faceData.hReal);
        }, 100);
    }

}
function updateViewLongIndex(type, idx) {
    if (type=='2') {
        ud.idxTemplateStroke = idx;
    } else if (type == '1') {
        ud.idxTemplateColor = idx;
    }
    if (import.meta.env.DEV) {
        console.log('scroll select',type, idx)
    }
    if (['1','2'].includes(type)) {
        fetchSubImageData(ImgHandleType.stroke, ()=>{});
    }
}
function changeInputFile(event) {
    const files = event.target.files;
    if (files.length > 0) {
        uploadOriginImage(files[0]);
    }
    event.target.value = '';
}
async function fetchSubImageData(imgHType, callback) {
    faceData.addTime(Date.now());
    elLoading.show(document.body, {zIndex: 2002, message: `Generate Smile Image`});
    elLoading.updatep(1, `${1}%`, false);
    const myHeaders = new Headers();
    const formData = new FormData();
    formData.append('id', ud.id);
    formData.append('transd_matx_1',JSON.stringify(faceData.info.transd_matx_1));
    formData.append('factor',faceData.getFactor());
    formData.append('wind',faceData.getSmileWind());
    formData.append('mod', faceData.getKeyPoint());
    if (subCode.value === 1) {
        // 第一次调用时会生成四个模板,需要保存
        ud.genImgUrl = [];
        const info = ConfigColor.shapeInfo;
        ud.shapes = info.map(e=>ConfigColor.shapes[e.index]);
        formData.append('color', '0');
    } else {
        ud.shapes = [ConfigColor.shapes[ud.idxTemplateStroke]];
        formData.append('color',ud.idxTemplateColor.toString());
    }
    formData.append('shape',JSON.stringify(ud.shapes));
    faceData.addTime(Date.now());
    invokeQueue(ud.id, 2).then((per)=>{
        // elLoading.update('Generate Smile Image');
        elLoading.updatepOffset(per, 100 - per, 0, false);
        registerAiSmile2(formData, ud.idxService, {
            headers: myHeaders,        
        }).then(res=>res.json()).then(res=>{
            elLoading.updatepOffset(100, 0, 0, false);
            releaseQueue(ud.id);
            faceData.addTime(Date.now());
            if (import.meta.env.DEV) {
                console.log('ai2', res)
            }
            if (res.data) {
                elLoading.update(res.data, 'text-danger');
            } else {
                closureImageData.updateSubImage(imgHType, res, {
                    rect:faceData.rectWindow,
                    info: toRaw(infoColor),
                }).then(data=>{
                    if (imgHType === ImgHandleType.oneFromFour) {
                        // 四个模板的数据
                        ud.genImgUrl = data;
                        subCode.value = 2;
                        updateMenu();
                        faceData.addTime(Date.now());
                        faceData.showTime();
                        elLoading.hide(10);
                    } else {
                        // 单个更新的数据
                        faceData.updateBitmap(data[0], true, closureImageData.getNewTeethCouter(`${ud.shapes[0]}_${ud.idxTemplateColor}`, faceData.info.cropped_loc));
                        elLoading.hide(10);
                        if (callback) callback();
                    }
                    
                });
            }
        });
    });
}
async function fetchFinalImageData(colorData, callback) {
    elLoading.show(document.body, {zIndex: 2002, message: `Generate Final Image`});
    elLoading.updatep(1, `${1}%`, false);
    const myHeaders = new Headers();
    const formData = new FormData();
    formData.append('id', ud.id);
    formData.append('factor',faceData.getFactor());
    formData.append('wind',faceData.getSmileWind());
    formData.append('mod', faceData.getKeyPoint());
    formData.append('colorData', colorData);
    formData.append('color', `${ud.idxTemplateColor}`);
    ud.shapes = [ConfigColor.shapes[ud.idxTemplateStroke]];
    formData.append('shape',JSON.stringify(ud.shapes));
    formData.append('loc',JSON.stringify(faceData.info.cropped_loc));
    formData.append('hsv_color',JSON.stringify([
        parseFloat(infoColor.hue), 
        parseFloat(infoColor.saturation),
        parseFloat(infoColor.brightness),
    ]));
    invokeQueue(ud.id, 3).then((per)=>{
        // elLoading.update('Generate Final Image');
        elLoading.updatepOffset(per, 100 - per, 0, false);
        registerAiSmile4(formData, ud.idxService, {
            headers: myHeaders,        
        }).then(res=>res.json()).then(res=>{
            elLoading.updatepOffset(100, 0, 0, false);
            releaseQueue(ud.id);
            if (import.meta.env.DEV) {
                console.log('ai3', res)
            }
            if (res.data) {
                elLoading.update(res.data, 'text-danger');
            } else {
                closureImageData.replaceAiResult(faceData.bitmapBk, res, {
                    rect:faceData.rectWindow,
                    info: toRaw(infoColor),
                }).then(bitmap=>{
                    // 单个更新的数据
                    faceData.updateBitmap(bitmap);
                    elLoading.hide(10);
                    if (callback) callback(bitmap);
                });
            }
        });
    });
}
async function uploadOriginImage(file) {
    elLoading.show(document.body, {zIndex: 2002, message: `Let's get beautiful smile`});
    if (faceData) {
        faceData.dispose();
    }
    faceData = new ImageFaceData({
        fillColor: import.meta.env.DEV ? 'red' : 'white',
        // showLog: import.meta.env.DEV,
    });
    if (import.meta.env.DEV) {
        window.mjfd = faceData;
    }
    if (!file.type.startsWith('image/')) {
        elLoading.update(`${file.name}不是图片格式`, 'text-danger');
        return;
    }
    // ud.imgUrl = URL.createObjectURL(file);
    ud.id = Date.now().toString();
    const formData = new FormData();
    formData.append('image', file);    
    formData.append('id', ud.id);
    invokeQueue(ud.id, 1).then((per)=>{
        // elLoading.update(`Let's get beautiful smile`);
        elLoading.updatepOffset(per, 100 - per, 0, false);
        registerAiSmile1(formData, ud.idxService).then(res=>res.json()).then(res=>{
            elLoading.updatepOffset(100, 0, 0, false);
            releaseQueue(ud.id);    
            if (res.data) {
                elLoading.update(res.data, 'text-danger');
            } else {            
                if (import.meta.env.DEV) {
                    console.log('ai data', res);
                }
                const rc = res.cropped_loc;
                /**
                 * 2024-1-30
                 * 确认一下：image_rotat_angle = [x,y]
                 * x是exif的旋转，取值0-8
                 * y是ai的旋转，取值0-3
                 * 
                 * */
                const aiAngle = res.image_rotat_angle;
                imageToBitmapWithHandle(file, {
                    x: rc[0],
                    y: rc[1],
                    width: rc[2] - rc[0],
                    height: rc[3] - rc[1],
                    orientation: aiAngle[0],
                    aiAngle,
                }).then(res2=>{
                    if (import.meta.env.DEV) {
                        console.log('crop image', res2);
                    }   
                    bitmap2ImageUrl(res2).then(url=>ud.imgUrl = url);
                    // 更新菜单
                    subCode.value = 1;
                    updateMenu();
                    nextTick(()=>{
                        // 更新canvas
                        const { width:imgWidth, height:imgHeight} = res2;                            
                        const { offsetWidth, offsetHeight } = elContainer.value;
                        if (import.meta.env.DEV) {
                            console.log('container size ', offsetWidth, offsetHeight)
                        }
                        faceData.bindCanvas(elCanvas.value, ud.ctx, res2, svgList);
                        {
                            const imgRatio = imgWidth / imgHeight;
                            let imgRealWidth = 0, imgRealHeight = 0;
                            if (offsetWidth > offsetHeight) {
                                imgRealHeight = offsetHeight;
                                imgRealWidth = Math.ceil(offsetHeight * imgRatio);
                            } else {
                                elLoading.update(`未考虑图像大小逻辑`, 'text-danger');
                                return;
                            }
                            elCanvas.value.width = imgRealWidth;
                            elCanvas.value.height = imgRealHeight;
                            faceData.setImgData(imgWidth, imgHeight, imgRealWidth, imgRealHeight);
                            closureImageData = ClosureCanvasUpdateImage(res2, {
                                xratio: faceData.ratioX,
                                yratio: faceData.ratioY,
                            });
                        }                
                        faceData.addTime(Date.now());
                        faceData.setUnit(ud.unit);
                        faceData.bindData(res);
                        const { curveProxy:curve} = faceData;
                        curve.setSymmetry(ud.symmetry);
                        infoHeight.value = curve.t1xValue;
                        infoHeight.min = curve.t1xMin;
                        infoHeight.max = curve.t1xMax;
                        infoHeight.lvalue = curve.ratio11;
                        infoHeight.rvalue = curve.ratio21;
                        infoCorridor.min = curve.corridorMin;
                        infoCorridor.max = curve.corridorMax;
                        infoCorridor.lvalue = curve.corridor1;
                        infoCorridor.rvalue = curve.corridor2;
                        updateMenu();
                        faceData.updateFrame();
                        ud.degree = faceData.degreeByMiddle;
                        elCanvas.value.style.transform = DomToolkit.rotate(parseFloat(ud.degree), ud.scale);
                        ud.info.degree = ud.degree;
                    });
                    elLoading.hide(0);
                });
            }
        });
    })
}
let cacheQueue = []; 
function releaseQueue(id) {
    const arg = cacheQueue.filter(e=>e.id==id)[0];
    smileRelease(arg).then(()=>{
        arg.state = 2;
        cacheQueue = cacheQueue.filter(e=>e.state==1);
    });
}
function invokeQueue(id, queue = 1) {
    const arg = {id, queue, qid: Date.now(), state: 1};
    cacheQueue.push(arg);
    if (queue !== 1) arg.service = ud.idService;
    let globalPer = 0;
    return new Promise(async (resolve)=>{
        const r1 = await smileInQueue(arg);
        if (r1.code != 200) {
            elLoading.update(`${r1.message}`, 'text-danger');
        } else {
            ud.idService = r1.data.service;
            ud.idxService = ud.idService === 'cq' ? 0 : 1;
            arg.service = ud.idService;
        }
        polling({
            tick: gConfigSmile.pollGapSecond,
            maxTimes: 10000,
            try: smileGetResult,
            tryRequest: arg,
            retryUntil: (res)=>{
                if (res.code == 200) {
                    const num = res.data.queueOrder;
                    if (num >= 0) {
                        let per = Math.ceil(90 / (num + 1));
                        globalPer = per;
                        elLoading.updatep(per, `${per}%`, false);
                    }
                    return num < 0;
                }
                elLoading.update(`${res.message}`, 'text-danger');
                throw 'polling error'
            },
        }).subscribe((res)=>{
            resolve(Math.max(50, Math.min(globalPer, 90)));
        });
    })
}
onMounted(()=>{
    ud.info = {
        patientName: '患者姓名',
        doctorName: '医生姓名',
        caseNo: 'A00001',
    };
    testUiAdapter();
    elLoading.config({
        colorBegin: '--bs-white',
        colorEnd: '--bs-gray-200',
        colorText: 'text-black-50',
        uiType: 'percentage',
    })
    gConfigSmile.showSpaceDebug = import.meta.env.DEV;
    gConfigSmile.isDev = import.meta.env.DEV;
    gConfigSmile.auxShowTeethPoint = import.meta.env.DEV;
    // gConfigSmile.showColorDebug = ['dev', 'beta'].includes(import.meta.env.VITE_APP_MODE);
    // document.title = `微笑设计`;
    ud.info.logo = imgLogoOrange;
    ud.ctx = bindCanvasPanZoom(elCanvas.value, {
        minimumZoom: true,
        lockZoom: false,
        updateFrame: ()=>{
            if (faceData) {
                const domMatrix = ud.ctx.getTransform();
                faceData.scale = domMatrix.a;
                faceData.updateFrame();
                ud.degree = faceData.degreeByMiddle;
                elCanvas.value.style.transform = DomToolkit.rotate(parseFloat(ud.degree), ud.scale);
                ud.info.degree = ud.degree;
            }
        },
    });
    if (ud.info.path) {
        elLoading.show(document.body, {zIndex: 2002, message: `Load the ${ud.info.patientName} smile image`});
        store.dispatch('oss/getClient').then(({client})=>{
            const url = signPath(client, ud.info.path);
            fetch(url).then(res=>res.arrayBuffer()).then(buffer=>{
                uploadOriginImage(new Blob([buffer], {type:'image/jpeg'}));
            })
        })
    }
    ud.info.font = {};
    returnChineseFonts().then(res=>{
        if (res.length > 0) ud.info.font = res[0];
    });
});
</script>