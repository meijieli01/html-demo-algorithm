<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view">
          
        </div>
        <div class="content-toolbar d-flex flex-column">
            <div class="d-flex flex-wrap">
                <button class="btn btn-primary m-1" @click="clickLoadShowData(1)">导入输出文件夹-展示模型</button>
                <button class="btn btn-primary m-1" @click="clickLoadShowData(2)">导入输入文件夹-CT数据</button>
                <div class="alert alert-warning m-1" role="alert">上传开始时，文件读取会卡顿一下</div>
            </div>
            <div class="d-flex">
                <div class="progress w-100" v-if="ud.uploading">
                    <div class="progress-bar" role="progressbar" :style="`width: ${getPer()}%;`" :aria-valuenow="getPer()" aria-valuemin="0" aria-valuemax="100" v-html="getPer()+'%'"></div>
                </div>
            </div>
            <div class="d-flex" v-if="ud.count2 > 0">
                <div class="alert alert-danger" role="alert">以下文件上传失败！</div>
                <div v-for="(item,i) in ud.errorList" :key="i">
                    <div class="alert alert-danger" role="alert" v-html="item.name"></div>
                </div>
            </div>
            <div class="d-flex flex-wrap">
                <button class="btn btn-primary m-1" @click="clickLoadShowData(3)">调用AI</button>
                <div class="alert alert-warning m-1" role="alert">整个过程计算耗时较长，需要等待！</div>
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
import { FileLoader, mjFileType, addColor2Mesh } from '../third/threejs/mjLoader';
import { upload } from '../api/file';
const refFile = ref(null);
const ud = reactive({
    type: 0,
    total: 0,
    count: 0,
    count2: 0,
    uploading:false,
    cacheList: {},
    errorList: [],
    timestamp: 0,
})
const stlLoader = new FileLoader(mjFileType.STL);
onMounted(() => {
    const elScript = document.createElement('script')
    elScript.type = 'text/javascript'
    elScript.src = '/js/libs/draco/draco_encoder.js'
    document.body.appendChild(elScript)
    
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
})
function clickLoadShowData(type) {
    ud.type = type;
    mqThree.threeEmpty();
    refFile.value.dispatchEvent(new MouseEvent('click'))
}
function getPer() {
    return Math.round(100 * ud.count / ud.total).toFixed(2); 
}
function handleSelectFile(event) {
    const files = event.target.files;
    if (ud.type == 1) {
        mqThree.threeLoading(true);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            stlLoader.load(file, (event)=>{
                // console.log('progress', event.loaded/event.total)
            }).then((geo)=>{
                if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
                    console.warn('empty BufferGeometry');
                }
                addColor2Mesh(geo).then(mesh=>{
                    mqThree.threeAdd(mesh);
                    mqThree.threeFrame();
                    mqThree.threeLoading(false);
                })
            })
        }
    } else if (ud.type == 2) {
        ud.uploading = true;
        // delete ud.cacheList[ud.timestamp];
        ud.timestamp = Date.now();
        ud.count2 = 0;
        ud.count = 1;
        ud.total = files.length;
        ud.cacheList[ud.timestamp] = {};
        const uploadSingleFile = async (file) => {
            const formData = new FormData();
            const tmp = ud.cacheList[ud.timestamp][file.name];
            if (tmp && tmp.size > 0 && tmp.loading == false) {
                // 已经上传了的文件，退出
                return;
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
                if (ud.count + ud.count2 == ud.total) {                    
                    ud.uploading = false;
                    if (ud.count2 > 0) {
                        ud.errorList = [];
                        for (let k in ud.cacheList[ud.timestamp]) {
                            if (k && k.loading) ud.errorList.push(k);
                        }
                    }
                } else {
                    ud.count++;
                }
            } else {
                ud.count2++;
            }
        }
        for (let i = 0; i < files.length; i++) {
            uploadSingleFile(files[i]);
        }
    } else if (ud.type == 3) {
        
    }
}
</script>