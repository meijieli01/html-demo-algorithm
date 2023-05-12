import {
  Scene,
  Box3,
  WebGLRenderer,
  PCFSoftShadowMap,
  AxesHelper,
  Vector3,
  Vector4,
  Object3D,
  Group,
  Color,
  Mesh,
  OrthographicCamera,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Quaternion,
} from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { TrackerResource } from './mjTrack';

function localDeg2Rad(deg) {
  return (deg * Math.PI) / 180
}
// function clampVal(value, min, max) {
//   return Math.min(Math.max(value, min), max)
// }
const xyzSequence = []
function initialSequence() {
  for (let deg = -60; deg <= 60; deg += 5) {
    if (deg !== 0) {
      xyzSequence.push({
        // x: localDeg2Rad(-deg/10),
        y: localDeg2Rad(deg),
      })
    }
  }
}
initialSequence()

export class mqThree {
  constructor() {
    // 宽高
    this.rc = {
      width: 0,
      height: 0,
    }
    this.useControl = false; // 默认关闭控件
    this.useRender = false; // 默认未主动渲染
    this.showGrid = false; // 网格
    this.zoomLevel = 0; // 配合网格使用
    this.callbackId = 0; // 删除资源
    this.track = new TrackerResource();
    // 
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
    // 
    this.scene = new Scene();
    this.group = new Group();
    this.group.name = 'group';
    this.scene.add(this.group);
  }
  init(options = {}) {
    const {rc} = this;
    rc.width = options.width;
    rc.height = options.height;
    if (options.container instanceof HTMLElement) {
      if (options.container instanceof HTMLCanvasElement) {
        this.renderer = new WebGLRenderer({
          canvas: options.container,
          antialias: true,
          logarithmicDepthBuffer: false,
        })
      } else {
        this.renderer = new WebGLRenderer({
          antialias: true,
        })
        options.container.appendChild(this.renderer.domElement)
      }
      // 存在大量创建canvas使用webgl来动态截取模型的图像，会在代码层强行退出
      this.renderer.domElement.addEventListener('webglcontextlost', (event) => {        
        // console.error(event)
        // location.reload()
      })
    } else {
      throw new Error('container is not a HTMLElement or Canvas')
    }
    this.resetCamera();
    this.renderer.setClearColor(new Color(0xffffff), 1)
    if (options.useControl) {
      this.useControl = true;
      this.updateControl();
    }    
    this.resize(options.width, options.height)
    // this.eventLoop();
    this.updateFrame();
    
    const winResize = () => {
      const {domElement} = this.renderer;
      const {clientWidth, clientHeight} = domElement.parentElement;
      this.resize(clientWidth, clientHeight);
    }
    window.removeEventListener('resize', winResize);
    window.addEventListener('resize', winResize);
    this.resize();
    this.initLight();
  }
  initLight() {
    const {scene} = this;
    // 灯光
    const ambientLight = new AmbientLight(0xffffff, 0.3)
    const directionLight = new DirectionalLight(0xffffff, 0.3)
    // let fog = new Fog(0xffffff, 0, 60)
    const pointLight1 = new PointLight(0xffffff, 1, 500, 2)
    const pointLight2 = new PointLight(0xffffff, 1, 500, 2)
    pointLight1.position.set(0, 200, 0)
    pointLight2.position.set(0, -200, 0)
    if (directionLight.isDirectionalLight) {
      directionLight.position.set(0, 0, 6000)
      // directionLight.castShadow = true // 灯光投掷阴影
      // directionLight.shadow.mapSize.width = 2048
      // directionLight.shadow.mapSize.height = 2048
      // directionLight.shadow.camera.near = 0.5
      // directionLight.shadow.camera.far = 5000

      let targetObject = new Object3D()
      targetObject.name = 'direction target object'
      directionLight.target = targetObject
      scene.add(targetObject);
    }
    ambientLight.name = 'ambientLight'
    scene.add(ambientLight)
    directionLight.name = 'directionLight'
    scene.add(directionLight)
    pointLight1.name = 'modelPointLight1'
    scene.add(pointLight1)
    pointLight2.name = 'modelPointLight2'
    scene.add(pointLight2)
    this.pointLight1 = pointLight1;
    this.pointLight2 = pointLight2;
  }
  resize(width, height) {
    const {rc} = this;
    width = width || rc.width
    height = height || rc.height
    this.updateResize(width, height, true)
  }
  updateResize(w, h, force) {
    const {rc, camera, renderer} = this;
    const canvas = this.renderer.domElement
    const width = w || canvas.width
    const height = h || canvas.height
    const isChange = canvas.width !== width || canvas.height !== height
    if (isChange || force) {
      rc.width = width
      rc.height = height
      if (camera) {
        camera.aspect = canvas.width / canvas.height
        camera.updateProjectionMatrix()
      }
      renderer.setSize(width, height)
      renderer.setViewport(0, 0, width, height)
      this.updateCameraViewport()
      this.updateControl()
    }
    return isChange
  }
  getBox() {
    function getBoundingBox(root, bbx) {
      if (root.geometry) {
        root.geometry.computeBoundingBox()
        bbx.union(root.geometry.boundingBox)
      } else {
        root.children.forEach((e) => getBoundingBox(e, bbx))
      }
    }
    const bbx = this.track.track(new Box3());
    const size = new Vector3();
    const center = new Vector3();
    getBoundingBox(this.scene, bbx);
    bbx.getSize(size)
    bbx.getCenter(center)
    return {
      size: size,
      center: center,
    }
  }
  updateCameraViewport() {
    const { renderer, group, camera} = this;
    const { size, center } = this.getBox();
    group.position.set(0, 0, 0)
    group.position.add(center.multiplyScalar(-1))
    let maxside = Math.max(size.x, size.y, size.z) / 2
    let ratio = renderer.domElement.width / renderer.domElement.height;
    let fitSideH = maxside * Math.sqrt(3);
    let fitSideV = fitSideH / ratio;
    camera.left = -fitSideH;
    camera.right = fitSideH;
    camera.top = fitSideV;
    camera.bottom = -fitSideV;
    camera.updateProjectionMatrix();
  }
  updateFrame(cb) {
    const { camera, scene, pointLight1, pointLight2, renderer, showGrid} = this;
    if (showGrid) {
      if (camera.zoom < 0.1) {
        camera.zoom = 0.1
        camera.updateProjectionMatrix();
      }
    }
    if (camera.position) {
      if (pointLight1) pointLight1.position.copy(camera.position);
      if (pointLight2) pointLight2.position.copy(camera.position);
    }
    renderer.clear();
    renderer.render(scene, camera);
    if (cb) cb()
    if (showGrid) {
      let v1 = new Vector3(0, 1, 0).unproject(camera)
      let v2 = new Vector3(0, -1, 0).unproject(camera)
      let distance = v1.distanceTo(v2)
      if (camera.zoom < 0.5) this.zoomLevel = 1
      else if (camera.zoom > 2.0) this.zoomLevel = 2
      else this.zoomLevel = 0;
      this.drawGrid(distance)
    } else {
      this.drawGrid(-1)
    }
  }
  updateControl() {
    const {camera, renderer, useControl} = this;
    if (!useControl) return
    if (!this.control) {
      const control = new TrackballControls(camera, renderer.domElement);
      // control.enabled = false;
      control.zoomSpeed = 3.5
      control.panSpeed = 2.5
      control.rotateSpeed = 2.2
      control.noZoom = false
      control.noPan = false
      control.noRotate = false
      control.staticMoving = false
      control.dynamicDampingFactor = 0.3
      control.keys = [65, 83, 68]
      control.addEventListener('change', () => {
        this.updateFrame();
      })
      this.control = control;
    }
    if (this.control.screen.width < 1 || this.control.screen.height < 1) {
      this.control.handleResize()
    }
    this.control.update();
  }
  setUseRender(isUse) {
    this.useRender = isUse;
  }
  dispose() {

    this.track.dispose();

    cancelAnimationFrame(this.callbackId);
    if (this.control) {
      this.control.dispose()
    }
    this.group.children.forEach(child=>{
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    })
    this.scene.traverse((obj)=>{
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        if (obj.material.map) {
          obj.material.map.dispose();
          obj.material.map = null;
        }
        obj.material.dispose();
      }
    })
    this.scene.clear();

    if (this.renderer) {
      console.log(this.renderer.info);
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      let gl = this.renderer.domElement.getContext('webgl');
      if (gl) {
        gl.getExtension('WEBGL_lose_context').loseContext();
      }
      const dom = this.renderer.domElement;
      dom.parentElement.remove(dom);
    }
  }
  drawGrid(distance) {
    const levelNames = ['1mm', '10mm', '0.1mm'];
    const unitSteps = 10;
    const {canvasGrid, renderer} = this;
    if (!canvasGrid) return
    let vp = new Vector4()
    renderer.getViewport(vp)
    const ctx = canvasGrid.getContext('2d')
    if (distance < 0) {
      ctx.clearRect(vp.x, vp.y, vp.z, vp.w)
      return
    }
    ctx.globalAlpha = 0.8
    ctx.lineWidth = 0.5
    let unitSize = vp.w / distance
    if (this.zoomLevel == 1) {
      unitSize *= 10.0
    } else if (this.zoomLevel == 2) {
      unitSize *= 0.1
    }
    // console.log('-unit size-', unitSize, distance, levelNames[gridlevel]);
    ctx.clearRect(vp.x, vp.y, vp.z, vp.w)
    ctx.beginPath()
    let pHUpper = vp.z / 2
    let pHLower = new Number(pHUpper)
    let pVUpper = vp.w / 2
    let pVLower = new Number(pVUpper)
    let count = 0
    let pointText = []
    function stepUnit() {
      ctx.strokeStyle = 'gray'
    }
    function stepUnit10() {
      ctx.strokeStyle = 'black'
    }
    function stepFont() {
      ctx.strokeStyle = 'red'
      ctx.fillStyle = 'red'
    }
    while (pHUpper > 0) {
      ctx.beginPath()
      if (count % unitSteps == 0) stepUnit10()
      else stepUnit()
      ctx.moveTo(pHUpper, vp.y)
      ctx.lineTo(pHUpper, vp.w)
      pHUpper -= unitSize
      if (pHUpper < 100 && pointText.length == 0) {
        pointText.push(pHUpper)
      }
      count++
      ctx.stroke()
    }
    count = 0
    while (pHLower < vp.z) {
      ctx.beginPath()
      if (count % unitSteps == 0) stepUnit10()
      else stepUnit()
      ctx.moveTo(pHLower, vp.y)
      ctx.lineTo(pHLower, vp.w)
      pHLower += unitSize
      count++
      ctx.stroke()
    }
    count = 0
    while (pVUpper > 0) {
      ctx.beginPath()
      if (count % unitSteps == 0) stepUnit10()
      else stepUnit()
      ctx.moveTo(vp.x, pVUpper)
      ctx.lineTo(vp.z, pVUpper)
      pVUpper -= unitSize
      if (pVUpper < 100 && pointText.length == 1) {
        pointText.push(pVUpper)
      }
      count++
      ctx.stroke()
    }
    count = 0
    while (pVLower < vp.w) {
      ctx.beginPath()
      if (count % unitSteps == 0) stepUnit10()
      else stepUnit()
      ctx.moveTo(vp.x, pVLower)
      ctx.lineTo(vp.z, pVLower)
      pVLower += unitSize
      count++
      ctx.stroke()
    }
    ctx.beginPath()
    stepFont()
    ctx.moveTo(pointText[0], pointText[1] - unitSize / 2)
    ctx.lineTo(pointText[0], pointText[1])
    ctx.lineTo(pointText[0] + unitSize, pointText[1])
    ctx.lineTo(pointText[0] + unitSize, pointText[1] - unitSize / 2)
    ctx.fillText(levelNames[this.zoomLevel], pointText[0], pointText[1] + unitSize)
    ctx.stroke()
  }
  bindGrid() {
    const {renderer} = this;
    if (this.canvasGrid) return;
    const canvas = renderer.domElement;
    const elContainer = canvas.parentNode;
    const width = canvas.width
    const height = canvas.height
    const canvas2d = document.createElement('canvas');
    elContainer.appendChild(canvas2d)
    canvas2d.style = `position: absolute;left: 0px;top: 0px;width: ${width}px;height: ${height}px;pointer-events: none;`;
    canvas2d.width = width;
    canvas2d.height = height;
    canvas2d.classList.add('grid');
    this.canvasGrid = canvas2d;
  }
  setLoadConfig(options = {}) {
    this.loadingMsg = options.msg || '加载中...';
    this.loadingUrl = options.url || '/images/loading.svg';
  }
  loading(isLoading) {
    if (isLoading) this.bindLoading()
    this.loadingState = isLoading;
    if (this.loadingState) {
      this.elLoading.style.display = 'flex';
    } else {
      this.elLoading.style.display = 'none';
    }
  }
  bindLoading() {
    const { renderer } = this;
    if (this.elLoading) return;
    const canvas = renderer.domElement;
    const elContainer = canvas.parentNode;
    const elLoading = document.createElement('div');
    elContainer.appendChild(elLoading)
    elLoading.style = `position: absolute;left: 0px;top: 0px;width: 100%;height: 100%;z-index: 55; display: flex; flex-direction: column;background-color: rgba(0,0,0,0.2);`
    elLoading.innerHTML = `
      <div style="width: 100px; margin: auto; text-align: center;"><div id="idMqLoadingText">${this.loadingMsg}</div><img src='/images/loading.svg' dragable="false" /></div>
      <div id="close" style="width: 60px; font-size: 2rem; top: 0; right: 0;position: absolute;">x</div>
    `
    elLoading.addEventListener('click', (event) => {
      let target = event.target
      if (target.getAttribute('id')=='close') {
        this.loading(false);
      }
    })
    this.elLoading = elLoading;
  }
  gridVisile(show) {
    console.log('-grid visible-', show)
    if (show) this.bindGrid();
    this.showGrid = show;
    this.updateFrame()
  }
  callAnimate() {
    if (!ud.useRender) return
    const animate = () => {
      this.updateFrame()
      this.updateControl();
      this.callbackId = requestAnimationFrame(animate);  
    }
    animate();
  }
  eventLoop() {
    const {renderer} = this;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.autoClear = false;
    // renderer.setAnimationLoop(()=>this.renderFrame())
    const oneFrame = () => {
      this.callbackId = requestAnimationFrame(oneFrame);
      renderer.getContext().finish();
      this.updateControl();
    }
    oneFrame();
  }
  resetGroup() {
    const {group} = this;
    // canvas重新加载后，scene没变，但是canvas已改变
    group.children.forEach((child) => {
      child.position.copy(new Vector3(0, 0, 0));
      child.quaternion.copy(new Quaternion(0, 0, 0, 1));
      child.scale.copy(new Vector3(1, 1, 1));
      child.updateMatrix();
      child.updateMatrixWorld();
    })
    group.position.copy(new Vector3(0, 0, 0));
    group.quaternion.copy(new Quaternion(0, 0, 0, 1));
    group.scale.copy(new Vector3(1, 1, 1));
    group.updateMatrix();
    group.updateMatrixWorld();
  }
  resetCamera() {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);
    this.camera.position.set(0, 0, 90)
    // camera.position = new Vector3(0, 0, 90)
    // camera.quaternion  = new Quaternion(0, 0, 0, 1)
    // camera.scale = new Vector3(1, 1, 1)
    // camera.updateMatrix()
    // camera.updateMatrixWorld()
    // // console.log('-reset camera-', Date.now())
  }
  addAxes(size) {
    const {scene, track} = this;
    let axes = new AxesHelper(size);
    axes.name = 'axesHelper';
    if (!scene.getObjectByName(axes.name)) {
      scene.add(axes);
      track.track(axes);
    }
    this.updateFrame()
  }
  add(mesh) {
    const {group, track} = this;
    group.add(mesh);
    track.track(mesh);
    this.updateCameraViewport();
    this.updateFrame()
  }
  removeByName(meshName) {
    const {group} = this;
    let child = group.children.filter((e) => e.name == meshName)
    if (child.length > 0) {
      group.remove(child[0]);
    }
    this.updateFrame()
  }
  empty() {
    const {group, track} = this;
    track.dispose();
    group.children.forEach(child=>{
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    })
    group.clear()
    this.updateFrame()
  }
  side(side) {
    const {control, group} = this;
    // return
    const {center} = getBox()
    control.handleResize()
    let offset = new Vector3(center.x, center.y, center.z);
    offset.multiplyScalar(-1);
    group.position.set(0,0,0);
    group.position.add(offset);   
    if (side == 'front') { // xy plane
      group.quaternion.set(0,0,0,1);
    } else if (side == 'back') { // xy plane
      group.quaternion.set(0,0,0,1);
    } else if (side == 'left') { // zy plane
      group.quaternion.setFromAxisAngle(new Vector3(0,1,0), Math.PI/2);
    } else if (side == 'right') { // zy plane
      group.quaternion.setFromAxisAngle(new Vector3(0,1,0), -Math.PI/2);
    } else if (side == 'top') { // xz plane
      group.quaternion.setFromAxisAngle(new Vector3(1,0,0), -Math.PI/2);
    } else if (side == 'bottom') { // xz plane
      group.quaternion.setFromAxisAngle(new Vector3(1,0,0), Math.PI/2);
    } else if (side == 'top-upper') {
      group.quaternion.setFromAxisAngle(new Vector3(1,0,0), -Math.PI/2);
    } else if (side == 'bottom-lower') {
      group.quaternion.setFromAxisAngle(new Vector3(1,0,0), Math.PI/2);
      // let minsize = Math.min(size.x, Math.min(size.y, size.z));
      // group.position.y -= minsize/3;
    }                    
    group.scale.set(1,1,1)
    group.updateMatrixWorld()
  }
  screenshot(isBuffer, idx) {
    const {renderer, scene, camera} = this;
    renderer.clear()
    renderer.render(scene, camera)
    return new Promise((resolve) => {
      const canvas = renderer.domElement
      if (isBuffer) {
        canvas.toBlob((blob) => {
          resolve({ blob: blob, idx: idx })
        }, 'image/png')
      } else {
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    })
  }
}
