<template>
    <ViewerBase ref="elViewer">
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
                    <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(2)" :disabled="getState()">Upload the upper scanned meshes</button>
                    <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(6)" :disabled="getState()">Upload the lower scanned meshes</button>
                </div>
            </div>
            <div class="d-flex flex-wrap">                
                <div class="alert alert-warning m-1 p-0" role="alert" v-html="'Enter the prep tooth id'"></div>
                <select class="form-select" v-model="m1.missId" @change="selectMissingTid" :disabled="getState()">
                    <option v-for="(tid,i) in ud.tidList" :key="i" :value="tid" v-html="tid"></option>
                </select>
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
        <div class="">
            <div class="d-flex my-1" v-for="(item,i) in ud.infoList" :key="i">
                <input type="color" class="form-control" :value="item.color" @change="inputChangeColorUpdate($event,item)" style="width:60px;" />
                <input type="range" class="form-range" min="0" max="1" step="0.01" :value="item.opacity" @change="inputChangeOpacityUpdate($event,item)" style="width:160px;" />
                <div class="form-check form-switch mx-1">
                    <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                    <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                </div>
                <button class="btn btn-primary btn-sm" @click="showDownload($event, item, 'download')">Download</button>
            </div>
        </div>
        <SubChangeLog :tag="tag" />
        <!-- <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </ViewerBase>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import ViewerBase from './ViewerBase.vue';
import SubChangeLog from './sub/SubChangeLog.vue';
import SubVersion from './sub/SubVersion.vue';
import SubProgress from './sub/SubProgress.vue';
import { getMeshMaterialOption } from '../third/threejs/mjColor';
import { readFromStorage, writeToStorage } from '../third/snippet/storage';
import { addColor2Mesh, PathLoader, updateMeshColor, updateMeshOpacity, FilePathLoader, emptyTrackFile } from '../third/threejs/mjLoader';
import { upload, getHistoryCrown, callAiCrown } from '../api/crown';
import { getBaseRoot, vInfo } from '../../config';
import { ext, filterFile } from '../utils/util';
const props = defineProps({
    tag: {
        type:String,
        default: 'CROWN',
        // require: true,
    }
});
const elViewer = ref(null);
const refFile = ref(null);
const isDev = ref(import.meta.env.DEV);
const msg = ref('');
const ud = reactive({
    type: 0,
    total: 0,
    count: 0,
    countError: 0,
    uploading:false,
    errorList: [],
    pathList: [],
    timestampList: [],
    timestamp: '1680514251226',
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
});
const m1 = reactive({
    missId: '',
    tempDir: '',
});
let app3 = null;
const keyOfLocalStorage = 'keyOfLocalStorage4Crown';
onMounted(() => {
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    app3 = elViewer.value.app3;
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
function clickLoadShowData(type, item) {
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
        if (!m1.missId) {
            msg.value = 'Must select a teeth id to continue';
            return;
        }
        ud.calling = true;
        callAiCrown(m1).then(res=>{
            ud.calling = false;
            if (res.code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, m1.missId, false);
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
            tid: '',
        });
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        m1.type = 1;        
        m1.tempDir = `${ud.selTimestamp.tmpDir}`;
        ud.lockCall = false;
    } else if (type == 5) {
        // 删除
        ud.timestampList = [];
        getHistoryCrown().then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = parseInt(strList[0].split('=').pop());
                    const tid = parseInt(strList[1].split('=').pop());
                    updateTimestampData(tmpDir, tid, true);
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
        m1.missId = tid;
        m1.type = 2;
    } else {
        m1.missId = '';
        m1.type = 1;
        ud.timestamp = tmpDir;
    }
}
function updateByPath() {
    app3.loading(true);
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length;
    ud.fetchCount = 0;
    const fetchSinglePath = async (path) => {
        const filename = PathLoader.getName(path);
        const validPath = `${import.meta.env.VITE_APP_FILE_PREFIX}/${path}`;
        const geo = await new PathLoader(path, `${import.meta.env.VITE_APP_PREFIX_PUBLIC}/draco/`).load(validPath, (e)=>{
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
        addGeotoScene(geo, filename);
    }
    ud.pathList.forEach(path=>{
        fetchSinglePath(path);
    })
    app3.updateFrame();
}
function addGeotoScene(geo, filename) {
    if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
        console.warn('empty BufferGeometry');
        return;
    }
    const info = getMeshMaterialOption(filename, {tag:props.tag});
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
    return Math.round(100 * ud.count / ud.total).toFixed(0); 
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
            const geo = await new FilePathLoader(file.name, `${import.meta.env.VITE_APP_PREFIX_PUBLIC}/draco/`).load(file, (event)=>{
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
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = 'Please Select Timestamp to Continue';
            return;
        }
        const auxiliary = ud.type == 2 ? 'upper' : 'lower';
        ud.uploading = true;
        ud.count = 0.5;
        ud.total = 1;
        const file = files[0];
        const filename = `${auxiliary}${ext(file.name)}`;
        const formData = new FormData();
        formData.append("files", file, filename);
        formData.append("tempDir", ud.timestamp); 
        const res = await upload(formData)
        if (res.code == 200) {
            ud.count = 1;
            ud.uploading = false;
        } else {
            msg.value += `File ${file.name} upload failed`;
        }
    }
}
function showDownload(event, item, type) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }    
    if (type == 'download') {
        return elViewer.value.donwloadByName(item.filename, {prefix:'Crown'});
    }
    // 是否显示
    return item.filename.startsWith('crown');
}
</script>