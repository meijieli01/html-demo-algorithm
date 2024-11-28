<template>
    <ViewerBase ref="elViewer" entry="retainer">
        <div>
            <div class="alert alert-info m-1 p-0 my-auto" role="alert" v-html="'Custom ID'"></div>
            <input class="form-control" v-model="ud.customId" type="text" />
        </div>  
        <div class="d-flex flex-wrap">
            <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(1)" v-if="isDev" v-html="'Local Test to Show'"></button>
            <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(4)" v-html="'New Timestamp'"></button>
            <button class="btn btn-primary m-1 btn-sm" @click="clickByCode(5)" v-html="'Load historical Data'"></button>
            <SubVersion :tag="tag" />
        </div>
        <div v-if="ud.timestampList.length > 0">
            <div>
                <div class="d-flex flex-wrap">                
                    <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Use the timestamp to differentiate processed and un-processed data'"></div>
                    <select class="form-select" v-model="ud.selTimestamp" @change="selectTimestamp">
                        <option v-for="(item,i) in ud.timestampList" :key="i" :value="item" v-html="parseTime(item)"></option>
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
                    <div class="d-flex justify-content-start">
                        <label class="form-label my-auto mx-1">Thickness</label>
                        <input class="form-control w-50" v-model="m1.thickness">
                    </div>
                    <div class="d-flex justify-content-start">
                        <label class="form-label my-auto mx-1">Tightness/Offset</label>
                        <input class="form-control w-50" v-model="m1.tightness">
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
                            <button class="btn btn-primary w-25 m-1 btn-sm" :disabled="m2.lockUpper" @click="clickByCode(7)">update</button>
                        </label>
                        <div class="d-flex flex-column">
                            <label class="d-flex mx-3">X
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockUpper" v-model="m2.x1" @change="positionInputChange($event, 1)"></label>
                            <label class="d-flex mx-3">Y
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockUpper" v-model="m2.y1" @change="positionInputChange($event, 1)"></label>
                            <label class="d-flex mx-3">Z
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockUpper" v-model="m2.z1" @change="positionInputChange($event, 1)"></label>                            
                        </div>
                    </div>
                    <div class="d-flex flex-column justify-content-start">
                        <label class="form-label my-auto mx-1">
                            <span :style="`color:rgb(${color4Mesh[1].map(e=>e*255).join(',')})`">lower Direction</span>
                            <button class="btn btn-primary w-25 m-1 btn-sm" :disabled="m2.lockLower" @click="clickByCode(8)">update</button>
                        </label>
                        <div class="d-flex flex-column">
                            <label class="d-flex mx-3">X
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockLower" v-model="m2.x2" @change="positionInputChange($event, 2)"></label>
                            <label class="d-flex mx-3">Y
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockLower" v-model="m2.y2" @change="positionInputChange($event, 2)"></label>
                            <label class="d-flex mx-3">Z
                                <input class="form-control form-control-sm ms-2 w-50" :disabled="m2.lockLower" v-model="m2.z2" @change="positionInputChange($event, 2)"></label>                            
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
import { filterFile, toYYMMDDHHmmss } from '../utils/util';
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
const ud = reactive({
    type: 0,
    total: 0,
    count: 0,
    countError: 0,
    uploading:false,
    cacheList: {},
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
let gCache = {};
const mat = reactive({
    upper: null,
    lower: null,
});
const m1 = reactive({
    tempDir: '',
    tag: props.tag,
    isShell: configRetainer.isShell,
    thickness: '0.6',
    tightness: '0',
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
function parseTime(timestamp) {
    const ymdhms = toYYMMDDHHmmss(timestamp.tmpDir);
    return `${ymdhms} --- ${timestamp.customId}`;
}
function getState() {
    const {tmpDir, customId} = ud.selTimestamp || {};
    if (ud.lockUpload==1) return true;
    if (ud.lockBtn==0) return true;
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
}
function clickByCode(type) {
    ud.fetching = false;
    msg.value = '';
    msg.errorList = [];
    msg.countError = 0;
    ud.type = type;
    if ([1,2,6].includes(type)) {
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        if (!m1.upper || !m1.lower) {
            msg.value = 'Please wait patiently for the upload to complete';
            return;
        }
        ud.calling = true;
        if (m2.hasCut) {
            m1.upperDir = { x: Number(m2.x1), y: Number(m2.y1), z: Number(m2.z1) };
            m1.lowerDir = { x: Number(m2.x2), y: Number(m2.y2), z: Number(m2.z2) };
        } else {
            m1.upperDir = undefined;
            m1.lowerDir = undefined;
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
                const keyList = Object.keys(data);
                if (keyList.length < 1) {
                    msg.value = 'empty data';
                    return;
                }
                ud.lockUpload = 0;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, 'history', m1, false);
                }
                ud.pathList = data.files.filter(e=>filterFile(e));
                if (m1.type == 2) {
                    // 历史记录
                    // ud.pathList = ud.pathList.filter(e=>!e.indexOf('/input/')>-1);
                    app3.setAxes(40);
                } else {
                    // 新的调用
                    ud.pathList = ud.pathList.filter(e=>e.indexOf('/output/')>-1);
                }
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
        gScene.clear(); //不能直接清空，需要保留之前的数据
        app3.updateFrame();
        m2.hasCut = true;
        ud.infoList = [];
        gCache = {};
        [7,8].forEach(e=>{
            if (markers[e]) app3.add(markers[e]);
        })
        app3.setAxes(40);
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
                        if (str.startsWith('thickness')) {
                            parameters.thickness = parseFloat(strValue);
                        }
                        if (str.startsWith('tightness')) {
                            parameters.tightness = parseFloat(strValue);
                        }
                        if (str.startsWith('upperDir')) {
                            parameters.upperDir = JSON.parse(strValue);                            
                        }
                        if (str.startsWith('lowerDir')) {
                            parameters.lowerDir = JSON.parse(strValue);
                        }
                    })
                    updateTimestampData(parseInt(ids[0]), ids[1] || 'history', parameters, true);
                })
            }
        })
    } else if ([7,8].includes(type)) {
        elLoading.show(document.body, {message: `Wait for computing...`, zIndex:5000});
        const pos = app3.getCameraPosition().normalize().negate();
        if (type==7) m2.x1 = pos.x, m2.y1 = pos.y, m2.z1 = pos.z;
        else m2.x2 = pos.x, m2.y2 = pos.y, m2.z2 = pos.z;
        if (!markers[type]) {            
            elLoading.update(`no ${info1[type == 7 ? 0 : 1].label} mesh`)
        } else {
            markers[type].update(pos)
            showUnderCut();
        }
    }
}
function updateTimestampData(tmpDir, customId, parameters, isNew) {
    // 更新进去
    const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
    if (tmp) {
        tmp.customId = customId;
        tmp.isShell = parameters.isShell;
        tmp.thickness = parameters.thickness;
        tmp.tightness = parameters.tightness;
        if (parameters.upperDir) tmp.upperDir = parameters.upperDir;
        if (parameters.lowerDir) tmp.lowerDir = parameters.lowerDir;
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
function selectTimestamp() {
    const { 
        tmpDir, customId, isShell, thickness, tightness, upperDir, lowerDir 
    } = ud.selTimestamp || {};
    ud.customId = '';
    ud.lockBtn = 0;
    m1.isShell = isShell;
    m1.thickness = thickness;
    m1.tightness = tightness;
    if (upperDir || lowerDir) {
        m2.hasCut = true;
        m2.x1 = upperDir.x;
        m2.y1 = upperDir.y;
        m2.z1 = upperDir.z;
        m2.x2 = lowerDir.x;
        m2.y2 = lowerDir.y;
        m2.z2 = lowerDir.z;
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
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
        app3.updateFrame();
        elLoading.hide();
        return;
    }
    const fetchSinglePath = async (path) => {
        // const filename = PathLoader.getName(path);        
        // const url = await store.dispatch('auth/getUrl', path);
        const filename = PathLoader.getName(path);
        const validPath = `${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`;
        const geo = await new PathLoader(path, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`}).load(validPath, (e)=>{
            // console.log('progress', e.loaded/e.total)
        }).catch(err=>{
            if (err instanceof ProgressEvent) {
                if (err.total==0) {
                    ud.countError++;
                    ud.errorList.push({
                        name: filename,
                    })
                }   
            }
            msg.value = 'File Load failure';
            elLoading.hide();
            return null;
        })
        ud.fetchCount++;
        if (!geo) return;
        elLoading.hide();
        addGeotoScene(geo, filename, path);
    }
    ud.pathList.forEach(path=>{        
        // if (path && path.indexOf('/input/') > 0) {
        //     const str = path.toLowerCase();
        //     if (str.indexOf('/input/cleaned_lower.mq') > 0 && mat.lower) {
        //         gCache[nameMeshs[1]].applyMatrix4(mat.lower);
        //         gCache[nameMeshs[1]].matrixWorldNeedsUpdate = true;
        //     } else if (str.indexOf('/input/cleaned_upper.mq') > 0 && mat.upper) {
        //         gCache[nameMeshs[0]].applyMatrix4(mat.upper);
        //         gCache[nameMeshs[0]].matrixWorldNeedsUpdate = true;
        //     }
        // } else {
            fetchSinglePath(path);
        // }
    });
    app3.updateFrame();
    elLoading.hide();
}
async function showUnderCut() {
    const dir = [];
    let mesh;
    if (idxMarker==7) {
        dir.push(m2.x1, m2.y1, m2.z1);
        mesh = gCache[nameMeshs[0]];
    } else {
        dir.push(m2.x2, m2.y2, m2.z2);
        mesh = gCache[nameMeshs[1]];
    }
    const index = cut.fetchIndex(idxMarker==7, dir.map(e=>parseFloat(e)));
    if (!mesh.userData.oldColor) {
        mesh.userData.oldColor = mesh.geometry.attributes.color.clone();
    } else {
        mesh.geometry.attributes.color.copy(mesh.userData.oldColor);
    }
    colorUpdateByIndex(mesh.geometry, index, color4Mesh[idxMarker==7?0:1]);
    elLoading.hide(0);
    app3.updateFrame();
}
function appendFileMesh(mesh, filename, isUpper) {
    mesh.name = filename;
    const geo = mesh.geometry;
    const idx = isUpper ? 7 : 8;
    const pos = new alias3.Vector3(0, 0, 1);
    markers[idx] = new MarkerLines([pos], 40, {
        showX: true,
        color1: color4Mesh[isUpper ? 0 : 1],
    });     
    markers[idx].name = `marker${idx}`;
    app3.add(markers[idx]);
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
    gCache[filename] = mesh;
    ud.lockUpload = markers[7] && markers[8] ? 1 : 0;
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
    addColor2Mesh(geo, {name:filename, color:info.color, opacity: info.opacity}).then(mesh=>{
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
    })
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
    } else {
        app3.updateFrame();
    }
}
function jawInputChange() {
    if (m2.jaw=='1') {
        m2.lockUpper = false;
        m2.lockLower = true;
        idxMarker = 7;
        // showUnderCut();    
    } else if (m2.jaw=='2') {
        m2.lockUpper = true;
        m2.lockLower = false;
        idxMarker = 8;
        // showUnderCut();
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
    showUnderCut();
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
    if (ud.type == 1) {
        // 本地加载stl文件
        ud.fetching = true;
        ud.uploading = true;
        ud.infoList = [];
        elLoading.show(document.body, {message: `加载中...`, zIndex:5000});
        ud.fetchTotal = files.length;
        ud.fetchCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const geo = await new FilePathLoader(file.name, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`}).load(file, (event)=>{
                // console.log('progress', event.loaded/event.total)
            }).catch(err=>{
                if (err instanceof ProgressEvent) {
                    if (err.total==0) {
                        ud.countError++;
                        ud.errorList.push({
                            name: filename,
                        })
                    }   
                }
                msg.value = 'File Load failure';
                elLoading.hide();
                return null;
            });
            ud.fetchCount++;
            if (!geo) return;
            const filename = FilePathLoader.getName(file.name);
            elLoading.hide();
            addGeotoScene(geo, filename);
        }
    } else if ([2,6].includes(ud.type)) {
        // 上传文件
        ud.fetching = false;
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = 'Please Select Timestamp to Continue';
            return;
        }
        const auxiliary = ud.type == 6 ? 'upper' : 'lower';
        ud.uploading = true;
        const file = files[0];
        let filename = file.name;
        const fnameLower = filename.toLowerCase();
        const { tag } = props;
        if (true) {
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
        } else {
            let res = null;
            if (filename.endsWith('.drc') || filename.endsWith('.mq')) {
                const path = `retainer/${ud.timestamp}_${ud.customId}/input/${auxiliary}/${filename}`;
                res = await store.dispatch('auth/putFile', {
                    file, path,
                });
            } else {
                //  其他格式转换一下
                try {
                    const noExtFilename = filename.substr(0, filename.lastIndexOf('.'));
                    const geo = await new FilePathLoader(filename, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`}).load(file)
                    .catch(err=>{
                        msg.value = 'File Load failure';
                        return null;
                    })
                    if (!geo) return;            
                    const path = `retainer/${ud.timestamp}_${ud.customId}/input/${auxiliary}/${noExtFilename}.mq`;
                    const mesh = await addColor2Mesh(geo);
                    const buffer = await mesh2drc(mesh);
                    res = await store.dispatch('auth/putFile', {
                        file: new Blob([buffer.buffer], { type: 'application/octet-stream',}),
                        path: path,
                    })
                } catch(err){
                    console.log(err);
                    msg.value = 'File Load failure';
                }
            }
            if (res && res.res.status == 200) {
                if (ud.type == 6) {
                    m1.upper = res.name;
                    ud.lockBtn |= 2;
                } else if (ud.type == 2) {
                    m1.lower = res.name;
                    ud.lockBtn |= 4;
                }
                // 0x1 | 0x2 | 0x4 can call Ai
                console.log('lock btn', ud.lockBtn)
            }
        }
        ud.uploading = false;
    }
}
</script>