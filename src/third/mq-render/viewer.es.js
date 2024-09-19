import { C as Color, V as Vector3, q as Camera, P as PerspectiveCamera, O as OrthographicCamera, b as Matrix4, v as viewDir, r as Mesh, s as PlaneGeometry, u as ShaderMaterial, w as AlwaysDepth, E as EventDispatcher, x as Vector2, M as MqRender, e as eColorState, S as SRGBColorSpace, a as StrSprite, f as PointLight, D as DirectionalLight, A as AmbientLight, T as TrackballControls, y as LinearSRGBColorSpace, z as MeshPhongMaterial, I as DoubleSide, J as BufferAttribute, K as MeshStandardMaterial, N as materiallegacyCrownShader, Q as materialGumShader } from "./tooth-vbodTlKR.js";
import { _, B, a0, F, a1, a2, Z, a3, j, $, p, X, n, l, Y, o, h, m, k, R, U, W } from "./tooth-vbodTlKR.js";
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
function frustumHeightAtDistance(camera, distance) {
  const vFov = camera.fov * Math.PI / 180;
  return Math.tan(vFov / 2) * distance * 2;
}
function frustumWidthAtDistance(camera, distance) {
  return frustumHeightAtDistance(camera, distance) * camera.aspect;
}
class SwitchCamera extends Camera {
  constructor() {
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
    this.aspect = 1;
    this.near = 0.1;
    this.far = 1e4;
    this.zoom = 1;
    this.width = 0;
    this.height = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  getCamera() {
    return this.camera;
  }
  switch() {
    if (this.isOrtho) {
      this.isOrtho = false;
      this.camera = this.persp;
    } else {
      this.isOrtho = true;
      this.camera = this.ortho;
    }
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
    const { persp, ortho } = this;
    ortho.position.copy(persp.position);
    const distance = persp.position.distanceTo(control.target);
    const halfWidth = frustumWidthAtDistance(persp, distance) / 2;
    const halfHeight = frustumHeightAtDistance(persp, distance) / 2;
    ortho.top = halfHeight;
    ortho.bottom = -halfHeight;
    ortho.left = -halfWidth;
    ortho.right = halfWidth;
    ortho.zoom = 1;
    ortho.lookAt(control.target);
    ortho.updateProjectionMatrix();
  }
  toPerspective() {
    const { persp, ortho } = this;
    const oldY = persp.position.y;
    persp.position.copy(ortho.position);
    persp.position.y = oldY / ortho.zoom;
    persp.updateProjectionMatrix();
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
    const { near, far, zoom } = this.ortho;
    const { fov, aspect } = this.persp;
    let tmp = new Vector3().fromArray(this.wPositionV);
    const height = Math.tan(fov / 2) * tmp.z;
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
  var _2 = { label: 0, sent: function() {
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
    while (g && (g = 0, op[0] && (_2 = 0)), _2) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _2.label++;
          return { value: op[1], done: false };
        case 5:
          _2.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _2.ops.pop();
          _2.trys.pop();
          continue;
        default:
          if (!(t = _2.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _2 = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _2.label = op[1];
            break;
          }
          if (op[0] === 6 && _2.label < t[1]) {
            _2.label = t[1];
            t = op;
            break;
          }
          if (t && _2.label < t[2]) {
            _2.label = t[2];
            _2.ops.push(op);
            break;
          }
          if (t[2]) _2.ops.pop();
          _2.trys.pop();
          continue;
      }
      op = body.call(thisArg, _2);
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
class MqMultiViewEditor extends MqRender {
  constructor() {
    super("multi-view-render", eColorState.currently);
    this.cameraAngle = 20;
    this.cameraFar = 1e4;
    this.tan = 1;
    this.theme = getThemeByName();
    this.compiledLights = /* @__PURE__ */ new WeakMap();
    this.camera = new SwitchCamera();
  }
  init(options, theme) {
    const { cameraNear, cameraAngle, cameraFar } = this;
    super.init(options);
    this.renderer.outputColorSpace = SRGBColorSpace;
    const ratio = options.width / options.height;
    this.camera.ortho = new OrthographicCamera(-options.width / 2, options.width / 2, options.height / 2, -options.height / 2, cameraNear, cameraFar);
    this.camera.ortho.position.set(0, 0, options.cameraPositionZ);
    this.camera.persp = new PerspectiveCamera(cameraAngle, ratio, cameraNear, cameraFar);
    this.camera.persp.position.set(0, 0, options.cameraPositionZ);
    this.camera.isOrtho = true;
    this.camera.switch();
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
    this.cameraOrtho = new OrthographicCamera(-options.width / 2, options.width / 2, options.height / 2, -options.height / 2, 0.1, 1e3);
    this.cameraOrtho.position.z = 10;
    if (options.useGrid) {
      const sizeScale = 80;
      this.meshGrid = new OrthoGrid1(5);
      this.sceneOrtho.add(this.meshGrid);
      this.labelUnit = new StrSprite("10", {
        hasPostfix: true,
        fontInfo: "100 32px sans-serif"
      });
      this.labelUnit.target.center.set(0.5, 0.25);
      this.labelUnit.target.scale.set(sizeScale, sizeScale, 1);
      this.labelUnit.target.position.set(0, +options.height * 0.4, 1);
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
                const al = (_b = view.scene) == null ? void 0 : _b.getObjectByName("AmbientLight");
                if (al) (_c = view.scene) == null ? void 0 : _c.remove(al);
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
    const { rc, renderer, control, camera, sceneOrtho, cameraOrtho } = this;
    if (!renderer) return;
    renderer.setPixelRatio(rc.dpr);
    const animate = (t) => {
      var _a;
      this.oneFrame(camera.getCamera());
      if (control) control.update();
      if (camera.isOrtho) {
        if (this.meshGrid) {
          this.meshGrid.updateSize(camera.newOrhtoProjection(), cameraOrtho);
          (_a = this.labelUnit) == null ? void 0 : _a.update(this.meshGrid.unit.toString());
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
    const { control, centerScene, tan, camera } = this;
    let frustumHeight, frustumWidth;
    const copyV = (src, dst) => {
      dst.position.copy(src.position);
      dst.quaternion.copy(src.quaternion);
      dst.scale.copy(src.scale);
      dst.up.copy(src.up);
      dst.updateMatrix();
      dst.updateMatrixWorld();
    };
    if (camera.isOrtho === false) {
      if (control) control.panSpeed = 5;
      const distance = camera.persp.position.distanceTo(centerScene);
      frustumHeight = 2 * tan * distance;
      frustumWidth = frustumHeight * camera.persp.aspect;
      camera.ortho.top = frustumHeight;
      camera.ortho.bottom = -frustumHeight;
      camera.ortho.left = -frustumWidth;
      camera.ortho.right = frustumWidth;
      camera.ortho.zoom = Math.log2(distance);
      copyV(camera.persp, camera.ortho);
      console.log("persp to ortho", frustumHeight);
    } else {
      if (control) control.panSpeed = 0.5;
      copyV(camera.ortho, camera.persp);
      frustumHeight = (camera.ortho.top - camera.ortho.bottom) / camera.ortho.zoom;
      let d = frustumHeight / 2 / tan;
      camera.persp.position.copy(camera.ortho.position).normalize().multiplyScalar(d);
      console.log("ortho to persp", frustumHeight);
    }
    camera.switch();
    camera.camera.updateProjectionMatrix();
    if (control) {
      control.object = camera.camera;
    }
  }
  add(mesh, name) {
    var _a;
    const { options: inOptions } = this;
    (_a = inOptions.viewStateList) == null ? void 0 : _a.forEach((view) => {
      var _a2;
      if (view.name == name) (_a2 = view.scene) == null ? void 0 : _a2.add(mesh);
    });
    this.updateFrame();
  }
  updateFrame() {
    const { camera } = this;
    this.oneFrame(camera.getCamera());
  }
}
function setXYZ(arr, i, x, y, z) {
  arr[i + 0] = x;
  arr[i + 1] = y;
  arr[i + 2] = z;
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
export {
  _ as AxesHelper,
  B as BoxGeometry,
  BufferAttribute,
  a0 as BufferGeometry,
  Camera,
  Color,
  DoubleSide,
  F as FilePathLoader,
  a1 as Float32BufferAttribute,
  Matrix4,
  Mesh,
  a2 as MeshBasicMaterial,
  MeshPhongMaterial,
  MqMultiViewEditor,
  Z as ObjectLoader,
  a3 as ObjectSpaceNormalMap,
  OrthographicCamera,
  j as PathLoader,
  PerspectiveCamera,
  $ as Scene,
  p as StrMesh,
  Vector3,
  X as bindDracoEncoder,
  n as create4ToothNumberMesh,
  l as createGumMesh,
  Y as debug_ToothVisualPoint,
  eMaterialReplace,
  o as eMaterialType,
  h as geometry2Mesh,
  m as mat2Mesh,
  k as mat4Tooth,
  R as mesh2drc,
  U as mesh2ply,
  W as mesh2stl,
  toMeshWithMaterialReplace
};
