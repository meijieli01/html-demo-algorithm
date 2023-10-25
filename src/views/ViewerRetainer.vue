<template>
    <ViewerBase ref="elViewer">
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
                <div class="d-flex">
                    <button class="btn btn-primary m-1" @click="clickLoadShowData(3)" :disabled="ud.lockUpload==1?false: ud.lockBtn !== 7" v-html="'Call the AI Algorithm'"></button>
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
            <div class="d-flex" v-for="(item,i) in ud.infoList" :key="i">
                <input type="color" class="form-control" :value="item.color" @change="inputChangeColorUpdate($event,item)" style="width:60px;" />
                <input type="range" class="form-range" min="0" max="1" step="0.01" :value="item.opacity" @change="inputChangeOpacityUpdate($event,item)" style="width:160px;" />
                <div class="form-check form-switch mx-3">
                    <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                    <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                </div>
            </div>
        </div>
        <!-- <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </ViewerBase>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import ViewerBase from './ViewerBase.vue';
import SubChangeLog from './sub/SubChangeLog.vue';
import SubVersion from './sub/SubVersion.vue';
import SubProgress from './sub/SubProgress.vue';
import { getMeshMaterialByName } from '../third/threejs/mjColor';
import { readFromStorage, writeToStorage } from '../third/snippet/storage';
import { addColor2Mesh, PathLoader, updateMeshColor, updateMeshOpacity, FilePathLoader, emptyTrackFile } from '../third/threejs/mjLoader';
import { mesh2drc, bindDracoEncoder } from '../third/threejs/mjExporter';
import { arrayVectorToMatrix } from '../third/threejs/mjUtil';
import { upload, getHistory, callAiRetainer, callAiRetainerNew } from '../api/all';
import { getOssAuth } from '../api/admin';
import { getBaseRoot, vInfo, configRetainer } from '../../config';
import { filterFile, toYYMMDDHHmmss } from '../utils/util';
const props = defineProps({
    tag: {
        type:String,
        default: 'pmp_retainer',
    }
});
const store = useStore();
const elViewer = ref(null);
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
});
let app3 = null;
const keyOfLocalStorage = `keyOfLocalStorage${props.tag}`;
onMounted(() => {
    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    // 
    bindDracoEncoder(`https://mydentalx.com/public/draco/draco_encoder.js`);
    store.dispatch('auth/getAuth').then(()=>{});
    app3 = elViewer.value.app3;
})
function parseTime(timestamp) {
    console.log('22', timestamp)
    const ymdhms = toYYMMDDHHmmss(timestamp.tmpDir);
    return `${timestamp.isShell} --- ${ymdhms} --- ${timestamp.tid}`;
}
function getState() {
    const {tmpDir, tid} = ud.selTimestamp || {};
    if (ud.lockUpload==1) return true;
    if (ud.lockBtn==0) return true;
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
    app3.empty();
    if ([1,2,6].includes(type)) {
        emptyTrackFile();
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        if (!m1.upper || !m1.lower) {
            msg.value = 'Please wait patiently for the upload to complete';
            return;
        }
        ud.calling = true;
        // callAiRetainer(m1).then(res=>{
        callAiRetainerNew(m1).then(res=>{
            ud.calling = false;
            const {code, message, data} = res;
            if (code == 200) {
                ud.lockUpload = 0;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, 'history', m1.isShell, false);
                }
                ud.pathList = data.files.filter(e=>filterFile(e));
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
    } else if (type == 5) {
        ud.timestampList = [];
        getHistory(m1).then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = strList[0].split('=').pop();
                    const t1 = tmpDir.split('_');
                    let isShell = configRetainer.isShell;
                    if (strList.length > 1) {
                        isShell = strList[1].split('=').pop() == 'true';
                    }
                    updateTimestampData(parseInt(t1[0]), t1[1] || 'history', isShell, true);
                })
            }
        })
    }
}
function updateTimestampData(tmpDir, tid, isShell, isNew) {
    // 更新进去
    const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
    if (tmp) {
        tmp.tid = tid;
        tmp.isShell = isShell;
    } else {
        if (isNew) {
            ud.timestampList.push({
                tmpDir: tmpDir,
                tid: tid,
                isShell: isShell,
            });
        }
    }
    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
}
function selectTimestamp() {
    const { tmpDir, tid, isShell } = ud.selTimestamp || {};
    ud.customId = '';
    ud.lockBtn = 0;
    m1.isShell = isShell;
    if (tid == 'history') m1.tempDir = `${tmpDir}`; // 旧数据，未添加自定义
    else m1.tempDir = `${tmpDir}_${tid}`; // 有自定义ID的
    if (tid) {
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
    msg1.value = `${toYYMMDDHHmmss(tmpDir)}_${tid}`;
}
function updateByPath() {
    app3.loading(true);
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length || 0;
    ud.fetchCount = 0;
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
        app3.updateFrame();
        app3.loading(false);
        return;
    }
    const fetchSinglePath = async (path) => {
        // const filename = PathLoader.getName(path);        
        // const url = await store.dispatch('auth/getUrl', path);
        const filename = PathLoader.getName(path);
        const validPath = `${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`;
        const geo = await new PathLoader(path, `https://mydentalx.com/public/draco/`).load(validPath, (e)=>{
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
            app3.loading(false);
            return null;
        })
        ud.fetchCount++;
        if (!geo) return;
        app3.loading(false);
        addGeotoScene(geo, filename, path);
    }
    ud.pathList.forEach(path=>{
        fetchSinglePath(path);
    });
    app3.updateFrame();
    app3.loading(false);
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
            if (str.indexOf('/input/cleaned_lower.mq') > 0 && mat.lower) {
                mesh.applyMatrix4(mat.lower);
            } else if (str.indexOf('/input/cleaned_upper.mq') > 0 && mat.upper) {
                mesh.applyMatrix4(mat.upper);
            }
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
function inputChangeUpdate(item) {
    item.check = !item.check;
    const mesh = app3.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        mesh.visible = item.check;
        app3.updateFrame();
    }
}
function inputChangeColorUpdate(event, item) {
    item.color = event.target.value;
    const mesh = app3.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshColor(mesh, item.color);
        app3.updateFrame();
    }
}
function inputChangeOpacityUpdate(event, item) {
    item.opacity = parseFloat(event.target.value);
    const mesh = app3.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshOpacity(mesh, item.opacity);
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
        app3.loading(true);
        ud.fetchTotal = files.length;
        ud.fetchCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const geo = await new FilePathLoader(file.name, `https://mydentalx.com/public/draco/`).load(file, (event)=>{
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
                app3.loading(false);
                return null;
            });
            ud.fetchCount++;
            if (!geo) return;
            const filename = FilePathLoader.getName(file.name);
            app3.loading(false);
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
        let filename = file.name;
        const { tag } = props;
        if (true) {
            const formData = new FormData();
            if (filename.endsWith('.drc') || filename.endsWith('.mq')) {
                filename =  ud.type == 6 ? 'cleaned_upper.mq' : 'cleaned_lower.mq';
                formData.append("files", file, filename);
            } else {
                //  其他格式转换一下
                try {
                    const geo = await new FilePathLoader(filename, `https://mydentalx.com/public/draco/`).load(file)
                    .catch(err=>{
                        msg.value = 'File Load failure';
                        console.error(err);
                        return null;
                    })
                    if (!geo) return;            
                    const mesh = await addColor2Mesh(geo);
                    const buffer = await mesh2drc(mesh);
                    const noExtFilename = filename.substr(0, filename.lastIndexOf('.'));
                    // filename =  `${noExtFilename}.mq`;
                    filename =  ud.type == 6 ? 'cleaned_upper.mq' : 'cleaned_lower.mq';
                    formData.append("files", new Blob([buffer.buffer], { type: 'application/octet-stream',}), filename);
                } catch(err){
                    console.log(err);
                    msg.value = 'File Load failure';
                }
            }
            formData.append("tempDir", `${ud.timestamp}_${ud.customId}`); 
            formData.append("tag", tag); 
            const res = await upload(formData)
            if (res.code == 200) {
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
                    const geo = await new FilePathLoader(filename, `https://mydentalx.com/public/draco/`).load(file)
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