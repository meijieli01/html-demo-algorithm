<template>
    <div class="canvas-page">
      <div class="top-buttons">
        <button  width="150px" height="32px" buttonClass="grey-button">Main Menu</button>
        <button @click="openFileDialog" width="150px" height="32px" buttonClass="red-button">Add Frame</button>
        <button @click="addCbctFrame" width="150px" height="32px" buttonClass="red-button">Add Cbct</button>
        <input ref="fileInput" type="file" multiple accept="image/*,.stl,.ply,.obj" @change="handleFiles" style="display:none" />
      </div>
      <InfiniteViewer class="viewer" :zoom="1" ref="viewer">
        <div class="canvas" ref="canvasContainer">
            <DraggableContainer>
          <VueDraggableResizable
              :initW="400+frame.extw" :initH="300 + frame.exth"
            v-for="frame in frames" :key="frame.id"
            v-model:x="frame.x" v-model:y="frame.y" v-model:w="frame.w" v-model:h="frame.h"
            :parent="true" class="frame" :class="{ fullscreen: frame.fullscreen }"
          >
            <div class="frame-bar">
              <span class="file-name">{{ frame.name }}</span>
              <div class="frame-actions">
                <!-- <span class="action" @click="toggleFullscreen(frame)">[ ]</span> -->
                <span class="action" @click="removeFrame(frame)">x</span>
              </div>
            </div>
            <div class="frame-content" :class="frame.type" @mousedown.stop="" @mousemove.stop="" >
              <img v-if="frame.type === 'image'" :src="frame.url" />
              <iframe v-if="frame.type === 'cbct'" width="100%" height="100%" :src="frame.url" sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation" />
              <canvas v-else :ref="el => frame.canvasRef = el" class="mesh-canvas"></canvas>
            </div>
          </VueDraggableResizable>
          </DraggableContainer>
        </div>
      </InfiniteViewer>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, nextTick } from 'vue';
  import InfiniteViewer from 'vue3-infinite-viewer';
  import VueDraggableResizable from 'vue3-draggable-resizable';
  import { DraggableContainer } from 'vue3-draggable-resizable';
  import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';
  import { alias3 } from '../third/mq-webui/viewer.es';
  
  const frames = reactive([]);
  const fileInput = ref(null);
  const viewer = ref();
  
  function openFileDialog() {
    fileInput.value.click();
  }
  function addCbctFrame() {
    const isInternal = ['192.168.0.16'].includes(location.hostname);
      const frame = {
      id:Date.now() + Math.random(),
      type:'cbct',
      name:'cbct',
      //url:'https://localhost:7702',
      url:`${isInternal ? ('https://' + location.hostname + ':7702') : 'https://47.108.166.54:4053'}`,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 900 + Math.random() * 100,
      height: 800 + Math.random() * 100,
      exth: 400,
      extw: 400,
      }
      frames.push(frame);
  }
  
  function removeFrame(frame) {
    const index = frames.indexOf(frame);
    if (index !== -1) {
      if (frame.objectUrl) URL.revokeObjectURL(frame.objectUrl);
      frames.splice(index, 1);
    }
  }
  
  function toggleFullscreen(frame) {
    //frame.fullscreen = !frame.fullscreen;
  }
  
  async function handleFiles(event) {
    const input = event.target;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      const type = /\.(stl|ply|obj)$/i.test(file.name) ? 'mesh' : 'image';
      const url = URL.createObjectURL(file);
      const frame = {
        id: Date.now() + Math.random(),
        type,
        name: file.name,
        url,
        x: 50 + 50 * Math.random(),
        y: 50 + 50 * Math.random(),
        w: 300,
        h: 300,
        fullscreen: false,
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
  .canvas-page {
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
  }
  .viewer {
    flex: 1;
    overflow: auto;
  }
  .canvas {
    position: relative;
    width: 2000px;
    height: 2000px;
  }
  .frame {
    border: 1px solid #555;
    background: #2b2b2b;
    color: white;
    display: flex;
    flex-direction: column;
  }
  .frame-bar {
    height: 24px;
    background: #3b3b3b;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
    cursor: move;
    user-select: none;
  }
  .file-name {
    font-size: 12px;
  }
  .frame-actions .action {
    margin-left: 8px;
    cursor: pointer;
  }
  .frame.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 1000;
  }
  .frame-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    &.image {
        display: block;
    }
  }
  .mesh-canvas, img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  </style>
  
