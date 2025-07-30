<template>
    <div class="canvas-function-root">
        <div class="top-buttons">
            <!--<button class="btn btn-primary"  width="150px" height="32px" buttonClass="grey-button">Main Menu</button>-->
            <button class="btn btn-primary" @click="openFileDialog" width="150px" height="32px" title="model file support stl,ply,obj, and cbct support file is nii format" buttonClass="red-button">Add Frame</button>
            <!--<button @click="addCbctFrame" width="150px" height="32px" buttonClass="red-button">Add Cbct</button>-->
            <input ref="fileInput" type="file" multiple accept="image/*,.stl,.ply,.obj,.nii,.gz" @change="handleFiles" style="display:none" />
        </div>
          <InfiniteViewer class="viewer-board" :zoom="1" :useWheelScroll="false" :useMouseDrag="!ud.activeChild" ref="elViewer"
            :class="{move:ud.mdown}"
            @mousedown="handleEvt($event,'mdown4Viewer')"
            @mouseup="handleEvt($event,'mup4Viewer')"
          >
            <div class="viewport-board" ref="canvasContainer">
                <DraggableContainer :adsorbParent="false" :referenceLineVisible="false">
                    <VueDraggableResizable
                        :initW="400+frame.extw" :initH="300 + frame.exth"
                        :draggable="true" :resizable="true"
                        v-for="frame in frames" :key="frame.id"
                        v-model:x="frame.x" v-model:y="frame.y" v-model:w="frame.w" v-model:h="frame.h"
                        v-model:active="frame.active"
                        :parent="false" class="frame" :class="{ ztop: frame.isTop }"
                        :handles="['tl','bl','tr','br']"
                        classNameResizable="resizable"
                    >
                        <CanvasTarget :frame="frame" @op="handleFrameOp" />
                    </VueDraggableResizable>
                </DraggableContainer>
            </div>
        </InfiniteViewer>
    </div>
</template>
  
<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import InfiniteViewer from 'vue3-infinite-viewer';
import VueDraggableResizable from 'vue3-draggable-resizable';
import { DraggableContainer } from 'vue3-draggable-resizable';
import CanvasTarget from './CanvasTarget.vue';
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';
import { alias3 } from '../third/mq-webui/viewer.es';
import { Observable } from 'rxjs';
import img1 from '../assets/scanbody_1.png?url';
import img2 from '../assets/scanbody_2.png?url';
import img3 from '../assets/scanbody_3.png?url';


const frames = reactive([]);
const fileInput = ref(null);
const elViewer = ref();
const ud = reactive({
    isReady: false,
    activeChild: false,
})

onMounted(()=>{
    window.addEventListener('message',(e)=>{
        const {type, status, id } = e.data;
        console.log('message', e, id);
        if (type=='CATCH_LOAD' && status==0) {
            ud.isReady = true;
        } else if (type=='CATCH_READY' && status==1) {
            if (id) {
                const tmp = frames.filter(t=>t.id==id)[0];
                if (tmp) tmp.isReady = true;
            }
        }
    })
    window.mjviewer = elViewer.value;
    [img1, img2, img3].forEach((img,i)=>{
        const frame = {
            id:Date.now() + Math.random(),
            type:'image',
            name:`image${i}`,
            active: false,
            isTop: false,
            url:img,
            x: 100 + Math.random() * 100,
            y: 100 + Math.random() * 100,
            width: 400,
            height: 300,
            exth: 0,
            extw: 0,
        };
        frames.push(frame);
    });
    initArrangeFrames();
});

function initArrangeFrames(type='vertical') {
    const gap = 40;
    let curx = gap;
    let cury = gap;
    frames.forEach((frame,i)=>{
        if ('vertical' == type) {
            if (i == 0) {
                frame.x = gap;
                frame.y = cury;
                cury += frame.height + gap;
            } else {
                frame.x = gap;
                frame.y = cury + gap;
                cury += frame.height + gap * 2;
            }
        }
    });
}

function sendToIframe(frame, frequency = 2000) {
    return new Observable(observer=>{
        let count = 0;
        const intervalId = setInterval(()=>{
            count++;
            const tmp = frames.filter(t=>t.id==frame.id)[0];
            if (tmp && tmp.isReady) {
                observer.complete();
                clearInterval(intervalId);
                const elIFrame = document.getElementById(frame.id).contentWindow;
                if (elIFrame) elIFrame.postMessage({type:'FILE_NII_DATA', file:frame.file, id: frame.id},'*');
            }   
            if (ud.isReady) {
                ud.isReady = false;
                const elIFrame = document.getElementById(frame.id).contentWindow;
                if (elIFrame) elIFrame.postMessage({type:'CATCH_READY', id: frame.id},'*');
            }
            observer.next(count);
        }, frequency);
        return ()=>{
            clearInterval(intervalId);
        }
    })
}

function openFileDialog() {
    fileInput.value.click();
}
function addCbctFrame(file) {
    const isInternal = ['192.168.0.16', 'localhost'].includes(location.hostname);
    const delayTime = (isInternal ? 3 : 15) * 1000;
    const frame = {
        id:Date.now() + Math.random(),
        type:'cbct',
        name:'cbct',
        active: false,
        isTop: false,
        //url:'https://localhost:7702',
        url:`${isInternal ? ('https://' + location.hostname + ':7702') : 'https://47.108.166.54:4053'}`,
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100,
        width: 900 + Math.random() * 100,
        height: 800 + Math.random() * 100,
        exth: 400,
        extw: 400,
        file,
    };
    frames.push(frame);
    sendToIframe(frame).subscribe({
        next:(value)=>console.log('next', value),
        complete:()=>console.log('over'),
        error: (err)=>console.log(err),
    });
}
function handleFrameOp(frame, type) {
    console.log(frame, type);
    if (type=='remove') {
        const index = frames.indexOf(frame);
        if (index !== -1) {
            if (frame.objectUrl) URL.revokeObjectURL(frame.objectUrl);
            frames.splice(index, 1);
        }
    } else if (['active','deactive'].includes(type)) {
        ud.activeChild = type == 'active' ? true : false;
        frames.forEach(e=>e.isTop = false);
        frame.isTop = true;
    }
}

function handleEvt(evt, type) {
    if (type == 'mdown4Viewer') {
        ud.mdown = true;
    } else if (type == 'mup4Viewer') {
        ud.mdown = false;
    }
}

async function handleFiles(event) {
    const input = event.target;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
        if (/\.(nii|gz)$/i.test(file.name)) {
            addCbctFrame(file);
            return;
        }
      const type = /\.(stl|ply|obj)$/i.test(file.name) ? 'mesh' : 'image';
      const url = URL.createObjectURL(file);
      const frame = {
        id: Date.now() + Math.random(),
        type,
        name: file.name,
        url,
        active: false,
        isTop: false,
        x: 50 + 50 * Math.random(),
        y: 50 + 50 * Math.random(),
        w: 300,
        h: 300,
        objectUrl: url,
        exth: 10,
        extw: 0,
      };
      frames.push(frame);
      if (type === 'mesh') {
        await nextTick();
        initMesh(frame);
      }
    }
    input.value = '';
}

async function initMesh(frame) {
    const { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Mesh, Object3D, LoadingManager, BufferGeometry, MeshPhongMaterial, Box3, Vector3,
        TrackballControls, STLLoader, OBJLoader, PLYLoader
    } = alias3;

    const canvas = frame.canvasRef;
    const renderer = new WebGLRenderer({ canvas, alpha: true });
    const scene = new Scene();
    const camera = new PerspectiveCamera(45, frame.w / frame.h, 0.1, 1000);
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5;
    controls.panSpeed = 0.5;
    controls.minDistance = 2;
    controls.maxDistance = 160;

    const ambient = new AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dirLight = new DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 0, 100);
    scene.add(dirLight);

    const loaderMap = {
      stl: STLLoader,
      obj: OBJLoader,
      ply: PLYLoader,
    };
    const ext = fileExtension(frame.name);
    const LoaderClass = loaderMap[ext] || STLLoader;
    const loader = new LoaderClass(new LoadingManager());
    loader.load(frame.url, (geometry) => {
      let object;
      if (geometry instanceof Object3D) {
        object = geometry;
      } else {
        object = new Mesh(geometry, new MeshPhongMaterial({ color: 0xcccccc }));
      }
      const box = new Box3().setFromObject(object);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3()).length();
      object.position.sub(center);
      camera.position.copy(center.clone().add(new Vector3(0, 0, size * 1.5)));
      controls.target.copy(center);
      scene.add(object);
      animate();
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.setSize(frame.w, frame.h);
      camera.aspect = frame.w / frame.h;
      camera.updateProjectionMatrix();
      controls.update();
      renderer.render(scene, camera);
    }
}

function fileExtension(name) {
    const match = name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
}
</script>

<style scoped>
.canvas-function-root {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
}
.top-buttons {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: lightblue;
}
.resizable {
    border: 1px solid;
    border-color: $primary;
    &.ztop {
        z-index: 50;
    }
}
.viewer-board {
    position: relative;
    flex: 1;
    overflow: auto;
    background-image: 
        linear-gradient( 0deg, rgba(0, 0, 0, 0.5) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.5) 1px, transparent 1px);
    background-size: 50px 50px;
    cursor: default;
    &.move {
        cursor: all-scroll;
    }
}
.viewport-board {
    position: relative;
    width: 800px;
    height: 800px;
    background: #444;
}
</style>

