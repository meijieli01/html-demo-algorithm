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
                    <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(2)" :disabled="getState()" v-html="info.btn1Label[tag]"></button>
                    <button class="btn btn-primary m-1 btn-sm" v-if="['AI_NightGuard','AI_Retainer'].includes(tag)" @click="clickLoadShowData(6)" :disabled="getState()">Upload the lower scanned meshes</button>
                </div>
            </div>
            <div class="d-flex flex-wrap" v-if="tag=='AI_NightGuard'">                
                <!-- <div class="alert alert-info m-1 p-0" role="alert">Move Down</div>
                <select class="form-select" v-model="m1a.move_distance">
                    <option v-for="(item,i) in info.moveDownList" :key="i" :value="item.value" v-html="item.label"></option>
                </select> -->
                <div class="alert alert-info m-1 p-0" role="alert">Model Choose</div>
                <select class="form-select" v-model="m1a.mode">
                    <option v-for="(item,i) in info.modelList" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
                <div class="alert alert-info m-1 p-0" role="alert">Openbite or Closebite</div>
                <select class="form-select" v-model="m1a.openbite">
                    <option v-for="(item,i) in info.biteList" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
                <div class="alert alert-info m-1 p-0" role="alert">Occlusion Thickness</div>
                <select class="form-select" v-model="m1a.occ_thickness">
                    <option v-for="(item,i) in info.thicknessList" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
                <div class="alert alert-info m-1 p-0" role="alert">Minimum Self-Thickness</div>
                <select class="form-select" v-model="m1a.self_thickness">
                    <option v-for="(item,i) in info.minimumSelfThickness" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
            </div>
            <div class="d-flex flex-wrap" v-if="tag=='AI_Retainer'">                
                <div class="alert alert-info m-1 p-0" role="alert">Model Choose</div>
                <select class="form-select" v-model="m1b.mode">
                    <option v-for="(item,i) in info.modelListRetainer" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
                <div class="alert alert-info m-1 p-0" role="alert">Occlusion Thickness</div>
                <select class="form-select" v-model="m1b.occ_thickness">
                    <option v-for="(item,i) in info.thicknessListRetainer" :key="i" :value="item.value" v-html="item.label"></option>
                </select>
            </div>
            <div class="d-flex flex-wrap" v-if="tag=='AI_Clean'">                
                <div class="alert alert-info m-1 p-0" role="alert">Efficient Mode</div>
                <select class="form-select" v-model="m1c.efficient_mode">
                    <option v-for="(item,i) in info.efficientModeList" :key="i" :value="item.value" v-html="item.label"></option>
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
                <div class="form-check form-switch mx-3">
                    <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                    <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                </div>
                <button class="btn btn-primary btn-sm" v-if="showDownload(null, item)" @click="showDownload($event, item, 'download')">Download</button>
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
import { upload, getHistory, callAi } from '../api/all';
import { getBaseRoot, vInfo } from '../../config';
import { ext, filterFile } from '../utils/util';
const props = defineProps({
    tag: {
        type:String,
        require: true,
    }
})
const refFile = ref(null);
const elViewer = ref(null);
const isDev = ref(import.meta.env.DEV);
const msg = ref('');
const info = reactive({
    btn1Label: {
        'AI_NightGuard': 'Upload the upper scanned meshes',
        'AI_BracketRemove': 'Upload the upper or lower scanned mesh',
        'AI_Retainer': 'Upload the upper scanned meshes',
        'AI_Clean': 'Upload the mesh',
    },
    moveDownList: [
        { id: 0, value: '0.0', label: '0.0mm' },
        { id: 1, value: '1.0', label: '1.0mm' },
        { id: 2, value: '1.5', label: '1.5mm' },
        { id: 3, value: '4.0', label: '4.0mm' },
    ],
    modelList: [
        { id: 0, value: '0', label: 'upper smooth' },
        { id: 1, value: '1', label: 'upper occlusion' },
        { id: 2, value: '2', label: 'lower smooth' },
        { id: 3, value: '3', label: 'lower occlusion' },
    ],
    biteList: [
        { id: 0, value: '0', label: 'Closebite' },
        { id: 1, value: '1', label: 'Openbite' },
    ],
    thicknessList: [
        { id: 1, value: '1.5', label: '1.5mm' },
        { id: 2, value: '2.0', label: '2.0mm' },
        { id: 3, value: '2.5', label: '2.5mm' },
    ],
    modelListRetainer: [
        { id: 0, value: '0', label: 'upper' },
        { id: 2, value: '2', label: 'lower' },
    ],
    thicknessListRetainer: [
        { id: 1, value: '0.5', label: '0.5mm' },
        { id: 2, value: '0.6', label: '0.6mm' },
        { id: 3, value: '0.7', label: '0.7mm' },
        { id: 3, value: '0.8', label: '0.8mm' },
    ],
    minimumSelfThickness: [
        { id: 1, value: '0.8', label: '0.8mm' },
        { id: 2, value: '0.9', label: '0.9mm' },
        { id: 3, value: '1.0', label: '1.0mm' },
    ],
    efficientModeList: [
        { id: 0, value: 'true', label: 'True' },
        { id: 1, value: 'false', label: 'False' },
    ],
});
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
    script: null,
});
const m1 = reactive({
    tempDir: '',
    tag: props.tag,
    param: '', // 
});
const m1a = reactive({
    move_distance: '0.0',
    mode: '0',
    openbite: '0',
    occ_thickness: '1.5',
    self_thickness: '0.8',
});
const m1b = reactive({
    mode: '0',
    occ_thickness: '0.6',
});
const m1c = reactive({
    efficient_mode: info['efficientModeList'][1].value,
});
let app3 = null;
const keyOfLocalStorage = `keyOfLocalStorage${props.tag}`;
onMounted(() => {
    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    app3 = elViewer.value.app3;
})
function parseTime(timestamp) {
    const date = new Date(parseInt(timestamp.tmpDir));
    let strTid = timestamp.tid ? `${ timestamp.tid}--` : '';
    if (props.tag == 'AI_NightGuard') {
        if (timestamp.param) {
            strTid = '';
            const t2 = timestamp.param;
            // strTid += `${t2.move_distance}--`;
            strTid += `${t2.mode}--`;
            strTid += `${t2.openbite}--`;
            strTid += `${t2.occ_thickness}--`;
        }
    }
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
    app3.empty();
    if ([1,2,6].includes(type)) {
        emptyTrackFile();
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        ud.calling = true;
        const tmp = {tid:'history',needAdd:false};
        if (props.tag == 'AI_NightGuard') {
            m1.param = JSON.stringify(m1a);
        } else if (props.tag == 'AI_Retainer') {
            m1.param = JSON.stringify(m1b);
        } else if (props.tag == 'AI_Clean') {
            m1.param = JSON.stringify(m1c);
        }
        callAi(m1).then(res=>{
            ud.calling = false;
            if (res.code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {                               
                    updateTimestampData(m1.tempDir, tmp);
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
            tid: null, // 出生时默认为空
            param: null,
        });
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        m1.type = 1;        
        m1.tempDir = `${ud.selTimestamp.tmpDir}`;
        ud.lockCall = false;
    } else if (type == 5) {
        ud.timestampList = [];
        getHistory(m1).then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = parseInt(strList[0].split('=').pop());
                    const t1 = { tid: 'history', needAdd: true, param: null };
                    if (['AI_NightGuard', 'AI_Retainer', 'AI_Clean'].includes(props.tag)) {
                        const t2 = strList.filter(e=>e.startsWith('param'))[0];
                        if (t2 && t2.length > 6) t1.param = JSON.parse(t2.split('=')[1]);
                    }
                    updateTimestampData(tmpDir, t1);
                })
            }
        })
    }
}
function updateTimestampData(tmpDir, options) {
    // 更新进去
    const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
    if (tmp) {
        tmp.tid = options.tid;
        tmp.param = options.param;
    } else {
        if (options.needAdd) {
            ud.timestampList.push({
                tmpDir: tmpDir,
                tid: options.tid,
                param: options.param,
            });
        }
    }
    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
}
function selectTimestamp() {
    const { tmpDir, tid, param } = ud.selTimestamp || {};
    ud.lockCall = false;
    m1.tempDir = tmpDir;
    // 只有新建的tid为空，其他都是历史记录
    if (tid) {
        // 历史记录
        m1.type = 2;
    } else {
        m1.type = 1;
        ud.timestamp = tmpDir;
    }
    if (props.tag == 'AI_NightGuard') {
        for (let k in m1a) {
            if (param[k]) m1a[k] = param[k];
        }
    }
    if (props.tag == 'AI_Retainer') {
        for (let k in m1b) {
            if (param[k]) m1b[k] = param[k];
        }
    }
    if (props.tag == 'AI_Clean') {
        for (let k in m1c) {
            if (param[k]) m1c[k] = param[k];
        }
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
            console.log('progress', e.loaded/e.total)
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
        const { tag } = props;
        const file = files[0];
        ud.uploading = true;
        ud.countError = 0;
        ud.count = 0.5;
        ud.total = files.length;
        const formData = new FormData();
        if (tag == 'AI_NightGuard') {
            const auxiliary = ud.type == 2 ? 'upper' : 'lower';    
            const filename = `${auxiliary}${ext(file.name)}`;
            formData.append("files", file, filename);
        } else {
            formData.append("files", file, file.name);
        }
        formData.append("tempDir", ud.timestamp); 
        formData.append("tag", tag); 
        const res = await upload(formData)
        if (res.code == 200) {
            ud.count = 1;
            ud.uploading = false;
        } else {
            ud.countError++;
            msg.value += `File ${file.name} upload failed`;
        }
    }
}
function showDownload(event, item, type) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    } 
    if (['AI_NightGuard', 'AI_Retainer'].includes(props.tag)) {        
        if (type == 'download') {
            return elViewer.value.donwloadByName(item.filename, {
                prefix:`NightGuard`
            });
        }
        return true;
    }
    return false;
}
</script>