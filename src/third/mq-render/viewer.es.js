import { C as Color, V as Vector3, q as Camera, P as PerspectiveCamera, O as OrthographicCamera, b as Matrix4, v as viewDir, r as Mesh, s as PlaneGeometry, u as ShaderMaterial, w as AlwaysDepth, E as EventDispatcher, x as Vector2, M as MqRender, e as eColorState, S as SRGBColorSpace, a as StrSprite, f as PointLight, D as DirectionalLight, A as AmbientLight, T as TrackballControls, y as LinearSRGBColorSpace, z as MeshPhongMaterial, I as DoubleSide, J as BufferAttribute, K as MeshStandardMaterial, N as materiallegacyCrownShader, Q as materialGumShader, R as BufferGeometry, U as InstancedBufferAttribute, W as InterleavedBuffer, X as InterleavedBufferAttribute, Y as TrianglesDrawMode, Z as TriangleFanDrawMode, _ as TriangleStripDrawMode, $ as Float32BufferAttribute, a0 as Plane, a1 as Line3, a2 as Triangle, a3 as Sphere, a4 as Box3, a5 as BackSide, a6 as FrontSide, a7 as BatchedMesh, a8 as Ray, a9 as ObjectLoader, aa as Scene, ab as AxesHelper, ac as Quaternion, B as BoxGeometry, ad as TubeGeometry, ae as SphereGeometry, i as CylinderGeometry, af as ConeGeometry, ag as MeshBasicMaterial, ah as ObjectSpaceNormalMap, ai as CatmullRomCurve3 } from "./tooth-Cjf2t_8G.js";
import { F, ao, j, p, am, n, l, an, o, h, m, k, aj, ak, al } from "./tooth-Cjf2t_8G.js";
const themeDefault = {
  name: "Default",
  lights: [
    {
      type: "ambient",
      color: new Color().setRGB(0.9, 0.9, 0.9),
      intensity: 1.2
    },
    {
      type: "point",
      color: new Color().setRGB(0.5, 0.5, 0.7),
      position: new Vector3(-1, 1, 4),
      distance: 300,
      intensity: 2.5
    },
    {
      type: "point",
      color: new Color().setRGB(0.7, 0.5, 0.5),
      position: new Vector3(1, -1, 4),
      distance: 300,
      intensity: 2.5
    },
    {
      type: "directional",
      color: new Color().setRGB(1, 1, 1),
      position: new Vector3(0, 0, 3),
      intensity: 1.2
    }
  ]
};
const CacheTheme = /* @__PURE__ */ new Map();
CacheTheme.set("Default", themeDefault);
function getThemeByName(name) {
  let theme;
  {
    theme = CacheTheme.get(
      "Default"
      /* default */
    );
  }
  if (theme) return theme;
  throw new Error("no valid theme");
}
function setXYZ(arr, i, x, y, z) {
  arr[i + 0] = x;
  arr[i + 1] = y;
  arr[i + 2] = z;
}
function inMinMax(current, min, max) {
  return Math.min(Math.max(current, min), max);
}
function minimalValue(value) {
  return Math.max(value, 0.01);
}
function getVFov(aspect, hFov) {
  return 2 * Math.atan(Math.tan(hFov / 2) / aspect);
}
function frustumHeightAtDistance(camera, distance) {
  const vFov = camera.fov * Math.PI / 180;
  return Math.tan(vFov / 2) * distance * 2;
}
function frustumWidthAtDistance(camera, distance) {
  return frustumHeightAtDistance(camera, distance) * camera.aspect;
}
class SwitchCamera extends Camera {
  constructor(cameraAngle = 20) {
    super();
    this.persp = new PerspectiveCamera();
    this.ortho = new OrthographicCamera(-1, 1, 1, -1);
    this.camera = this.persp;
    this.isOrtho = false;
    this.projectionMatrix = new Matrix4();
    this.orthoView = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.perspView = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.fov = Math.PI / 4;
    this.fovMin = Math.PI / 6;
    this.fovMax = Math.PI / 2;
    this.aspect = 1;
    this.near = 0.1;
    this.far = 1e4;
    this.zoom = 1;
    this.zoomMin = Math.PI / 4;
    this.zoomMax = Math.PI;
    this.width = 0;
    this.height = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.tan = Math.atan(cameraAngle / 2 * (Math.PI / 180));
  }
  getCamera() {
    return this.camera;
  }
  switch(control) {
    if (this.isOrtho) {
      this.toPerspective();
      this.isOrtho = false;
      this.camera = this.persp;
    } else {
      this.toOrthographic(control);
      this.isOrtho = true;
      this.camera = this.ortho;
    }
    if (control) control.object = this.camera;
  }
  updateFrustum(control, options = {}) {
    const { persp, ortho } = this;
    persp.aspect = options.width / options.height;
    const distance = ortho.position.distanceTo(control.target);
    const halfWidth = frustumWidthAtDistance(persp, distance) / 2;
    const halfHeight = frustumHeightAtDistance(persp, distance) / 2;
    const halfSize = { x: halfWidth, y: halfHeight };
    ortho.top = halfSize.y;
    ortho.bottom = -halfSize.y;
    ortho.left = -halfSize.x;
    ortho.right = halfSize.x;
  }
  toOrthographic(control) {
    const { persp, ortho, tan } = this;
    const distance = persp.position.distanceTo(control.target);
    let halfHeight = tan * distance;
    let halfWidth = halfHeight * persp.aspect;
    ortho.top = halfHeight;
    ortho.bottom = -halfHeight;
    ortho.left = -halfWidth;
    ortho.right = halfWidth;
    ortho.zoom = 1;
    console.log("to ortho ", Math.log2(distance), distance, persp.zoom, ortho.zoom);
    ortho.lookAt(control.target);
    this.syncCameraPosture(true);
    ortho.updateProjectionMatrix();
  }
  toPerspective() {
    const { persp, ortho, tan } = this;
    this.syncCameraPosture(false);
    let frustumHeight = (ortho.top - ortho.bottom) / ortho.zoom;
    let d = frustumHeight / 2 / tan;
    persp.position.copy(ortho.position).normalize().multiplyScalar(d);
    persp.updateProjectionMatrix();
  }
  syncCameraPosture(toOrtho) {
    const { persp, ortho } = this;
    if (toOrtho) {
      ortho.position.copy(persp.position);
      ortho.quaternion.copy(persp.quaternion);
      ortho.scale.copy(persp.scale);
      ortho.up.copy(persp.up);
      ortho.updateMatrix();
      ortho.updateMatrixWorld();
    } else {
      persp.position.copy(ortho.position);
      persp.quaternion.copy(ortho.quaternion);
      persp.scale.copy(ortho.scale);
      persp.up.copy(ortho.up);
      persp.updateMatrix();
      persp.updateMatrixWorld();
    }
  }
  get wPositionV() {
    const { position, quaternion } = this.camera;
    const pos = position.clone();
    const quat = quaternion.clone();
    quat.invert();
    pos.applyQuaternion(quat);
    return pos.toArray();
  }
  newOrhtoProjection() {
    const { tan } = this;
    const { near, far, zoom } = this.ortho;
    const { aspect } = this.persp;
    const height = tan * new Vector3().fromArray(this.wPositionV).z;
    const width = height * aspect;
    const projectionMatrix = new Matrix4();
    projectionMatrix.makeOrthographic(-width, width, height, -height, near, far);
    const { left, right } = function(e) {
      const t = e.elements[0], n2 = e.elements[12];
      return {
        left: -(n2 + 1) / t,
        right: (1 - n2) / t
      };
    }(projectionMatrix);
    const vpWidth = (right - left) / zoom;
    return vpWidth;
  }
  updateViewDir(code) {
    const { camera } = this;
    const data = viewDir(code);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.quaternion.identity();
    camera.scale.set(1, 1, 1);
    camera.up.set(data.up[0], data.up[1], data.up[2]);
    camera.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
    camera.updateProjectionMatrix();
  }
  getRealViewWidth() {
    const { projectionMatrix } = this.ortho;
    const { left: vpLeft, right: vpRight } = function(e) {
      const t = e.elements[0], n2 = e.elements[12];
      return {
        left: -(n2 + 1) / t,
        right: (1 - n2) / t
      };
    }(projectionMatrix);
    const width = vpRight - vpLeft;
    return width;
  }
  updateProjectionMatrix() {
    const { isOrtho, orthoView: ov, perspView: pv, near, far } = this;
    if (isOrtho) {
      this.updateOrthoView();
      this.projectionMatrix.makeOrthographic(ov.left, ov.right, ov.top, ov.bottom, near, far);
    } else {
      this.updatePerspView();
      this.projectionMatrix.makePerspective(pv.left, pv.right, pv.top, pv.bottom, near, far);
    }
  }
  getOrthoViewportWidth() {
    const { isOrtho, width, projectionMatrix, ortho } = this;
    let vpWidth = width;
    if (isOrtho) {
      const { left, right } = function(e) {
        const t = e.elements[0], n2 = e.elements[12];
        return {
          left: -(n2 + 1) / t,
          right: (1 - n2) / t
        };
      }(projectionMatrix);
      vpWidth = (right - left) / ortho.zoom;
    }
    return vpWidth;
  }
  updateOrthoView() {
    const { fov, aspect, orthoView } = this;
    let tmp = new Vector3().fromArray(this.wPositionV);
    const halfHeight = Math.tan(fov / 2) * tmp.z;
    const halfWidth = halfHeight * aspect;
    orthoView.left = -halfWidth;
    orthoView.right = halfWidth;
    orthoView.top = halfHeight;
    orthoView.bottom = -halfHeight;
  }
  updatePerspView() {
    const { fov, near, aspect, perspView, offsetX, offsetY } = this;
    const tan = Math.tan(fov / 2), halfHeight = near * tan, height = 2 * halfHeight, width = aspect * height, left = -0.5 * width * (1 + offsetX);
    perspView.left = left;
    perspView.right = left + width;
    perspView.top = halfHeight * (1 + offsetY) - height;
    perspView.bottom = halfHeight * (1 + offsetY);
  }
  updateCameraInfo() {
    this.updateProjectionMatrix();
    this.updateMatrix();
    this.updateMatrixWorld(true);
  }
  setClip(near, far) {
    this.near = near;
    this.far = far;
    this.updateCameraInfo();
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.aspect = width / height;
    this.updateCameraInfo();
  }
  setAspect(aspect) {
    if (Number.isNaN(aspect))
      throw new Error("Camera has incorrect aspect");
    this.aspect = aspect;
    this.updateCameraInfo();
  }
  resize(width, height) {
    this.setSize(width, height);
  }
  setZoom(zoom) {
    this.zoom = inMinMax(zoom, this.zoomMin, this.zoomMax);
    this.updateFov(zoom);
    this.updatePosition(zoom);
    this.updateCameraInfo();
    this.dispatchEvent({ type: "zoomChanged" });
  }
  updateFov(fov) {
    const hFov = getVFov(this.aspect, fov);
    this.fov = inMinMax(hFov, this.fovMin, this.fovMax);
  }
  updatePosition(zoom) {
    const { position, quaternion } = this;
    const t = position.clone().applyQuaternion(quaternion.clone().invert());
    t.z = minimalValue(zoom);
    this.position.copy(t.applyQuaternion(quaternion));
  }
}
class OrthoGrid1 extends Mesh {
  constructor(size) {
    const geometry = new PlaneGeometry(1, 1);
    const material = new ShaderMaterial({
      uniforms: {
        lineStep: { value: 0 },
        lineWidth: { value: 0 },
        sceneCenterX: { value: 0 },
        sceneCenterY: { value: 0 }
      },
      depthTest: false,
      depthFunc: AlwaysDepth,
      transparent: true,
      vertexShader: `			
			void main() {			
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);			
			}
			`,
      fragmentShader: `	
			uniform float lineStep;
			uniform float lineWidth;
			uniform float sceneCenterX;
			uniform float sceneCenterY;
			void main() {
				float x = sceneCenterX - gl_FragCoord.x;
				float y = sceneCenterY - gl_FragCoord.y;
				
				float regularX = abs(mod(x, lineStep));
				float regularY = abs(mod(y, lineStep));
				
				float masterX = abs(mod(x, lineStep * 10.0));
				float masterY = abs(mod(y, lineStep * 10.0));
				
				if (masterX < lineWidth || masterY < lineWidth) {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.3);
				} else if (regularX < lineWidth || regularY < lineWidth) {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
				} else {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
				}
			}
			`,
      extensions: {
        // derivatives: true
      }
    });
    super(geometry, material);
    this.unit = 1;
    this.stepSize = size || 5;
    this.onBeforeRender = (renderer, scene, camera, geometry2, material2, group) => {
    };
  }
  /**
   * 
   * @param vpWidth 
   * @param fullCamera 
   */
  updateSize(vpWidth, fullCamera) {
    const { stepSize } = this;
    let screenWidth = fullCamera.right - fullCamera.left;
    let screenHeight = fullCamera.top - fullCamera.bottom;
    const size1 = screenWidth / vpWidth;
    const tmp1 = Math.abs(stepSize / size1);
    const scale = 10 ** Math.ceil(Math.log(tmp1) / Math.log(10));
    const size1Physical = size1 * scale;
    const lineWidth = Math.ceil(window.devicePixelRatio);
    this.scale.set(screenWidth * 2, screenHeight * 2, 1);
    this.position.set(screenWidth / 2, screenHeight / 2, 0);
    const material = this.material;
    material.uniforms.lineStep.value = size1Physical;
    material.uniforms.lineWidth.value = lineWidth;
    material.uniforms.sceneCenterX.value = Math.floor(0.5 * screenWidth);
    material.uniforms.sceneCenterY.value = Math.floor(0.5 * screenHeight);
    this.unit = scale;
  }
}
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p2 in b2) if (Object.prototype.hasOwnProperty.call(b2, p2)) d2[p2] = b2[p2];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1) throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n2) {
    return function(v) {
      return step([n2, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values(o2) {
  var s = typeof Symbol === "function" && Symbol.iterator, m2 = s && o2[s], i = 0;
  if (m2) return m2.call(o2);
  if (o2 && typeof o2.length === "number") return {
    next: function() {
      if (o2 && i >= o2.length) o2 = void 0;
      return { value: o2 && o2[i++], done: !o2 };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o2, n2) {
  var m2 = typeof Symbol === "function" && o2[Symbol.iterator];
  if (!m2) return o2;
  var i = m2.call(o2), r, ar = [], e;
  try {
    while ((n2 === void 0 || n2-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m2 = i["return"])) m2.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l2 = from2.length, ar; i < l2; i++) {
    if (ar || !(i in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
      ar[i] = from2[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n2, f) {
    if (g[n2]) {
      i[n2] = function(v) {
        return new Promise(function(a, b) {
          q.push([n2, v, a, b]) > 1 || resume(n2, v);
        });
      };
      if (f) i[n2] = f(i[n2]);
    }
  }
  function resume(n2, v) {
    try {
      step(g[n2](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o2) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m2 = o2[Symbol.asyncIterator], i;
  return m2 ? m2.call(o2) : (o2 = typeof __values === "function" ? __values(o2) : o2[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n2) {
    i[n2] = o2[n2] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o2[n2](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function isFunction(value) {
  return typeof value === "function";
}
function createErrorClass(createImpl) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}
var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});
function arrRemove(arr, item) {
  if (arr) {
    var index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}
var Subscription = function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  }();
  return Subscription2;
}();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}
var config = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false
};
var timeoutProvider = {
  setTimeout: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function(handle) {
    var delegate = timeoutProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
  },
  delegate: void 0
};
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    {
      throw err;
    }
  });
}
function noop() {
}
function errorContext(cb) {
  {
    cb();
  }
}
var Subscriber = function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) ;
    else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
}(Subscription);
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
  return _bind.call(fn, thisArg);
}
var ConsumerObserver = function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
}();
var SafeSubscriber = function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      var context_1;
      if (_this && config.useDeprecatedNextContext) {
        context_1 = Object.create(observerOrNext);
        context_1.unsubscribe = function() {
          return _this.unsubscribe();
        };
        partialObserver = {
          next: observerOrNext.next && bind(observerOrNext.next, context_1),
          error: observerOrNext.error && bind(observerOrNext.error, context_1),
          complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
        };
      } else {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
}(Subscriber);
function handleUnhandledError(error) {
  {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};
var observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();
function identity(x) {
  return x;
}
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}
var Observable = function() {
  function Observable2(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function(operator) {
    var observable2 = new Observable2();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function() {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable2.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable2.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable2.prototype._subscribe = function(subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function() {
    return this;
  };
  Observable2.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable2.create = function(subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
}();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
}(Subscriber);
var ObjectUnsubscribedError = createErrorClass(function(_super) {
  return function ObjectUnsubscribedErrorImpl() {
    _super(this);
    this.name = "ObjectUnsubscribedError";
    this.message = "object unsubscribed";
  };
});
var Subject = function(_super) {
  __extends(Subject2, _super);
  function Subject2() {
    var _this = _super.call(this) || this;
    _this.closed = false;
    _this.currentObservers = null;
    _this.observers = [];
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject2.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject2.prototype._throwIfClosed = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  };
  Subject2.prototype.next = function(value) {
    var _this = this;
    errorContext(function() {
      var e_1, _a;
      _this._throwIfClosed();
      if (!_this.isStopped) {
        if (!_this.currentObservers) {
          _this.currentObservers = Array.from(_this.observers);
        }
        try {
          for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
            var observer = _c.value;
            observer.next(value);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
    });
  };
  Subject2.prototype.error = function(err) {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.hasError = _this.isStopped = true;
        _this.thrownError = err;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().error(err);
        }
      }
    });
  };
  Subject2.prototype.complete = function() {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.isStopped = true;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().complete();
        }
      }
    });
  };
  Subject2.prototype.unsubscribe = function() {
    this.isStopped = this.closed = true;
    this.observers = this.currentObservers = null;
  };
  Object.defineProperty(Subject2.prototype, "observed", {
    get: function() {
      var _a;
      return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
    },
    enumerable: false,
    configurable: true
  });
  Subject2.prototype._trySubscribe = function(subscriber) {
    this._throwIfClosed();
    return _super.prototype._trySubscribe.call(this, subscriber);
  };
  Subject2.prototype._subscribe = function(subscriber) {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  };
  Subject2.prototype._innerSubscribe = function(subscriber) {
    var _this = this;
    var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
    if (hasError || isStopped) {
      return EMPTY_SUBSCRIPTION;
    }
    this.currentObservers = null;
    observers.push(subscriber);
    return new Subscription(function() {
      _this.currentObservers = null;
      arrRemove(observers, subscriber);
    });
  };
  Subject2.prototype._checkFinalizedStatuses = function(subscriber) {
    var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  };
  Subject2.prototype.asObservable = function() {
    var observable2 = new Observable();
    observable2.source = this;
    return observable2;
  };
  Subject2.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject2;
}(Observable);
var AnonymousSubject = function(_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function(value) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
  };
  AnonymousSubject2.prototype.error = function(err) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
  };
  AnonymousSubject2.prototype.complete = function() {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
  };
  AnonymousSubject2.prototype._subscribe = function(subscriber) {
    var _a, _b;
    return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
  };
  return AnonymousSubject2;
}(Subject);
function isScheduler(value) {
  return value && isFunction(value.schedule);
}
function last(arr) {
  return arr[arr.length - 1];
}
function popScheduler(args) {
  return isScheduler(last(args)) ? args.pop() : void 0;
}
function popNumber(args, defaultValue) {
  return typeof last(args) === "number" ? args.pop() : defaultValue;
}
var isArrayLike = function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
};
function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}
function isInteropObservable(input) {
  return isFunction(input[observable]);
}
function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();
function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}
function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done) return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
function innerFrom(input) {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable(function(subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable(function(subscriber) {
    for (var i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable(function(subscriber) {
    promise.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable(function(subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable(function(subscriber) {
    process(asyncIterable, subscriber).catch(function(err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter(this, void 0, void 0, function() {
    var value, e_2_1;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2) throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}
function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
  if (delay === void 0) {
    delay = 0;
  }
  if (repeat === void 0) {
    repeat = false;
  }
  var scheduleSubscription = scheduler.schedule(function() {
    work();
    if (repeat) {
      parentSubscription.add(this.schedule(null, delay));
    } else {
      this.unsubscribe();
    }
  }, delay);
  parentSubscription.add(scheduleSubscription);
  if (!repeat) {
    return scheduleSubscription;
  }
}
function observeOn(scheduler, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return operate(function(source, subscriber) {
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.next(value);
      }, delay);
    }, function() {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.complete();
      }, delay);
    }, function(err) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.error(err);
      }, delay);
    }));
  });
}
function subscribeOn(scheduler, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return operate(function(source, subscriber) {
    subscriber.add(scheduler.schedule(function() {
      return source.subscribe(subscriber);
    }, delay));
  });
}
function scheduleObservable(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
function schedulePromise(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
function scheduleArray(input, scheduler) {
  return new Observable(function(subscriber) {
    var i = 0;
    return scheduler.schedule(function() {
      if (i === input.length) {
        subscriber.complete();
      } else {
        subscriber.next(input[i++]);
        if (!subscriber.closed) {
          this.schedule();
        }
      }
    });
  });
}
function scheduleIterable(input, scheduler) {
  return new Observable(function(subscriber) {
    var iterator$1;
    executeSchedule(subscriber, scheduler, function() {
      iterator$1 = input[iterator]();
      executeSchedule(subscriber, scheduler, function() {
        var _a;
        var value;
        var done;
        try {
          _a = iterator$1.next(), value = _a.value, done = _a.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
        }
      }, 0, true);
    });
    return function() {
      return isFunction(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return();
    };
  });
}
function scheduleAsyncIterable(input, scheduler) {
  if (!input) {
    throw new Error("Iterable cannot be null");
  }
  return new Observable(function(subscriber) {
    executeSchedule(subscriber, scheduler, function() {
      var iterator2 = input[Symbol.asyncIterator]();
      executeSchedule(subscriber, scheduler, function() {
        iterator2.next().then(function(result) {
          if (result.done) {
            subscriber.complete();
          } else {
            subscriber.next(result.value);
          }
        });
      }, 0, true);
    });
  });
}
function scheduleReadableStreamLike(input, scheduler) {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}
function scheduled(input, scheduler) {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function from(input, scheduler) {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}
function map(project, thisArg) {
  return operate(function(source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      subscriber.next(project.call(thisArg, value, index++));
    }));
  });
}
var isArray$1 = Array.isArray;
function callOrApply(fn, args) {
  return isArray$1(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
  return map(function(args) {
    return callOrApply(fn, args);
  });
}
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
  var buffer = [];
  var active = 0;
  var index = 0;
  var isComplete = false;
  var checkComplete = function() {
    if (isComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };
  var outerNext = function(value) {
    return active < concurrent ? doInnerSub(value) : buffer.push(value);
  };
  var doInnerSub = function(value) {
    active++;
    var innerComplete = false;
    innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
      {
        subscriber.next(innerValue);
      }
    }, function() {
      innerComplete = true;
    }, void 0, function() {
      if (innerComplete) {
        try {
          active--;
          var _loop_1 = function() {
            var bufferedValue = buffer.shift();
            if (innerSubScheduler) ;
            else {
              doInnerSub(bufferedValue);
            }
          };
          while (buffer.length && active < concurrent) {
            _loop_1();
          }
          checkComplete();
        } catch (err) {
          subscriber.error(err);
        }
      }
    }));
  };
  source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
    isComplete = true;
    checkComplete();
  }));
  return function() {
  };
}
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  if (isFunction(resultSelector)) {
    return mergeMap(function(a, i) {
      return map(function(b, ii) {
        return resultSelector(a, b, i, ii);
      })(innerFrom(project(a, i)));
    }, concurrent);
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return operate(function(source, subscriber) {
    return mergeInternals(source, subscriber, project, concurrent);
  });
}
function mergeAll(concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  return mergeMap(identity, concurrent);
}
var nodeEventEmitterMethods = ["addListener", "removeListener"];
var eventTargetMethods = ["addEventListener", "removeEventListener"];
var jqueryMethods = ["on", "off"];
function fromEvent(target, eventName, options, resultSelector) {
  if (isFunction(options)) {
    resultSelector = options;
    options = void 0;
  }
  if (resultSelector) {
    return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs(resultSelector));
  }
  var _a = __read(isEventTarget(target) ? eventTargetMethods.map(function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler, options);
    };
  }) : isNodeStyleEventEmitter(target) ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName)) : isJQueryStyleEventEmitter(target) ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName)) : [], 2), add = _a[0], remove = _a[1];
  if (!add) {
    if (isArrayLike(target)) {
      return mergeMap(function(subTarget) {
        return fromEvent(subTarget, eventName, options);
      })(innerFrom(target));
    }
  }
  if (!add) {
    throw new TypeError("Invalid event target");
  }
  return new Observable(function(subscriber) {
    var handler = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return subscriber.next(1 < args.length ? args : args[0]);
    };
    add(handler);
    return function() {
      return remove(handler);
    };
  });
}
function toCommonHandlerRegistry(target, eventName) {
  return function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler);
    };
  };
}
function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
  return isFunction(target.on) && isFunction(target.off);
}
function isEventTarget(target) {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}
var isArray = Array.isArray;
function argsOrArgArray(args) {
  return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
function merge() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  var concurrent = popNumber(args, Infinity);
  args = argsOrArgArray(args);
  return operate(function(source, subscriber) {
    mergeAll(concurrent)(from(__spreadArray([source], __read(args)), scheduler)).subscribe(subscriber);
  });
}
function mergeWith() {
  var otherSources = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    otherSources[_i] = arguments[_i];
  }
  return merge.apply(void 0, __spreadArray([], __read(otherSources)));
}
function share(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.connector, connector = _a === void 0 ? function() {
    return new Subject();
  } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
  return function(wrapperSource) {
    var connection;
    var resetConnection;
    var subject;
    var refCount = 0;
    var hasCompleted = false;
    var hasErrored = false;
    var cancelReset = function() {
      resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
      resetConnection = void 0;
    };
    var reset = function() {
      cancelReset();
      connection = subject = void 0;
      hasCompleted = hasErrored = false;
    };
    var resetAndUnsubscribe = function() {
      var conn = connection;
      reset();
      conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
    };
    return operate(function(source, subscriber) {
      refCount++;
      if (!hasErrored && !hasCompleted) {
        cancelReset();
      }
      var dest = subject = subject !== null && subject !== void 0 ? subject : connector();
      subscriber.add(function() {
        refCount--;
        if (refCount === 0 && !hasErrored && !hasCompleted) {
          resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
        }
      });
      dest.subscribe(subscriber);
      if (!connection && refCount > 0) {
        connection = new SafeSubscriber({
          next: function(value) {
            return dest.next(value);
          },
          error: function(err) {
            hasErrored = true;
            cancelReset();
            resetConnection = handleReset(reset, resetOnError, err);
            dest.error(err);
          },
          complete: function() {
            hasCompleted = true;
            cancelReset();
            resetConnection = handleReset(reset, resetOnComplete);
            dest.complete();
          }
        });
        innerFrom(source).subscribe(connection);
      }
    })(wrapperSource);
  };
}
function handleReset(reset, on) {
  var args = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    args[_i - 2] = arguments[_i];
  }
  if (on === true) {
    reset();
    return;
  }
  if (on === false) {
    return;
  }
  var onSubscriber = new SafeSubscriber({
    next: function() {
      onSubscriber.unsubscribe();
      reset();
    }
  });
  return innerFrom(on.apply(void 0, __spreadArray([], __read(args)))).subscribe(onSubscriber);
}
function tap(observerOrNext, error, complete) {
  var tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error, complete } : observerOrNext;
  return tapObserver ? operate(function(source, subscriber) {
    var _a;
    (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
    var isUnsub = true;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var _a2;
      (_a2 = tapObserver.next) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, value);
      subscriber.next(value);
    }, function() {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.complete) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      subscriber.complete();
    }, function(err) {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.error) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, err);
      subscriber.error(err);
    }, function() {
      var _a2, _b;
      if (isUnsub) {
        (_a2 = tapObserver.unsubscribe) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      }
      (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
    }));
  }) : identity;
}
const cSupportEventName = [
  "touchstart",
  "touchmove",
  "touchend",
  "mouseleave",
  "mousedown",
  "mousemove",
  "mouseup",
  "wheel",
  "keydown",
  "keyup",
  "contextmenu"
];
const cKeyboardEventName = ["keydown", "keyup"];
class EventPool extends EventDispatcher {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.preventMouse = (e) => {
      if ("TouchEvent" in window && e instanceof TouchEvent) e.preventDefault();
    };
    this.getMerge = (eName) => {
      switch (eName) {
        case "mousedown":
          return this.streamPool.touchstart;
        case "mousemove":
          return this.streamPool.touchmove;
        case "mouseup":
          return this.streamPool.touchend;
        default:
          return new Subject();
      }
    };
    this.pick = (e) => {
      this.normalizeCoords(e);
      return {
        e,
        first: false,
        data: {}
      };
    };
    this.streamPool = {};
  }
  createStream() {
    cSupportEventName.forEach((eName) => {
      const target = cKeyboardEventName.includes(eName) ? window : this.canvas;
      if (!target) throw new Error("un-bind canvas");
      const observer = fromEvent(target, eName);
      this.streamPool[eName] = observer.pipe(
        tap(this.preventMouse),
        map(this.pick),
        mergeWith(this.getMerge(eName)),
        share()
      );
    });
    this.streamPool.documenttouchend = fromEvent(document, "touchend").pipe(
      map((e) => ({ e })),
      share()
    );
    this.streamPool.documentmouseup = fromEvent(document, "mouseup").pipe(
      map((e) => ({ e })),
      mergeWith(this.streamPool.documenttouchend),
      share()
    );
    this.streamPool.documentmousedown = fromEvent(document, "mousedown").pipe(
      map(this.pick),
      share()
    );
    Object.keys(this.streamPool).forEach((key) => {
      this.streamPool[key].subscribe(() => {
      });
    });
  }
  normalizeCoords(evt) {
    const rc = this.canvas.getBoundingClientRect();
    let x, y;
    if ("TouchEvent" in window && evt instanceof TouchEvent) {
      x = evt.changedTouches[0].clientX;
      y = evt.changedTouches[0].clientY;
    } else {
      if (["keydown", "keyup"].includes(evt.type)) return;
      if (!(evt instanceof MouseEvent)) {
        console.log(evt.type);
        throw new Error("Unknown type of event");
      }
      x = evt.clientX;
      y = evt.clientY;
    }
    x = x - rc.left;
    y = y - rc.top;
    return new Vector2(x, y);
  }
  getCanvas() {
    return this.canvas;
  }
}
var eEntryCode = /* @__PURE__ */ ((eEntryCode2) => {
  eEntryCode2[eEntryCode2["none"] = 0] = "none";
  eEntryCode2[eEntryCode2["webui"] = 1] = "webui";
  return eEntryCode2;
})(eEntryCode || {});
class MqMultiViewEditor extends MqRender {
  constructor(entryCode = 0) {
    super("multi-view-render", eColorState.currently);
    this.entryCode = entryCode;
    this.cameraAngle = 20;
    this.cameraFar = 1e4;
    this.tan = 1;
    this.theme = getThemeByName();
    this.compiledLights = /* @__PURE__ */ new WeakMap();
    this.camera = new SwitchCamera(this.cameraAngle);
  }
  init(options, theme) {
    var _a;
    const { cameraNear, cameraAngle, cameraFar } = this;
    super.init(options);
    this.renderer.outputColorSpace = SRGBColorSpace;
    const ratio = options.width / options.height;
    const halfW = options.width / 2, halfH = options.height / 2;
    const totalView = ((_a = options.viewStateList) == null ? void 0 : _a.length) || 1;
    this.camera.ortho = new OrthographicCamera(-halfW, halfW, halfH, -halfH, cameraNear, cameraFar);
    this.camera.ortho.position.set(0, 0, options.cameraPositionZ);
    this.camera.persp = new PerspectiveCamera(cameraAngle, ratio, cameraNear, cameraFar);
    this.camera.persp.position.set(0, 0, options.cameraPositionZ);
    this.camera.isOrtho = false;
    this.camera.camera = this.camera.persp;
    const { domElement } = this.renderer;
    const winResize = () => {
      const { clientWidth, clientHeight } = domElement.parentElement;
      this.resize(clientWidth, clientHeight);
    };
    window.addEventListener("resize", winResize);
    this.resize(options.width, options.height);
    if (options.useControl) {
      this.initControl();
    }
    this.applyAppearance(theme);
    this.cameraOrtho = new OrthographicCamera(-halfW, halfW, halfH, -halfH, cameraNear, cameraFar);
    this.cameraOrtho.position.z = 10;
    if (options.useGrid) {
      const sizeScale = 80;
      this.meshGrid = new OrthoGrid1(5);
      this.sceneOrtho.add(this.meshGrid);
      this.labelUnit = new StrSprite("10", {
        hasPostfix: true,
        fontInfo: "100 32px sans-serif",
        fillStyle: "red"
      });
      this.labelUnit.target.center.set(0.5, 0.5 / totalView);
      this.labelUnit.target.scale.set(sizeScale, sizeScale, 1);
      this.labelUnit.target.position.set(0, +options.height * 0.4, 0);
      this.labelUnit.target.visible = true;
      this.sceneOrtho.add(this.labelUnit.target);
    }
    this.ePool = new EventPool(this.renderer.domElement);
    this.ePool.createStream();
  }
  applyAppearance(theme = this.theme) {
    const { viewStateList } = this.options;
    if (void 0 !== this.currentLights) {
      this.currentLights.forEach((light) => {
        if (this.compiledLights.has(light)) {
          const instance = this.compiledLights.get(light);
          if (instance instanceof PointLight || instance instanceof DirectionalLight) this.camera.persp.remove(instance);
          else {
            viewStateList == null ? void 0 : viewStateList.forEach((view, index) => {
              var _a, _b, _c;
              if (index == 0) (_a = view.scene) == null ? void 0 : _a.remove(instance);
              else {
                const al2 = (_b = view.scene) == null ? void 0 : _b.getObjectByName("AmbientLight");
                if (al2) (_c = view.scene) == null ? void 0 : _c.remove(al2);
              }
            });
          }
        }
      });
    }
    this.currentLights = theme.lights.map((e) => Object.assign({}, e));
    this.applyLights();
  }
  applyLights(lightData) {
    const { viewStateList } = this.options;
    const lights = lightData || this.currentLights || [];
    lights.forEach((light) => {
      if ("point" === light.type) {
        if (!this.compiledLights.has(light)) {
          const pointLight = new PointLight(light.color, light.intensity, light.distance);
          pointLight.name = "PointLight";
          if (light.position) pointLight.position.copy(light.position);
          this.compiledLights.set(light, pointLight);
          this.camera.persp.add(pointLight);
          this.camera.ortho.add(pointLight.clone());
        }
      } else if ("directional" === light.type) {
        if (!this.compiledLights.has(light)) {
          const dirLight = new DirectionalLight(light.color, light.intensity);
          dirLight.name = "DirectionalLight";
          if (light.position) dirLight.position.copy(light.position);
          this.compiledLights.set(light, dirLight);
          this.camera.persp.add(dirLight);
          this.camera.ortho.add(dirLight.clone());
        }
      } else if ("ambient" === light.type && !this.compiledLights.has(light)) {
        const ambientLight = new AmbientLight(light.color, light.intensity);
        ambientLight.name = "AmbientLight";
        this.compiledLights.set(light, ambientLight);
        viewStateList == null ? void 0 : viewStateList.forEach((view, index) => {
          var _a;
          (_a = view.scene) == null ? void 0 : _a.add(index == 0 ? ambientLight : ambientLight.clone());
        });
      }
    });
  }
  resize(width, height) {
    const { rc, renderer } = this;
    let newWidth = rc.width;
    let newHeight = rc.height;
    if (width) {
      newWidth = width;
      rc.width = width;
    }
    if (height) {
      newHeight = height;
      rc.height = height;
    }
    renderer.setSize(newWidth, newHeight);
  }
  callAnimate() {
    const { rc, renderer, control, camera, sceneOrtho, cameraOrtho, options } = this;
    if (!renderer) return;
    renderer.setPixelRatio(rc.dpr);
    const animate = (t) => {
      var _a, _b;
      this.oneFrame(camera.getCamera());
      if (control) control.update();
      if (camera.isOrtho) {
        let total = ((_a = options.viewStateList) == null ? void 0 : _a.length) || 1;
        if (this.meshGrid) {
          this.meshGrid.updateSize(camera.newOrhtoProjection() * total, cameraOrtho);
          (_b = this.labelUnit) == null ? void 0 : _b.update(this.meshGrid.unit.toString());
        }
        renderer.setViewport(0, 0, rc.width, rc.height);
        renderer.setScissor(0, 0, rc.width, rc.height);
        renderer.setScissorTest(true);
        renderer.render(sceneOrtho, cameraOrtho);
      }
      renderer.getContext().finish();
    };
    renderer.setAnimationLoop(animate);
  }
  initControl() {
    const { camera, renderer, options } = this;
    if (!options.useControl) return;
    if (!this.control) {
      const { domElement } = renderer;
      const control = new TrackballControls(camera.getCamera(), domElement);
      control.zoomSpeed = 1.2;
      control.panSpeed = 0.5;
      control.rotateSpeed = 1;
      control.noZoom = false;
      control.noPan = false;
      control.noRotate = false;
      control.keys = ["65", "83", "68"];
      control.target.set(0, 0, 0);
      control.minZoom = 0.01;
      control.maxZoom = 90;
      this.control = control;
    }
    if (this.control.screen.width < 1 || this.control.screen.height < 1) {
      this.control.handleResize();
    }
    this.control.update();
  }
  updateWindowSize(width, height) {
    const { rc } = this;
    rc.width = width;
    rc.height = height;
    this.resize(width, height);
  }
  computeSceneBox() {
    var _a;
    const { options, cameraAngle, camera } = this;
    const sides = [];
    (_a = options.viewStateList) == null ? void 0 : _a.forEach((view) => {
      const box = this.getBox(view.scene);
      const side = Math.max(box.size.x, box.size.y, box.size.z);
      sides.push({ side, box });
    });
    let idx = 0, maxSide = sides[0].side;
    for (let i = 1; i < sides.length; i++) {
      if (sides[idx].side < sides[i].side) {
        idx = i;
        maxSide = sides[i].side;
      }
    }
    this.centerScene = sides[idx].box.size;
    this.tan = Math.atan(cameraAngle / 2 * (Math.PI / 180));
    camera.persp.position.z = maxSide * 3;
    camera.ortho.position.z = maxSide * 3;
  }
  switchCamera() {
    const { control, camera } = this;
    camera.switch(control);
    this.updateFrame();
  }
  add(mesh, name) {
    var _a;
    const { options: inOptions, entryCode } = this;
    (_a = inOptions.viewStateList) == null ? void 0 : _a.forEach((view) => {
      var _a2;
      if (view.name == name) (_a2 = view.scene) == null ? void 0 : _a2.add(mesh);
    });
    if ([
      1
      /* webui */
    ].includes(entryCode)) {
      this.cameraFitViewport();
      this.computeSceneBox();
    }
    this.updateFrame();
  }
  remove(name) {
    var _a;
    const { options: inOptions, entryCode } = this;
    (_a = inOptions.viewStateList) == null ? void 0 : _a.forEach((view) => {
      var _a2, _b;
      const obj = (_a2 = view.scene) == null ? void 0 : _a2.getObjectByName(name);
      if (obj) (_b = view.scene) == null ? void 0 : _b.remove(obj);
    });
    if ([
      1
      /* webui */
    ].includes(entryCode)) {
      this.cameraFitViewport();
      this.computeSceneBox();
    }
    this.updateFrame();
  }
  updateFrame() {
    const { camera } = this;
    this.oneFrame(camera.getCamera());
  }
  cameraFitViewport() {
    const { options, camera, renderer } = this;
    if (!options || !renderer) return;
    if (!options.viewStateList) return;
    const theScene = options.viewStateList[0].scene;
    const { size } = this.getBox(theScene);
    const maxside = Math.max(size.x, size.y, size.z);
    const aspect = renderer.domElement.width / renderer.domElement.height;
    let fitSideH = maxside * Math.sqrt(3);
    let fitSideV = fitSideH / aspect;
    console.log(fitSideH, fitSideV, maxside);
    const persp = camera.persp;
    persp.projectionMatrix.makePerspective(-fitSideH, fitSideH, fitSideV, -fitSideV, persp.near, persp.far);
    persp.updateProjectionMatrix();
  }
}
var eMaterialReplace = /* @__PURE__ */ ((eMaterialReplace2) => {
  eMaterialReplace2["crown"] = "crown-origin";
  eMaterialReplace2["generateGum"] = "generate-gum";
  eMaterialReplace2["jawBone"] = "jaw-bone";
  eMaterialReplace2["fusionTooth"] = "fusion-tooth";
  return eMaterialReplace2;
})(eMaterialReplace || {});
const colorJawBone = new Color().setRGB(243 / 255, 219 / 255, 201 / 255, LinearSRGBColorSpace);
const colorFusionToothRoot = new Color().setRGB(232 / 255, 217 / 255, 213 / 255);
const colorFusionToothCrown = new Color().setRGB(180 / 255, 180 / 255, 180 / 255);
function attributeVFlag(geometry) {
  let colors = geometry.attributes.color.array;
  let vflag = void 0;
  if (geometry.attributes.VFlag) vflag = geometry.attributes.VFlag.array;
  for (let i = 0, il = colors.length; i < il; i += 3) {
    let idx = Math.floor(i / 3);
    if (vflag && vflag[idx] == 1) {
      setXYZ(colors, i, colorFusionToothRoot.r, colorFusionToothRoot.g, colorFusionToothRoot.b);
    } else {
      setXYZ(colors, i, colorFusionToothCrown.r, colorFusionToothCrown.g, colorFusionToothCrown.b);
    }
  }
}
function toMeshWithMaterialReplace(geometry, eType, userData = {}) {
  let material;
  if (eType == "fusion-tooth") {
    material = new MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      side: DoubleSide
    });
    geometry.deleteAttribute("color");
    const colors = new Float32Array(geometry.attributes.position.array.length);
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    attributeVFlag(geometry);
    geometry.computeBoundingBox();
  } else if (eType == "jaw-bone") {
    material = new MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      side: DoubleSide,
      opacity: 0.8,
      transparent: true
    });
    geometry.deleteAttribute("color");
    const colors = new Float32Array(geometry.attributes.position.array.length);
    for (let i = 0, il = colors.length; i < il; i += 3) setXYZ(colors, i, colorJawBone.r, colorJawBone.g, colorJawBone.b);
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.computeBoundingBox();
  } else if (eType == "crown-origin") {
    material = materiallegacyCrownShader(geometry, userData.isUpper);
  } else if (eType == "generate-gum") {
    material = materialGumShader();
  } else {
    throw new Error(`un-support material type ${eType}`);
  }
  if (material) return new Mesh(geometry, material);
}
function computeMikkTSpaceTangents(geometry, MikkTSpace, negateSign = true) {
  if (!MikkTSpace || !MikkTSpace.isReady) {
    throw new Error("BufferGeometryUtils: Initialized MikkTSpace library required.");
  }
  if (!geometry.hasAttribute("position") || !geometry.hasAttribute("normal") || !geometry.hasAttribute("uv")) {
    throw new Error('BufferGeometryUtils: Tangents require "position", "normal", and "uv" attributes.');
  }
  function getAttributeArray(attribute) {
    if (attribute.normalized || attribute.isInterleavedBufferAttribute) {
      const dstArray = new Float32Array(attribute.count * attribute.itemSize);
      for (let i = 0, j2 = 0; i < attribute.count; i++) {
        dstArray[j2++] = attribute.getX(i);
        dstArray[j2++] = attribute.getY(i);
        if (attribute.itemSize > 2) {
          dstArray[j2++] = attribute.getZ(i);
        }
      }
      return dstArray;
    }
    if (attribute.array instanceof Float32Array) {
      return attribute.array;
    }
    return new Float32Array(attribute.array);
  }
  const _geometry = geometry.index ? geometry.toNonIndexed() : geometry;
  const tangents = MikkTSpace.generateTangents(
    getAttributeArray(_geometry.attributes.position),
    getAttributeArray(_geometry.attributes.normal),
    getAttributeArray(_geometry.attributes.uv)
  );
  if (negateSign) {
    for (let i = 3; i < tangents.length; i += 4) {
      tangents[i] *= -1;
    }
  }
  _geometry.setAttribute("tangent", new BufferAttribute(tangents, 4));
  if (geometry !== _geometry) {
    geometry.copy(_geometry);
  }
  return geometry;
}
function mergeGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null;
  const attributesUsed = new Set(Object.keys(geometries[0].attributes));
  const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
  const attributes = {};
  const morphAttributes = {};
  const morphTargetsRelative = geometries[0].morphTargetsRelative;
  const mergedGeometry = new BufferGeometry();
  let offset = 0;
  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i];
    let attributesCount = 0;
    if (isIndexed !== (geometry.index !== null)) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");
      return null;
    }
    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.');
        return null;
      }
      if (attributes[name] === void 0) attributes[name] = [];
      attributes[name].push(geometry.attributes[name]);
      attributesCount++;
    }
    if (attributesCount !== attributesUsed.size) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". Make sure all geometries have the same number of attributes.");
      return null;
    }
    if (morphTargetsRelative !== geometry.morphTargetsRelative) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". .morphTargetsRelative must be consistent throughout all geometries.");
      return null;
    }
    for (const name in geometry.morphAttributes) {
      if (!morphAttributesUsed.has(name)) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ".  .morphAttributes must be consistent throughout all geometries.");
        return null;
      }
      if (morphAttributes[name] === void 0) morphAttributes[name] = [];
      morphAttributes[name].push(geometry.morphAttributes[name]);
    }
    if (useGroups) {
      let count;
      if (isIndexed) {
        count = geometry.index.count;
      } else if (geometry.attributes.position !== void 0) {
        count = geometry.attributes.position.count;
      } else {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + i + ". The geometry must have either an index or a position attribute");
        return null;
      }
      mergedGeometry.addGroup(offset, count, i);
      offset += count;
    }
  }
  if (isIndexed) {
    let indexOffset = 0;
    const mergedIndex = [];
    for (let i = 0; i < geometries.length; ++i) {
      const index = geometries[i].index;
      for (let j2 = 0; j2 < index.count; ++j2) {
        mergedIndex.push(index.getX(j2) + indexOffset);
      }
      indexOffset += geometries[i].attributes.position.count;
    }
    mergedGeometry.setIndex(mergedIndex);
  }
  for (const name in attributes) {
    const mergedAttribute = mergeAttributes(attributes[name]);
    if (!mergedAttribute) {
      console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + name + " attribute.");
      return null;
    }
    mergedGeometry.setAttribute(name, mergedAttribute);
  }
  for (const name in morphAttributes) {
    const numMorphTargets = morphAttributes[name][0].length;
    if (numMorphTargets === 0) break;
    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
    mergedGeometry.morphAttributes[name] = [];
    for (let i = 0; i < numMorphTargets; ++i) {
      const morphAttributesToMerge = [];
      for (let j2 = 0; j2 < morphAttributes[name].length; ++j2) {
        morphAttributesToMerge.push(morphAttributes[name][j2][i]);
      }
      const mergedMorphAttribute = mergeAttributes(morphAttributesToMerge);
      if (!mergedMorphAttribute) {
        console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + name + " morphAttribute.");
        return null;
      }
      mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
    }
  }
  return mergedGeometry;
}
function mergeAttributes(attributes) {
  let TypedArray;
  let itemSize;
  let normalized;
  let gpuType = -1;
  let arrayLength = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];
    if (TypedArray === void 0) TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.");
      return null;
    }
    if (itemSize === void 0) itemSize = attribute.itemSize;
    if (itemSize !== attribute.itemSize) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.");
      return null;
    }
    if (normalized === void 0) normalized = attribute.normalized;
    if (normalized !== attribute.normalized) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.");
      return null;
    }
    if (gpuType === -1) gpuType = attribute.gpuType;
    if (gpuType !== attribute.gpuType) {
      console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.");
      return null;
    }
    arrayLength += attribute.count * itemSize;
  }
  const array = new TypedArray(arrayLength);
  const result = new BufferAttribute(array, itemSize, normalized);
  let offset = 0;
  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];
    if (attribute.isInterleavedBufferAttribute) {
      const tupleOffset = offset / itemSize;
      for (let j2 = 0, l2 = attribute.count; j2 < l2; j2++) {
        for (let c = 0; c < itemSize; c++) {
          const value = attribute.getComponent(j2, c);
          result.setComponent(j2 + tupleOffset, c, value);
        }
      }
    } else {
      array.set(attribute.array, offset);
    }
    offset += attribute.count * itemSize;
  }
  if (gpuType !== void 0) {
    result.gpuType = gpuType;
  }
  return result;
}
function deepCloneAttribute(attribute) {
  if (attribute.isInstancedInterleavedBufferAttribute || attribute.isInterleavedBufferAttribute) {
    return deinterleaveAttribute(attribute);
  }
  if (attribute.isInstancedBufferAttribute) {
    return new InstancedBufferAttribute().copy(attribute);
  }
  return new BufferAttribute().copy(attribute);
}
function interleaveAttributes(attributes) {
  let TypedArray;
  let arrayLength = 0;
  let stride = 0;
  for (let i = 0, l2 = attributes.length; i < l2; ++i) {
    const attribute = attributes[i];
    if (TypedArray === void 0) TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error("AttributeBuffers of different types cannot be interleaved");
      return null;
    }
    arrayLength += attribute.array.length;
    stride += attribute.itemSize;
  }
  const interleavedBuffer = new InterleavedBuffer(new TypedArray(arrayLength), stride);
  let offset = 0;
  const res = [];
  const getters = ["getX", "getY", "getZ", "getW"];
  const setters = ["setX", "setY", "setZ", "setW"];
  for (let j2 = 0, l2 = attributes.length; j2 < l2; j2++) {
    const attribute = attributes[j2];
    const itemSize = attribute.itemSize;
    const count = attribute.count;
    const iba = new InterleavedBufferAttribute(interleavedBuffer, itemSize, offset, attribute.normalized);
    res.push(iba);
    offset += itemSize;
    for (let c = 0; c < count; c++) {
      for (let k2 = 0; k2 < itemSize; k2++) {
        iba[setters[k2]](c, attribute[getters[k2]](c));
      }
    }
  }
  return res;
}
function deinterleaveAttribute(attribute) {
  const cons = attribute.data.array.constructor;
  const count = attribute.count;
  const itemSize = attribute.itemSize;
  const normalized = attribute.normalized;
  const array = new cons(count * itemSize);
  let newAttribute;
  if (attribute.isInstancedInterleavedBufferAttribute) {
    newAttribute = new InstancedBufferAttribute(array, itemSize, normalized, attribute.meshPerAttribute);
  } else {
    newAttribute = new BufferAttribute(array, itemSize, normalized);
  }
  for (let i = 0; i < count; i++) {
    newAttribute.setX(i, attribute.getX(i));
    if (itemSize >= 2) {
      newAttribute.setY(i, attribute.getY(i));
    }
    if (itemSize >= 3) {
      newAttribute.setZ(i, attribute.getZ(i));
    }
    if (itemSize >= 4) {
      newAttribute.setW(i, attribute.getW(i));
    }
  }
  return newAttribute;
}
function deinterleaveGeometry(geometry) {
  const attributes = geometry.attributes;
  const morphTargets = geometry.morphTargets;
  const attrMap = /* @__PURE__ */ new Map();
  for (const key in attributes) {
    const attr = attributes[key];
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr));
      }
      attributes[key] = attrMap.get(attr);
    }
  }
  for (const key in morphTargets) {
    const attr = morphTargets[key];
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr));
      }
      morphTargets[key] = attrMap.get(attr);
    }
  }
}
function estimateBytesUsed(geometry) {
  let mem = 0;
  for (const name in geometry.attributes) {
    const attr = geometry.getAttribute(name);
    mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;
  }
  const indices = geometry.getIndex();
  mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
  return mem;
}
function mergeVertices(geometry, tolerance = 1e-4) {
  tolerance = Math.max(tolerance, Number.EPSILON);
  const hashToIndex = {};
  const indices = geometry.getIndex();
  const positions = geometry.getAttribute("position");
  const vertexCount = indices ? indices.count : positions.count;
  let nextIndex = 0;
  const attributeNames = Object.keys(geometry.attributes);
  const tmpAttributes = {};
  const tmpMorphAttributes = {};
  const newIndices = [];
  const getters = ["getX", "getY", "getZ", "getW"];
  const setters = ["setX", "setY", "setZ", "setW"];
  for (let i = 0, l2 = attributeNames.length; i < l2; i++) {
    const name = attributeNames[i];
    const attr = geometry.attributes[name];
    tmpAttributes[name] = new attr.constructor(
      new attr.array.constructor(attr.count * attr.itemSize),
      attr.itemSize,
      attr.normalized
    );
    const morphAttributes = geometry.morphAttributes[name];
    if (morphAttributes) {
      if (!tmpMorphAttributes[name]) tmpMorphAttributes[name] = [];
      morphAttributes.forEach((morphAttr, i2) => {
        const array = new morphAttr.array.constructor(morphAttr.count * morphAttr.itemSize);
        tmpMorphAttributes[name][i2] = new morphAttr.constructor(array, morphAttr.itemSize, morphAttr.normalized);
      });
    }
  }
  const halfTolerance = tolerance * 0.5;
  const exponent = Math.log10(1 / tolerance);
  const hashMultiplier = Math.pow(10, exponent);
  const hashAdditive = halfTolerance * hashMultiplier;
  for (let i = 0; i < vertexCount; i++) {
    const index = indices ? indices.getX(i) : i;
    let hash = "";
    for (let j2 = 0, l2 = attributeNames.length; j2 < l2; j2++) {
      const name = attributeNames[j2];
      const attribute = geometry.getAttribute(name);
      const itemSize = attribute.itemSize;
      for (let k2 = 0; k2 < itemSize; k2++) {
        hash += `${~~(attribute[getters[k2]](index) * hashMultiplier + hashAdditive)},`;
      }
    }
    if (hash in hashToIndex) {
      newIndices.push(hashToIndex[hash]);
    } else {
      for (let j2 = 0, l2 = attributeNames.length; j2 < l2; j2++) {
        const name = attributeNames[j2];
        const attribute = geometry.getAttribute(name);
        const morphAttributes = geometry.morphAttributes[name];
        const itemSize = attribute.itemSize;
        const newArray = tmpAttributes[name];
        const newMorphArrays = tmpMorphAttributes[name];
        for (let k2 = 0; k2 < itemSize; k2++) {
          const getterFunc = getters[k2];
          const setterFunc = setters[k2];
          newArray[setterFunc](nextIndex, attribute[getterFunc](index));
          if (morphAttributes) {
            for (let m2 = 0, ml = morphAttributes.length; m2 < ml; m2++) {
              newMorphArrays[m2][setterFunc](nextIndex, morphAttributes[m2][getterFunc](index));
            }
          }
        }
      }
      hashToIndex[hash] = nextIndex;
      newIndices.push(nextIndex);
      nextIndex++;
    }
  }
  const result = geometry.clone();
  for (const name in geometry.attributes) {
    const tmpAttribute = tmpAttributes[name];
    result.setAttribute(name, new tmpAttribute.constructor(
      tmpAttribute.array.slice(0, nextIndex * tmpAttribute.itemSize),
      tmpAttribute.itemSize,
      tmpAttribute.normalized
    ));
    if (!(name in tmpMorphAttributes)) continue;
    for (let j2 = 0; j2 < tmpMorphAttributes[name].length; j2++) {
      const tmpMorphAttribute = tmpMorphAttributes[name][j2];
      result.morphAttributes[name][j2] = new tmpMorphAttribute.constructor(
        tmpMorphAttribute.array.slice(0, nextIndex * tmpMorphAttribute.itemSize),
        tmpMorphAttribute.itemSize,
        tmpMorphAttribute.normalized
      );
    }
  }
  result.setIndex(newIndices);
  return result;
}
function toTrianglesDrawMode(geometry, drawMode) {
  if (drawMode === TrianglesDrawMode) {
    console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
    return geometry;
  }
  if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
    let index = geometry.getIndex();
    if (index === null) {
      const indices = [];
      const position = geometry.getAttribute("position");
      if (position !== void 0) {
        for (let i = 0; i < position.count; i++) {
          indices.push(i);
        }
        geometry.setIndex(indices);
        index = geometry.getIndex();
      } else {
        console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
        return geometry;
      }
    }
    const numberOfTriangles = index.count - 2;
    const newIndices = [];
    if (drawMode === TriangleFanDrawMode) {
      for (let i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0));
        newIndices.push(index.getX(i));
        newIndices.push(index.getX(i + 1));
      }
    } else {
      for (let i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i + 2));
        } else {
          newIndices.push(index.getX(i + 2));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i));
        }
      }
    }
    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    }
    const newGeometry = geometry.clone();
    newGeometry.setIndex(newIndices);
    newGeometry.clearGroups();
    return newGeometry;
  } else {
    console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
    return geometry;
  }
}
function computeMorphedAttributes(object) {
  const _vA2 = new Vector3();
  const _vB2 = new Vector3();
  const _vC2 = new Vector3();
  const _tempA = new Vector3();
  const _tempB = new Vector3();
  const _tempC = new Vector3();
  const _morphA = new Vector3();
  const _morphB = new Vector3();
  const _morphC = new Vector3();
  function _calculateMorphedAttributeData(object2, attribute, morphAttribute, morphTargetsRelative2, a2, b2, c2, modifiedAttributeArray) {
    _vA2.fromBufferAttribute(attribute, a2);
    _vB2.fromBufferAttribute(attribute, b2);
    _vC2.fromBufferAttribute(attribute, c2);
    const morphInfluences = object2.morphTargetInfluences;
    if (morphAttribute && morphInfluences) {
      _morphA.set(0, 0, 0);
      _morphB.set(0, 0, 0);
      _morphC.set(0, 0, 0);
      for (let i2 = 0, il2 = morphAttribute.length; i2 < il2; i2++) {
        const influence = morphInfluences[i2];
        const morph = morphAttribute[i2];
        if (influence === 0) continue;
        _tempA.fromBufferAttribute(morph, a2);
        _tempB.fromBufferAttribute(morph, b2);
        _tempC.fromBufferAttribute(morph, c2);
        if (morphTargetsRelative2) {
          _morphA.addScaledVector(_tempA, influence);
          _morphB.addScaledVector(_tempB, influence);
          _morphC.addScaledVector(_tempC, influence);
        } else {
          _morphA.addScaledVector(_tempA.sub(_vA2), influence);
          _morphB.addScaledVector(_tempB.sub(_vB2), influence);
          _morphC.addScaledVector(_tempC.sub(_vC2), influence);
        }
      }
      _vA2.add(_morphA);
      _vB2.add(_morphB);
      _vC2.add(_morphC);
    }
    if (object2.isSkinnedMesh) {
      object2.applyBoneTransform(a2, _vA2);
      object2.applyBoneTransform(b2, _vB2);
      object2.applyBoneTransform(c2, _vC2);
    }
    modifiedAttributeArray[a2 * 3 + 0] = _vA2.x;
    modifiedAttributeArray[a2 * 3 + 1] = _vA2.y;
    modifiedAttributeArray[a2 * 3 + 2] = _vA2.z;
    modifiedAttributeArray[b2 * 3 + 0] = _vB2.x;
    modifiedAttributeArray[b2 * 3 + 1] = _vB2.y;
    modifiedAttributeArray[b2 * 3 + 2] = _vB2.z;
    modifiedAttributeArray[c2 * 3 + 0] = _vC2.x;
    modifiedAttributeArray[c2 * 3 + 1] = _vC2.y;
    modifiedAttributeArray[c2 * 3 + 2] = _vC2.z;
  }
  const geometry = object.geometry;
  const material = object.material;
  let a, b, c;
  const index = geometry.index;
  const positionAttribute = geometry.attributes.position;
  const morphPosition = geometry.morphAttributes.position;
  const morphTargetsRelative = geometry.morphTargetsRelative;
  const normalAttribute = geometry.attributes.normal;
  const morphNormal = geometry.morphAttributes.position;
  const groups = geometry.groups;
  const drawRange = geometry.drawRange;
  let i, j2, il, jl;
  let group;
  let start, end;
  const modifiedPosition = new Float32Array(positionAttribute.count * positionAttribute.itemSize);
  const modifiedNormal = new Float32Array(normalAttribute.count * normalAttribute.itemSize);
  if (index !== null) {
    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i];
        start = Math.max(group.start, drawRange.start);
        end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
        for (j2 = start, jl = end; j2 < jl; j2 += 3) {
          a = index.getX(j2);
          b = index.getX(j2 + 1);
          c = index.getX(j2 + 2);
          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          );
          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          );
        }
      }
    } else {
      start = Math.max(0, drawRange.start);
      end = Math.min(index.count, drawRange.start + drawRange.count);
      for (i = start, il = end; i < il; i += 3) {
        a = index.getX(i);
        b = index.getX(i + 1);
        c = index.getX(i + 2);
        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        );
        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        );
      }
    }
  } else {
    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i];
        start = Math.max(group.start, drawRange.start);
        end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
        for (j2 = start, jl = end; j2 < jl; j2 += 3) {
          a = j2;
          b = j2 + 1;
          c = j2 + 2;
          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          );
          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          );
        }
      }
    } else {
      start = Math.max(0, drawRange.start);
      end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
      for (i = start, il = end; i < il; i += 3) {
        a = i;
        b = i + 1;
        c = i + 2;
        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        );
        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        );
      }
    }
  }
  const morphedPositionAttribute = new Float32BufferAttribute(modifiedPosition, 3);
  const morphedNormalAttribute = new Float32BufferAttribute(modifiedNormal, 3);
  return {
    positionAttribute,
    normalAttribute,
    morphedPositionAttribute,
    morphedNormalAttribute
  };
}
function mergeGroups(geometry) {
  if (geometry.groups.length === 0) {
    console.warn("THREE.BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge.");
    return geometry;
  }
  let groups = geometry.groups;
  groups = groups.sort((a, b) => {
    if (a.materialIndex !== b.materialIndex) return a.materialIndex - b.materialIndex;
    return a.start - b.start;
  });
  if (geometry.getIndex() === null) {
    const positionAttribute = geometry.getAttribute("position");
    const indices = [];
    for (let i = 0; i < positionAttribute.count; i += 3) {
      indices.push(i, i + 1, i + 2);
    }
    geometry.setIndex(indices);
  }
  const index = geometry.getIndex();
  const newIndices = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const groupStart = group.start;
    const groupLength = groupStart + group.count;
    for (let j2 = groupStart; j2 < groupLength; j2++) {
      newIndices.push(index.getX(j2));
    }
  }
  geometry.dispose();
  geometry.setIndex(newIndices);
  let start = 0;
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    group.start = start;
    start += group.count;
  }
  let currentGroup = groups[0];
  geometry.groups = [currentGroup];
  for (let i = 1; i < groups.length; i++) {
    const group = groups[i];
    if (currentGroup.materialIndex === group.materialIndex) {
      currentGroup.count += group.count;
    } else {
      currentGroup = group;
      geometry.groups.push(currentGroup);
    }
  }
  return geometry;
}
function toCreasedNormals(geometry, creaseAngle = Math.PI / 3) {
  const creaseDot = Math.cos(creaseAngle);
  const hashMultiplier = (1 + 1e-10) * 100;
  const verts = [new Vector3(), new Vector3(), new Vector3()];
  const tempVec1 = new Vector3();
  const tempVec2 = new Vector3();
  const tempNorm = new Vector3();
  const tempNorm2 = new Vector3();
  function hashVertex(v) {
    const x = ~~(v.x * hashMultiplier);
    const y = ~~(v.y * hashMultiplier);
    const z = ~~(v.z * hashMultiplier);
    return `${x},${y},${z}`;
  }
  const resultGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
  const posAttr = resultGeometry.attributes.position;
  const vertexMap = {};
  for (let i = 0, l2 = posAttr.count / 3; i < l2; i++) {
    const i3 = 3 * i;
    const a = verts[0].fromBufferAttribute(posAttr, i3 + 0);
    const b = verts[1].fromBufferAttribute(posAttr, i3 + 1);
    const c = verts[2].fromBufferAttribute(posAttr, i3 + 2);
    tempVec1.subVectors(c, b);
    tempVec2.subVectors(a, b);
    const normal = new Vector3().crossVectors(tempVec1, tempVec2).normalize();
    for (let n2 = 0; n2 < 3; n2++) {
      const vert = verts[n2];
      const hash = hashVertex(vert);
      if (!(hash in vertexMap)) {
        vertexMap[hash] = [];
      }
      vertexMap[hash].push(normal);
    }
  }
  const normalArray = new Float32Array(posAttr.count * 3);
  const normAttr = new BufferAttribute(normalArray, 3, false);
  for (let i = 0, l2 = posAttr.count / 3; i < l2; i++) {
    const i3 = 3 * i;
    const a = verts[0].fromBufferAttribute(posAttr, i3 + 0);
    const b = verts[1].fromBufferAttribute(posAttr, i3 + 1);
    const c = verts[2].fromBufferAttribute(posAttr, i3 + 2);
    tempVec1.subVectors(c, b);
    tempVec2.subVectors(a, b);
    tempNorm.crossVectors(tempVec1, tempVec2).normalize();
    for (let n2 = 0; n2 < 3; n2++) {
      const vert = verts[n2];
      const hash = hashVertex(vert);
      const otherNormals = vertexMap[hash];
      tempNorm2.set(0, 0, 0);
      for (let k2 = 0, lk = otherNormals.length; k2 < lk; k2++) {
        const otherNorm = otherNormals[k2];
        if (tempNorm.dot(otherNorm) > creaseDot) {
          tempNorm2.add(otherNorm);
        }
      }
      tempNorm2.normalize();
      normAttr.setXYZ(i3 + n2, tempNorm2.x, tempNorm2.y, tempNorm2.z);
    }
  }
  resultGeometry.setAttribute("normal", normAttr);
  return resultGeometry;
}
const BufferGeometryUtils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  computeMikkTSpaceTangents,
  computeMorphedAttributes,
  deepCloneAttribute,
  deinterleaveAttribute,
  deinterleaveGeometry,
  estimateBytesUsed,
  interleaveAttributes,
  mergeAttributes,
  mergeGeometries,
  mergeGroups,
  mergeVertices,
  toCreasedNormals,
  toTrianglesDrawMode
}, Symbol.toStringTag, { value: "Module" }));
const CENTER = 0;
const AVERAGE = 1;
const SAH = 2;
const CONTAINED = 2;
const TRIANGLE_INTERSECT_COST = 1.25;
const TRAVERSAL_COST = 1;
const BYTES_PER_NODE = 6 * 4 + 4 + 4;
const IS_LEAFNODE_FLAG = 65535;
const FLOAT32_EPSILON = Math.pow(2, -24);
const SKIP_GENERATION = Symbol("SKIP_GENERATION");
function getVertexCount(geo) {
  return geo.index ? geo.index.count : geo.attributes.position.count;
}
function getTriCount(geo) {
  return getVertexCount(geo) / 3;
}
function getIndexArray(vertexCount, BufferConstructor = ArrayBuffer) {
  if (vertexCount > 65535) {
    return new Uint32Array(new BufferConstructor(4 * vertexCount));
  } else {
    return new Uint16Array(new BufferConstructor(2 * vertexCount));
  }
}
function ensureIndex(geo, options) {
  if (!geo.index) {
    const vertexCount = geo.attributes.position.count;
    const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
    const index = getIndexArray(vertexCount, BufferConstructor);
    geo.setIndex(new BufferAttribute(index, 1));
    for (let i = 0; i < vertexCount; i++) {
      index[i] = i;
    }
  }
}
function getFullGeometryRange(geo, range) {
  const triCount = getTriCount(geo);
  const drawRange = range ? range : geo.drawRange;
  const start = drawRange.start / 3;
  const end = (drawRange.start + drawRange.count) / 3;
  const offset = Math.max(0, start);
  const count = Math.min(triCount, end) - offset;
  return [{
    offset: Math.floor(offset),
    count: Math.floor(count)
  }];
}
function getRootIndexRanges(geo, range) {
  if (!geo.groups || !geo.groups.length) {
    return getFullGeometryRange(geo, range);
  }
  const ranges = [];
  const rangeBoundaries = /* @__PURE__ */ new Set();
  const drawRange = range ? range : geo.drawRange;
  const drawRangeStart = drawRange.start / 3;
  const drawRangeEnd = (drawRange.start + drawRange.count) / 3;
  for (const group of geo.groups) {
    const groupStart = group.start / 3;
    const groupEnd = (group.start + group.count) / 3;
    rangeBoundaries.add(Math.max(drawRangeStart, groupStart));
    rangeBoundaries.add(Math.min(drawRangeEnd, groupEnd));
  }
  const sortedBoundaries = Array.from(rangeBoundaries.values()).sort((a, b) => a - b);
  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i];
    const end = sortedBoundaries[i + 1];
    ranges.push({
      offset: Math.floor(start),
      count: Math.floor(end - start)
    });
  }
  return ranges;
}
function hasGroupGaps(geometry, range) {
  const vertexCount = getTriCount(geometry);
  const groups = getRootIndexRanges(geometry, range).sort((a, b) => a.offset - b.offset);
  const finalGroup = groups[groups.length - 1];
  finalGroup.count = Math.min(vertexCount - finalGroup.offset, finalGroup.count);
  let total = 0;
  groups.forEach(({ count }) => total += count);
  return vertexCount !== total;
}
function getBounds(triangleBounds, offset, count, target, centroidTarget) {
  let minx = Infinity;
  let miny = Infinity;
  let minz = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  let maxz = -Infinity;
  let cminx = Infinity;
  let cminy = Infinity;
  let cminz = Infinity;
  let cmaxx = -Infinity;
  let cmaxy = -Infinity;
  let cmaxz = -Infinity;
  for (let i = offset * 6, end = (offset + count) * 6; i < end; i += 6) {
    const cx = triangleBounds[i + 0];
    const hx = triangleBounds[i + 1];
    const lx = cx - hx;
    const rx = cx + hx;
    if (lx < minx) minx = lx;
    if (rx > maxx) maxx = rx;
    if (cx < cminx) cminx = cx;
    if (cx > cmaxx) cmaxx = cx;
    const cy = triangleBounds[i + 2];
    const hy = triangleBounds[i + 3];
    const ly = cy - hy;
    const ry = cy + hy;
    if (ly < miny) miny = ly;
    if (ry > maxy) maxy = ry;
    if (cy < cminy) cminy = cy;
    if (cy > cmaxy) cmaxy = cy;
    const cz = triangleBounds[i + 4];
    const hz = triangleBounds[i + 5];
    const lz = cz - hz;
    const rz = cz + hz;
    if (lz < minz) minz = lz;
    if (rz > maxz) maxz = rz;
    if (cz < cminz) cminz = cz;
    if (cz > cmaxz) cmaxz = cz;
  }
  target[0] = minx;
  target[1] = miny;
  target[2] = minz;
  target[3] = maxx;
  target[4] = maxy;
  target[5] = maxz;
  centroidTarget[0] = cminx;
  centroidTarget[1] = cminy;
  centroidTarget[2] = cminz;
  centroidTarget[3] = cmaxx;
  centroidTarget[4] = cmaxy;
  centroidTarget[5] = cmaxz;
}
function computeTriangleBounds(geo, target = null, offset = null, count = null) {
  const posAttr = geo.attributes.position;
  const index = geo.index ? geo.index.array : null;
  const triCount = getTriCount(geo);
  const normalized = posAttr.normalized;
  let triangleBounds;
  if (target === null) {
    triangleBounds = new Float32Array(triCount * 6 * 4);
    offset = 0;
    count = triCount;
  } else {
    triangleBounds = target;
    offset = offset || 0;
    count = count || triCount;
  }
  const posArr = posAttr.array;
  const bufferOffset = posAttr.offset || 0;
  let stride = 3;
  if (posAttr.isInterleavedBufferAttribute) {
    stride = posAttr.data.stride;
  }
  const getters = ["getX", "getY", "getZ"];
  for (let tri = offset; tri < offset + count; tri++) {
    const tri3 = tri * 3;
    const tri6 = tri * 6;
    let ai = tri3 + 0;
    let bi = tri3 + 1;
    let ci = tri3 + 2;
    if (index) {
      ai = index[ai];
      bi = index[bi];
      ci = index[ci];
    }
    if (!normalized) {
      ai = ai * stride + bufferOffset;
      bi = bi * stride + bufferOffset;
      ci = ci * stride + bufferOffset;
    }
    for (let el = 0; el < 3; el++) {
      let a, b, c;
      if (normalized) {
        a = posAttr[getters[el]](ai);
        b = posAttr[getters[el]](bi);
        c = posAttr[getters[el]](ci);
      } else {
        a = posArr[ai + el];
        b = posArr[bi + el];
        c = posArr[ci + el];
      }
      let min = a;
      if (b < min) min = b;
      if (c < min) min = c;
      let max = a;
      if (b > max) max = b;
      if (c > max) max = c;
      const halfExtents = (max - min) / 2;
      const el2 = el * 2;
      triangleBounds[tri6 + el2 + 0] = min + halfExtents;
      triangleBounds[tri6 + el2 + 1] = halfExtents + (Math.abs(min) + halfExtents) * FLOAT32_EPSILON;
    }
  }
  return triangleBounds;
}
function arrayToBox(nodeIndex32, array, target) {
  target.min.x = array[nodeIndex32];
  target.min.y = array[nodeIndex32 + 1];
  target.min.z = array[nodeIndex32 + 2];
  target.max.x = array[nodeIndex32 + 3];
  target.max.y = array[nodeIndex32 + 4];
  target.max.z = array[nodeIndex32 + 5];
  return target;
}
function getLongestEdgeIndex(bounds) {
  let splitDimIdx = -1;
  let splitDist = -Infinity;
  for (let i = 0; i < 3; i++) {
    const dist = bounds[i + 3] - bounds[i];
    if (dist > splitDist) {
      splitDist = dist;
      splitDimIdx = i;
    }
  }
  return splitDimIdx;
}
function copyBounds(source, target) {
  target.set(source);
}
function unionBounds(a, b, target) {
  let aVal, bVal;
  for (let d = 0; d < 3; d++) {
    const d3 = d + 3;
    aVal = a[d];
    bVal = b[d];
    target[d] = aVal < bVal ? aVal : bVal;
    aVal = a[d3];
    bVal = b[d3];
    target[d3] = aVal > bVal ? aVal : bVal;
  }
}
function expandByTriangleBounds(startIndex, triangleBounds, bounds) {
  for (let d = 0; d < 3; d++) {
    const tCenter = triangleBounds[startIndex + 2 * d];
    const tHalf = triangleBounds[startIndex + 2 * d + 1];
    const tMin = tCenter - tHalf;
    const tMax = tCenter + tHalf;
    if (tMin < bounds[d]) {
      bounds[d] = tMin;
    }
    if (tMax > bounds[d + 3]) {
      bounds[d + 3] = tMax;
    }
  }
}
function computeSurfaceArea(bounds) {
  const d0 = bounds[3] - bounds[0];
  const d1 = bounds[4] - bounds[1];
  const d2 = bounds[5] - bounds[2];
  return 2 * (d0 * d1 + d1 * d2 + d2 * d0);
}
const BIN_COUNT = 32;
const binsSort = (a, b) => a.candidate - b.candidate;
const sahBins = new Array(BIN_COUNT).fill().map(() => {
  return {
    count: 0,
    bounds: new Float32Array(6),
    rightCacheBounds: new Float32Array(6),
    leftCacheBounds: new Float32Array(6),
    candidate: 0
  };
});
const leftBounds = new Float32Array(6);
function getOptimalSplit(nodeBoundingData, centroidBoundingData, triangleBounds, offset, count, strategy) {
  let axis = -1;
  let pos = 0;
  if (strategy === CENTER) {
    axis = getLongestEdgeIndex(centroidBoundingData);
    if (axis !== -1) {
      pos = (centroidBoundingData[axis] + centroidBoundingData[axis + 3]) / 2;
    }
  } else if (strategy === AVERAGE) {
    axis = getLongestEdgeIndex(nodeBoundingData);
    if (axis !== -1) {
      pos = getAverage(triangleBounds, offset, count, axis);
    }
  } else if (strategy === SAH) {
    const rootSurfaceArea = computeSurfaceArea(nodeBoundingData);
    let bestCost = TRIANGLE_INTERSECT_COST * count;
    const cStart = offset * 6;
    const cEnd = (offset + count) * 6;
    for (let a = 0; a < 3; a++) {
      const axisLeft = centroidBoundingData[a];
      const axisRight = centroidBoundingData[a + 3];
      const axisLength = axisRight - axisLeft;
      const binWidth = axisLength / BIN_COUNT;
      if (count < BIN_COUNT / 4) {
        const truncatedBins = [...sahBins];
        truncatedBins.length = count;
        let b = 0;
        for (let c = cStart; c < cEnd; c += 6, b++) {
          const bin = truncatedBins[b];
          bin.candidate = triangleBounds[c + 2 * a];
          bin.count = 0;
          const {
            bounds,
            leftCacheBounds,
            rightCacheBounds
          } = bin;
          for (let d = 0; d < 3; d++) {
            rightCacheBounds[d] = Infinity;
            rightCacheBounds[d + 3] = -Infinity;
            leftCacheBounds[d] = Infinity;
            leftCacheBounds[d + 3] = -Infinity;
            bounds[d] = Infinity;
            bounds[d + 3] = -Infinity;
          }
          expandByTriangleBounds(c, triangleBounds, bounds);
        }
        truncatedBins.sort(binsSort);
        let splitCount = count;
        for (let bi = 0; bi < splitCount; bi++) {
          const bin = truncatedBins[bi];
          while (bi + 1 < splitCount && truncatedBins[bi + 1].candidate === bin.candidate) {
            truncatedBins.splice(bi + 1, 1);
            splitCount--;
          }
        }
        for (let c = cStart; c < cEnd; c += 6) {
          const center = triangleBounds[c + 2 * a];
          for (let bi = 0; bi < splitCount; bi++) {
            const bin = truncatedBins[bi];
            if (center >= bin.candidate) {
              expandByTriangleBounds(c, triangleBounds, bin.rightCacheBounds);
            } else {
              expandByTriangleBounds(c, triangleBounds, bin.leftCacheBounds);
              bin.count++;
            }
          }
        }
        for (let bi = 0; bi < splitCount; bi++) {
          const bin = truncatedBins[bi];
          const leftCount = bin.count;
          const rightCount = count - bin.count;
          const leftBounds2 = bin.leftCacheBounds;
          const rightBounds = bin.rightCacheBounds;
          let leftProb = 0;
          if (leftCount !== 0) {
            leftProb = computeSurfaceArea(leftBounds2) / rootSurfaceArea;
          }
          let rightProb = 0;
          if (rightCount !== 0) {
            rightProb = computeSurfaceArea(rightBounds) / rootSurfaceArea;
          }
          const cost = TRAVERSAL_COST + TRIANGLE_INTERSECT_COST * (leftProb * leftCount + rightProb * rightCount);
          if (cost < bestCost) {
            axis = a;
            bestCost = cost;
            pos = bin.candidate;
          }
        }
      } else {
        for (let i = 0; i < BIN_COUNT; i++) {
          const bin = sahBins[i];
          bin.count = 0;
          bin.candidate = axisLeft + binWidth + i * binWidth;
          const bounds = bin.bounds;
          for (let d = 0; d < 3; d++) {
            bounds[d] = Infinity;
            bounds[d + 3] = -Infinity;
          }
        }
        for (let c = cStart; c < cEnd; c += 6) {
          const triCenter = triangleBounds[c + 2 * a];
          const relativeCenter = triCenter - axisLeft;
          let binIndex = ~~(relativeCenter / binWidth);
          if (binIndex >= BIN_COUNT) binIndex = BIN_COUNT - 1;
          const bin = sahBins[binIndex];
          bin.count++;
          expandByTriangleBounds(c, triangleBounds, bin.bounds);
        }
        const lastBin = sahBins[BIN_COUNT - 1];
        copyBounds(lastBin.bounds, lastBin.rightCacheBounds);
        for (let i = BIN_COUNT - 2; i >= 0; i--) {
          const bin = sahBins[i];
          const nextBin = sahBins[i + 1];
          unionBounds(bin.bounds, nextBin.rightCacheBounds, bin.rightCacheBounds);
        }
        let leftCount = 0;
        for (let i = 0; i < BIN_COUNT - 1; i++) {
          const bin = sahBins[i];
          const binCount = bin.count;
          const bounds = bin.bounds;
          const nextBin = sahBins[i + 1];
          const rightBounds = nextBin.rightCacheBounds;
          if (binCount !== 0) {
            if (leftCount === 0) {
              copyBounds(bounds, leftBounds);
            } else {
              unionBounds(bounds, leftBounds, leftBounds);
            }
          }
          leftCount += binCount;
          let leftProb = 0;
          let rightProb = 0;
          if (leftCount !== 0) {
            leftProb = computeSurfaceArea(leftBounds) / rootSurfaceArea;
          }
          const rightCount = count - leftCount;
          if (rightCount !== 0) {
            rightProb = computeSurfaceArea(rightBounds) / rootSurfaceArea;
          }
          const cost = TRAVERSAL_COST + TRIANGLE_INTERSECT_COST * (leftProb * leftCount + rightProb * rightCount);
          if (cost < bestCost) {
            axis = a;
            bestCost = cost;
            pos = bin.candidate;
          }
        }
      }
    }
  } else {
    console.warn(`MeshBVH: Invalid build strategy value ${strategy} used.`);
  }
  return { axis, pos };
}
function getAverage(triangleBounds, offset, count, axis) {
  let avg = 0;
  for (let i = offset, end = offset + count; i < end; i++) {
    avg += triangleBounds[i * 6 + axis * 2];
  }
  return avg / count;
}
class MeshBVHNode {
  constructor() {
    this.boundingData = new Float32Array(6);
  }
}
function partition(indirectBuffer, index, triangleBounds, offset, count, split) {
  let left = offset;
  let right = offset + count - 1;
  const pos = split.pos;
  const axisOffset = split.axis * 2;
  while (true) {
    while (left <= right && triangleBounds[left * 6 + axisOffset] < pos) {
      left++;
    }
    while (left <= right && triangleBounds[right * 6 + axisOffset] >= pos) {
      right--;
    }
    if (left < right) {
      for (let i = 0; i < 3; i++) {
        let t0 = index[left * 3 + i];
        index[left * 3 + i] = index[right * 3 + i];
        index[right * 3 + i] = t0;
      }
      for (let i = 0; i < 6; i++) {
        let tb = triangleBounds[left * 6 + i];
        triangleBounds[left * 6 + i] = triangleBounds[right * 6 + i];
        triangleBounds[right * 6 + i] = tb;
      }
      left++;
      right--;
    } else {
      return left;
    }
  }
}
function partition_indirect(indirectBuffer, index, triangleBounds, offset, count, split) {
  let left = offset;
  let right = offset + count - 1;
  const pos = split.pos;
  const axisOffset = split.axis * 2;
  while (true) {
    while (left <= right && triangleBounds[left * 6 + axisOffset] < pos) {
      left++;
    }
    while (left <= right && triangleBounds[right * 6 + axisOffset] >= pos) {
      right--;
    }
    if (left < right) {
      let t = indirectBuffer[left];
      indirectBuffer[left] = indirectBuffer[right];
      indirectBuffer[right] = t;
      for (let i = 0; i < 6; i++) {
        let tb = triangleBounds[left * 6 + i];
        triangleBounds[left * 6 + i] = triangleBounds[right * 6 + i];
        triangleBounds[right * 6 + i] = tb;
      }
      left++;
      right--;
    } else {
      return left;
    }
  }
}
function IS_LEAF(n16, uint16Array2) {
  return uint16Array2[n16 + 15] === 65535;
}
function OFFSET(n32, uint32Array2) {
  return uint32Array2[n32 + 6];
}
function COUNT(n16, uint16Array2) {
  return uint16Array2[n16 + 14];
}
function LEFT_NODE(n32) {
  return n32 + 8;
}
function RIGHT_NODE(n32, uint32Array2) {
  return uint32Array2[n32 + 6];
}
function SPLIT_AXIS(n32, uint32Array2) {
  return uint32Array2[n32 + 7];
}
function BOUNDING_DATA_INDEX(n32) {
  return n32;
}
let float32Array, uint32Array, uint16Array, uint8Array;
const MAX_POINTER = Math.pow(2, 32);
function countNodes(node) {
  if ("count" in node) {
    return 1;
  } else {
    return 1 + countNodes(node.left) + countNodes(node.right);
  }
}
function populateBuffer(byteOffset, node, buffer) {
  float32Array = new Float32Array(buffer);
  uint32Array = new Uint32Array(buffer);
  uint16Array = new Uint16Array(buffer);
  uint8Array = new Uint8Array(buffer);
  return _populateBuffer(byteOffset, node);
}
function _populateBuffer(byteOffset, node) {
  const stride4Offset = byteOffset / 4;
  const stride2Offset = byteOffset / 2;
  const isLeaf = "count" in node;
  const boundingData = node.boundingData;
  for (let i = 0; i < 6; i++) {
    float32Array[stride4Offset + i] = boundingData[i];
  }
  if (isLeaf) {
    if (node.buffer) {
      const buffer = node.buffer;
      uint8Array.set(new Uint8Array(buffer), byteOffset);
      for (let offset = byteOffset, l2 = byteOffset + buffer.byteLength; offset < l2; offset += BYTES_PER_NODE) {
        const offset2 = offset / 2;
        if (!IS_LEAF(offset2, uint16Array)) {
          uint32Array[offset / 4 + 6] += stride4Offset;
        }
      }
      return byteOffset + buffer.byteLength;
    } else {
      const offset = node.offset;
      const count = node.count;
      uint32Array[stride4Offset + 6] = offset;
      uint16Array[stride2Offset + 14] = count;
      uint16Array[stride2Offset + 15] = IS_LEAFNODE_FLAG;
      return byteOffset + BYTES_PER_NODE;
    }
  } else {
    const left = node.left;
    const right = node.right;
    const splitAxis = node.splitAxis;
    let nextUnusedPointer;
    nextUnusedPointer = _populateBuffer(byteOffset + BYTES_PER_NODE, left);
    if (nextUnusedPointer / 4 > MAX_POINTER) {
      throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");
    }
    uint32Array[stride4Offset + 6] = nextUnusedPointer / 4;
    nextUnusedPointer = _populateBuffer(nextUnusedPointer, right);
    uint32Array[stride4Offset + 7] = splitAxis;
    return nextUnusedPointer;
  }
}
function generateIndirectBuffer(geometry, useSharedArrayBuffer) {
  const triCount = (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3;
  const useUint32 = triCount > 2 ** 16;
  const byteCount = useUint32 ? 4 : 2;
  const buffer = useSharedArrayBuffer ? new SharedArrayBuffer(triCount * byteCount) : new ArrayBuffer(triCount * byteCount);
  const indirectBuffer = useUint32 ? new Uint32Array(buffer) : new Uint16Array(buffer);
  for (let i = 0, l2 = indirectBuffer.length; i < l2; i++) {
    indirectBuffer[i] = i;
  }
  return indirectBuffer;
}
function buildTree(bvh, triangleBounds, offset, count, options) {
  const {
    maxDepth,
    verbose,
    maxLeafTris,
    strategy,
    onProgress,
    indirect
  } = options;
  const indirectBuffer = bvh._indirectBuffer;
  const geometry = bvh.geometry;
  const indexArray = geometry.index ? geometry.index.array : null;
  const partionFunc = indirect ? partition_indirect : partition;
  const totalTriangles = getTriCount(geometry);
  const cacheCentroidBoundingData = new Float32Array(6);
  let reachedMaxDepth = false;
  const root = new MeshBVHNode();
  getBounds(triangleBounds, offset, count, root.boundingData, cacheCentroidBoundingData);
  splitNode(root, offset, count, cacheCentroidBoundingData);
  return root;
  function triggerProgress(trianglesProcessed) {
    if (onProgress) {
      onProgress(trianglesProcessed / totalTriangles);
    }
  }
  function splitNode(node, offset2, count2, centroidBoundingData = null, depth = 0) {
    if (!reachedMaxDepth && depth >= maxDepth) {
      reachedMaxDepth = true;
      if (verbose) {
        console.warn(`MeshBVH: Max depth of ${maxDepth} reached when generating BVH. Consider increasing maxDepth.`);
        console.warn(geometry);
      }
    }
    if (count2 <= maxLeafTris || depth >= maxDepth) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
      return node;
    }
    const split = getOptimalSplit(node.boundingData, centroidBoundingData, triangleBounds, offset2, count2, strategy);
    if (split.axis === -1) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
      return node;
    }
    const splitOffset = partionFunc(indirectBuffer, indexArray, triangleBounds, offset2, count2, split);
    if (splitOffset === offset2 || splitOffset === offset2 + count2) {
      triggerProgress(offset2 + count2);
      node.offset = offset2;
      node.count = count2;
    } else {
      node.splitAxis = split.axis;
      const left = new MeshBVHNode();
      const lstart = offset2;
      const lcount = splitOffset - offset2;
      node.left = left;
      getBounds(triangleBounds, lstart, lcount, left.boundingData, cacheCentroidBoundingData);
      splitNode(left, lstart, lcount, cacheCentroidBoundingData, depth + 1);
      const right = new MeshBVHNode();
      const rstart = splitOffset;
      const rcount = count2 - lcount;
      node.right = right;
      getBounds(triangleBounds, rstart, rcount, right.boundingData, cacheCentroidBoundingData);
      splitNode(right, rstart, rcount, cacheCentroidBoundingData, depth + 1);
    }
    return node;
  }
}
function buildPackedTree(bvh, options) {
  const geometry = bvh.geometry;
  if (options.indirect) {
    bvh._indirectBuffer = generateIndirectBuffer(geometry, options.useSharedArrayBuffer);
    if (hasGroupGaps(geometry, options.range) && !options.verbose) {
      console.warn(
        'MeshBVH: Provided geometry contains groups or a range that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.'
      );
    }
  }
  if (!bvh._indirectBuffer) {
    ensureIndex(geometry, options);
  }
  const BufferConstructor = options.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer;
  const triangleBounds = computeTriangleBounds(geometry);
  const geometryRanges = options.indirect ? getFullGeometryRange(geometry, options.range) : getRootIndexRanges(geometry, options.range);
  bvh._roots = geometryRanges.map((range) => {
    const root = buildTree(bvh, triangleBounds, range.offset, range.count, options);
    const nodeCount = countNodes(root);
    const buffer = new BufferConstructor(BYTES_PER_NODE * nodeCount);
    populateBuffer(0, root, buffer);
    return buffer;
  });
}
class SeparatingAxisBounds {
  constructor() {
    this.min = Infinity;
    this.max = -Infinity;
  }
  setFromPointsField(points, field) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0, l2 = points.length; i < l2; i++) {
      const p2 = points[i];
      const val = p2[field];
      min = val < min ? val : min;
      max = val > max ? val : max;
    }
    this.min = min;
    this.max = max;
  }
  setFromPoints(axis, points) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0, l2 = points.length; i < l2; i++) {
      const p2 = points[i];
      const val = axis.dot(p2);
      min = val < min ? val : min;
      max = val > max ? val : max;
    }
    this.min = min;
    this.max = max;
  }
  isSeparated(other) {
    return this.min > other.max || other.min > this.max;
  }
}
SeparatingAxisBounds.prototype.setFromBox = function() {
  const p2 = new Vector3();
  return function setFromBox(axis, box) {
    const boxMin = box.min;
    const boxMax = box.max;
    let min = Infinity;
    let max = -Infinity;
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          p2.x = boxMin.x * x + boxMax.x * (1 - x);
          p2.y = boxMin.y * y + boxMax.y * (1 - y);
          p2.z = boxMin.z * z + boxMax.z * (1 - z);
          const val = axis.dot(p2);
          min = Math.min(val, min);
          max = Math.max(val, max);
        }
      }
    }
    this.min = min;
    this.max = max;
  };
}();
const closestPointLineToLine = function() {
  const dir1 = new Vector3();
  const dir2 = new Vector3();
  const v02 = new Vector3();
  return function closestPointLineToLine2(l1, l2, result) {
    const v0 = l1.start;
    const v10 = dir1;
    const v2 = l2.start;
    const v32 = dir2;
    v02.subVectors(v0, v2);
    dir1.subVectors(l1.end, l1.start);
    dir2.subVectors(l2.end, l2.start);
    const d0232 = v02.dot(v32);
    const d3210 = v32.dot(v10);
    const d3232 = v32.dot(v32);
    const d0210 = v02.dot(v10);
    const d1010 = v10.dot(v10);
    const denom = d1010 * d3232 - d3210 * d3210;
    let d, d2;
    if (denom !== 0) {
      d = (d0232 * d3210 - d0210 * d3232) / denom;
    } else {
      d = 0;
    }
    d2 = (d0232 + d * d3210) / d3232;
    result.x = d;
    result.y = d2;
  };
}();
const closestPointsSegmentToSegment = function() {
  const paramResult = new Vector2();
  const temp12 = new Vector3();
  const temp22 = new Vector3();
  return function closestPointsSegmentToSegment2(l1, l2, target1, target2) {
    closestPointLineToLine(l1, l2, paramResult);
    let d = paramResult.x;
    let d2 = paramResult.y;
    if (d >= 0 && d <= 1 && d2 >= 0 && d2 <= 1) {
      l1.at(d, target1);
      l2.at(d2, target2);
      return;
    } else if (d >= 0 && d <= 1) {
      if (d2 < 0) {
        l2.at(0, target2);
      } else {
        l2.at(1, target2);
      }
      l1.closestPointToPoint(target2, true, target1);
      return;
    } else if (d2 >= 0 && d2 <= 1) {
      if (d < 0) {
        l1.at(0, target1);
      } else {
        l1.at(1, target1);
      }
      l2.closestPointToPoint(target1, true, target2);
      return;
    } else {
      let p2;
      if (d < 0) {
        p2 = l1.start;
      } else {
        p2 = l1.end;
      }
      let p22;
      if (d2 < 0) {
        p22 = l2.start;
      } else {
        p22 = l2.end;
      }
      const closestPoint = temp12;
      const closestPoint2 = temp22;
      l1.closestPointToPoint(p22, true, temp12);
      l2.closestPointToPoint(p2, true, temp22);
      if (closestPoint.distanceToSquared(p22) <= closestPoint2.distanceToSquared(p2)) {
        target1.copy(closestPoint);
        target2.copy(p22);
        return;
      } else {
        target1.copy(p2);
        target2.copy(closestPoint2);
        return;
      }
    }
  };
}();
const sphereIntersectTriangle = function() {
  const closestPointTemp = new Vector3();
  const projectedPointTemp = new Vector3();
  const planeTemp = new Plane();
  const lineTemp = new Line3();
  return function sphereIntersectTriangle2(sphere, triangle3) {
    const { radius, center } = sphere;
    const { a, b, c } = triangle3;
    lineTemp.start = a;
    lineTemp.end = b;
    const closestPoint1 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint1.distanceTo(center) <= radius) return true;
    lineTemp.start = a;
    lineTemp.end = c;
    const closestPoint2 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint2.distanceTo(center) <= radius) return true;
    lineTemp.start = b;
    lineTemp.end = c;
    const closestPoint3 = lineTemp.closestPointToPoint(center, true, closestPointTemp);
    if (closestPoint3.distanceTo(center) <= radius) return true;
    const plane = triangle3.getPlane(planeTemp);
    const dp = Math.abs(plane.distanceToPoint(center));
    if (dp <= radius) {
      const pp = plane.projectPoint(center, projectedPointTemp);
      const cp = triangle3.containsPoint(pp);
      if (cp) return true;
    }
    return false;
  };
}();
const ZERO_EPSILON = 1e-15;
function isNearZero(value) {
  return Math.abs(value) < ZERO_EPSILON;
}
class ExtendedTriangle extends Triangle {
  constructor(...args) {
    super(...args);
    this.isExtendedTriangle = true;
    this.satAxes = new Array(4).fill().map(() => new Vector3());
    this.satBounds = new Array(4).fill().map(() => new SeparatingAxisBounds());
    this.points = [this.a, this.b, this.c];
    this.sphere = new Sphere();
    this.plane = new Plane();
    this.needsUpdate = true;
  }
  intersectsSphere(sphere) {
    return sphereIntersectTriangle(sphere, this);
  }
  update() {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const points = this.points;
    const satAxes = this.satAxes;
    const satBounds = this.satBounds;
    const axis0 = satAxes[0];
    const sab0 = satBounds[0];
    this.getNormal(axis0);
    sab0.setFromPoints(axis0, points);
    const axis1 = satAxes[1];
    const sab1 = satBounds[1];
    axis1.subVectors(a, b);
    sab1.setFromPoints(axis1, points);
    const axis2 = satAxes[2];
    const sab2 = satBounds[2];
    axis2.subVectors(b, c);
    sab2.setFromPoints(axis2, points);
    const axis3 = satAxes[3];
    const sab3 = satBounds[3];
    axis3.subVectors(c, a);
    sab3.setFromPoints(axis3, points);
    this.sphere.setFromPoints(this.points);
    this.plane.setFromNormalAndCoplanarPoint(axis0, a);
    this.needsUpdate = false;
  }
}
ExtendedTriangle.prototype.closestPointToSegment = function() {
  const point1 = new Vector3();
  const point2 = new Vector3();
  const edge = new Line3();
  return function distanceToSegment(segment, target1 = null, target2 = null) {
    const { start, end } = segment;
    const points = this.points;
    let distSq;
    let closestDistanceSq = Infinity;
    for (let i = 0; i < 3; i++) {
      const nexti = (i + 1) % 3;
      edge.start.copy(points[i]);
      edge.end.copy(points[nexti]);
      closestPointsSegmentToSegment(edge, segment, point1, point2);
      distSq = point1.distanceToSquared(point2);
      if (distSq < closestDistanceSq) {
        closestDistanceSq = distSq;
        if (target1) target1.copy(point1);
        if (target2) target2.copy(point2);
      }
    }
    this.closestPointToPoint(start, point1);
    distSq = start.distanceToSquared(point1);
    if (distSq < closestDistanceSq) {
      closestDistanceSq = distSq;
      if (target1) target1.copy(point1);
      if (target2) target2.copy(start);
    }
    this.closestPointToPoint(end, point1);
    distSq = end.distanceToSquared(point1);
    if (distSq < closestDistanceSq) {
      closestDistanceSq = distSq;
      if (target1) target1.copy(point1);
      if (target2) target2.copy(end);
    }
    return Math.sqrt(closestDistanceSq);
  };
}();
ExtendedTriangle.prototype.intersectsTriangle = function() {
  const saTri2 = new ExtendedTriangle();
  const arr1 = new Array(3);
  const arr2 = new Array(3);
  const cachedSatBounds = new SeparatingAxisBounds();
  const cachedSatBounds2 = new SeparatingAxisBounds();
  const cachedAxis = new Vector3();
  const dir = new Vector3();
  const dir1 = new Vector3();
  const dir2 = new Vector3();
  const tempDir = new Vector3();
  const edge = new Line3();
  const edge1 = new Line3();
  const edge2 = new Line3();
  const tempPoint = new Vector3();
  function triIntersectPlane(tri, plane, targetEdge) {
    const points = tri.points;
    let count = 0;
    let startPointIntersection = -1;
    for (let i = 0; i < 3; i++) {
      const { start, end } = edge;
      start.copy(points[i]);
      end.copy(points[(i + 1) % 3]);
      edge.delta(dir);
      const startIntersects = isNearZero(plane.distanceToPoint(start));
      if (isNearZero(plane.normal.dot(dir)) && startIntersects) {
        targetEdge.copy(edge);
        count = 2;
        break;
      }
      const doesIntersect = plane.intersectLine(edge, tempPoint);
      if (!doesIntersect && startIntersects) {
        tempPoint.copy(start);
      }
      if ((doesIntersect || startIntersects) && !isNearZero(tempPoint.distanceTo(end))) {
        if (count <= 1) {
          const point = count === 1 ? targetEdge.start : targetEdge.end;
          point.copy(tempPoint);
          if (startIntersects) {
            startPointIntersection = count;
          }
        } else if (count >= 2) {
          const point = startPointIntersection === 1 ? targetEdge.start : targetEdge.end;
          point.copy(tempPoint);
          count = 2;
          break;
        }
        count++;
        if (count === 2 && startPointIntersection === -1) {
          break;
        }
      }
    }
    return count;
  }
  return function intersectsTriangle(other, target = null, suppressLog = false) {
    if (this.needsUpdate) {
      this.update();
    }
    if (!other.isExtendedTriangle) {
      saTri2.copy(other);
      saTri2.update();
      other = saTri2;
    } else if (other.needsUpdate) {
      other.update();
    }
    const plane1 = this.plane;
    const plane2 = other.plane;
    if (Math.abs(plane1.normal.dot(plane2.normal)) > 1 - 1e-10) {
      const satBounds1 = this.satBounds;
      const satAxes1 = this.satAxes;
      arr2[0] = other.a;
      arr2[1] = other.b;
      arr2[2] = other.c;
      for (let i = 0; i < 4; i++) {
        const sb = satBounds1[i];
        const sa = satAxes1[i];
        cachedSatBounds.setFromPoints(sa, arr2);
        if (sb.isSeparated(cachedSatBounds)) return false;
      }
      const satBounds2 = other.satBounds;
      const satAxes2 = other.satAxes;
      arr1[0] = this.a;
      arr1[1] = this.b;
      arr1[2] = this.c;
      for (let i = 0; i < 4; i++) {
        const sb = satBounds2[i];
        const sa = satAxes2[i];
        cachedSatBounds.setFromPoints(sa, arr1);
        if (sb.isSeparated(cachedSatBounds)) return false;
      }
      for (let i = 0; i < 4; i++) {
        const sa1 = satAxes1[i];
        for (let i2 = 0; i2 < 4; i2++) {
          const sa2 = satAxes2[i2];
          cachedAxis.crossVectors(sa1, sa2);
          cachedSatBounds.setFromPoints(cachedAxis, arr1);
          cachedSatBounds2.setFromPoints(cachedAxis, arr2);
          if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
        }
      }
      if (target) {
        if (!suppressLog) {
          console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");
        }
        target.start.set(0, 0, 0);
        target.end.set(0, 0, 0);
      }
      return true;
    } else {
      const count1 = triIntersectPlane(this, plane2, edge1);
      if (count1 === 1 && other.containsPoint(edge1.end)) {
        if (target) {
          target.start.copy(edge1.end);
          target.end.copy(edge1.end);
        }
        return true;
      } else if (count1 !== 2) {
        return false;
      }
      const count2 = triIntersectPlane(other, plane1, edge2);
      if (count2 === 1 && this.containsPoint(edge2.end)) {
        if (target) {
          target.start.copy(edge2.end);
          target.end.copy(edge2.end);
        }
        return true;
      } else if (count2 !== 2) {
        return false;
      }
      edge1.delta(dir1);
      edge2.delta(dir2);
      if (dir1.dot(dir2) < 0) {
        let tmp = edge2.start;
        edge2.start = edge2.end;
        edge2.end = tmp;
      }
      const s1 = edge1.start.dot(dir1);
      const e1 = edge1.end.dot(dir1);
      const s2 = edge2.start.dot(dir1);
      const e2 = edge2.end.dot(dir1);
      const separated1 = e1 < s2;
      const separated2 = s1 < e2;
      if (s1 !== e2 && s2 !== e1 && separated1 === separated2) {
        return false;
      }
      if (target) {
        tempDir.subVectors(edge1.start, edge2.start);
        if (tempDir.dot(dir1) > 0) {
          target.start.copy(edge1.start);
        } else {
          target.start.copy(edge2.start);
        }
        tempDir.subVectors(edge1.end, edge2.end);
        if (tempDir.dot(dir1) < 0) {
          target.end.copy(edge1.end);
        } else {
          target.end.copy(edge2.end);
        }
      }
      return true;
    }
  };
}();
ExtendedTriangle.prototype.distanceToPoint = function() {
  const target = new Vector3();
  return function distanceToPoint(point) {
    this.closestPointToPoint(point, target);
    return point.distanceTo(target);
  };
}();
ExtendedTriangle.prototype.distanceToTriangle = function() {
  const point = new Vector3();
  const point2 = new Vector3();
  const cornerFields = ["a", "b", "c"];
  const line1 = new Line3();
  const line2 = new Line3();
  return function distanceToTriangle(other, target1 = null, target2 = null) {
    const lineTarget = target1 || target2 ? line1 : null;
    if (this.intersectsTriangle(other, lineTarget)) {
      if (target1 || target2) {
        if (target1) lineTarget.getCenter(target1);
        if (target2) lineTarget.getCenter(target2);
      }
      return 0;
    }
    let closestDistanceSq = Infinity;
    for (let i = 0; i < 3; i++) {
      let dist;
      const field = cornerFields[i];
      const otherVec = other[field];
      this.closestPointToPoint(otherVec, point);
      dist = otherVec.distanceToSquared(point);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(point);
        if (target2) target2.copy(otherVec);
      }
      const thisVec = this[field];
      other.closestPointToPoint(thisVec, point);
      dist = thisVec.distanceToSquared(point);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(thisVec);
        if (target2) target2.copy(point);
      }
    }
    for (let i = 0; i < 3; i++) {
      const f11 = cornerFields[i];
      const f12 = cornerFields[(i + 1) % 3];
      line1.set(this[f11], this[f12]);
      for (let i2 = 0; i2 < 3; i2++) {
        const f21 = cornerFields[i2];
        const f22 = cornerFields[(i2 + 1) % 3];
        line2.set(other[f21], other[f22]);
        closestPointsSegmentToSegment(line1, line2, point, point2);
        const dist = point.distanceToSquared(point2);
        if (dist < closestDistanceSq) {
          closestDistanceSq = dist;
          if (target1) target1.copy(point);
          if (target2) target2.copy(point2);
        }
      }
    }
    return Math.sqrt(closestDistanceSq);
  };
}();
class OrientedBox {
  constructor(min, max, matrix) {
    this.isOrientedBox = true;
    this.min = new Vector3();
    this.max = new Vector3();
    this.matrix = new Matrix4();
    this.invMatrix = new Matrix4();
    this.points = new Array(8).fill().map(() => new Vector3());
    this.satAxes = new Array(3).fill().map(() => new Vector3());
    this.satBounds = new Array(3).fill().map(() => new SeparatingAxisBounds());
    this.alignedSatBounds = new Array(3).fill().map(() => new SeparatingAxisBounds());
    this.needsUpdate = false;
    if (min) this.min.copy(min);
    if (max) this.max.copy(max);
    if (matrix) this.matrix.copy(matrix);
  }
  set(min, max, matrix) {
    this.min.copy(min);
    this.max.copy(max);
    this.matrix.copy(matrix);
    this.needsUpdate = true;
  }
  copy(other) {
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.matrix.copy(other.matrix);
    this.needsUpdate = true;
  }
}
OrientedBox.prototype.update = /* @__PURE__ */ function() {
  return function update() {
    const matrix = this.matrix;
    const min = this.min;
    const max = this.max;
    const points = this.points;
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          const i = (1 << 0) * x | (1 << 1) * y | (1 << 2) * z;
          const v = points[i];
          v.x = x ? max.x : min.x;
          v.y = y ? max.y : min.y;
          v.z = z ? max.z : min.z;
          v.applyMatrix4(matrix);
        }
      }
    }
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    const minVec = points[0];
    for (let i = 0; i < 3; i++) {
      const axis = satAxes[i];
      const sb = satBounds[i];
      const index = 1 << i;
      const pi = points[index];
      axis.subVectors(minVec, pi);
      sb.setFromPoints(axis, points);
    }
    const alignedSatBounds = this.alignedSatBounds;
    alignedSatBounds[0].setFromPointsField(points, "x");
    alignedSatBounds[1].setFromPointsField(points, "y");
    alignedSatBounds[2].setFromPointsField(points, "z");
    this.invMatrix.copy(this.matrix).invert();
    this.needsUpdate = false;
  };
}();
OrientedBox.prototype.intersectsBox = function() {
  const aabbBounds = new SeparatingAxisBounds();
  return function intersectsBox(box) {
    if (this.needsUpdate) {
      this.update();
    }
    const min = box.min;
    const max = box.max;
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    const alignedSatBounds = this.alignedSatBounds;
    aabbBounds.min = min.x;
    aabbBounds.max = max.x;
    if (alignedSatBounds[0].isSeparated(aabbBounds)) return false;
    aabbBounds.min = min.y;
    aabbBounds.max = max.y;
    if (alignedSatBounds[1].isSeparated(aabbBounds)) return false;
    aabbBounds.min = min.z;
    aabbBounds.max = max.z;
    if (alignedSatBounds[2].isSeparated(aabbBounds)) return false;
    for (let i = 0; i < 3; i++) {
      const axis = satAxes[i];
      const sb = satBounds[i];
      aabbBounds.setFromBox(axis, box);
      if (sb.isSeparated(aabbBounds)) return false;
    }
    return true;
  };
}();
OrientedBox.prototype.intersectsTriangle = function() {
  const saTri = new ExtendedTriangle();
  const pointsArr = new Array(3);
  const cachedSatBounds = new SeparatingAxisBounds();
  const cachedSatBounds2 = new SeparatingAxisBounds();
  const cachedAxis = new Vector3();
  return function intersectsTriangle(triangle3) {
    if (this.needsUpdate) {
      this.update();
    }
    if (!triangle3.isExtendedTriangle) {
      saTri.copy(triangle3);
      saTri.update();
      triangle3 = saTri;
    } else if (triangle3.needsUpdate) {
      triangle3.update();
    }
    const satBounds = this.satBounds;
    const satAxes = this.satAxes;
    pointsArr[0] = triangle3.a;
    pointsArr[1] = triangle3.b;
    pointsArr[2] = triangle3.c;
    for (let i = 0; i < 3; i++) {
      const sb = satBounds[i];
      const sa = satAxes[i];
      cachedSatBounds.setFromPoints(sa, pointsArr);
      if (sb.isSeparated(cachedSatBounds)) return false;
    }
    const triSatBounds = triangle3.satBounds;
    const triSatAxes = triangle3.satAxes;
    const points = this.points;
    for (let i = 0; i < 3; i++) {
      const sb = triSatBounds[i];
      const sa = triSatAxes[i];
      cachedSatBounds.setFromPoints(sa, points);
      if (sb.isSeparated(cachedSatBounds)) return false;
    }
    for (let i = 0; i < 3; i++) {
      const sa1 = satAxes[i];
      for (let i2 = 0; i2 < 4; i2++) {
        const sa2 = triSatAxes[i2];
        cachedAxis.crossVectors(sa1, sa2);
        cachedSatBounds.setFromPoints(cachedAxis, pointsArr);
        cachedSatBounds2.setFromPoints(cachedAxis, points);
        if (cachedSatBounds.isSeparated(cachedSatBounds2)) return false;
      }
    }
    return true;
  };
}();
OrientedBox.prototype.closestPointToPoint = /* @__PURE__ */ function() {
  return function closestPointToPoint2(point, target1) {
    if (this.needsUpdate) {
      this.update();
    }
    target1.copy(point).applyMatrix4(this.invMatrix).clamp(this.min, this.max).applyMatrix4(this.matrix);
    return target1;
  };
}();
OrientedBox.prototype.distanceToPoint = function() {
  const target = new Vector3();
  return function distanceToPoint(point) {
    this.closestPointToPoint(point, target);
    return point.distanceTo(target);
  };
}();
OrientedBox.prototype.distanceToBox = function() {
  const xyzFields = ["x", "y", "z"];
  const segments1 = new Array(12).fill().map(() => new Line3());
  const segments2 = new Array(12).fill().map(() => new Line3());
  const point1 = new Vector3();
  const point2 = new Vector3();
  return function distanceToBox(box, threshold = 0, target1 = null, target2 = null) {
    if (this.needsUpdate) {
      this.update();
    }
    if (this.intersectsBox(box)) {
      if (target1 || target2) {
        box.getCenter(point2);
        this.closestPointToPoint(point2, point1);
        box.closestPointToPoint(point1, point2);
        if (target1) target1.copy(point1);
        if (target2) target2.copy(point2);
      }
      return 0;
    }
    const threshold2 = threshold * threshold;
    const min = box.min;
    const max = box.max;
    const points = this.points;
    let closestDistanceSq = Infinity;
    for (let i = 0; i < 8; i++) {
      const p2 = points[i];
      point2.copy(p2).clamp(min, max);
      const dist = p2.distanceToSquared(point2);
      if (dist < closestDistanceSq) {
        closestDistanceSq = dist;
        if (target1) target1.copy(p2);
        if (target2) target2.copy(point2);
        if (dist < threshold2) return Math.sqrt(dist);
      }
    }
    let count = 0;
    for (let i = 0; i < 3; i++) {
      for (let i1 = 0; i1 <= 1; i1++) {
        for (let i2 = 0; i2 <= 1; i2++) {
          const nextIndex = (i + 1) % 3;
          const nextIndex2 = (i + 2) % 3;
          const index = i1 << nextIndex | i2 << nextIndex2;
          const index2 = 1 << i | i1 << nextIndex | i2 << nextIndex2;
          const p1 = points[index];
          const p2 = points[index2];
          const line1 = segments1[count];
          line1.set(p1, p2);
          const f1 = xyzFields[i];
          const f2 = xyzFields[nextIndex];
          const f3 = xyzFields[nextIndex2];
          const line2 = segments2[count];
          const start = line2.start;
          const end = line2.end;
          start[f1] = min[f1];
          start[f2] = i1 ? min[f2] : max[f2];
          start[f3] = i2 ? min[f3] : max[f2];
          end[f1] = max[f1];
          end[f2] = i1 ? min[f2] : max[f2];
          end[f3] = i2 ? min[f3] : max[f2];
          count++;
        }
      }
    }
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          point2.x = x ? max.x : min.x;
          point2.y = y ? max.y : min.y;
          point2.z = z ? max.z : min.z;
          this.closestPointToPoint(point2, point1);
          const dist = point2.distanceToSquared(point1);
          if (dist < closestDistanceSq) {
            closestDistanceSq = dist;
            if (target1) target1.copy(point1);
            if (target2) target2.copy(point2);
            if (dist < threshold2) return Math.sqrt(dist);
          }
        }
      }
    }
    for (let i = 0; i < 12; i++) {
      const l1 = segments1[i];
      for (let i2 = 0; i2 < 12; i2++) {
        const l2 = segments2[i2];
        closestPointsSegmentToSegment(l1, l2, point1, point2);
        const dist = point1.distanceToSquared(point2);
        if (dist < closestDistanceSq) {
          closestDistanceSq = dist;
          if (target1) target1.copy(point1);
          if (target2) target2.copy(point2);
          if (dist < threshold2) return Math.sqrt(dist);
        }
      }
    }
    return Math.sqrt(closestDistanceSq);
  };
}();
class PrimitivePool {
  constructor(getNewPrimitive) {
    this._getNewPrimitive = getNewPrimitive;
    this._primitives = [];
  }
  getPrimitive() {
    const primitives = this._primitives;
    if (primitives.length === 0) {
      return this._getNewPrimitive();
    } else {
      return primitives.pop();
    }
  }
  releasePrimitive(primitive) {
    this._primitives.push(primitive);
  }
}
class ExtendedTrianglePoolBase extends PrimitivePool {
  constructor() {
    super(() => new ExtendedTriangle());
  }
}
const ExtendedTrianglePool = /* @__PURE__ */ new ExtendedTrianglePoolBase();
class _BufferStack {
  constructor() {
    this.float32Array = null;
    this.uint16Array = null;
    this.uint32Array = null;
    const stack = [];
    let prevBuffer = null;
    this.setBuffer = (buffer) => {
      if (prevBuffer) {
        stack.push(prevBuffer);
      }
      prevBuffer = buffer;
      this.float32Array = new Float32Array(buffer);
      this.uint16Array = new Uint16Array(buffer);
      this.uint32Array = new Uint32Array(buffer);
    };
    this.clearBuffer = () => {
      prevBuffer = null;
      this.float32Array = null;
      this.uint16Array = null;
      this.uint32Array = null;
      if (stack.length !== 0) {
        this.setBuffer(stack.pop());
      }
    };
  }
}
const BufferStack = new _BufferStack();
let _box1, _box2;
const boxStack = [];
const boxPool = /* @__PURE__ */ new PrimitivePool(() => new Box3());
function shapecast(bvh, root, intersectsBounds, intersectsRange, boundsTraverseOrder, byteOffset) {
  _box1 = boxPool.getPrimitive();
  _box2 = boxPool.getPrimitive();
  boxStack.push(_box1, _box2);
  BufferStack.setBuffer(bvh._roots[root]);
  const result = shapecastTraverse(0, bvh.geometry, intersectsBounds, intersectsRange, boundsTraverseOrder, byteOffset);
  BufferStack.clearBuffer();
  boxPool.releasePrimitive(_box1);
  boxPool.releasePrimitive(_box2);
  boxStack.pop();
  boxStack.pop();
  const length = boxStack.length;
  if (length > 0) {
    _box2 = boxStack[length - 1];
    _box1 = boxStack[length - 2];
  }
  return result;
}
function shapecastTraverse(nodeIndex32, geometry, intersectsBoundsFunc, intersectsRangeFunc, nodeScoreFunc = null, nodeIndexByteOffset = 0, depth = 0) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, _box1);
    return intersectsRangeFunc(offset, count, false, depth, nodeIndexByteOffset + nodeIndex32, _box1);
  } else {
    let getLeftOffset = function(nodeIndex322) {
      const { uint16Array: uint16Array3, uint32Array: uint32Array3 } = BufferStack;
      let nodeIndex162 = nodeIndex322 * 2;
      while (!IS_LEAF(nodeIndex162, uint16Array3)) {
        nodeIndex322 = LEFT_NODE(nodeIndex322);
        nodeIndex162 = nodeIndex322 * 2;
      }
      return OFFSET(nodeIndex322, uint32Array3);
    }, getRightEndOffset = function(nodeIndex322) {
      const { uint16Array: uint16Array3, uint32Array: uint32Array3 } = BufferStack;
      let nodeIndex162 = nodeIndex322 * 2;
      while (!IS_LEAF(nodeIndex162, uint16Array3)) {
        nodeIndex322 = RIGHT_NODE(nodeIndex322, uint32Array3);
        nodeIndex162 = nodeIndex322 * 2;
      }
      return OFFSET(nodeIndex322, uint32Array3) + COUNT(nodeIndex162, uint16Array3);
    };
    const left = LEFT_NODE(nodeIndex32);
    const right = RIGHT_NODE(nodeIndex32, uint32Array2);
    let c1 = left;
    let c2 = right;
    let score1, score2;
    let box1, box2;
    if (nodeScoreFunc) {
      box1 = _box1;
      box2 = _box2;
      arrayToBox(BOUNDING_DATA_INDEX(c1), float32Array2, box1);
      arrayToBox(BOUNDING_DATA_INDEX(c2), float32Array2, box2);
      score1 = nodeScoreFunc(box1);
      score2 = nodeScoreFunc(box2);
      if (score2 < score1) {
        c1 = right;
        c2 = left;
        const temp5 = score1;
        score1 = score2;
        score2 = temp5;
        box1 = box2;
      }
    }
    if (!box1) {
      box1 = _box1;
      arrayToBox(BOUNDING_DATA_INDEX(c1), float32Array2, box1);
    }
    const isC1Leaf = IS_LEAF(c1 * 2, uint16Array2);
    const c1Intersection = intersectsBoundsFunc(box1, isC1Leaf, score1, depth + 1, nodeIndexByteOffset + c1);
    let c1StopTraversal;
    if (c1Intersection === CONTAINED) {
      const offset = getLeftOffset(c1);
      const end = getRightEndOffset(c1);
      const count = end - offset;
      c1StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexByteOffset + c1, box1);
    } else {
      c1StopTraversal = c1Intersection && shapecastTraverse(
        c1,
        geometry,
        intersectsBoundsFunc,
        intersectsRangeFunc,
        nodeScoreFunc,
        nodeIndexByteOffset,
        depth + 1
      );
    }
    if (c1StopTraversal) return true;
    box2 = _box2;
    arrayToBox(BOUNDING_DATA_INDEX(c2), float32Array2, box2);
    const isC2Leaf = IS_LEAF(c2 * 2, uint16Array2);
    const c2Intersection = intersectsBoundsFunc(box2, isC2Leaf, score2, depth + 1, nodeIndexByteOffset + c2);
    let c2StopTraversal;
    if (c2Intersection === CONTAINED) {
      const offset = getLeftOffset(c2);
      const end = getRightEndOffset(c2);
      const count = end - offset;
      c2StopTraversal = intersectsRangeFunc(offset, count, true, depth + 1, nodeIndexByteOffset + c2, box2);
    } else {
      c2StopTraversal = c2Intersection && shapecastTraverse(
        c2,
        geometry,
        intersectsBoundsFunc,
        intersectsRangeFunc,
        nodeScoreFunc,
        nodeIndexByteOffset,
        depth + 1
      );
    }
    if (c2StopTraversal) return true;
    return false;
  }
}
const temp = /* @__PURE__ */ new Vector3();
const temp1$2 = /* @__PURE__ */ new Vector3();
function closestPointToPoint(bvh, point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
  const minThresholdSq = minThreshold * minThreshold;
  const maxThresholdSq = maxThreshold * maxThreshold;
  let closestDistanceSq = Infinity;
  let closestDistanceTriIndex = null;
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        temp.copy(point).clamp(box.min, box.max);
        return temp.distanceToSquared(point);
      },
      intersectsBounds: (box, isLeaf, score) => {
        return score < closestDistanceSq && score < maxThresholdSq;
      },
      intersectsTriangle: (tri, triIndex) => {
        tri.closestPointToPoint(point, temp);
        const distSq = point.distanceToSquared(temp);
        if (distSq < closestDistanceSq) {
          temp1$2.copy(temp);
          closestDistanceSq = distSq;
          closestDistanceTriIndex = triIndex;
        }
        if (distSq < minThresholdSq) {
          return true;
        } else {
          return false;
        }
      }
    }
  );
  if (closestDistanceSq === Infinity) return null;
  const closestDistance = Math.sqrt(closestDistanceSq);
  if (!target.point) target.point = temp1$2.clone();
  else target.point.copy(temp1$2);
  target.distance = closestDistance, target.faceIndex = closestDistanceTriIndex;
  return target;
}
const _vA = /* @__PURE__ */ new Vector3();
const _vB = /* @__PURE__ */ new Vector3();
const _vC = /* @__PURE__ */ new Vector3();
const _uvA = /* @__PURE__ */ new Vector2();
const _uvB = /* @__PURE__ */ new Vector2();
const _uvC = /* @__PURE__ */ new Vector2();
const _normalA = /* @__PURE__ */ new Vector3();
const _normalB = /* @__PURE__ */ new Vector3();
const _normalC = /* @__PURE__ */ new Vector3();
const _intersectionPoint = /* @__PURE__ */ new Vector3();
function checkIntersection(ray2, pA, pB, pC, point, side, near, far) {
  let intersect;
  if (side === BackSide) {
    intersect = ray2.intersectTriangle(pC, pB, pA, true, point);
  } else {
    intersect = ray2.intersectTriangle(pA, pB, pC, side !== DoubleSide, point);
  }
  if (intersect === null) return null;
  const distance = ray2.origin.distanceTo(point);
  if (distance < near || distance > far) return null;
  return {
    distance,
    point: point.clone()
  };
}
function checkBufferGeometryIntersection(ray2, position, normal, uv, uv1, a, b, c, side, near, far) {
  _vA.fromBufferAttribute(position, a);
  _vB.fromBufferAttribute(position, b);
  _vC.fromBufferAttribute(position, c);
  const intersection = checkIntersection(ray2, _vA, _vB, _vC, _intersectionPoint, side, near, far);
  if (intersection) {
    if (uv) {
      _uvA.fromBufferAttribute(uv, a);
      _uvB.fromBufferAttribute(uv, b);
      _uvC.fromBufferAttribute(uv, c);
      intersection.uv = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2());
    }
    if (uv1) {
      _uvA.fromBufferAttribute(uv1, a);
      _uvB.fromBufferAttribute(uv1, b);
      _uvC.fromBufferAttribute(uv1, c);
      intersection.uv1 = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2());
    }
    if (normal) {
      _normalA.fromBufferAttribute(normal, a);
      _normalB.fromBufferAttribute(normal, b);
      _normalC.fromBufferAttribute(normal, c);
      intersection.normal = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _normalA, _normalB, _normalC, new Vector3());
      if (intersection.normal.dot(ray2.direction) > 0) {
        intersection.normal.multiplyScalar(-1);
      }
    }
    const face = {
      a,
      b,
      c,
      normal: new Vector3(),
      materialIndex: 0
    };
    Triangle.getNormal(_vA, _vB, _vC, face.normal);
    intersection.face = face;
    intersection.faceIndex = a;
  }
  return intersection;
}
function intersectTri(geo, side, ray2, tri, intersections, near, far) {
  const triOffset = tri * 3;
  let a = triOffset + 0;
  let b = triOffset + 1;
  let c = triOffset + 2;
  const index = geo.index;
  if (geo.index) {
    a = index.getX(a);
    b = index.getX(b);
    c = index.getX(c);
  }
  const { position, normal, uv, uv1 } = geo.attributes;
  const intersection = checkBufferGeometryIntersection(ray2, position, normal, uv, uv1, a, b, c, side, near, far);
  if (intersection) {
    intersection.faceIndex = tri;
    if (intersections) intersections.push(intersection);
    return intersection;
  }
  return null;
}
function setTriangle(tri, i, index, pos) {
  const ta = tri.a;
  const tb = tri.b;
  const tc = tri.c;
  let i0 = i;
  let i1 = i + 1;
  let i2 = i + 2;
  if (index) {
    i0 = index.getX(i0);
    i1 = index.getX(i1);
    i2 = index.getX(i2);
  }
  ta.x = pos.getX(i0);
  ta.y = pos.getY(i0);
  ta.z = pos.getZ(i0);
  tb.x = pos.getX(i1);
  tb.y = pos.getY(i1);
  tb.z = pos.getZ(i1);
  tc.x = pos.getX(i2);
  tc.y = pos.getY(i2);
  tc.z = pos.getZ(i2);
}
function intersectTris(bvh, side, ray2, offset, count, intersections, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  for (let i = offset, end = offset + count; i < end; i++) {
    intersectTri(geometry, side, ray2, i, intersections, near, far);
  }
}
function intersectClosestTri(bvh, side, ray2, offset, count, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  let dist = Infinity;
  let res = null;
  for (let i = offset, end = offset + count; i < end; i++) {
    let intersection;
    intersection = intersectTri(geometry, side, ray2, i, null, near, far);
    if (intersection && intersection.distance < dist) {
      res = intersection;
      dist = intersection.distance;
    }
  }
  return res;
}
function iterateOverTriangles(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle3) {
  const { geometry } = bvh;
  const { index } = geometry;
  const pos = geometry.attributes.position;
  for (let i = offset, l2 = count + offset; i < l2; i++) {
    let tri;
    tri = i;
    setTriangle(triangle3, tri * 3, index, pos);
    triangle3.needsUpdate = true;
    if (intersectsTriangleFunc(triangle3, tri, contained, depth)) {
      return true;
    }
  }
  return false;
}
function refit(bvh, nodeIndices = null) {
  if (nodeIndices && Array.isArray(nodeIndices)) {
    nodeIndices = new Set(nodeIndices);
  }
  const geometry = bvh.geometry;
  const indexArr = geometry.index ? geometry.index.array : null;
  const posAttr = geometry.attributes.position;
  let buffer, uint32Array2, uint16Array2, float32Array2;
  let byteOffset = 0;
  const roots = bvh._roots;
  for (let i = 0, l2 = roots.length; i < l2; i++) {
    buffer = roots[i];
    uint32Array2 = new Uint32Array(buffer);
    uint16Array2 = new Uint16Array(buffer);
    float32Array2 = new Float32Array(buffer);
    _traverse2(0, byteOffset);
    byteOffset += buffer.byteLength;
  }
  function _traverse2(node32Index, byteOffset2, force = false) {
    const node16Index = node32Index * 2;
    const isLeaf = uint16Array2[node16Index + 15] === IS_LEAFNODE_FLAG;
    if (isLeaf) {
      const offset = uint32Array2[node32Index + 6];
      const count = uint16Array2[node16Index + 14];
      let minx = Infinity;
      let miny = Infinity;
      let minz = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;
      let maxz = -Infinity;
      for (let i = 3 * offset, l2 = 3 * (offset + count); i < l2; i++) {
        let index = indexArr[i];
        const x = posAttr.getX(index);
        const y = posAttr.getY(index);
        const z = posAttr.getZ(index);
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
        if (z < minz) minz = z;
        if (z > maxz) maxz = z;
      }
      if (float32Array2[node32Index + 0] !== minx || float32Array2[node32Index + 1] !== miny || float32Array2[node32Index + 2] !== minz || float32Array2[node32Index + 3] !== maxx || float32Array2[node32Index + 4] !== maxy || float32Array2[node32Index + 5] !== maxz) {
        float32Array2[node32Index + 0] = minx;
        float32Array2[node32Index + 1] = miny;
        float32Array2[node32Index + 2] = minz;
        float32Array2[node32Index + 3] = maxx;
        float32Array2[node32Index + 4] = maxy;
        float32Array2[node32Index + 5] = maxz;
        return true;
      } else {
        return false;
      }
    } else {
      const left = node32Index + 8;
      const right = uint32Array2[node32Index + 6];
      const offsetLeft = left + byteOffset2;
      const offsetRight = right + byteOffset2;
      let forceChildren = force;
      let includesLeft = false;
      let includesRight = false;
      if (nodeIndices) {
        if (!forceChildren) {
          includesLeft = nodeIndices.has(offsetLeft);
          includesRight = nodeIndices.has(offsetRight);
          forceChildren = !includesLeft && !includesRight;
        }
      } else {
        includesLeft = true;
        includesRight = true;
      }
      const traverseLeft = forceChildren || includesLeft;
      const traverseRight = forceChildren || includesRight;
      let leftChange = false;
      if (traverseLeft) {
        leftChange = _traverse2(left, byteOffset2, forceChildren);
      }
      let rightChange = false;
      if (traverseRight) {
        rightChange = _traverse2(right, byteOffset2, forceChildren);
      }
      const didChange = leftChange || rightChange;
      if (didChange) {
        for (let i = 0; i < 3; i++) {
          const lefti = left + i;
          const righti = right + i;
          const minLeftValue = float32Array2[lefti];
          const maxLeftValue = float32Array2[lefti + 3];
          const minRightValue = float32Array2[righti];
          const maxRightValue = float32Array2[righti + 3];
          float32Array2[node32Index + i] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
          float32Array2[node32Index + i + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
        }
      }
      return didChange;
    }
  }
}
function intersectRay(nodeIndex32, array, ray2, near, far) {
  let tmin, tmax, tymin, tymax, tzmin, tzmax;
  const invdirx = 1 / ray2.direction.x, invdiry = 1 / ray2.direction.y, invdirz = 1 / ray2.direction.z;
  const ox = ray2.origin.x;
  const oy = ray2.origin.y;
  const oz = ray2.origin.z;
  let minx = array[nodeIndex32];
  let maxx = array[nodeIndex32 + 3];
  let miny = array[nodeIndex32 + 1];
  let maxy = array[nodeIndex32 + 3 + 1];
  let minz = array[nodeIndex32 + 2];
  let maxz = array[nodeIndex32 + 3 + 2];
  if (invdirx >= 0) {
    tmin = (minx - ox) * invdirx;
    tmax = (maxx - ox) * invdirx;
  } else {
    tmin = (maxx - ox) * invdirx;
    tmax = (minx - ox) * invdirx;
  }
  if (invdiry >= 0) {
    tymin = (miny - oy) * invdiry;
    tymax = (maxy - oy) * invdiry;
  } else {
    tymin = (maxy - oy) * invdiry;
    tymax = (miny - oy) * invdiry;
  }
  if (tmin > tymax || tymin > tmax) return false;
  if (tymin > tmin || isNaN(tmin)) tmin = tymin;
  if (tymax < tmax || isNaN(tmax)) tmax = tymax;
  if (invdirz >= 0) {
    tzmin = (minz - oz) * invdirz;
    tzmax = (maxz - oz) * invdirz;
  } else {
    tzmin = (maxz - oz) * invdirz;
    tzmax = (minz - oz) * invdirz;
  }
  if (tmin > tzmax || tzmin > tmax) return false;
  if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
  if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
  return tmin <= far && tmax >= near;
}
function intersectTris_indirect(bvh, side, ray2, offset, count, intersections, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  for (let i = offset, end = offset + count; i < end; i++) {
    let vi = _indirectBuffer ? _indirectBuffer[i] : i;
    intersectTri(geometry, side, ray2, vi, intersections, near, far);
  }
}
function intersectClosestTri_indirect(bvh, side, ray2, offset, count, near, far) {
  const { geometry, _indirectBuffer } = bvh;
  let dist = Infinity;
  let res = null;
  for (let i = offset, end = offset + count; i < end; i++) {
    let intersection;
    intersection = intersectTri(geometry, side, ray2, _indirectBuffer ? _indirectBuffer[i] : i, null, near, far);
    if (intersection && intersection.distance < dist) {
      res = intersection;
      dist = intersection.distance;
    }
  }
  return res;
}
function iterateOverTriangles_indirect(offset, count, bvh, intersectsTriangleFunc, contained, depth, triangle3) {
  const { geometry } = bvh;
  const { index } = geometry;
  const pos = geometry.attributes.position;
  for (let i = offset, l2 = count + offset; i < l2; i++) {
    let tri;
    tri = bvh.resolveTriangleIndex(i);
    setTriangle(triangle3, tri * 3, index, pos);
    triangle3.needsUpdate = true;
    if (intersectsTriangleFunc(triangle3, tri, contained, depth)) {
      return true;
    }
  }
  return false;
}
function raycast(bvh, root, side, ray2, intersects, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  _raycast$1(0, bvh, side, ray2, intersects, near, far);
  BufferStack.clearBuffer();
}
function _raycast$1(nodeIndex32, bvh, side, ray2, intersects, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  const nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    intersectTris(bvh, side, ray2, offset, count, intersects, near, far);
  } else {
    const leftIndex = LEFT_NODE(nodeIndex32);
    if (intersectRay(leftIndex, float32Array2, ray2, near, far)) {
      _raycast$1(leftIndex, bvh, side, ray2, intersects, near, far);
    }
    const rightIndex = RIGHT_NODE(nodeIndex32, uint32Array2);
    if (intersectRay(rightIndex, float32Array2, ray2, near, far)) {
      _raycast$1(rightIndex, bvh, side, ray2, intersects, near, far);
    }
  }
}
const _xyzFields$1 = ["x", "y", "z"];
function raycastFirst(bvh, root, side, ray2, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _raycastFirst$1(0, bvh, side, ray2, near, far);
  BufferStack.clearBuffer();
  return result;
}
function _raycastFirst$1(nodeIndex32, bvh, side, ray2, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    return intersectClosestTri(bvh, side, ray2, offset, count, near, far);
  } else {
    const splitAxis = SPLIT_AXIS(nodeIndex32, uint32Array2);
    const xyzAxis = _xyzFields$1[splitAxis];
    const rayDir = ray2.direction[xyzAxis];
    const leftToRight = rayDir >= 0;
    let c1, c2;
    if (leftToRight) {
      c1 = LEFT_NODE(nodeIndex32);
      c2 = RIGHT_NODE(nodeIndex32, uint32Array2);
    } else {
      c1 = RIGHT_NODE(nodeIndex32, uint32Array2);
      c2 = LEFT_NODE(nodeIndex32);
    }
    const c1Intersection = intersectRay(c1, float32Array2, ray2, near, far);
    const c1Result = c1Intersection ? _raycastFirst$1(c1, bvh, side, ray2, near, far) : null;
    if (c1Result) {
      const point = c1Result.point[xyzAxis];
      const isOutside = leftToRight ? point <= float32Array2[c2 + splitAxis] : (
        // min bounding data
        point >= float32Array2[c2 + splitAxis + 3]
      );
      if (isOutside) {
        return c1Result;
      }
    }
    const c2Intersection = intersectRay(c2, float32Array2, ray2, near, far);
    const c2Result = c2Intersection ? _raycastFirst$1(c2, bvh, side, ray2, near, far) : null;
    if (c1Result && c2Result) {
      return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
    } else {
      return c1Result || c2Result || null;
    }
  }
}
const boundingBox$1 = /* @__PURE__ */ new Box3();
const triangle$1 = /* @__PURE__ */ new ExtendedTriangle();
const triangle2$1 = /* @__PURE__ */ new ExtendedTriangle();
const invertedMat$1 = /* @__PURE__ */ new Matrix4();
const obb$4 = /* @__PURE__ */ new OrientedBox();
const obb2$3 = /* @__PURE__ */ new OrientedBox();
function intersectsGeometry(bvh, root, otherGeometry, geometryToBvh) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _intersectsGeometry$1(0, bvh, otherGeometry, geometryToBvh);
  BufferStack.clearBuffer();
  return result;
}
function _intersectsGeometry$1(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  if (cachedObb === null) {
    if (!otherGeometry.boundingBox) {
      otherGeometry.computeBoundingBox();
    }
    obb$4.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    cachedObb = obb$4;
  }
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const thisGeometry = bvh.geometry;
    const thisIndex = thisGeometry.index;
    const thisPos = thisGeometry.attributes.position;
    const index = otherGeometry.index;
    const pos = otherGeometry.attributes.position;
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    invertedMat$1.copy(geometryToBvh).invert();
    if (otherGeometry.boundsTree) {
      arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, obb2$3);
      obb2$3.matrix.copy(invertedMat$1);
      obb2$3.needsUpdate = true;
      const res = otherGeometry.boundsTree.shapecast({
        intersectsBounds: (box) => obb2$3.intersectsBox(box),
        intersectsTriangle: (tri) => {
          tri.a.applyMatrix4(geometryToBvh);
          tri.b.applyMatrix4(geometryToBvh);
          tri.c.applyMatrix4(geometryToBvh);
          tri.needsUpdate = true;
          for (let i = offset * 3, l2 = (count + offset) * 3; i < l2; i += 3) {
            setTriangle(triangle2$1, i, thisIndex, thisPos);
            triangle2$1.needsUpdate = true;
            if (tri.intersectsTriangle(triangle2$1)) {
              return true;
            }
          }
          return false;
        }
      });
      return res;
    } else {
      for (let i = offset * 3, l2 = (count + offset) * 3; i < l2; i += 3) {
        setTriangle(triangle$1, i, thisIndex, thisPos);
        triangle$1.a.applyMatrix4(invertedMat$1);
        triangle$1.b.applyMatrix4(invertedMat$1);
        triangle$1.c.applyMatrix4(invertedMat$1);
        triangle$1.needsUpdate = true;
        for (let i2 = 0, l22 = index.count; i2 < l22; i2 += 3) {
          setTriangle(triangle2$1, i2, index, pos);
          triangle2$1.needsUpdate = true;
          if (triangle$1.intersectsTriangle(triangle2$1)) {
            return true;
          }
        }
      }
    }
  } else {
    const left = nodeIndex32 + 8;
    const right = uint32Array2[nodeIndex32 + 6];
    arrayToBox(BOUNDING_DATA_INDEX(left), float32Array2, boundingBox$1);
    const leftIntersection = cachedObb.intersectsBox(boundingBox$1) && _intersectsGeometry$1(left, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (leftIntersection) return true;
    arrayToBox(BOUNDING_DATA_INDEX(right), float32Array2, boundingBox$1);
    const rightIntersection = cachedObb.intersectsBox(boundingBox$1) && _intersectsGeometry$1(right, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (rightIntersection) return true;
    return false;
  }
}
const tempMatrix$1 = /* @__PURE__ */ new Matrix4();
const obb$3 = /* @__PURE__ */ new OrientedBox();
const obb2$2 = /* @__PURE__ */ new OrientedBox();
const temp1$1 = /* @__PURE__ */ new Vector3();
const temp2$1 = /* @__PURE__ */ new Vector3();
const temp3$1 = /* @__PURE__ */ new Vector3();
const temp4$1 = /* @__PURE__ */ new Vector3();
function closestPointToGeometry(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
  if (!otherGeometry.boundingBox) {
    otherGeometry.computeBoundingBox();
  }
  obb$3.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
  obb$3.needsUpdate = true;
  const geometry = bvh.geometry;
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const otherPos = otherGeometry.attributes.position;
  const otherIndex = otherGeometry.index;
  const triangle3 = ExtendedTrianglePool.getPrimitive();
  const triangle22 = ExtendedTrianglePool.getPrimitive();
  let tempTarget1 = temp1$1;
  let tempTargetDest1 = temp2$1;
  let tempTarget2 = null;
  let tempTargetDest2 = null;
  if (target2) {
    tempTarget2 = temp3$1;
    tempTargetDest2 = temp4$1;
  }
  let closestDistance = Infinity;
  let closestDistanceTriIndex = null;
  let closestDistanceOtherTriIndex = null;
  tempMatrix$1.copy(geometryToBvh).invert();
  obb2$2.matrix.copy(tempMatrix$1);
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        return obb$3.distanceToBox(box);
      },
      intersectsBounds: (box, isLeaf, score) => {
        if (score < closestDistance && score < maxThreshold) {
          if (isLeaf) {
            obb2$2.min.copy(box.min);
            obb2$2.max.copy(box.max);
            obb2$2.needsUpdate = true;
          }
          return true;
        }
        return false;
      },
      intersectsRange: (offset, count) => {
        if (otherGeometry.boundsTree) {
          const otherBvh = otherGeometry.boundsTree;
          return otherBvh.shapecast({
            boundsTraverseOrder: (box) => {
              return obb2$2.distanceToBox(box);
            },
            intersectsBounds: (box, isLeaf, score) => {
              return score < closestDistance && score < maxThreshold;
            },
            intersectsRange: (otherOffset, otherCount) => {
              for (let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++) {
                setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
                triangle22.a.applyMatrix4(geometryToBvh);
                triangle22.b.applyMatrix4(geometryToBvh);
                triangle22.c.applyMatrix4(geometryToBvh);
                triangle22.needsUpdate = true;
                for (let i = offset, l3 = offset + count; i < l3; i++) {
                  setTriangle(triangle3, 3 * i, index, pos);
                  triangle3.needsUpdate = true;
                  const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
                  if (dist < closestDistance) {
                    tempTargetDest1.copy(tempTarget1);
                    if (tempTargetDest2) {
                      tempTargetDest2.copy(tempTarget2);
                    }
                    closestDistance = dist;
                    closestDistanceTriIndex = i;
                    closestDistanceOtherTriIndex = i2;
                  }
                  if (dist < minThreshold) {
                    return true;
                  }
                }
              }
            }
          });
        } else {
          const triCount = getTriCount(otherGeometry);
          for (let i2 = 0, l2 = triCount; i2 < l2; i2++) {
            setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
            triangle22.a.applyMatrix4(geometryToBvh);
            triangle22.b.applyMatrix4(geometryToBvh);
            triangle22.c.applyMatrix4(geometryToBvh);
            triangle22.needsUpdate = true;
            for (let i = offset, l3 = offset + count; i < l3; i++) {
              setTriangle(triangle3, 3 * i, index, pos);
              triangle3.needsUpdate = true;
              const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
              if (dist < closestDistance) {
                tempTargetDest1.copy(tempTarget1);
                if (tempTargetDest2) {
                  tempTargetDest2.copy(tempTarget2);
                }
                closestDistance = dist;
                closestDistanceTriIndex = i;
                closestDistanceOtherTriIndex = i2;
              }
              if (dist < minThreshold) {
                return true;
              }
            }
          }
        }
      }
    }
  );
  ExtendedTrianglePool.releasePrimitive(triangle3);
  ExtendedTrianglePool.releasePrimitive(triangle22);
  if (closestDistance === Infinity) {
    return null;
  }
  if (!target1.point) {
    target1.point = tempTargetDest1.clone();
  } else {
    target1.point.copy(tempTargetDest1);
  }
  target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
  if (target2) {
    if (!target2.point) target2.point = tempTargetDest2.clone();
    else target2.point.copy(tempTargetDest2);
    target2.point.applyMatrix4(tempMatrix$1);
    tempTargetDest1.applyMatrix4(tempMatrix$1);
    target2.distance = tempTargetDest1.sub(target2.point).length();
    target2.faceIndex = closestDistanceOtherTriIndex;
  }
  return target1;
}
function refit_indirect(bvh, nodeIndices = null) {
  if (nodeIndices && Array.isArray(nodeIndices)) {
    nodeIndices = new Set(nodeIndices);
  }
  const geometry = bvh.geometry;
  const indexArr = geometry.index ? geometry.index.array : null;
  const posAttr = geometry.attributes.position;
  let buffer, uint32Array2, uint16Array2, float32Array2;
  let byteOffset = 0;
  const roots = bvh._roots;
  for (let i = 0, l2 = roots.length; i < l2; i++) {
    buffer = roots[i];
    uint32Array2 = new Uint32Array(buffer);
    uint16Array2 = new Uint16Array(buffer);
    float32Array2 = new Float32Array(buffer);
    _traverse2(0, byteOffset);
    byteOffset += buffer.byteLength;
  }
  function _traverse2(node32Index, byteOffset2, force = false) {
    const node16Index = node32Index * 2;
    const isLeaf = uint16Array2[node16Index + 15] === IS_LEAFNODE_FLAG;
    if (isLeaf) {
      const offset = uint32Array2[node32Index + 6];
      const count = uint16Array2[node16Index + 14];
      let minx = Infinity;
      let miny = Infinity;
      let minz = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;
      let maxz = -Infinity;
      for (let i = offset, l2 = offset + count; i < l2; i++) {
        const t = 3 * bvh.resolveTriangleIndex(i);
        for (let j2 = 0; j2 < 3; j2++) {
          let index = t + j2;
          index = indexArr ? indexArr[index] : index;
          const x = posAttr.getX(index);
          const y = posAttr.getY(index);
          const z = posAttr.getZ(index);
          if (x < minx) minx = x;
          if (x > maxx) maxx = x;
          if (y < miny) miny = y;
          if (y > maxy) maxy = y;
          if (z < minz) minz = z;
          if (z > maxz) maxz = z;
        }
      }
      if (float32Array2[node32Index + 0] !== minx || float32Array2[node32Index + 1] !== miny || float32Array2[node32Index + 2] !== minz || float32Array2[node32Index + 3] !== maxx || float32Array2[node32Index + 4] !== maxy || float32Array2[node32Index + 5] !== maxz) {
        float32Array2[node32Index + 0] = minx;
        float32Array2[node32Index + 1] = miny;
        float32Array2[node32Index + 2] = minz;
        float32Array2[node32Index + 3] = maxx;
        float32Array2[node32Index + 4] = maxy;
        float32Array2[node32Index + 5] = maxz;
        return true;
      } else {
        return false;
      }
    } else {
      const left = node32Index + 8;
      const right = uint32Array2[node32Index + 6];
      const offsetLeft = left + byteOffset2;
      const offsetRight = right + byteOffset2;
      let forceChildren = force;
      let includesLeft = false;
      let includesRight = false;
      if (nodeIndices) {
        if (!forceChildren) {
          includesLeft = nodeIndices.has(offsetLeft);
          includesRight = nodeIndices.has(offsetRight);
          forceChildren = !includesLeft && !includesRight;
        }
      } else {
        includesLeft = true;
        includesRight = true;
      }
      const traverseLeft = forceChildren || includesLeft;
      const traverseRight = forceChildren || includesRight;
      let leftChange = false;
      if (traverseLeft) {
        leftChange = _traverse2(left, byteOffset2, forceChildren);
      }
      let rightChange = false;
      if (traverseRight) {
        rightChange = _traverse2(right, byteOffset2, forceChildren);
      }
      const didChange = leftChange || rightChange;
      if (didChange) {
        for (let i = 0; i < 3; i++) {
          const lefti = left + i;
          const righti = right + i;
          const minLeftValue = float32Array2[lefti];
          const maxLeftValue = float32Array2[lefti + 3];
          const minRightValue = float32Array2[righti];
          const maxRightValue = float32Array2[righti + 3];
          float32Array2[node32Index + i] = minLeftValue < minRightValue ? minLeftValue : minRightValue;
          float32Array2[node32Index + i + 3] = maxLeftValue > maxRightValue ? maxLeftValue : maxRightValue;
        }
      }
      return didChange;
    }
  }
}
function raycast_indirect(bvh, root, side, ray2, intersects, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  _raycast(0, bvh, side, ray2, intersects, near, far);
  BufferStack.clearBuffer();
}
function _raycast(nodeIndex32, bvh, side, ray2, intersects, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  const nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    intersectTris_indirect(bvh, side, ray2, offset, count, intersects, near, far);
  } else {
    const leftIndex = LEFT_NODE(nodeIndex32);
    if (intersectRay(leftIndex, float32Array2, ray2, near, far)) {
      _raycast(leftIndex, bvh, side, ray2, intersects, near, far);
    }
    const rightIndex = RIGHT_NODE(nodeIndex32, uint32Array2);
    if (intersectRay(rightIndex, float32Array2, ray2, near, far)) {
      _raycast(rightIndex, bvh, side, ray2, intersects, near, far);
    }
  }
}
const _xyzFields = ["x", "y", "z"];
function raycastFirst_indirect(bvh, root, side, ray2, near, far) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _raycastFirst(0, bvh, side, ray2, near, far);
  BufferStack.clearBuffer();
  return result;
}
function _raycastFirst(nodeIndex32, bvh, side, ray2, near, far) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    return intersectClosestTri_indirect(bvh, side, ray2, offset, count, near, far);
  } else {
    const splitAxis = SPLIT_AXIS(nodeIndex32, uint32Array2);
    const xyzAxis = _xyzFields[splitAxis];
    const rayDir = ray2.direction[xyzAxis];
    const leftToRight = rayDir >= 0;
    let c1, c2;
    if (leftToRight) {
      c1 = LEFT_NODE(nodeIndex32);
      c2 = RIGHT_NODE(nodeIndex32, uint32Array2);
    } else {
      c1 = RIGHT_NODE(nodeIndex32, uint32Array2);
      c2 = LEFT_NODE(nodeIndex32);
    }
    const c1Intersection = intersectRay(c1, float32Array2, ray2, near, far);
    const c1Result = c1Intersection ? _raycastFirst(c1, bvh, side, ray2, near, far) : null;
    if (c1Result) {
      const point = c1Result.point[xyzAxis];
      const isOutside = leftToRight ? point <= float32Array2[c2 + splitAxis] : (
        // min bounding data
        point >= float32Array2[c2 + splitAxis + 3]
      );
      if (isOutside) {
        return c1Result;
      }
    }
    const c2Intersection = intersectRay(c2, float32Array2, ray2, near, far);
    const c2Result = c2Intersection ? _raycastFirst(c2, bvh, side, ray2, near, far) : null;
    if (c1Result && c2Result) {
      return c1Result.distance <= c2Result.distance ? c1Result : c2Result;
    } else {
      return c1Result || c2Result || null;
    }
  }
}
const boundingBox = /* @__PURE__ */ new Box3();
const triangle = /* @__PURE__ */ new ExtendedTriangle();
const triangle2 = /* @__PURE__ */ new ExtendedTriangle();
const invertedMat = /* @__PURE__ */ new Matrix4();
const obb$2 = /* @__PURE__ */ new OrientedBox();
const obb2$1 = /* @__PURE__ */ new OrientedBox();
function intersectsGeometry_indirect(bvh, root, otherGeometry, geometryToBvh) {
  BufferStack.setBuffer(bvh._roots[root]);
  const result = _intersectsGeometry(0, bvh, otherGeometry, geometryToBvh);
  BufferStack.clearBuffer();
  return result;
}
function _intersectsGeometry(nodeIndex32, bvh, otherGeometry, geometryToBvh, cachedObb = null) {
  const { float32Array: float32Array2, uint16Array: uint16Array2, uint32Array: uint32Array2 } = BufferStack;
  let nodeIndex16 = nodeIndex32 * 2;
  if (cachedObb === null) {
    if (!otherGeometry.boundingBox) {
      otherGeometry.computeBoundingBox();
    }
    obb$2.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
    cachedObb = obb$2;
  }
  const isLeaf = IS_LEAF(nodeIndex16, uint16Array2);
  if (isLeaf) {
    const thisGeometry = bvh.geometry;
    const thisIndex = thisGeometry.index;
    const thisPos = thisGeometry.attributes.position;
    const index = otherGeometry.index;
    const pos = otherGeometry.attributes.position;
    const offset = OFFSET(nodeIndex32, uint32Array2);
    const count = COUNT(nodeIndex16, uint16Array2);
    invertedMat.copy(geometryToBvh).invert();
    if (otherGeometry.boundsTree) {
      arrayToBox(BOUNDING_DATA_INDEX(nodeIndex32), float32Array2, obb2$1);
      obb2$1.matrix.copy(invertedMat);
      obb2$1.needsUpdate = true;
      const res = otherGeometry.boundsTree.shapecast({
        intersectsBounds: (box) => obb2$1.intersectsBox(box),
        intersectsTriangle: (tri) => {
          tri.a.applyMatrix4(geometryToBvh);
          tri.b.applyMatrix4(geometryToBvh);
          tri.c.applyMatrix4(geometryToBvh);
          tri.needsUpdate = true;
          for (let i = offset, l2 = count + offset; i < l2; i++) {
            setTriangle(triangle2, 3 * bvh.resolveTriangleIndex(i), thisIndex, thisPos);
            triangle2.needsUpdate = true;
            if (tri.intersectsTriangle(triangle2)) {
              return true;
            }
          }
          return false;
        }
      });
      return res;
    } else {
      for (let i = offset, l2 = count + offset; i < l2; i++) {
        const ti = bvh.resolveTriangleIndex(i);
        setTriangle(triangle, 3 * ti, thisIndex, thisPos);
        triangle.a.applyMatrix4(invertedMat);
        triangle.b.applyMatrix4(invertedMat);
        triangle.c.applyMatrix4(invertedMat);
        triangle.needsUpdate = true;
        for (let i2 = 0, l22 = index.count; i2 < l22; i2 += 3) {
          setTriangle(triangle2, i2, index, pos);
          triangle2.needsUpdate = true;
          if (triangle.intersectsTriangle(triangle2)) {
            return true;
          }
        }
      }
    }
  } else {
    const left = nodeIndex32 + 8;
    const right = uint32Array2[nodeIndex32 + 6];
    arrayToBox(BOUNDING_DATA_INDEX(left), float32Array2, boundingBox);
    const leftIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(left, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (leftIntersection) return true;
    arrayToBox(BOUNDING_DATA_INDEX(right), float32Array2, boundingBox);
    const rightIntersection = cachedObb.intersectsBox(boundingBox) && _intersectsGeometry(right, bvh, otherGeometry, geometryToBvh, cachedObb);
    if (rightIntersection) return true;
    return false;
  }
}
const tempMatrix = /* @__PURE__ */ new Matrix4();
const obb$1 = /* @__PURE__ */ new OrientedBox();
const obb2 = /* @__PURE__ */ new OrientedBox();
const temp1 = /* @__PURE__ */ new Vector3();
const temp2 = /* @__PURE__ */ new Vector3();
const temp3 = /* @__PURE__ */ new Vector3();
const temp4 = /* @__PURE__ */ new Vector3();
function closestPointToGeometry_indirect(bvh, otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
  if (!otherGeometry.boundingBox) {
    otherGeometry.computeBoundingBox();
  }
  obb$1.set(otherGeometry.boundingBox.min, otherGeometry.boundingBox.max, geometryToBvh);
  obb$1.needsUpdate = true;
  const geometry = bvh.geometry;
  const pos = geometry.attributes.position;
  const index = geometry.index;
  const otherPos = otherGeometry.attributes.position;
  const otherIndex = otherGeometry.index;
  const triangle3 = ExtendedTrianglePool.getPrimitive();
  const triangle22 = ExtendedTrianglePool.getPrimitive();
  let tempTarget1 = temp1;
  let tempTargetDest1 = temp2;
  let tempTarget2 = null;
  let tempTargetDest2 = null;
  if (target2) {
    tempTarget2 = temp3;
    tempTargetDest2 = temp4;
  }
  let closestDistance = Infinity;
  let closestDistanceTriIndex = null;
  let closestDistanceOtherTriIndex = null;
  tempMatrix.copy(geometryToBvh).invert();
  obb2.matrix.copy(tempMatrix);
  bvh.shapecast(
    {
      boundsTraverseOrder: (box) => {
        return obb$1.distanceToBox(box);
      },
      intersectsBounds: (box, isLeaf, score) => {
        if (score < closestDistance && score < maxThreshold) {
          if (isLeaf) {
            obb2.min.copy(box.min);
            obb2.max.copy(box.max);
            obb2.needsUpdate = true;
          }
          return true;
        }
        return false;
      },
      intersectsRange: (offset, count) => {
        if (otherGeometry.boundsTree) {
          const otherBvh = otherGeometry.boundsTree;
          return otherBvh.shapecast({
            boundsTraverseOrder: (box) => {
              return obb2.distanceToBox(box);
            },
            intersectsBounds: (box, isLeaf, score) => {
              return score < closestDistance && score < maxThreshold;
            },
            intersectsRange: (otherOffset, otherCount) => {
              for (let i2 = otherOffset, l2 = otherOffset + otherCount; i2 < l2; i2++) {
                const ti2 = otherBvh.resolveTriangleIndex(i2);
                setTriangle(triangle22, 3 * ti2, otherIndex, otherPos);
                triangle22.a.applyMatrix4(geometryToBvh);
                triangle22.b.applyMatrix4(geometryToBvh);
                triangle22.c.applyMatrix4(geometryToBvh);
                triangle22.needsUpdate = true;
                for (let i = offset, l3 = offset + count; i < l3; i++) {
                  const ti = bvh.resolveTriangleIndex(i);
                  setTriangle(triangle3, 3 * ti, index, pos);
                  triangle3.needsUpdate = true;
                  const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
                  if (dist < closestDistance) {
                    tempTargetDest1.copy(tempTarget1);
                    if (tempTargetDest2) {
                      tempTargetDest2.copy(tempTarget2);
                    }
                    closestDistance = dist;
                    closestDistanceTriIndex = i;
                    closestDistanceOtherTriIndex = i2;
                  }
                  if (dist < minThreshold) {
                    return true;
                  }
                }
              }
            }
          });
        } else {
          const triCount = getTriCount(otherGeometry);
          for (let i2 = 0, l2 = triCount; i2 < l2; i2++) {
            setTriangle(triangle22, 3 * i2, otherIndex, otherPos);
            triangle22.a.applyMatrix4(geometryToBvh);
            triangle22.b.applyMatrix4(geometryToBvh);
            triangle22.c.applyMatrix4(geometryToBvh);
            triangle22.needsUpdate = true;
            for (let i = offset, l3 = offset + count; i < l3; i++) {
              const ti = bvh.resolveTriangleIndex(i);
              setTriangle(triangle3, 3 * ti, index, pos);
              triangle3.needsUpdate = true;
              const dist = triangle3.distanceToTriangle(triangle22, tempTarget1, tempTarget2);
              if (dist < closestDistance) {
                tempTargetDest1.copy(tempTarget1);
                if (tempTargetDest2) {
                  tempTargetDest2.copy(tempTarget2);
                }
                closestDistance = dist;
                closestDistanceTriIndex = i;
                closestDistanceOtherTriIndex = i2;
              }
              if (dist < minThreshold) {
                return true;
              }
            }
          }
        }
      }
    }
  );
  ExtendedTrianglePool.releasePrimitive(triangle3);
  ExtendedTrianglePool.releasePrimitive(triangle22);
  if (closestDistance === Infinity) {
    return null;
  }
  if (!target1.point) {
    target1.point = tempTargetDest1.clone();
  } else {
    target1.point.copy(tempTargetDest1);
  }
  target1.distance = closestDistance, target1.faceIndex = closestDistanceTriIndex;
  if (target2) {
    if (!target2.point) target2.point = tempTargetDest2.clone();
    else target2.point.copy(tempTargetDest2);
    target2.point.applyMatrix4(tempMatrix);
    tempTargetDest1.applyMatrix4(tempMatrix);
    target2.distance = tempTargetDest1.sub(target2.point).length();
    target2.faceIndex = closestDistanceOtherTriIndex;
  }
  return target1;
}
function isSharedArrayBufferSupported() {
  return typeof SharedArrayBuffer !== "undefined";
}
const _bufferStack1 = new BufferStack.constructor();
const _bufferStack2 = new BufferStack.constructor();
const _boxPool = new PrimitivePool(() => new Box3());
const _leftBox1 = new Box3();
const _rightBox1 = new Box3();
const _leftBox2 = new Box3();
const _rightBox2 = new Box3();
let _active = false;
function bvhcast(bvh, otherBvh, matrixToLocal, intersectsRanges) {
  if (_active) {
    throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");
  }
  _active = true;
  const roots = bvh._roots;
  const otherRoots = otherBvh._roots;
  let result;
  let offset1 = 0;
  let offset2 = 0;
  const invMat = new Matrix4().copy(matrixToLocal).invert();
  for (let i = 0, il = roots.length; i < il; i++) {
    _bufferStack1.setBuffer(roots[i]);
    offset2 = 0;
    const localBox = _boxPool.getPrimitive();
    arrayToBox(BOUNDING_DATA_INDEX(0), _bufferStack1.float32Array, localBox);
    localBox.applyMatrix4(invMat);
    for (let j2 = 0, jl = otherRoots.length; j2 < jl; j2++) {
      _bufferStack2.setBuffer(otherRoots[j2]);
      result = _traverse(
        0,
        0,
        matrixToLocal,
        invMat,
        intersectsRanges,
        offset1,
        offset2,
        0,
        0,
        localBox
      );
      _bufferStack2.clearBuffer();
      offset2 += otherRoots[j2].length;
      if (result) {
        break;
      }
    }
    _boxPool.releasePrimitive(localBox);
    _bufferStack1.clearBuffer();
    offset1 += roots[i].length;
    if (result) {
      break;
    }
  }
  _active = false;
  return result;
}
function _traverse(node1Index32, node2Index32, matrix2to1, matrix1to2, intersectsRangesFunc, node1IndexByteOffset = 0, node2IndexByteOffset = 0, depth1 = 0, depth2 = 0, currBox = null, reversed = false) {
  let bufferStack1, bufferStack2;
  if (reversed) {
    bufferStack1 = _bufferStack2;
    bufferStack2 = _bufferStack1;
  } else {
    bufferStack1 = _bufferStack1;
    bufferStack2 = _bufferStack2;
  }
  const float32Array1 = bufferStack1.float32Array, uint32Array1 = bufferStack1.uint32Array, uint16Array1 = bufferStack1.uint16Array, float32Array2 = bufferStack2.float32Array, uint32Array2 = bufferStack2.uint32Array, uint16Array2 = bufferStack2.uint16Array;
  const node1Index16 = node1Index32 * 2;
  const node2Index16 = node2Index32 * 2;
  const isLeaf1 = IS_LEAF(node1Index16, uint16Array1);
  const isLeaf2 = IS_LEAF(node2Index16, uint16Array2);
  let result = false;
  if (isLeaf2 && isLeaf1) {
    if (reversed) {
      result = intersectsRangesFunc(
        OFFSET(node2Index32, uint32Array2),
        COUNT(node2Index32 * 2, uint16Array2),
        OFFSET(node1Index32, uint32Array1),
        COUNT(node1Index32 * 2, uint16Array1),
        depth2,
        node2IndexByteOffset + node2Index32,
        depth1,
        node1IndexByteOffset + node1Index32
      );
    } else {
      result = intersectsRangesFunc(
        OFFSET(node1Index32, uint32Array1),
        COUNT(node1Index32 * 2, uint16Array1),
        OFFSET(node2Index32, uint32Array2),
        COUNT(node2Index32 * 2, uint16Array2),
        depth1,
        node1IndexByteOffset + node1Index32,
        depth2,
        node2IndexByteOffset + node2Index32
      );
    }
  } else if (isLeaf2) {
    const newBox = _boxPool.getPrimitive();
    arrayToBox(BOUNDING_DATA_INDEX(node2Index32), float32Array2, newBox);
    newBox.applyMatrix4(matrix2to1);
    const cl1 = LEFT_NODE(node1Index32);
    const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
    arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
    arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
    const intersectCl1 = newBox.intersectsBox(_leftBox1);
    const intersectCr1 = newBox.intersectsBox(_rightBox1);
    result = intersectCl1 && _traverse(
      node2Index32,
      cl1,
      matrix1to2,
      matrix2to1,
      intersectsRangesFunc,
      node2IndexByteOffset,
      node1IndexByteOffset,
      depth2,
      depth1 + 1,
      newBox,
      !reversed
    ) || intersectCr1 && _traverse(
      node2Index32,
      cr1,
      matrix1to2,
      matrix2to1,
      intersectsRangesFunc,
      node2IndexByteOffset,
      node1IndexByteOffset,
      depth2,
      depth1 + 1,
      newBox,
      !reversed
    );
    _boxPool.releasePrimitive(newBox);
  } else {
    const cl2 = LEFT_NODE(node2Index32);
    const cr2 = RIGHT_NODE(node2Index32, uint32Array2);
    arrayToBox(BOUNDING_DATA_INDEX(cl2), float32Array2, _leftBox2);
    arrayToBox(BOUNDING_DATA_INDEX(cr2), float32Array2, _rightBox2);
    const leftIntersects = currBox.intersectsBox(_leftBox2);
    const rightIntersects = currBox.intersectsBox(_rightBox2);
    if (leftIntersects && rightIntersects) {
      result = _traverse(
        node1Index32,
        cl2,
        matrix2to1,
        matrix1to2,
        intersectsRangesFunc,
        node1IndexByteOffset,
        node2IndexByteOffset,
        depth1,
        depth2 + 1,
        currBox,
        reversed
      ) || _traverse(
        node1Index32,
        cr2,
        matrix2to1,
        matrix1to2,
        intersectsRangesFunc,
        node1IndexByteOffset,
        node2IndexByteOffset,
        depth1,
        depth2 + 1,
        currBox,
        reversed
      );
    } else if (leftIntersects) {
      if (isLeaf1) {
        result = _traverse(
          node1Index32,
          cl2,
          matrix2to1,
          matrix1to2,
          intersectsRangesFunc,
          node1IndexByteOffset,
          node2IndexByteOffset,
          depth1,
          depth2 + 1,
          currBox,
          reversed
        );
      } else {
        const newBox = _boxPool.getPrimitive();
        newBox.copy(_leftBox2).applyMatrix4(matrix2to1);
        const cl1 = LEFT_NODE(node1Index32);
        const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
        arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
        arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
        const intersectCl1 = newBox.intersectsBox(_leftBox1);
        const intersectCr1 = newBox.intersectsBox(_rightBox1);
        result = intersectCl1 && _traverse(
          cl2,
          cl1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexByteOffset,
          node1IndexByteOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        ) || intersectCr1 && _traverse(
          cl2,
          cr1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexByteOffset,
          node1IndexByteOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        );
        _boxPool.releasePrimitive(newBox);
      }
    } else if (rightIntersects) {
      if (isLeaf1) {
        result = _traverse(
          node1Index32,
          cr2,
          matrix2to1,
          matrix1to2,
          intersectsRangesFunc,
          node1IndexByteOffset,
          node2IndexByteOffset,
          depth1,
          depth2 + 1,
          currBox,
          reversed
        );
      } else {
        const newBox = _boxPool.getPrimitive();
        newBox.copy(_rightBox2).applyMatrix4(matrix2to1);
        const cl1 = LEFT_NODE(node1Index32);
        const cr1 = RIGHT_NODE(node1Index32, uint32Array1);
        arrayToBox(BOUNDING_DATA_INDEX(cl1), float32Array1, _leftBox1);
        arrayToBox(BOUNDING_DATA_INDEX(cr1), float32Array1, _rightBox1);
        const intersectCl1 = newBox.intersectsBox(_leftBox1);
        const intersectCr1 = newBox.intersectsBox(_rightBox1);
        result = intersectCl1 && _traverse(
          cr2,
          cl1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexByteOffset,
          node1IndexByteOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        ) || intersectCr1 && _traverse(
          cr2,
          cr1,
          matrix1to2,
          matrix2to1,
          intersectsRangesFunc,
          node2IndexByteOffset,
          node1IndexByteOffset,
          depth2,
          depth1 + 1,
          newBox,
          !reversed
        );
        _boxPool.releasePrimitive(newBox);
      }
    }
  }
  return result;
}
const obb = /* @__PURE__ */ new OrientedBox();
const tempBox = /* @__PURE__ */ new Box3();
const DEFAULT_OPTIONS = {
  strategy: CENTER,
  maxDepth: 40,
  maxLeafTris: 10,
  useSharedArrayBuffer: false,
  setBoundingBox: true,
  onProgress: null,
  indirect: false,
  verbose: true,
  range: null
};
class MeshBVH {
  static serialize(bvh, options = {}) {
    options = {
      cloneBuffers: true,
      ...options
    };
    const geometry = bvh.geometry;
    const rootData = bvh._roots;
    const indirectBuffer = bvh._indirectBuffer;
    const indexAttribute = geometry.getIndex();
    let result;
    if (options.cloneBuffers) {
      result = {
        roots: rootData.map((root) => root.slice()),
        index: indexAttribute ? indexAttribute.array.slice() : null,
        indirectBuffer: indirectBuffer ? indirectBuffer.slice() : null
      };
    } else {
      result = {
        roots: rootData,
        index: indexAttribute ? indexAttribute.array : null,
        indirectBuffer
      };
    }
    return result;
  }
  static deserialize(data, geometry, options = {}) {
    options = {
      setIndex: true,
      indirect: Boolean(data.indirectBuffer),
      ...options
    };
    const { index, roots, indirectBuffer } = data;
    const bvh = new MeshBVH(geometry, { ...options, [SKIP_GENERATION]: true });
    bvh._roots = roots;
    bvh._indirectBuffer = indirectBuffer || null;
    if (options.setIndex) {
      const indexAttribute = geometry.getIndex();
      if (indexAttribute === null) {
        const newIndex = new BufferAttribute(data.index, 1, false);
        geometry.setIndex(newIndex);
      } else if (indexAttribute.array !== index) {
        indexAttribute.array.set(index);
        indexAttribute.needsUpdate = true;
      }
    }
    return bvh;
  }
  get indirect() {
    return !!this._indirectBuffer;
  }
  constructor(geometry, options = {}) {
    if (!geometry.isBufferGeometry) {
      throw new Error("MeshBVH: Only BufferGeometries are supported.");
    } else if (geometry.index && geometry.index.isInterleavedBufferAttribute) {
      throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.");
    }
    options = Object.assign({
      ...DEFAULT_OPTIONS,
      // undocumented options
      // Whether to skip generating the tree. Used for deserialization.
      [SKIP_GENERATION]: false
    }, options);
    if (options.useSharedArrayBuffer && !isSharedArrayBufferSupported()) {
      throw new Error("MeshBVH: SharedArrayBuffer is not available.");
    }
    this.geometry = geometry;
    this._roots = null;
    this._indirectBuffer = null;
    if (!options[SKIP_GENERATION]) {
      buildPackedTree(this, options);
      if (!geometry.boundingBox && options.setBoundingBox) {
        geometry.boundingBox = this.getBoundingBox(new Box3());
      }
    }
    this.resolveTriangleIndex = options.indirect ? (i) => this._indirectBuffer[i] : (i) => i;
  }
  refit(nodeIndices = null) {
    const refitFunc = this.indirect ? refit_indirect : refit;
    return refitFunc(this, nodeIndices);
  }
  traverse(callback, rootIndex = 0) {
    const buffer = this._roots[rootIndex];
    const uint32Array2 = new Uint32Array(buffer);
    const uint16Array2 = new Uint16Array(buffer);
    _traverse2(0);
    function _traverse2(node32Index, depth = 0) {
      const node16Index = node32Index * 2;
      const isLeaf = uint16Array2[node16Index + 15] === IS_LEAFNODE_FLAG;
      if (isLeaf) {
        const offset = uint32Array2[node32Index + 6];
        const count = uint16Array2[node16Index + 14];
        callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), offset, count);
      } else {
        const left = node32Index + BYTES_PER_NODE / 4;
        const right = uint32Array2[node32Index + 6];
        const splitAxis = uint32Array2[node32Index + 7];
        const stopTraversal = callback(depth, isLeaf, new Float32Array(buffer, node32Index * 4, 6), splitAxis);
        if (!stopTraversal) {
          _traverse2(left, depth + 1);
          _traverse2(right, depth + 1);
        }
      }
    }
  }
  /* Core Cast Functions */
  raycast(ray2, materialOrSide = FrontSide, near = 0, far = Infinity) {
    const roots = this._roots;
    const geometry = this.geometry;
    const intersects = [];
    const isMaterial = materialOrSide.isMaterial;
    const isArrayMaterial = Array.isArray(materialOrSide);
    const groups = geometry.groups;
    const side = isMaterial ? materialOrSide.side : materialOrSide;
    const raycastFunc = this.indirect ? raycast_indirect : raycast;
    for (let i = 0, l2 = roots.length; i < l2; i++) {
      const materialSide = isArrayMaterial ? materialOrSide[groups[i].materialIndex].side : side;
      const startCount = intersects.length;
      raycastFunc(this, i, materialSide, ray2, intersects, near, far);
      if (isArrayMaterial) {
        const materialIndex = groups[i].materialIndex;
        for (let j2 = startCount, jl = intersects.length; j2 < jl; j2++) {
          intersects[j2].face.materialIndex = materialIndex;
        }
      }
    }
    return intersects;
  }
  raycastFirst(ray2, materialOrSide = FrontSide, near = 0, far = Infinity) {
    const roots = this._roots;
    const geometry = this.geometry;
    const isMaterial = materialOrSide.isMaterial;
    const isArrayMaterial = Array.isArray(materialOrSide);
    let closestResult = null;
    const groups = geometry.groups;
    const side = isMaterial ? materialOrSide.side : materialOrSide;
    const raycastFirstFunc = this.indirect ? raycastFirst_indirect : raycastFirst;
    for (let i = 0, l2 = roots.length; i < l2; i++) {
      const materialSide = isArrayMaterial ? materialOrSide[groups[i].materialIndex].side : side;
      const result = raycastFirstFunc(this, i, materialSide, ray2, near, far);
      if (result != null && (closestResult == null || result.distance < closestResult.distance)) {
        closestResult = result;
        if (isArrayMaterial) {
          result.face.materialIndex = groups[i].materialIndex;
        }
      }
    }
    return closestResult;
  }
  intersectsGeometry(otherGeometry, geomToMesh) {
    let result = false;
    const roots = this._roots;
    const intersectsGeometryFunc = this.indirect ? intersectsGeometry_indirect : intersectsGeometry;
    for (let i = 0, l2 = roots.length; i < l2; i++) {
      result = intersectsGeometryFunc(this, i, otherGeometry, geomToMesh);
      if (result) {
        break;
      }
    }
    return result;
  }
  shapecast(callbacks) {
    const triangle3 = ExtendedTrianglePool.getPrimitive();
    const iterateFunc = this.indirect ? iterateOverTriangles_indirect : iterateOverTriangles;
    let {
      boundsTraverseOrder,
      intersectsBounds,
      intersectsRange,
      intersectsTriangle
    } = callbacks;
    if (intersectsRange && intersectsTriangle) {
      const originalIntersectsRange = intersectsRange;
      intersectsRange = (offset, count, contained, depth, nodeIndex) => {
        if (!originalIntersectsRange(offset, count, contained, depth, nodeIndex)) {
          return iterateFunc(offset, count, this, intersectsTriangle, contained, depth, triangle3);
        }
        return true;
      };
    } else if (!intersectsRange) {
      if (intersectsTriangle) {
        intersectsRange = (offset, count, contained, depth) => {
          return iterateFunc(offset, count, this, intersectsTriangle, contained, depth, triangle3);
        };
      } else {
        intersectsRange = (offset, count, contained) => {
          return contained;
        };
      }
    }
    let result = false;
    let byteOffset = 0;
    const roots = this._roots;
    for (let i = 0, l2 = roots.length; i < l2; i++) {
      const root = roots[i];
      result = shapecast(this, i, intersectsBounds, intersectsRange, boundsTraverseOrder, byteOffset);
      if (result) {
        break;
      }
      byteOffset += root.byteLength;
    }
    ExtendedTrianglePool.releasePrimitive(triangle3);
    return result;
  }
  bvhcast(otherBvh, matrixToLocal, callbacks) {
    let {
      intersectsRanges,
      intersectsTriangles
    } = callbacks;
    const triangle1 = ExtendedTrianglePool.getPrimitive();
    const indexAttr1 = this.geometry.index;
    const positionAttr1 = this.geometry.attributes.position;
    const assignTriangle1 = this.indirect ? (i1) => {
      const ti = this.resolveTriangleIndex(i1);
      setTriangle(triangle1, ti * 3, indexAttr1, positionAttr1);
    } : (i1) => {
      setTriangle(triangle1, i1 * 3, indexAttr1, positionAttr1);
    };
    const triangle22 = ExtendedTrianglePool.getPrimitive();
    const indexAttr2 = otherBvh.geometry.index;
    const positionAttr2 = otherBvh.geometry.attributes.position;
    const assignTriangle2 = otherBvh.indirect ? (i2) => {
      const ti2 = otherBvh.resolveTriangleIndex(i2);
      setTriangle(triangle22, ti2 * 3, indexAttr2, positionAttr2);
    } : (i2) => {
      setTriangle(triangle22, i2 * 3, indexAttr2, positionAttr2);
    };
    if (intersectsTriangles) {
      const iterateOverDoubleTriangles = (offset1, count1, offset2, count2, depth1, index1, depth2, index2) => {
        for (let i2 = offset2, l2 = offset2 + count2; i2 < l2; i2++) {
          assignTriangle2(i2);
          triangle22.a.applyMatrix4(matrixToLocal);
          triangle22.b.applyMatrix4(matrixToLocal);
          triangle22.c.applyMatrix4(matrixToLocal);
          triangle22.needsUpdate = true;
          for (let i1 = offset1, l1 = offset1 + count1; i1 < l1; i1++) {
            assignTriangle1(i1);
            triangle1.needsUpdate = true;
            if (intersectsTriangles(triangle1, triangle22, i1, i2, depth1, index1, depth2, index2)) {
              return true;
            }
          }
        }
        return false;
      };
      if (intersectsRanges) {
        const originalIntersectsRanges = intersectsRanges;
        intersectsRanges = function(offset1, count1, offset2, count2, depth1, index1, depth2, index2) {
          if (!originalIntersectsRanges(offset1, count1, offset2, count2, depth1, index1, depth2, index2)) {
            return iterateOverDoubleTriangles(offset1, count1, offset2, count2, depth1, index1, depth2, index2);
          }
          return true;
        };
      } else {
        intersectsRanges = iterateOverDoubleTriangles;
      }
    }
    return bvhcast(this, otherBvh, matrixToLocal, intersectsRanges);
  }
  /* Derived Cast Functions */
  intersectsBox(box, boxToMesh) {
    obb.set(box.min, box.max, boxToMesh);
    obb.needsUpdate = true;
    return this.shapecast(
      {
        intersectsBounds: (box2) => obb.intersectsBox(box2),
        intersectsTriangle: (tri) => obb.intersectsTriangle(tri)
      }
    );
  }
  intersectsSphere(sphere) {
    return this.shapecast(
      {
        intersectsBounds: (box) => sphere.intersectsBox(box),
        intersectsTriangle: (tri) => tri.intersectsSphere(sphere)
      }
    );
  }
  closestPointToGeometry(otherGeometry, geometryToBvh, target1 = {}, target2 = {}, minThreshold = 0, maxThreshold = Infinity) {
    const closestPointToGeometryFunc = this.indirect ? closestPointToGeometry_indirect : closestPointToGeometry;
    return closestPointToGeometryFunc(
      this,
      otherGeometry,
      geometryToBvh,
      target1,
      target2,
      minThreshold,
      maxThreshold
    );
  }
  closestPointToPoint(point, target = {}, minThreshold = 0, maxThreshold = Infinity) {
    return closestPointToPoint(
      this,
      point,
      target,
      minThreshold,
      maxThreshold
    );
  }
  getBoundingBox(target) {
    target.makeEmpty();
    const roots = this._roots;
    roots.forEach((buffer) => {
      arrayToBox(0, new Float32Array(buffer), tempBox);
      target.union(tempBox);
    });
    return target;
  }
}
function convertRaycastIntersect(hit, object, raycaster) {
  if (hit === null) {
    return null;
  }
  hit.point.applyMatrix4(object.matrixWorld);
  hit.distance = hit.point.distanceTo(raycaster.ray.origin);
  hit.object = object;
  return hit;
}
const ray = /* @__PURE__ */ new Ray();
const direction = /* @__PURE__ */ new Vector3();
const tmpInverseMatrix = /* @__PURE__ */ new Matrix4();
const origMeshRaycastFunc = Mesh.prototype.raycast;
const origBatchedRaycastFunc = BatchedMesh.prototype.raycast;
const _worldScale = /* @__PURE__ */ new Vector3();
const _mesh = /* @__PURE__ */ new Mesh();
const _batchIntersects = [];
function acceleratedRaycast(raycaster, intersects) {
  if (this.isBatchedMesh) {
    acceleratedBatchedMeshRaycast.call(this, raycaster, intersects);
  } else {
    acceleratedMeshRaycast.call(this, raycaster, intersects);
  }
}
function acceleratedBatchedMeshRaycast(raycaster, intersects) {
  if (this.boundsTrees) {
    const boundsTrees = this.boundsTrees;
    const drawInfo = this._drawInfo;
    const drawRanges = this._drawRanges;
    const matrixWorld = this.matrixWorld;
    _mesh.material = this.material;
    _mesh.geometry = this.geometry;
    const oldBoundsTree = _mesh.geometry.boundsTree;
    const oldDrawRange = _mesh.geometry.drawRange;
    if (_mesh.geometry.boundingSphere === null) {
      _mesh.geometry.boundingSphere = new Sphere();
    }
    for (let i = 0, l2 = drawInfo.length; i < l2; i++) {
      if (!this.getVisibleAt(i)) {
        continue;
      }
      const geometryId = drawInfo[i].geometryIndex;
      _mesh.geometry.boundsTree = boundsTrees[geometryId];
      this.getMatrixAt(i, _mesh.matrixWorld).premultiply(matrixWorld);
      if (!_mesh.geometry.boundsTree) {
        this.getBoundingBoxAt(geometryId, _mesh.geometry.boundingBox);
        this.getBoundingSphereAt(geometryId, _mesh.geometry.boundingSphere);
        const drawRange = drawRanges[geometryId];
        _mesh.geometry.setDrawRange(drawRange.start, drawRange.count);
      }
      _mesh.raycast(raycaster, _batchIntersects);
      for (let j2 = 0, l3 = _batchIntersects.length; j2 < l3; j2++) {
        const intersect = _batchIntersects[j2];
        intersect.object = this;
        intersect.batchId = i;
        intersects.push(intersect);
      }
      _batchIntersects.length = 0;
    }
    _mesh.geometry.boundsTree = oldBoundsTree;
    _mesh.geometry.drawRange = oldDrawRange;
    _mesh.material = null;
    _mesh.geometry = null;
  } else {
    origBatchedRaycastFunc.call(this, raycaster, intersects);
  }
}
function acceleratedMeshRaycast(raycaster, intersects) {
  if (this.geometry.boundsTree) {
    if (this.material === void 0) return;
    tmpInverseMatrix.copy(this.matrixWorld).invert();
    ray.copy(raycaster.ray).applyMatrix4(tmpInverseMatrix);
    _worldScale.setFromMatrixScale(this.matrixWorld);
    direction.copy(ray.direction).multiply(_worldScale);
    const scaleFactor = direction.length();
    const near = raycaster.near / scaleFactor;
    const far = raycaster.far / scaleFactor;
    const bvh = this.geometry.boundsTree;
    if (raycaster.firstHitOnly === true) {
      const hit = convertRaycastIntersect(bvh.raycastFirst(ray, this.material, near, far), this, raycaster);
      if (hit) {
        intersects.push(hit);
      }
    } else {
      const hits = bvh.raycast(ray, this.material, near, far);
      for (let i = 0, l2 = hits.length; i < l2; i++) {
        const hit = convertRaycastIntersect(hits[i], this, raycaster);
        if (hit) {
          intersects.push(hit);
        }
      }
    }
  } else {
    origMeshRaycastFunc.call(this, raycaster, intersects);
  }
}
function computeBoundsTree(options = {}) {
  this.boundsTree = new MeshBVH(this, options);
  return this.boundsTree;
}
function disposeBoundsTree() {
  this.boundsTree = null;
}
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
const alias3 = {
  ObjectLoader,
  Color,
  Camera,
  Scene,
  AxesHelper,
  Mesh,
  Vector3,
  Quaternion,
  Matrix4,
  Line3,
  Plane,
  PerspectiveCamera,
  OrthographicCamera,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  BoxGeometry,
  TubeGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhongMaterial,
  DoubleSide,
  ObjectSpaceNormalMap,
  CatmullRomCurve3,
  // 
  BufferGeometryUtils
};
const aliasBvh = {
  computeBoundsTree,
  MeshBVH
};
export {
  F as FilePathLoader,
  MqMultiViewEditor,
  ao as MqUtil,
  j as PathLoader,
  p as StrMesh,
  alias3,
  aliasBvh,
  am as bindDracoEncoder,
  n as create4ToothNumberMesh,
  l as createGumMesh,
  an as debug_ToothVisualPoint,
  eEntryCode,
  eMaterialReplace,
  o as eMaterialType,
  h as geometry2Mesh,
  m as mat2Mesh,
  k as mat4Tooth,
  aj as mesh2drc,
  ak as mesh2ply,
  al as mesh2stl,
  toMeshWithMaterialReplace
};
