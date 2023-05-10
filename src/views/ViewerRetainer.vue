<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view">
          
        </div>
        <div class="content-toolbar d-flex flex-column">
            <div>
                <div class="alert alert-info m-1 p-0 my-auto" role="alert" v-html="'Custom ID'"></div>
                <input class="form-control" v-model="ud.customId" type="text" />
            </div>  
            <div class="d-flex flex-wrap">
                <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(1)" v-if="isDev" v-html="'Local Test to Show'"></button>
                <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(4)" v-html="'New Timestamp'"></button>
                <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(5)" v-html="'Load historical Data'"></button>
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
                        <div class="alert alert-info m-1 p-0 my-auto" role="alert">Current is {{msg1}}</div>
                        <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(6)" :disabled="getState()" >Upload the upper scanned meshes</button>
                        <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(2)" :disabled="getState()" >Upload the lower scanned meshes</button>
                    </div>
                </div>
                <div class="d-flex flex-wrap">                
                    <button class="btn btn-primary m-1" @click="clickLoadShowData(3)" :disabled="ud.lockCall" v-html="'Call the AI Algorithm'"></button>
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
            </div>
            <div class="d-flex flex-column overflow-auto">
                <div class="alert alert-danger p-1 m-1" role="alert" v-if="msg.length > 0" v-html="msg"></div>
                <div v-for="(item,i) in ud.errorList" :key="i">
                    <div class="alert alert-danger p-1 m-1" role="alert" v-html="item.name"></div>
                </div>
            </div>
            <SubChangeLog :tag="tag" />
            <div class="overflow-auto">
                <div class="d-flex" v-for="(item,i) in ud.infoList" :key="i">
                    <input type="color" class="form-control" :value="item.color" @change="inputChangeColorUpdate($event,item)" style="width:60px;" />
                    <input type="range" class="form-control" min="0" max="1" step="0.01" :value="item.opacity" @change="inputChangeOpacityUpdate($event,item)" style="width:160px;" />
                    <div class="form-check form-switch mx-3">
                        <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                        <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                    </div>
                </div>
            </div>
        </div>
        <!-- <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import SubChangeLog from './SubChangeLog.vue';
import SubVersion from './SubVersion.vue';
import { mqThree } from '../third/threejs/mjthree';
import { getMeshMaterialByName } from '../third/threejs/mjColor';
import { readFromStorage, writeToStorage } from '../third/snippet/tool/storage';
import { addColor2Mesh, PathLoader, updateMeshColor, updateMeshOpacity, FilePathLoader, emptyTrackFile } from '../third/threejs/mjLoader';
import { export2drc } from '../third/threejs/threeExporter';
import { arrayVectorToMatrix } from '../third/threejs/mjUtil';
import { upload, getHistory, callAiRetainer } from '../api/all';
import { getOssAuth } from '../api/admin';
import { getBaseRoot, vInfo } from '../../config';
const props = defineProps({
    tag: {
        type:String,
        default: 'pmp_retainer',
    }
});
const store = useStore();
const refFile = ref(null);
const isDev = ref(import.meta.env.DEV);
const msg = ref('');
const msg1 = ref('');
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
    lockCall: true,
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
});
const appThree = new mqThree();
const keyOfLocalStorage = `keyOfLocalStorage${props.tag}`;
const drcPathPrefix = `${getBaseRoot()}js/libs/draco/`;
onMounted(() => {
    ud.script = document.createElement('script');
    ud.script.type = 'text/javascript';
    ud.script.src = `${drcPathPrefix}draco_encoder.js`;
    document.body.appendChild(ud.script);
    
    let el = document.getElementById('id3DContainer')
    let rect = el.getBoundingClientRect()
    if (import.meta.env.DEV) {        
        window.mjthree = appThree;
    }
    appThree.init({
        width: rect.width,
        height: rect.height,
        container: el,
        useControl: true,
    })
    appThree.setLoadConfig({
        msg: 'Loading',
        url: '/web/images/loading.svg',
    })
    appThree.eventLoop();
    appThree.resize();
    appThree.updateFrame();

    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    // 
    store.dispatch('auth/getAuth').then(()=>{});
})
onBeforeUnmount(() => {
    document.body.removeChild(ud.script);
    appThree.empty();
    appThree.dispose();
})
function toYYMMDDHHMMSS(timestamp) {
    const date = new Date(parseInt(timestamp));
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
function parseTime(timestamp) {
    const ymdhms = toYYMMDDHHMMSS(timestamp.tmpDir);    
    const strTid = timestamp.tid ? `${ timestamp.tid} ---  ` : '';
    return `${strTid}${ymdhms}`;
}
function getState() {
    const {tmpDir, tid} = ud.selTimestamp || {};
    if (!tmpDir && !tid) {
        // 未选中时，禁用
        return true;
    }
    if (tmpDir > 0 && tid > 0) {
        // 历史记录，禁用
        return true;
    }
    return false;
}
function clickLoadShowData(type) {
    ud.fetching = false;
    msg.value = '';
    ud.infoList = [];
    msg.errorList = [];
    msg.countError = 0;
    ud.type = type;
    appThree.empty();
    if ([1,2,6].includes(type)) {
        emptyTrackFile();
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        if (!m1.upper || !m1.lower) {
            msg.value = 'Please wait patiently for the upload to complete';
            return;
        }
        ud.calling = true;
        callAiRetainer(m1).then(res=>{
            ud.calling = false;
            const {code, message, data} = res;
            if (code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, 'history', false);
                }
                ud.pathList = data.files.filter(e=>!e.endsWith('.json'));
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
            tid: '',
        });
        // 添加时自动第一个
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        ud.lockCall = false;
        m1.type = 1;        
        m1.tempDir = `${ud.selTimestamp.tmpDir}_${ud.customId}`;      
        msg1.value = `${toYYMMDDHHMMSS(ud.selTimestamp.tmpDir)}_${ud.customId}`;
    } else if (type == 5) {
        ud.timestampList = [];
        getHistory(m1).then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = strList[0].split('=').pop();
                    const t1 = tmpDir.split('_');
                    updateTimestampData(parseInt(t1[0]), t1[1] || 'history', true);
                })
            }
        })
    }
}
function updateTimestampData(tmpDir, tid, isNew) {
    // 更新进去
    const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
    if (tmp) {
        tmp.tid = tid;
    } else {
        if (isNew) {
            ud.timestampList.push({
                tmpDir: tmpDir,
                tid: tid,
            });
        }
    }
    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
}
function selectTimestamp() {
    const { tmpDir, tid } = ud.selTimestamp || {};
    ud.customId = '';
    ud.lockCall = false;
    if (tid == 'history') m1.tempDir = `${tmpDir}`; // 旧数据，未添加自定义
    else m1.tempDir = `${tmpDir}_${tid}`; // 有自定义ID的
    if (tid) {
        // 历史记录
        m1.type = 2;
        m1.upper = 'no upper path';
        m1.lower = 'no lower path';
    } else {
        m1.type = 1;
        m1.upper = null;
        m1.lower = null;
        ud.timestamp = tmpDir;
    }
    msg1.value = `${toYYMMDDHHMMSS(tmpDir)}_${tid}`;
}
function updateByPath() {
    appThree.loading(true);
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length || 0;
    ud.fetchCount = 0;
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
        appThree.updateFrame();
        appThree.loading(false);
        return;
    }
    const fetchSinglePath = async (path) => {
        const filename = PathLoader.getName(path);        
        const url = await store.dispatch('auth/getUrl', path);
        const geo = await new PathLoader(path, drcPathPrefix).load(url, (e)=>{
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
            appThree.loading(false);
            return null;
        })
        ud.fetchCount++;
        if (!geo) return;
        appThree.loading(false);
        addGeotoScene(geo, filename, path);
    }
    ud.pathList.forEach(path=>{
        fetchSinglePath(path);
    });
    appThree.updateFrame();
    appThree.loading(false);
}
function addGeotoScene(geo, filename, path) {
    if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
        console.warn('empty BufferGeometry');
        return;
    }
    const info = getMeshMaterialByName(filename, props.tag);
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
    const tmp = ud.infoList.sort(compare('filename'));
    addColor2Mesh(geo, {name:filename, color:info.color, opacity: info.opacity}).then(mesh=>{
        if (path && path.indexOf('/input/') > 0) {
            const str = path.toLowerCase();
            if (str.indexOf('/input/lower/') > 0 && mat.lower) {
                mesh.applyMatrix4(mat.lower);
            } else if (str.indexOf('/input/upper/') > 0 && mat.upper) {
                mesh.applyMatrix4(mat.upper);
            }
            mesh.matrixWorldNeedsUpdate = true;
        }
        appThree.add(mesh);
        appThree.updateFrame();
    })
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
    } else {
        appThree.updateFrame();
    }
}
function inputChangeUpdate(item) {
    item.check = !item.check;
    const mesh = appThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        mesh.visible = item.check;
        appThree.updateFrame();
    }
}
function inputChangeColorUpdate(event, item) {
    item.color = event.target.value;
    const mesh = appThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshColor(mesh, item.color);
        appThree.updateFrame();
    }
}
function inputChangeOpacityUpdate(event, item) {
    item.opacity = parseFloat(event.target.value);
    const mesh = appThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshOpacity(mesh, item.opacity);
        appThree.updateFrame();
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
        appThree.loading(true);
        ud.fetchTotal = files.length;
        ud.fetchCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const geo = await new FilePathLoader(file.name, drcPathPrefix).load(file, (event)=>{
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
                appThree.loading(false);
                return null;
            });
            ud.fetchCount++;
            if (!geo) return;
            const filename = FilePathLoader.getName(file.name);
            appThree.loading(false);
            addGeotoScene(geo, filename);
        }
        emptyTrackFile();
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
        const filename = file.name;
        if (filename.endsWith('.drc') || filename.endsWith('.mq')) {
            const path = `retainer/${ud.timestamp}_${ud.customId}/input/${auxiliary}/${filename}`;
            const res = await store.dispatch('auth/putFile', {
                file, path,
            });
            if (res.res.status == 200) {
                if (ud.type == 6) m1.upper = res.name;
                else if (ud.type == 2) m1.lower = res.name;
            }
        } else {
            //  其他格式转换一下
            try {
                const noExtFilename = filename.substr(0, filename.lastIndexOf('.'));
                const geo = await new FilePathLoader(filename, drcPathPrefix).load(file)
                .catch(err=>{
                    msg.value = 'File Load failure';
                    return null;
                })
                if (!geo) return;            
                const path = `retainer/${ud.timestamp}_${ud.customId}/input/${auxiliary}/${noExtFilename}.mq`;
                const mesh = await addColor2Mesh(geo);
                const buffer = await export2drc(mesh);
                const res = await store.dispatch('auth/putFile', {
                    file: new Blob([buffer.buffer], { type: 'application/octet-stream',}),
                    path: path,
                })
                if (res.res.status == 200) {
                    if (ud.type == 6) m1.upper = res.name;
                    else if (ud.type == 2) m1.lower = res.name;
                }
            } catch(err){
                msg.value = 'File Load failure';
            }
        }
        ud.uploading = false;
    }
}
</script>