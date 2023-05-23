<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view">
          
        </div>
        <div class="content-toolbar d-flex flex-column">
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
                    <div class="d-flex flex-wrap">
                        <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Attention: It takes a while to upload the data, and please call the AI Algorithm after the progress bar is 100%.'"></div>
                        <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Please select the folder that stored the CBCT data and the scanned mesh(es) to upload. Note for the scanned mesh(es), only .stl and .ply are supported for now, and for  CBCT data, only .dcm are supported.'"></div>
                        <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(2)" :disabled="getState()" v-html="'Upload the CBCT data and the scanned mesh(es)'"></button>
                    </div>
                </div>
                <div class="d-flex flex-wrap">                
                    <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Enter the tooth id that needs implant for the AI Algorithm'"></div>
                    <SubSelection class="w-100" id="missId" :value="ud.tidList" :list="selList" :disable="getState()" @update="e=>m1.missTids=`[${e.join(',')}]`" />
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
                    <input type="range" class="form-control" min="0" max="1" step="0.01" :value="item.opacity" @change="inputChangeOpacityUpdate($event,item)" style="width:160px;" />
                    <div class="form-check form-switch mx-3">
                        <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                        <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                    </div>
                </div>
            </div>
        </div>
        <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import SubChangeLog from './SubChangeLog.vue';
import SubVersion from './SubVersion.vue';
import SubSelection from './SubSelection.vue';
import SubProgress from './SubProgress.vue';
import { mqThree } from '../third/threejs/mjthree';
import { getCtMeshMaterialByName } from '../third/threejs/mjColor';
import { readFromStorage, writeToStorage } from '../third/snippet/tool/storage';
import { FilePathLoader, addColor2Mesh, PathLoader, updateMeshColor, updateMeshOpacity, emptyTrackFile } from '../third/threejs/mjLoader';
import { upload, callAi, getHistory } from '../api/ct';
import { getBaseRoot, vInfo } from '../../config';
import { calcPer, filterFile } from '../utils/util';
const props = defineProps({
    tag: {
        type:String,
        default: 'IMPLANT',
    }
});
const refFile = ref(null);
const isDev = ref(import.meta.env.DEV);
const msg = ref('');
const selList = ref([]);
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
    timestamp: '1683618615792',
    tidList: [
        18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
        48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
    ].map(e=>({id:e,name:e})),
    fetchTotal: 0,
    fetchCount: 0,
    fetching: false,
    calling: false,
    lockCall: true,
    selTimestamp: {},
    script: null,
});
const m1 = reactive({
    missTids: '',
    tempDir: '',
});
const appThree = new mqThree();
const keyOfLocalStorage = 'keyOfLocalStorage';
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
})
onBeforeUnmount(() => {
    document.body.removeChild(ud.script);
    appThree.empty();
    appThree.dispose();
})
function parseTime(timestamp) {
    const date = new Date(parseInt(timestamp.tmpDir));
    const strTid = timestamp.tid ? `${timestamp.tid} ---  ` : '';
    return `${strTid}${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
    if ([1,2].includes(type)) {
        emptyTrackFile();
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        const { tmpDir, tid } = ud.selTimestamp || {};
        // 兼容历史数据
        if (typeof tid == 'string') {
            if (!m1 || m1.missTids.length < 1) {
                msg.value = 'Must select some missing teeth id';
                return;
            }
        } else {
            if (!m1.missId) {
                msg.value = 'Must select a missing teeth id';
                return;
            }
        }
        ud.calling = true;
        callAi(m1).then(res=>{
            ud.calling = false;
            if (res.code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, m1.missTids, false);
                }
                ud.pathList = res.data.filter(e=>filterFile(e));
                updateByPath();
            } else {
                msg.value = res.message;
            }
        })
    } else if (type == 4) {
        ud.timestampList.unshift({
            tmpDir: Date.now(),
            // tmpDir: 1683618615792,
            tid: '',
        });
        // 添加时自动第一个
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        ud.lockCall = false;
        m1.type = 1;
        m1.tempDir = ud.timestamp;
    } else if (type == 5) {
        // 删除
        ud.timestampList = [];
        getHistory().then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = parseInt(strList[0].split('=').pop());
                    const idInfo = strList[1].split('=').pop();
                    updateTimestampData(tmpDir, idInfo.startsWith('[') ? idInfo : parseInt(idInfo), true);
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
    ud.lockCall = false;
    m1.tempDir = tmpDir;
    if (tid) {
        // 历史记录
        if (typeof tid == 'string' && tid.startsWith('[')) {
            m1.missTids = tid;
            m1.missId = null;
        } else {
            // 兼容之前的单颗数据
            m1.missId = tid;
            m1.missTids = null;
        }
        m1.type = 2;
    } else {
        m1.missTids = [];
        m1.type = 1;
        ud.timestamp = tmpDir;
    }
}
function updateByPath() {
    appThree.loading(true);
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length;
    ud.fetchCount = 0;
    const fetchSinglePath = async (path) => {
        const filename = PathLoader.getName(path);
        const validPath = `${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`;
        const geo = await new PathLoader(path, drcPathPrefix).load(validPath, (e)=>{
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
        addGeotoScene(geo, filename);
    }
    ud.pathList.forEach(path=>{
        fetchSinglePath(path);
    })
    appThree.updateFrame();
}
function addGeotoScene(geo, filename) {
    if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
        console.warn('empty BufferGeometry');
        return;
    }
    const info = getCtMeshMaterialByName(filename);
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
    if (ud.fetching) return calcPer(ud.fetchCount, ud.fetchTotal);
    return calcPer(ud.count, ud.total);
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
            })
            if (!geo) return;
            const filename = FilePathLoader.getName(file.name);
            ud.fetchCount++;
            appThree.loading(false);
            addGeotoScene(geo, filename);
        }
        emptyTrackFile();
    } else if (ud.type == 2) {
        // 上传文件
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = 'Please Select Timestamp to Continue';
            return;
        }
        ud.uploading = true;
        ud.countError = 0;
        ud.count = 1;
        ud.total = files.length;
        ud.cacheList[ud.timestamp] = {};
        const uploadSingleFile = async (file) => {
            const formData = new FormData();
            const tmp = ud.cacheList[ud.timestamp][file.name];
            if (tmp && tmp.size > 0 && tmp.loading == false) {
                msg.value += `Repeat upload ${file.name}`;
                // 已经上传了的文件，退出
                return;
            } else {
            }
            ud.cacheList[ud.timestamp][file.name] = {
                name: file.name,
                size: file.size,
                loading: true,
            };
            formData.append("files", file, file.name);
            formData.append("tempDir", ud.timestamp); 
            const res = await upload(formData)
            if (res.code == 200) {
                ud.cacheList[ud.timestamp][res.data[0]].loading = false;
                if (ud.count + ud.countError == ud.total) {                    
                    ud.uploading = false;
                    if (ud.countError > 0) {
                        msg.value = 'The above file failed to upload';
                        ud.errorList = [];
                        for (let k in ud.cacheList[ud.timestamp]) {
                            if (k && k.loading) ud.errorList.push(k);
                        }
                    }
                } else {
                    ud.count++;
                }
            } else {
                ud.countError++;
                msg.value += `File ${file.name} upload failed`;
            }
        }
        for (let i = 0; i < files.length; i++) {
            uploadSingleFile(files[i]);
        }
    }
}
</script>