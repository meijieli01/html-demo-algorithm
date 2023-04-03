import {
  Scene,
  // Clock,
  Box3,
  WebGLRenderer,
  PCFSoftShadowMap,
  AxesHelper,
  Vector3,
  Vector4,
  // Vector2,
  // Quaternion,
  Object3D,
  Group,
  Color,
  OrthographicCamera,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Quaternion,
  Matrix4,
  // Fog,
} from 'three/build/three.module'
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
// import { TrackballControls } from './TrackballControls.module'

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

const mqThree = (function () {
  const rc = {
    width: 0,
    height: 0,
  }
  const model = {
    show: false,
    loading: false,
    level: 0,
    canvas: null,
    elLoading: null,
    sequence: false,
    oldwidth: 0,
    oldheight: 0,
    pointLight1: null,
    pointLight2: null,
    msg: '', // 加载提示
  }
  const ud = {
    useRender: false,
    useControl: false,
    control: null,
    renderer: null,
    camera: new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000),
    scene: new Scene(),
  }
  const group = new Group()
  group.name = 'group'
  ud.scene.add(group)
  
  const threeLight = () => {
    // 灯光
    let ambientLight = new AmbientLight(0xffffff, 0.3)
    let directionLight = new DirectionalLight(0xffffff, 0.3)
    // let fog = new Fog(0xffffff, 0, 60)
    model.pointLight1 = new PointLight(0xffffff, 1, 500, 2)
    model.pointLight2 = new PointLight(0xffffff, 1, 500, 2)
    model.pointLight1.position.set(0, 200, 0)
    model.pointLight2.position.set(0, -200, 0)
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
      ud.scene.add(targetObject)
    }
    ambientLight.name = 'ambientLight'
    ud.scene.add(ambientLight)
    directionLight.name = 'directionLight'
    ud.scene.add(directionLight)
    model.pointLight1.name = 'modelPointLight1'
    ud.scene.add(model.pointLight1)
    model.pointLight2.name = 'modelPointLight2'
    ud.scene.add(model.pointLight2)
  }
  threeLight()
  function winResize() {
    threeResize()
  }
  const threeInit = (options) => {
    rc.width = options.width
    rc.height = options.height
    if (options.container instanceof HTMLElement) {
      if (options.container instanceof HTMLCanvasElement) {
        ud.renderer = new WebGLRenderer({
          canvas: options.container,
          antialias: true,
          logarithmicDepthBuffer: false,
        })
      } else {
        ud.renderer = new WebGLRenderer({
          antialias: true,
        })
        options.container.appendChild(ud.renderer.domElement)
      }
      // 存在大量创建canvas使用webgl来动态截取模型的图像，会在代码层强行退出
      // ud.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      //   console.error(event)
      // })
    } else {
      throw new Error('container is not a HTMLElement or Canvas')
    }
    resetCamera()
    ud.renderer.setClearColor(new Color(0xffffff), 1)
    if (options.useControl) {
      ud.useControl = true
      updateControl()
    }    
    threeResize(options.width, options.height)
    // threeEventLoop()
    threeFrame()
    window.removeEventListener('resize', winResize)
    window.addEventListener('resize', winResize)
    threeResize()
  }
  const threeResize = (width, height) => {
    width = width || rc.width
    height = height || rc.height
    updateResize(width, height, true)
  }
  const threeDispose = () => {
    if (ud.control) {
      ud.control.dispose()
    }
    if (ud.renderer) {
      ud.renderer.dispose()
      ud.renderer.forceContextLoss()
    }
  }
  const updateControl = () => {
    if (!ud.useControl) return
    if (!ud.control) {
      ud.control = new TrackballControls(ud.camera, ud.renderer.domElement)
      // control.enabled = false;
      ud.control.zoomSpeed = 3.5
      ud.control.panSpeed = 2.5
      ud.control.rotateSpeed = 2.2
      ud.control.noZoom = false
      ud.control.noPan = false
      ud.control.noRotate = false
      ud.control.staticMoving = false
      ud.control.dynamicDampingFactor = 0.3
      ud.control.keys = [65, 83, 68]
      ud.control.addEventListener('change', () => {
        threeFrame()
      })
    }
    if (ud.control.screen.width < 1 || ud.control.screen.height < 1) {
      ud.control.handleResize()
    }
    ud.control.update()
  }
  const updateResize = (w, h, force) => {
    const canvas = ud.renderer.domElement
    const width = w || canvas.width
    const height = h || canvas.height
    const isChange = canvas.width !== width || canvas.height !== height
    if (isChange || force) {
      rc.width = width
      rc.height = height
      if (ud.camera) {
        ud.camera.aspect = canvas.width / canvas.height
        ud.camera.updateProjectionMatrix()
      }
      ud.renderer.setSize(width, height)
      ud.renderer.setViewport(0, 0, width, height)
      updateCameraViewport()
      updateControl()
    }
    return isChange
  }
  const getBox = () => {
    function getBoundingBox(root, bbx) {
      if (root.geometry) {
        root.geometry.computeBoundingBox()
        bbx.union(root.geometry.boundingBox)
      } else {
        root.children.forEach((e) => getBoundingBox(e, bbx))
      }
    }
    const bbx = new Box3()
    const size = new Vector3()
    const center = new Vector3()
    getBoundingBox(ud.scene, bbx)
    bbx.getSize(size)
    bbx.getCenter(center)
    return {
      size: size,
      center: center,
    }
  }
  const updateCameraViewport = () => {
    const { size, center } = getBox()
    if (group) {
      group.position.set(0, 0, 0)
      group.position.add(center.multiplyScalar(-1))
    }
    let maxside = Math.max(size.x, size.y, size.z) / 2
    let ratio = ud.renderer.domElement.width / ud.renderer.domElement.height
    let fitSideH = maxside * Math.sqrt(3)
    let fitSideV = fitSideH / ratio
    ud.camera.left = -fitSideH
    ud.camera.right = fitSideH
    ud.camera.top = fitSideV
    ud.camera.bottom = -fitSideV
    ud.camera.updateProjectionMatrix()
  }
  const threeUseRender = (isUse) => {
    ud.useRender = isUse
  }
  const threeFrame = (cb) => {
    if (model.show) {
      if (ud.camera.zoom < 0.1) {
        ud.camera.zoom = 0.1
        ud.camera.updateProjectionMatrix()
      }
    }
    if (ud.camera.position) {
      model.pointLight1.position.copy(ud.camera.position)
      model.pointLight2.position.copy(ud.camera.position)
    }
    ud.renderer.clear()
    ud.renderer.render(ud.scene, ud.camera)
    if (cb) cb()
    if (model.show) {
      let v1 = new Vector3(0, 1, 0).unproject(ud.camera)
      let v2 = new Vector3(0, -1, 0).unproject(ud.camera)
      let distance = v1.distanceTo(v2)
      if (ud.camera.zoom < 0.5) model.level = 1
      else if (ud.camera.zoom > 2.0) model.level = 2
      else model.level = 0
      drawGrid(distance)
    } else {
      drawGrid(-1)
    }
  }
  const threeLoading = (isLoading, msg) => {
    if (isLoading) bindLoading()
    model.loading = isLoading
    model.msg = msg || '加载中...'
    if (model.loading) {
      model.elLoading.style.display = 'flex'
    } else {
      model.elLoading.style.display = 'none'
    }
  }
  const threeGrid = (show) => {
    if (show) bindGrid()
    model.show = show
    threeFrame()
  }
  const bindGrid = () => {
    if (model.canvas) return
    let canvas = ud.renderer.domElement
    let elContainer = canvas.parentNode
    let width = canvas.width
    let height = canvas.height
    let canvas2d = document.createElement('canvas')
    elContainer.appendChild(canvas2d)
    canvas2d.style = `position: absolute;left: 0px;top: 0px;width: ${width}px;height: ${height}px;pointer-events: none;`
    canvas2d.width = width
    canvas2d.height = height
    canvas2d.classList.add('grid')
    model.canvas = canvas2d
  }
  const bindLoading = () => {
    if (model.elLoading) return
    let canvas = ud.renderer.domElement
    let elContainer = canvas.parentNode
    let elLoading = document.createElement('div')
    elContainer.appendChild(elLoading)
    elLoading.style = `position: absolute;left: 0px;top: 0px;width: 100%;height: 100%;z-index: 55; display: flex; flex-direction: column;background-color: rgba(0,0,0,0.2);`
    elLoading.innerHTML = `
      <div style="width: 100px; margin: auto; text-align: center;"><div id="idMqLoadingText">${model.msg}</div><img src='/images/loading.svg' dragable="false" /></div>
      <div id="close" style="width: 60px; font-size: 2rem; top: 0; right: 0;position: absolute;">x</div>
    `
    elLoading.addEventListener('click', (event) => {
      let target = event.target
      if (target.getAttribute('id')=='close') {
        threeLoading(false)
      }
    })
    model.elLoading = elLoading
  }
  function drawGrid(distance) {
    const levelNames = ['1mm', '10mm', '0.1mm']
    const unitSteps = 10
    if (!model.canvas) return
    let vp = new Vector4()
    ud.renderer.getViewport(vp)
    const ctx = model.canvas.getContext('2d')
    if (distance < 0) {
      ctx.clearRect(vp.x, vp.y, vp.z, vp.w)
      return
    }
    ctx.globalAlpha = 0.8
    ctx.lineWidth = 0.5
    let unitSize = vp.w / distance
    if (model.level == 1) {
      unitSize *= 10.0
    } else if (model.level == 2) {
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
    ctx.fillText(levelNames[model.level], pointText[0], pointText[1] + unitSize)
    ctx.stroke()
  }
  const threeAnimate = () => {
    if (!ud.useRender) return
    // this.pointLight1.position.copy(this.camera.position)
    // this.pointLight2.position.copy(this.camera.position)
    // this.renderer.clear()
    // this.renderer.render(this.scene, this.camera)
    threeFrame()
    updateControl()
    requestAnimationFrame(threeAnimate)
  }
  const threeEventLoop = () => {
    ud.renderer.setPixelRatio(window.devicePixelRatio)
    ud.renderer.shadowMap.enabled = true
    ud.renderer.shadowMap.type = PCFSoftShadowMap
    ud.renderer.autoClear = false
    // ud.renderer.setAnimationLoop(()=>this.renderFrame())
    function updateFrame() {
      requestAnimationFrame(updateFrame)
      updateControl()
    }
    updateFrame()
  }
  const resetGroup = () => {
    // canvas重新加载后，scene没变，但是canvas已改变
    group.children.forEach((child) => {
      child.position.copy(new Vector3(0, 0, 0))
      child.quaternion.copy(new Quaternion(0, 0, 0, 1))
      child.scale.copy(new Vector3(1, 1, 1))
      child.updateMatrix()
      child.updateMatrixWorld()
    })
    group.position.copy(new Vector3(0, 0, 0))
    group.quaternion.copy(new Quaternion(0, 0, 0, 1))
    group.scale.copy(new Vector3(1, 1, 1))
    group.updateMatrix()
    group.updateMatrixWorld()
    // console.log('-rest group-', Date.now())
  }
  const resetCamera = () => {
    ud.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10000)
    ud.camera.position.set(0, 0, 90)
    // camera.position = new Vector3(0, 0, 90)
    // camera.quaternion  = new Quaternion(0, 0, 0, 1)
    // camera.scale = new Vector3(1, 1, 1)
    // camera.updateMatrix()
    // camera.updateMatrixWorld()
    // // console.log('-reset camera-', Date.now())
  }
  const addAxes = (size) => {
    let axes = new AxesHelper(size)
    axes.name = 'axesHelper'
    if (!ud.scene.getObjectByName(axes.name)) ud.scene.add(axes)
    threeFrame()
  }
  const threeAdd = (mesh) => {
    group.add(mesh)
    updateCameraViewport()
    threeFrame()
  }
  const threeRemoveByName = (meshName) => {
    let child = group.children.filter((e) => e.name == meshName)
    if (child.length > 0) {
      group.remove(child[0])
    }
    threeFrame()
  }
  const threeEmpty = () => {
    group.clear()
    threeFrame()
  }
  const threeSide = (side) => {
    // return
    const {center} = getBox()
    ud.control.handleResize()
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
  const threeScreenshot = (isBuffer, idx) => {
    ud.renderer.clear()
    ud.renderer.render(ud.scene, ud.camera)
    return new Promise((resolve) => {
      let canvas = ud.renderer.domElement
      if (isBuffer) {
        canvas.toBlob((blob) => {
          resolve({ blob: blob, idx: idx })
        }, 'image/png')
      } else {
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    })
  }
  const threeSequenceImages = (w, h, name) => {
    function oneScreenshot(arg, idx) {
      return new Promise((resolve) => {
        // group.rotateX(arg.x)
        group.rotateY(arg.y)
        threeFrame(() => {
          updateResize(w, h)
          threeFrame(() => {
            let res = threeScreenshot(true, idx)
            group.rotateY(-arg.y)
            // group.rotateX(-arg.x);
            threeFrame(() => {
              resolve(res)
            })
          })
        })
      })
    }
    async function queue(arr) {
      // updateResize(w, h, true)
      let result = []
      for (let i = 0; i < arr.length; i++) {
        let res = await oneScreenshot(arr[i], i)
        if (res) {
          result.push(res)
        }
      }
      threeFrame()
      return result
    }
    return new Promise((resolve, reject) => {
      if (model.sequence) {
        // console.log('screen image', '-waiting-')
        reject('waiting')
      }
      if (model.oldwidth !== rc.width || model.oldheight !== rc.height) {
        // console.log('screen image', 'not restore size')
      }
      model.sequence = true
      model.oldwidth = rc.width
      model.oldheight = rc.height
      let hasMesh = false
      group.children.forEach((mesh) => {
        if (mesh.name == name) {
          mesh.visible = true
          hasMesh = true
        } else mesh.visible = false
      })
      if (!hasMesh) {
        model.sequence = false
        resolve('no-mesh')
      }
      return queue(xyzSequence).then((res) => {
        updateResize(model.oldwidth, model.oldheight, true)
        group.children.forEach((mesh) => {
          mesh.visible = true
        })
        resetGroup()
        threeFrame()
        model.sequence = false
        resolve(res)
      })
    })
  }
  return {
    model,
    addAxes,
    group,
    ud,
    resetCamera,
    resetGroup,
    threeInit,
    threeEventLoop,
    threeAnimate,
    threeDispose,
    threeUseRender,
    threeFrame,
    threeResize,
    threeSide,
    threeAdd,
    threeRemoveByName,
    threeEmpty,
    threeGrid,
    threeLoading,
    threeScreenshot,
    threeSequenceImages,
  }
})()

export default mqThree
