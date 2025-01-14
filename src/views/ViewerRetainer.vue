<template>
    <ViewerBase ref="elViewer" entry="retainer">
        <div>
            <div class="alert alert-info m-1 p-0 my-auto" role="alert" v-html="'Custom ID'"></div>
            <input class="form-control" v-model="ud.customId" type="text" />
        </div>  
        <div class="d-flex flex-wrap">
            <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(4)" v-html="'New Timestamp'"></button>
            <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(5)" v-html="'Load historical Data'"></button>
            <SubVersion :tag="tag" />
        </div>
        <div v-if="ud.timestampList.length > 0">
            <div>
                <div class="d-flex flex-wrap">                
                    <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Use the timestamp to differentiate processed and un-processed data'"></div>
                    <select class="form-select" v-model="ud.selTimestamp" @change="selectTimestamp">
                        <option v-for="(item,i) in ud.timestampList" :key="i" :value="item" v-html="elViewer.parseTime(tag, item)"></option>
                    </select>
                </div>
                <div class="d-flex flex-column flex-wrap">
                    <div class="alert alert-info m-1 py-2" role="alert">Current is {{msg1}}</div>
                    <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(6)" :disabled="getState()" >Upload the upper scanned meshes</button>
                    <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(2)" :disabled="getState()" >Upload the lower scanned meshes</button>
                </div>
            </div>
            <div>
                <div class="d-flex flex-column flex-wrap">
                    <div class="d-flex justify-content-evenly">
                        <label class="form-label my-auto mx-1">Thickness</label>
                        <input class="form-control form-control-sm w-50" v-model="m1.levelSet">
                    </div>
                    <div class="d-flex justify-content-evenly">
                        <label class="form-label my-auto mx-1">Tightness/Offset</label>
                        <input class="form-control form-control-sm w-50" v-model="m1.innerLevelSet">
                    </div>
                    <div class="d-flex justify-content-start my-2">
                        <input class="form-check-input mx-2" type="checkbox" :checked="m2.hasCut" @change="inputChangeUnderCut"/>
                        <label class="form-check-label" for="shellHollow">UnderCut Direction</label>
                    </div>
                </div>
            </div>
            <div v-if="m2.hasCut">
                <div class="d-flex flex-column flex-wrap">
                    <div class="d-flex">
                        <div class="form-check form-check-inline" v-for="item in info1" :key="item.id">
                            <input class="form-check-input" type="radio" name="jawType" v-model="m2.jaw" :id="`jaw${item.id}`" :value="item.id" @change="jawInputChange">
                            <label class="form-check-label" :for="`jaw${item.id}`" v-html="item.label"></label>
                        </div>
                    </div>
                    <div class="d-flex flex-column justify-content-start">
                        <label class="form-label my-auto mx-1">
                            <span :style="`color:rgb(${color4Mesh[0].map(e=>e*255).join(',')})`">upper Direction</span>
                            <button class="btn btn-primary w-25 m-1 btn-sm" :disabled="m2.uDirDef || m2.lockUpper" @click="clickByCode(7)">update</button>
                            <label class="form-label my-auto mx-1">
                                <span>use default</span>
                                <input class="form-check-input m-1" type="checkbox" :disabled="m2.lockUpper" v-model="m2.uDirDef" value="">
                            </label>
                        </label>
                        <!-- <label class="form-label my-auto mx-1 d-flex justify-content-evenly">
                            <span class="m-auto">scale</span>                            
                            -2<input type="range" class="form-range w-75" min="-2" max="2" step="0.01" :disabled="m2.lockUpper"  v-model="m2.uLevelSet"/>2
                        </label> -->
                        <label class="d-flex ms-2 w-30">
                            <span class="m-auto">scale</span>
                            <input class="form-control form-control-sm" :disabled="m2.lockUpper" v-model="m2.uLevelSet">
                        </label>
                        <div class="d-flex justify-content-evenly">
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">X</span>
                                <input class="form-control form-control-sm" :disabled="m2.uDirDef || m2.lockUpper" v-model="m2.x1" @change="positionInputChange($event, 1)"></label>
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">Y</span>
                                <input class="form-control form-control-sm" :disabled="m2.uDirDef || m2.lockUpper" v-model="m2.y1" @change="positionInputChange($event, 1)"></label>
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">Z</span>
                                <input class="form-control form-control-sm" :disabled="m2.uDirDef || m2.lockUpper" v-model="m2.z1" @change="positionInputChange($event, 1)"></label>                            
                        </div>
                    </div>
                    <div class="d-flex flex-column justify-content-start">
                        <label class="form-label my-auto mx-1">
                            <span :style="`color:rgb(${color4Mesh[1].map(e=>e*255).join(',')})`">lower Direction</span>
                            <button class="btn btn-primary w-25 m-1 btn-sm" :disabled="m2.lDirDef || m2.lockLower" @click="clickByCode(8)">update</button>
                            <label class="form-label my-auto mx-1">
                                <span>use default</span>
                                <input class="form-check-input m-1" type="checkbox" :disabled="m2.lockLower" v-model="m2.lDirDef" value="">
                            </label>
                        </label>
                        <!-- <label class="form-label my-auto mx-1 d-flex justify-content-evenly">
                            <span class="m-auto">scale</span>
                            -2<input type="range" class="form-range w-75" min="-2" max="2" step="0.01" :disabled="m2.lockLower"  v-model="m2.lLevelSet"/>2
                        </label> -->
                        <label class="d-flex ms-2 w-30">
                            <span class="m-auto">scale</span>
                            <input class="form-control form-control-sm" :disabled="m2.lockLower" v-model="m2.lLevelSet">
                        </label>
                        <div class="d-flex justify-content-evenly">
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">X</span>
                                <input class="form-control form-control-sm" :disabled="m2.lDirDef || m2.lockLower" v-model="m2.x2" @change="positionInputChange($event, 2)"></label>
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">Y</span>
                                <input class="form-control form-control-sm" :disabled="m2.lDirDef || m2.lockLower" v-model="m2.y2" @change="positionInputChange($event, 2)"></label>
                            <label class="d-flex ms-1 w-30">
                                <span class="m-auto">Z</span>
                                <input class="form-control form-control-sm" :disabled="m2.lDirDef || m2.lockLower" v-model="m2.z2" @change="positionInputChange($event, 2)"></label>                            
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-wrap">                
                <div class="d-flex">
                    <button class="btn btn-primary m-1" @click="clickByCode(3)" :disabled="ud.lockUpload==1?false: ud.lockBtn !== 7" v-html="'Call the AI Algorithm'"></button>
                    <div class="d-flex m-auto">
                        <input class="form-check-input m-1" type="checkbox" v-model="m1.isShell" value="" id="shellHollow">
                        <label class="form-check-label" for="shellHollow">Hollow</label>
                    </div>
                </div>
                <div class="h-100 m-auto d-flex flex-column justify-content-center">
                    <div class="spinner-border text-primary" role="status" v-if="ud.calling"></div>
                </div>
                <div class="alert alert-warning m-1 p-0 my-auto" role="alert" v-html="'Now wait for the AI Algorithm to process'"></div>
            </div>
        </div>
        <div class="d-flex flex-column py-3">
            <div class="alert alert-warning text-center m-1 p-0" role="alert" v-html="'progress bar'"></div>
            <div class="progress w-100" v-if="ud.uploading">
                <div class="progress-bar" role="progressbar" :style="`width: ${getPer()}%;`" :aria-valuenow="getPer()" aria-valuemin="0" aria-valuemax="100" v-html="getPer()+'%'"></div>
            </div>
            <SubProgress :show="ud.uploading" v-if="ud.total == 1 || ud.fetchTotal == 1" />
        </div>
        <div class="d-flex flex-column">
            <div class="alert alert-danger p-1 m-1" role="alert" v-if="msg.length > 0" v-html="msg"></div>
            <div v-for="(item,i) in ud.errorList" :key="i">
                <div class="alert alert-danger p-1 m-1" role="alert" v-html="item.name"></div>
            </div>
        </div>
        <SubChangeLog :tag="tag" />
        <div class="">
            <div class="d-flex flex-wrap my-1" v-for="(item,i) in ud.infoList" :key="i">
                <input type="color" class="form-control" :value="item.color" @change="elViewer.colorUpdate($event,item)" style="width:60px;" />
                <input type="range" class="form-range" min="0" max="1" step="0.01" :value="item.opacity" @change="elViewer.opacityUpdate($event,item)" style="width:160px;" />
                <div class="form-check form-switch mx-3">
                    <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                    <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                </div>
                <button class="btn btn-primary btn-sm" v-if="elViewer.eventByType(tag, null, item)" 
                @click="elViewer.eventByType(tag, $event, item, 'download')">Download</button>
            </div>
        </div>
        <!-- <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </ViewerBase>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import ViewerBase from './ViewerBase.vue';
import SubChangeLog from './sub/SubChangeLog.vue';
import SubVersion from './sub/SubVersion.vue';
import SubProgress from './sub/SubProgress.vue';
import { 
    getMeshMaterialOption, addColor2Mesh, 
    arrayVectorToMatrix, 
} from '../third/auxThree';
import { readFromStorage, writeToStorage } from '../third/snippet/storage';
import elLoading from '../third/snippet/loading';
import { 
    FilePathLoader, PathLoader, mesh2drc, MarkerLines, toIndexGeometry, colorUpdateByIndex,
    alias3, bindDracoEncoder
} from '../third/mq-render/viewer.es';
import { upload, getHistory, callAiRetainerNew } from '../api/all';
import { configRetainer } from '../../config';
import { toYYMMDDHHmmss } from '../utils/util';
import { UnderCut } from '../utils/undercut';

const props = defineProps({
    tag: {
        type:String,
        default: 'pmp_retainer',
    }
});
const info1 = [
    {id: 1, label: 'Upper'},
    {id: 2, label: 'Lower'},
    // {id: 3, label: 'None'},
]
const color4Mesh = [
    // [0.23, 0.76, 0.71], // upper
    // [0.44, 0.64, 0.98], // lower
    [0.84, 0.2, 0.52], // upper
    [0, 0.68, 0.94], // lower
];
console.log(`color:rgb(${color4Mesh[0].map(e=>e*255).join(',')})`)
const nameMeshs = ['cleaned_upper.mq','cleaned_lower.mq'];
const store = useStore();
const elViewer = ref(null);
const refFile = ref(null);
const isDev = ref(import.meta.env.DEV);
const msg = ref('');
const msg1 = ref('');
const cut = new UnderCut();
const cFixNum = 4;
const ud = reactive({
    type: 0,
    total: 0,
    count: 0,
    uploading:false,
    errorList: [],
    pathList: [],
    timestampList: [],
    timestamp: '1680514251226',
    customId: 'A',
    tidList: [
        18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
        48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
    ],
    fetchTotal: 0,
    fetchCount: 0,
    fetching: false,
    calling: false,
    lockBtn: 0,
    lockUpload: 0, // 控制上传逻辑
    selTimestamp: {},
    script: null,
});
const mat = reactive({
    upper: null,
    lower: null,
});
const m1 = reactive({
    tempDir: '',
    tag: props.tag,
    isShell: configRetainer.isShell,
    levelSet: '0.6',
    innerLevelSet: '0',
    isPrint: true,    
});
const m2 = reactive({
    jaw: '3',
    lockUpper: true,
    lockLower: true,
    hasCut: false,
    x1: '0',
    y1: '0',
    z1: '1',
    x2: '0',
    y2: '0',
    z2: '1',
    uLevelSet: 0,
    lLevelSet: 0,
    uDirDef: true,
    lDirDef: true,
})
let app3 = null;
let gScene = null;
let markers = {}, idxMarker = 7;
const keyOfLocalStorage = `keyOfLocalStorage${props.tag}`;
onMounted(async() => {
    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    // 
    bindDracoEncoder(`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/draco_encoder.js`);
    app3 = elViewer.value.app3;
    gScene = elViewer.value.gScene;
    if (import.meta.env.DEV) {
        window.app = {
            app3,
        }
    }
    await cut.init();
    clickByCode(5); // 默认加载历史数据
})
function getState() {
    const {tmpDir, customId} = ud.selTimestamp || {};
    if (!tmpDir && !customId) {
        // 未选中时，禁用
        return true;
    }
    if (tmpDir > 0 && customId > 0) {
        // 历史记录，禁用
        return true;
    }
    return false;
}
function resetDir(hasNormal) {
    m2.hasCut = hasNormal;
    m2.x1 = 0, m2.y1 = 0, m2.z1 = 0;
    m2.x2 = 0, m2.y2 = 0, m2.z2 = 0;
    m2.uDirDef = true;
    m2.lDirDef = true;
    m2.uLevelSet = 0;
    m2.lLevelSet = 0;
}
function clickByCode(type) {
    ud.fetching = false;
    msg.value = '';
    ud.errorList = [];
    ud.type = type;
    if ([2,6].includes(type)) {
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        ud.calling = true;
        if (m2.hasCut) {
            m1.underCut = {
                upper: {
                    useDefaultDir: m2.uDirDef,
                    underCutLevelSet: Number(m2.uLevelSet),
                    underCutDir: { x: Number(m2.x1), y: Number(m2.y1), z: Number(m2.z1) },
                },
                lower: {
                    useDefaultDir: m2.lDirDef,
                    underCutLevelSet: Number(m2.lLevelSet),
                    underCutDir: { x: Number(m2.x2), y: Number(m2.y2), z: Number(m2.z2) },
                }
            }
        } else {
            m1.underCut = undefined;
        }
        if (mat.upper || mat.lower) {
            app3.remove('upper.stl');
            app3.remove('lower.stl');
            ud.infoList = ud.infoList.filter(e=>nameMeshs.includes(e.filename));
        }
        callAiRetainerNew(m1).then(res=>{
            ud.calling = false;
            const {code, message, data} = res;            
            if (code == 200) {
                gScene.clear();
                ud.infoList = [];
                const keyList = Object.keys(data);
                if (keyList.length < 1) {
                    msg.value = 'empty data';
                    return;
                }
                ud.lockUpload = 0;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateCacheHistoryData(m1.tempDir, 'history', m1, false);
                }
                ud.pathList = data.files;
                elViewer.value.resetAxes();
                if (data.lowerMat) mat.lower = arrayVectorToMatrix(data.lowerMat);
                if (data.upperMat) mat.upper = arrayVectorToMatrix(data.upperMat);
                updateByPath();
            } else {
                msg.value = message;
            }
        })
    } else if (type == 4) {
        // 
        if (!ud.customId) ud.customId = 'A';
        ud.timestampList.unshift({
            tmpDir: Date.now(),
            customId: '',
            isShell: configRetainer.isShell,
        });
        // 添加时自动第一个
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        m1.type = 1;
        m1.isShell = configRetainer.isShell;        
        m1.tempDir = `${ud.selTimestamp.tmpDir}_${ud.customId}`;      
        msg1.value = `${toYYMMDDHHmmss(ud.selTimestamp.tmpDir)}_${ud.customId}`;
        ud.lockUpload = 0;
        ud.lockBtn = 1;        
        gScene.clear();
        app3.updateFrame();
        m2.hasCut = true;
        ud.infoList = [];
        [7,8].forEach(e=>{
            if (markers[e]) app3.add(markers[e]);
        })
        elViewer.value.resetAxes();
        resetDir(true);
    } else if (type == 5) {
        ud.timestampList = [];
        getHistory(m1).then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = strList[0].split('=').pop();
                    const ids = tmpDir.split('_');
                    const parameters = {};
                    strList.forEach(str=>{
                        const strValue = str.split('=')[1];
                        if (str.startsWith('isShell')) {
                            parameters.isShell = configRetainer.isShell;
                            if (strList.length > 1) {
                                parameters.isShell = strValue == 'true';
                            }        
                        }
                        if (str.startsWith('levelSet')) {
                            parameters.levelSet = parseFloat(strValue);
                        }
                        if (str.startsWith('innerLevelSet')) {
                            parameters.innerLevelSet = parseFloat(strValue);
                        }
                        if (str.startsWith('underCut')) {
                            parameters.underCut = JSON.parse(strValue);                            
                        }
                    })
                    updateCacheHistoryData(parseInt(ids[0]), ids[1] || 'history', parameters, true);
                })
            }
        })
    } else if ([7,8].includes(type)) {
        elLoading.show(document.body, {message: `Wait for computing...`, zIndex:5000});
        const pos = app3.getCameraPosition().normalize().negate();
        if (type==7) m2.x1 = fixNum(pos.x), m2.y1 = fixNum(pos.y), m2.z1 = fixNum(pos.z);
        else m2.x2 = fixNum(pos.x), m2.y2 = fixNum(pos.y), m2.z2 = fixNum(pos.z);
        if (!markers[type]) {            
            elLoading.update(`no ${info1[type == 7 ? 0 : 1].label} mesh`)
        } else {
            markers[type].update(pos)
            showUnderCut(type);
        }
    }
}
function updateCacheHistoryData(tmpDir, customId, parameters, isNew) {
    // 更新进去
    const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
    if (tmp) {
        tmp.customId = customId;
        tmp.isShell = parameters.isShell;
        tmp.levelSet = parameters.levelSet;
        tmp.innerLevelSet = parameters.innerLevelSet;        
        if (parameters.underCut) {
            tmp.underCut = parameters.underCut;
        }
    } else {
        if (isNew) {
            ud.timestampList.push({
                tmpDir: tmpDir,
                customId: customId,
                ...parameters,
            });
        }
    }
    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
}
function fixNum(x) {
    return Number(x).toFixed(cFixNum);
}
function selectTimestamp() {
    const { 
        tmpDir, customId, isShell, levelSet, innerLevelSet, underCut
    } = ud.selTimestamp || {};
    ud.customId = '';
    ud.lockBtn = 0;
    m1.isShell = isShell;
    m1.levelSet = levelSet;
    m1.innerLevelSet = innerLevelSet;
    if (underCut) {
        m2.hasCut = true;
        m2.uDirDef = underCut.upper.useDefaultDir;
        m2.lDirDef = underCut.lower.useDefaultDir;
        m2.uLevelSet = underCut.upper.underCutLevelSet;
        m2.lLevelSet = underCut.lower.underCutLevelSet;
        m2.x1 = fixNum(underCut.upper.underCutDir.x); 
        m2.y1 = fixNum(underCut.upper.underCutDir.y); 
        m2.z1 = fixNum(underCut.upper.underCutDir.z);            
        m2.x2 = fixNum(underCut.lower.underCutDir.x); 
        m2.y2 = fixNum(underCut.lower.underCutDir.y); 
        m2.z2 = fixNum(underCut.lower.underCutDir.z);            
    } else {
        m2.hasCut = false;
    }
    if (customId == 'history') m1.tempDir = `${tmpDir}`; // 旧数据，未添加自定义
    else m1.tempDir = `${tmpDir}_${customId}`; // 有自定义ID的
    if (customId) {
        // 历史记录
        m1.type = 2;
        m1.upper = 'no upper path';
        m1.lower = 'no lower path';
        ud.lockUpload = 1;
    } else {
        m1.type = 1;
        m1.upper = null;
        m1.lower = null;
        ud.timestamp = tmpDir;
        ud.lockUpload = 0;
    }
    msg1.value = `${toYYMMDDHHmmss(tmpDir)}_${customId}`;
    gScene.clear();
    ud.infoList = [];
}
function updateByPath() {
    elLoading.show(document.body, {message: `Loading...`, zIndex:5000});
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length || 0;
    ud.fetchCount = 0;
    const fetchSinglePath = async (path) => {
        const filename = PathLoader.getName(path);
        const validPath = `${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`;
        const geo = await new PathLoader(path, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`})
        .load(validPath, (e)=>{
            // console.log('progress', e.loaded/e.total)
        }).catch(err=>{
            if (err instanceof ProgressEvent) {
                if (err.total==0) {
                    ud.errorList.push({
                        name: filename,
                    })
                }   
            }
            msg.value = 'File Load failure';
            elLoading.hide();
            return null;
        })
        if (!geo) return;
        elLoading.hide();
        if (path.indexOf('/input/') > 0) {
            const isUpper = path.indexOf('cleaned_upper.mq') > 0;
            cut.setData(isUpper, geo.attributes.position.array, geo.index.array);                   
        }
        addGeotoScene(geo, filename, path);
    }
    ud.pathList.forEach(async(path)=>{                    
        if (path.endsWith('.json')) {
            fetch(`${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`)
            .then(res=>res.json()).then(res=>{
                console.log(res);
                if (res.lowercutDir) {
                    m2.x2 = fixNum(res.lowercutDir.x);
                    m2.y2 = fixNum(res.lowercutDir.y);
                    m2.z2 = fixNum(res.lowercutDir.z);
                    updateMarkers(res.lowercutDir, false);
                }
                if (res.uppercutDir) {
                    m2.x1 = fixNum(res.uppercutDir.x);
                    m2.y1 = fixNum(res.uppercutDir.y);
                    m2.z1 = fixNum(res.uppercutDir.z);
                    updateMarkers(res.uppercutDir, true);
                }
                ud.fetchCount++;
            })
        } else {
            await fetchSinglePath(path);     
        }
    });
    app3.updateFrame();
    elLoading.hide();
}
async function showUnderCut(indexMark) {
    const dir = [];
    const meshName = nameMeshs[indexMark==7?0:1];
    const mesh = app3.findByName(meshName)[0];
    console.log('show undercut ', indexMark, mesh)
    if (!mesh) return;
    if (indexMark==7) {
        dir.push(m2.x1, m2.y1, m2.z1);
    } else {
        dir.push(m2.x2, m2.y2, m2.z2);
    }
    const index = cut.fetchIndex(indexMark==7, dir.map(e=>parseFloat(e)));
    if (!mesh.userData.oldColor) {
        mesh.userData.oldColor = mesh.geometry.attributes.color.clone();
    } else {
        mesh.geometry.attributes.color.copy(mesh.userData.oldColor);
    }
    colorUpdateByIndex(mesh.geometry, index, color4Mesh[indexMark==7?0:1]);
    elLoading.hide(0);
    app3.updateFrame();
}
function updateMarkers(position, isUpper) {
    const idx = isUpper ? 7 : 8;
    let mark = markers[idx];
    if (mark) {
        mark.update([position.x, position.y, position.z].map(e=>parseFloat(e)));        
    } else {
        const pos = new alias3.Vector3(position.x, position.y, position.z);
        mark = new MarkerLines([pos], 40, {
            showX: true,
            color1: color4Mesh[isUpper ? 0 : 1],    
        })
        mark.name = `marker${idx}`;
        markers[idx] = mark;
    }
    app3.add(mark);
}
function appendFileMesh(mesh, filename, isUpper) {
    mesh.name = filename;
    const geo = mesh.geometry;
    cut.setData(isUpper, geo.attributes.position.array, geo.index.array);
    const info = getMeshMaterialOption(filename, {tag:props.tag});
    if (!ud.infoList) ud.infoList = [];
    ud.infoList.push({
        filename: filename,
        check: true,
        color: info.color,
        opacity: info.opacity,
    });
    app3.add(mesh);
    app3.updateFrame();
    ud.lockUpload = markers[7] && markers[8] ? 1 : 0;
    updateMarkers({x:0,y:0,z:1},isUpper);    
}
function addGeotoScene(geo, filename, path) {
    if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
        console.warn('empty BufferGeometry');
        return;
    }
    const info = getMeshMaterialOption(filename, {tag:props.tag});
    if (!ud.infoList) ud.infoList = [];    
    ud.infoList.push({
        filename:filename,
        check: true,
        color: info.color,
        opacity: info.opacity,
    });
    function compare(attr) {
        return function(a,b) {
            const t1 = a[attr], t2 = b[attr];
            const t = t1.localeCompare(t2);
            return t1.localeCompare(t2);
        }
    }
    ud.infoList.sort(compare('filename'));
    addColor2Mesh(geo, {name:filename, color:info.color, opacity: info.opacity}).then((mesh)=>{
        ud.fetchCount++;
        if (path && path.indexOf('/input/') > 0) {                        
            const str = path.toLowerCase();
            // if (str.indexOf('/input/cleaned_lower.mq') > 0 && mat.lower) {
            //     mesh.applyMatrix4(mat.lower);
            // } else if (str.indexOf('/input/cleaned_upper.mq') > 0 && mat.upper) {
            //     mesh.applyMatrix4(mat.upper);
            // }
            mesh.matrixWorldNeedsUpdate = true;
        }
        app3.add(mesh);
        app3.updateFrame();
        if (ud.fetchCount == ud.fetchTotal) {
            showUnderCut(7).then(()=>{
                showUnderCut(8).then(()=>{

                })
            })
        }
    })    
    app3.updateFrame();
}
function jawInputChange() {
    if (m2.jaw=='1') {
        m2.lockUpper = false;
        m2.lockLower = true;
        idxMarker = 7;
    } else if (m2.jaw=='2') {
        m2.lockUpper = true;
        m2.lockLower = false;
        idxMarker = 8;
    } else {
        m2.lockUpper = true;
        m2.lockLower = true;
    }
}
function positionInputChange(event, code) {
    if (code == 1) {
        markers[idxMarker].update([m2.x1, m2.y1, m2.z1].map(e=>parseFloat(e)));
    } else if (code == 2) {
        markers[idxMarker].update([m2.x2, m2.y2, m2.z2].map(e=>parseFloat(e)));
    }
    showUnderCut(idxMarker);
}
function inputChangeUnderCut() {
    m2.hasCut = !m2.hasCut;
}
function inputChangeUpdate(item) {
    item.check = !item.check;
    const mesh = gScene.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        mesh.visible = item.check;
        app3.updateFrame();
    }
}
function getPer() {
    if (ud.fetching) {
        return Math.round(100 * ud.fetchCount / ud.fetchTotal).toFixed(0);     
    }
    return Math.round(50).toFixed(0); 
}
async function handleSelectFile(event) {
    const files = event.target.files;
    if ([2,6].includes(ud.type)) {
        // 上传文件
        ud.fetching = false;
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = 'Please Select Timestamp to Continue';
            return;
        }
        ud.uploading = true;
        const file = files[0];
        let filename = file.name;
        const fnameLower = filename.toLowerCase();
        const { tag } = props;
        const formData = new FormData();
        let geo = await new FilePathLoader(filename, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`}).load(file)
            .catch(err=>{
                msg.value = 'File Load failure';
                console.error(err);
                return null;
            })
        if (!geo) return; 
        // console.log('load', geo.clone()) 
        geo = toIndexGeometry(geo);
        // console.log('merge', geo.clone()) 
        const mesh = await addColor2Mesh(geo);
        if (fnameLower.endsWith('.drc') || fnameLower.endsWith('.mq')) {
            filename = nameMeshs[ud.type == 6 ? 0 : 1];
            formData.append("files", file, filename);
        } else {
            //  其他格式转换一下
            try {
                const buffer = await mesh2drc(mesh.clone());
                // const noExtFilename = filename.substr(0, filename.lastIndexOf('.'));
                filename = nameMeshs[ud.type == 6 ? 0 : 1];
                formData.append("files", new Blob([buffer.buffer], { type: 'application/octet-stream',}), filename);
            } catch(err){
                msg.value = 'File Load failure';
            }
        }
        appendFileMesh(mesh, filename, ud.type == 6);
        // ud.uploading = false;
        // return;
        formData.append("tempDir", `${ud.timestamp}_${ud.customId}`); 
        formData.append("tag", tag); 
        const res = await upload(formData)
        if (res.code == 200) {  
            // appendFileMesh(mesh, filename, ud.type == 6);
            if (ud.type == 6) {
                m1.upper = filename;
                ud.lockBtn |= 2;
            } else if (ud.type == 2) {
                m1.lower = filename;
                ud.lockBtn |= 4;
            }
            // 0x1 | 0x2 | 0x4 can call Ai
            console.log('lock btn', ud.lockBtn)
        } else {
            console.error(res.message);
            msg.value = res.message;
        }
        ud.uploading = false;
    }
}
</script>