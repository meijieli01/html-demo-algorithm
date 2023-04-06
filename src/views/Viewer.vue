<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view">
          
        </div>
        <div class="content-toolbar d-flex flex-column">
            <div class="d-flex flex-wrap">
                <button class="btn btn-primary m-1" @click="clickLoadShowData(1)">测试本地结果-展示模型</button>
                <button class="btn btn-primary m-1" @click="clickLoadShowData(4)">创建时间戳</button>
            </div>
            <div v-if="ud.timestampList.length > 0">
                <div>
                    <div class="d-flex flex-wrap">                
                        <div class="alert alert-warning m-1 p-0" role="alert">上传文件时间戳，区分未调用与调用历史记录</div>
                        <select class="form-select" v-model="ud.selTimestamp" @change="selectTimestamp">
                            <option v-for="(item,i) in ud.timestampList" :key="i" :value="item" v-html="parseTime(item)"></option>
                        </select>
                    </div>
                    <div class="d-flex flex-wrap">
                        <div class="alert alert-warning m-1 p-0" role="alert">注意，读取大量文件，会卡顿一下，请耐心等待</div>
                        <button class="btn btn-primary m-1" @click="clickLoadShowData(2)" :disabled="getState()">1.导入CT数据和咬合数据</button>
                    </div>
                </div>
                <div class="d-flex flex-wrap">                
                    <div class="alert alert-warning m-1 p-0" role="alert">调用AI时要传入一个缺少牙号</div>
                    <select class="form-select" v-model="m1.missId" @change="selectMissingTid" :disabled="getState()">
                        <option v-for="(tid,i) in ud.tidList" :key="i" :value="tid" v-html="tid"></option>
                    </select>
                </div>
                <div class="d-flex flex-wrap">                
                    <button class="btn btn-primary m-1" @click="clickLoadShowData(3)" :disabled="ud.lockCall">2.调用AI</button>
                    <div class="h-100 m-auto d-flex flex-column justify-content-center">
                        <div class="spinner-border text-primary" role="status" v-if="ud.calling"></div>
                    </div>
                    <div class="alert alert-warning m-1 p-0 my-auto" role="alert">整个过程计算耗时较长，需要等待！</div>
                </div>
            </div>
            <div class="d-flex flex-column py-3">
                <div class="alert alert-warning text-center m-1 p-0" role="alert">当前进度</div>
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
            <div>
                
            </div>
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
        <input type="file" webkitdirectory ref="refFile" @change="handleSelectFile($event)" hidden />
        <!-- <input type="file" ref="refFile" @change="handleSelectFile($event)" hidden /> -->
        <!-- <input type="file" multiple ref="refFile" @change="handleSelectFile($event)" hidden /> -->
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import mqThree from '../third/threejs/threejs';
import { readFromStorage, writeToStorage } from '../third/snippet/tool/storage';
import { FileLoader, mjFileType, addColor2Mesh, PathLoader, updateMeshColor, updateMeshOpacity } from '../third/threejs/mjLoader';
import { upload, callAi } from '../api/file';
import { getBaseRoot } from '../../config';
const refFile = ref(null);
const msg = ref('');
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
const keyOfLocalStorage = 'keyOfLocalStorage';
const colorOfDefault = '#B38E6B'
const opacityOfDefault = 1;
const stlLoader = new FileLoader(mjFileType.STL);
const drcPathPrefix = `${getBaseRoot()}/js/libs/draco/`;
onMounted(() => {
    const elScript = document.createElement('script')
    elScript.type = 'text/javascript'
    elScript.src = `${drcPathPrefix}draco_encoder.js`;
    document.body.appendChild(elScript)
    // const elScript1 = document.createElement('script')
    // elScript1.type = 'text/javascript'
    // elScript1.src = `${drcPathPrefix}draco_decoder.js`;
    // document.body.appendChild(elScript1)
    
    let el = document.getElementById('id3DContainer')
    let rect = el.getBoundingClientRect()
    if (import.meta.env.DEV) {
        window.mjthree = mqThree
    }
    mqThree.threeInit({
        width: rect.width,
        height: rect.height,
        container: el,
        useControl: true,
    })
    mqThree.threeEventLoop();
    mqThree.threeResize();
    mqThree.threeFrame();

    // 缓存上传文件的时间点
    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
})
function parseTime(timestamp) {
    const date = new Date(parseInt(timestamp.tmpDir));
    const strTid = timestamp.tid ? `${timestamp.tid} ---  ` : '';
    return `${strTid}${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
function getState() {
    const {tmpDir, tid} = ud.selTimestamp || {};
    // console.log('-state-', tmpDir, tid, typeof tmpDir, typeof tid)
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
    clearEmpty();
    if ([1,2].includes(type)) {
        refFile.value.dispatchEvent(new MouseEvent('click'))
    } else if (type == 3) {
        if (!m1.missId) {
            msg.value = '需要选择一个缺少牙号';
            return;
        }
        ud.calling = true;
        callAi(m1).then(res=>{
            ud.calling = false;
            if (res.code == 200) {
                ud.lockCall = true;
                // 新的调用需要缓存记录
                if (m1.type == 1) {                                             
                    // 更新进去
                    const tmp = ud.timestampList.filter(e=>e.tmpDir==m1.tempDir)[0];               
                    tmp.tid = m1.missId;
                    writeToStorage(keyOfLocalStorage, JSON.stringify(ud.timestampList));
                    ud.timestampList = JSON.parse(readFromStorage(keyOfLocalStorage, '[]'));
                }
                ud.pathList = res.data;                
                updateByPath();
            } else {
                msg.value = res.message;
            }
        })
    } else if (type == 4) {
        ud.timestampList.push({
            tmpDir: Date.now(),
            tid: '',
        });
    }
}
function clearEmpty() {
    mqThree.group.children.forEach(mesh=>{
        mesh.geometry.dispose();
        mesh.material.dispose();
    })
    mqThree.threeEmpty();
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
    mqThree.threeLoading(true);
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
            msg.value = '文件加载失败';
            mqThree.threeLoading(false);
            return null;
        })
        ud.fetchCount++;
        if (!geo) return;
        mqThree.threeLoading(false);
        addGeotoScene(geo, filename);
    }
    ud.pathList.forEach(path=>{
        fetchSinglePath(path);
    })
    mqThree.threeFrame();
}
function addGeotoScene(geo, filename) {
    if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
        console.warn('empty BufferGeometry');
        return;
    }
    ud.infoList.push({
        filename:filename,
        check: true,
        color: colorOfDefault,
        opacity: opacityOfDefault,
    });
    addColor2Mesh(geo, {name:filename, color:colorOfDefault, opacity: opacityOfDefault}).then(mesh=>{
        mqThree.threeAdd(mesh);
        mqThree.threeFrame();
    })
    if (ud.fetchTotal == ud.fetchCount) {
        ud.uploading = false;
        ud.fetching = false;
    } else {
        mqThree.threeFrame();
    }
}
function inputChangeUpdate(item) {
    item.check = !item.check;
    const mesh = mqThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        mesh.visible = item.check;
        mqThree.threeFrame();
    }
}
function inputChangeColorUpdate(event, item) {
    item.color = event.target.value;
    const mesh = mqThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshColor(mesh, item.color);
        mqThree.threeFrame();
    }
}
function inputChangeOpacityUpdate(event, item) {
    item.opacity = parseFloat(event.target.value);
    const mesh = mqThree.group.children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMeshOpacity(mesh, item.opacity);
        mqThree.threeFrame();
    }
}
function getPer() {
    if (ud.fetching) {
        return Math.round(100 * ud.fetchCount / ud.fetchTotal).toFixed(0);     
    }
    return Math.round(100 * ud.count / ud.total).toFixed(0); 
}
function handleSelectFile(event) {
    const files = event.target.files;
    if (ud.type == 1) {
        // 本地加载stl文件
        ud.fetching = true;
        ud.uploading = true;
        ud.infoList = [];
        mqThree.threeLoading(true);
        ud.fetchTotal = files.length;
        ud.fetchCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            stlLoader.load(file, (event)=>{
                // console.log('progress', event.loaded/event.total)
            }).then((geo)=>{
                const filename = FileLoader.getName(file.name);
                ud.fetchCount++;
                mqThree.threeLoading(false);
                addGeotoScene(geo, filename);
            })
        }
    } else if (ud.type == 2) {
        // 上传文件
        if (!ud.timestamp || ud.timestamp.length < 1) {
            msg.value = '请勾选时间戳';
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
                msg.value += `重复上传${file.name}`;
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
                        msg.value = '以上文件上传失败';
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
                msg.value += `文件${file.name}上传失败`;
            }
        }
        for (let i = 0; i < files.length; i++) {
            uploadSingleFile(files[i]);
        }
    }
}
</script>