<template>
    <ViewerBase ref="elViewer" entry="implantCrown">
        <div class="d-flex flex-wrap">
            <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(4)" v-html="'New Timestamp'"></button>
            <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(5)" v-html="'Load historical Data'"></button>
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
                <div class="d-flex justify-content-center my-2">
                    <button class="btn btn-primary w-75 btn-sm" @click="clickLoadShowData(2)" :disabled="getState()">Upload the scan mesh with scanbody<span class="text-danger">*</span></button>
                </div>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(6)" v-html="'Upload the original upper scan mesh'"></button>
                    <button class="btn btn-primary m-1 btn-sm" @click="clickLoadShowData(7)" v-html="'Upload the original lower scan mesh'"></button>
                </div>
            </div>
            <div class="d-flex flex-wrap">                
                <div>tooth id <span class="text-danger">*</span></div>
                <select v-model="m3.tooth_id" class="form-select" :disabled="ud.state=='history'">
                    <option v-for="(item,i) in ud.tidList" :key="i" :value="item.id" v-html="item.label"></option>
                </select>
            </div>            
            <div class="d-flex flex-wrap">                
                <div>scanbody id <span class="text-danger">*</span></div>
                <select v-model="m3.scanbody_id" class="form-select" :disabled="ud.state=='history'">
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>
            </div>            
            <div class="d-flex flex-column justify-content-start">
                <label class="form-label my-auto mx-1">
                    <span>Direction point</span>
                    <div class="alert alert-warning m-1 p-0 my-auto" role="alert" v-html="'left click pick and right click clear, and it cost much times'"></div>
                </label>
                <div class="d-flex flex-column">
                    <label class="d-flex mx-3">X
                        <input class="form-control form-control-sm ms-2 w-50" :disabled="ud.state=='history'" v-model="m2.x" @change="positionInputChange($event, 2)"></label>
                    <label class="d-flex mx-3">Y
                        <input class="form-control form-control-sm ms-2 w-50" :disabled="ud.state=='history'" v-model="m2.y" @change="positionInputChange($event, 2)"></label>
                    <label class="d-flex mx-3">Z
                        <input class="form-control form-control-sm ms-2 w-50" :disabled="ud.state=='history'" v-model="m2.z" @change="positionInputChange($event, 2)"></label>                            
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
            <SubProgress :show="ud.uploading" v-if="ud.total == 1 || ud.fetchTotal == 1" />
        </div>
        <div class="d-flex flex-column">
            <div class="alert alert-danger p-1 m-1" role="alert" v-if="msg.length > 0" v-html="msg"></div>
            <div v-for="(item,i) in ud.errorList" :key="i">
                <div class="alert alert-danger p-1 m-1" role="alert" v-html="item.name"></div>
            </div>
        </div>
        <div class="">
            <div class="d-flex" v-for="(item,i) in ud.infoList" :key="i">
                <input type="color" class="form-control" :value="item.color" @change="elViewer.colorUpdate($event,item)" style="width:60px;" />
                <input type="range" class="form-range" min="0" max="1" step="0.01" :value="item.opacity" @change="elViewer.opacityUpdate($event,item)" style="width:160px;" />
                <div class="form-check form-switch mx-3">
                    <input class="form-check-input" type="checkbox" :checked="item.check" @change="inputChangeUpdate(item)" />
                    <label class="form-check-label" for="flexSwitchCheckDefault" v-html="item.filename"></label>
                </div>
            </div>
        </div>
        <SubChangeLog :tag="tag" />
        <!-- <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </ViewerBase>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import ViewerBase from './ViewerBase.vue';
import SubChangeLog from './sub/SubChangeLog.vue';
import SubVersion from './sub/SubVersion.vue';
import SubProgress from './sub/SubProgress.vue';
import { getMeshMaterialOption, addColor2Mesh } from '../third/auxThree';
import { readFromStorage, writeToStorage } from '../third/snippet/storage';
import { FilePathLoader, PathLoader, alias3, listenDomEvent, PEType } from '../third/mq-render/viewer.es';
import { MqRaycast, createMarkSphere } from '../third/mq-webui/mq.webui.es';
import { upload, callAi, getHistory } from '../api/all';
import { calcPer, filterFile } from '../utils/util';
const props = defineProps({
    tag: {
        type:String,
        default: 'IMPLANTCROWN',
    }
});
const elViewer = ref(null);
const refFile = ref(null);
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
    timestamp: '1683618615792',
    tidList: [
        18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
        48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
    ].map(e=>({id:e,label:e})).filter(e=>[4,5,6,7].includes(e.id%10)).map(e=>{e.id=`${e.id}`; return e;}),
    fetchTotal: 0,
    fetchCount: 0,
    fetching: false,
    calling: false,
    lockCall: true,
    selTimestamp: {},
    script: null,
    state: '',
    // pick begin
    canPick: false,
    isDown: false,
    toPickTargets: [],
    // pick end
}); 
const m1 = reactive({
    tempDir: '',
});
const m2 = reactive({
    x: '',
    y: '',
    z: '',
});
const m3 = reactive({
    tooth_id: '',
    scanbody_id: '',
    direction_point: [],
});
const info1 = {
    2: {
        name: 'scan.stl',
    },
    6: {
        name: 'upper.stl',
    },
    7: {
        name: 'lower.stl',
    }
};
let app3 = null;
let gScene = null;
let mqraycast;
let gClearEvent;
let gMark;
const keyOfLocalStorage = 'keyOfImplantCrown';
const nameOfPick = 'pointPick4Name';
onMounted(() => {
    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
    app3 = elViewer.value.app3;
    gScene = elViewer.value.gScene;
    if (import.meta.env.DEV) {
        window.app = {
            app3,
        }
    }
    clickLoadShowData(5);
    mqraycast = new MqRaycast(alias3, app3);
    const { clearEvent } = listenDomEvent(app3.renderer.domElement, (type, info)=>{
        if (!ud.canPick) return;
        // console.log(info)
        if (type == PEType.down) {
            // 左键才能选择
            if (info.button==0 && !gMark) {
                const rc = app3.rc;   
                const ndcCoord = new alias3.Vector2();
                ndcCoord.x = (info.x / rc.width / rc.dpr) * 2 - 1;
                ndcCoord.y = -(info.y / rc.height / rc.dpr) * 2 + 1;
                
                ud.isDown = true;
                const target = mqraycast.pickMesh(ndcCoord, ud.toPickTargets, app3.camera.getCamera(), {recursive:false})
                if (!target) {
                    return;
                }
                if (app3.control) app3.control.enabled = false;
                const points = target.point.toArray();
                m2.x = points[0];
                m2.y = points[1];
                m2.z = points[2];
                gMark = createMarkSphere(alias3, {sphereRadius:0.75, name: nameOfPick, point: points });
                app3.add(gMark);
                // console.log(target);
            } else if (info.button == 2) {
                // 右键点击，清空
                ud.canPick = true;
                ud.isDown = false;
                if (app3.control) app3.control.enabled = true;
                app3.remove(nameOfPick)
                gMark = null;
            }
        } else if (type == PEType.up) {
            ud.isDown = false;
            if (app3.control) app3.control.enabled = true;
        }
        app3.updateFrame();
    })
    gClearEvent = clearEvent;
})
onUnmounted(()=>{
    if (gClearEvent) gClearEvent();
})
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
    if ([1,2,6,7].includes(type)) {
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        // 兼容历史数据
        if (m2.x && m2.y && m2.z) {
            m3.direction_point = [parseFloat(m2.x), parseFloat(m2.y), parseFloat(m2.z)];
        } else {
            m3.direction_point = [];
        }
        m1.param = JSON.stringify(m3);
        m1.tag = 'ImplantCrown';
        ud.calling = true;
        callAi(m1).then(res=>{
            ud.calling = false;
            if (res.code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {           
                    updateTimestampData(m1.tempDir, JSON.parse(m1.param), false);
                }
                // 去除取点时的模型和mark，未有校正变换
                gScene.clear();
                ud.pathList = res.data.filter(e=>filterFile(e));
                updateByPath();
            } else {
                ud.lockCall = false;
                msg.value = res.message;
            }
        })
    } else if (type == 4) {
        ud.timestampList.unshift({
            tmpDir: Date.now(),
            state: '',
        });
        // 添加时自动第一个
        ud.selTimestamp = ud.timestampList[0];
        ud.timestamp = ud.selTimestamp.tmpDir;
        ud.lockCall = false;
        m1.type = 1;
        m1.tempDir = ud.timestamp;
        m3.tooth_id = '';
        m3.scanbody_id = '';
        m3.direction_point = [];        
        gScene.clear();
        // elViewer.value.resetAxes();
    } else if (type == 5) {
        // 删除
        ud.timestampList = [];
        getHistory({tag:'ImplantCrown'}).then(res=>{
            if (res.code ==200) {
                res.data.forEach(e=>{
                    const strList = e.split(' ');
                    const tmpDir = parseInt(strList[0].split('=').pop());
                    const parameters = {};
                    strList.forEach(str=>{
                        const strValue = str.split('=')[1];
                        if (str.startsWith('param')) {
                            const tmp = JSON.parse(strValue);
                            parameters['param'] = tmp;
                        }
                    })
                    updateTimestampData(tmpDir, parameters, true);
                })
            }
        })
    }
}
function updateTimestampData(tmpDir, info, isNew) {
    // 更新进去
    if (isNew) {
        ud.timestampList.push({
            tmpDir,
            param: info.param,
            state: 'history',
        });
    } else {
        const tmp = ud.timestampList.filter(e=>e.tmpDir==tmpDir)[0];
        if (tmp) {
            tmp.param = info.param;
        } else {
            ud.timestampList.push({
                tmpDir,
                param: info.param,
                state: 'new',
            }); 
        }
    }
    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
}
function selectTimestamp() {
    const { tmpDir, param, state } = ud.selTimestamp;
    ud.state = state;
    ud.lockCall = false;
    m1.tempDir = tmpDir;
    if (state=='history') {
        // 历史记录
        m1.type = 2;
        if (param.direction_point.length > 0) {
            m2.x = param.direction_point[0];
            m2.y = param.direction_point[1];
            m2.z = param.direction_point[2];
        } else {
            m2.x = '';
            m2.y = '';
            m2.z = '';
        }
        m3.tooth_id = param.tooth_id;
        m3.scanbody_id = param.scanbody_id;
        ud.lockCall = false;
    } else {
        m1.type = 1;
        ud.timestamp = tmpDir;
    }
}
function updateByPath() {
    ud.uploading = true;
    ud.fetching = true;
    ud.fetchTotal = ud.pathList.length;
    ud.fetchCount = 0;
    const fetchSinglePath = async (path) => {
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
            return null;
        })
        ud.fetchCount++;
        if (!geo) return;
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
    let check = ['trans_lower.stl', 'trans_upper.stl'].includes(filename) ? false: true;
    ud.infoList.push({
        filename:filename,
        check,
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
        mesh.visible = check;
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
    const mesh = gScene.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        mesh.visible = item.check;
        app3.updateFrame();
    }
}
function getPer() {
    if (ud.fetching) return calcPer(ud.fetchCount, ud.fetchTotal);
    return calcPer(ud.count, ud.total);
}
function appendFileMesh(mesh, idx) {
    const tmpInfo = info1[idx];
    ud.toPickTargets = [mesh];
    ud.canPick = true;
    const info = getMeshMaterialOption(tmpInfo.name, {tag:props.tag});
    if (!ud.infoList) ud.infoList = [];
    ud.infoList.push({
        filename: tmpInfo.name,
        check: true,
        color: info.color,
        opacity: info.opacity,
    });
    app3.add(mesh);
    app3.updateFrame();
}
async function handleSelectFile(event) {
    const files = event.target.files;
    if ([2, 6, 7].includes(ud.type)) {
        const tmpInfo = info1[ud.type];
        // 上传文件
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = 'Please Select Timestamp to Continue';
            return;
        }
        ud.uploading = true;
        ud.countError = 0;
        ud.count = 1;
        ud.total = files.length;
        const uploadSingleFile = async (file) => {
            const formData = new FormData();
            if (['scan.stl'].includes(tmpInfo.name)) {
                let geo = await new FilePathLoader(tmpInfo.name, {drcPath:`${import.meta.env.VITE_APP_PREFIX_DRACO}/draco/`}).load(file)
                    .catch(err=>{
                        msg.value = 'File Load failure';
                        console.error(err);
                        return null;
                    })
                if (!geo) return;             
                const mesh = await addColor2Mesh(geo);
                mesh.name = tmpInfo.name;
                appendFileMesh(mesh, ud.type);
                // 测试取点
                // ud.uploading = false;
                // return;
            }
            formData.append("files", file, tmpInfo.name);
            formData.append("tempDir", ud.timestamp); 
            formData.append("tag", "ImplantCrown");
            const res = await upload(formData)
            if (res.code == 200) {
                if (ud.count + ud.countError == ud.total) {                    
                    ud.uploading = false;
                } else {
                    ud.count++;
                }
            } else {
                ud.countError++;
                msg.value += `File ${tmpInfo.name} upload failed`;
            }
        }
        for (let i = 0; i < files.length; i++) {
            uploadSingleFile(files[i]);
        }
    }
}
</script>