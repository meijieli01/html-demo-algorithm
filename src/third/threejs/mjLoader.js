import { FileType, toFileType } from './utils/modelfile';
import {
  Color,
  MeshPhongMaterial,
  DoubleSide,
  ObjectSpaceNormalMap,
  Mesh,
  Float32BufferAttribute,
} from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

function setLoaderType(ftype, options={}) {
  let loader = null;
  switch (ftype) {
    case FileType.DRC:
    case FileType.MQ: {
      loader = new DRACOLoader()
      loader.setDecoderPath(options.drcPath || '/js/libs/draco/');
      loader.setDecoderConfig({ type: 'js' })
      loader.preload()
      break
    }
    case FileType.STL: {
      loader = new STLLoader()
      break
    }
    case FileType.PLY: {
      loader = new PLYLoader()
      break
    }
    case FileType.OBJ: {
      loader = new OBJLoader()
      break
    }
    default: {
      loader = null
      throw `暂未支持文件格式，支持格式有STL、PLY、DRC、MQ`
    }
  }
  if (!loader) throw `暂未支持文件格式，支持格式有STL、PLY、DRC、MQ`;
  return loader;
}

class CommonLoader {
  constructor() {

  }
  static getName(path) {
    return path.substr(path.lastIndexOf('/')+1);
  }
}

export class PathLoader extends CommonLoader {
  constructor(path, drcPath) {
    super();
    this.loader = setLoaderType(toFileType(path), {drcPath:drcPath});
  }
  load(path, cb = ()=>{}) {
    try {
      return this.loader.loadAsync(path, cb);
    } catch(err) {
      console.log(err);
    }
  }
}
export class TrackFile {
  constructor() {
    this.fileUrlSet = new Set();
  }
  add(url) {
    this.fileUrlSet.add(url);
  }
  free() {
    for(const url of this.fileUrlSet) {
      URL.revokeObjectURL(url);
    }
    this.fileUrlSet.clear();
  }
}
const trackFileUrl = new TrackFile();
export function emptyTrackFile() {
  trackFileUrl.free();
}
export class FilePathLoader extends PathLoader {
  constructor(filename, drcPath) {
    super(filename, drcPath);
  }
  load(file, cb = () => {}) {
    const url = URL.createObjectURL(file);
    trackFileUrl.add(url);
    return super.load(url, cb);
  }
}

export function addColor2Mesh(bufferGeo, options = {}) {  
  const hasColor = typeof options.hasColor == 'boolean' ? options.hasColor : true;
  return new Promise((resolve)=>{
    const color = new Color(options.color || 'rgb(179,142,107)');
    let material = new MeshPhongMaterial({
      color: color,
      specular: 0x111111,
      reflectivity: 0.1,
      shininess: 10,
      normalMapType: ObjectSpaceNormalMap,
      side: DoubleSide,
      transparent: false,
    });
    if (hasColor) {
      let colors = []
      for (let i = 0; i < bufferGeo.attributes.position.count; i++) {
        colors.push(color.r)
        colors.push(color.g)
        colors.push(color.b)
      }
      bufferGeo.setAttribute('color', new Float32BufferAttribute(colors, 3))
      bufferGeo.computeVertexNormals()
      bufferGeo.normalizeNormals()
      bufferGeo.attributes.color.needsUpdate = true
    }
    const mesh = new Mesh(bufferGeo, material)
    mesh.name = options.name || Date.now().toString();
    updateMeshOpacity(mesh, options.opacity || 1);
    resolve(mesh);
  })
}

export function updateMeshColor(mesh, strColor) {  
  const color = new Color(strColor);
  mesh.material.color.copy(color);
}

export function updateMeshOpacity(mesh, opacity) {
  mesh.material.opacity = opacity;
  mesh.material.transparent = !(opacity == 1);
  mesh.material.needsUpdate = true;
}

// 直接加载资源，兼容之前的
export function loadUrl(url, options) {
  return new PathLoader(options.path, options.drcConfig).load(url).then(geo=>{
    return addColor2Mesh(geo,{...options});
  })
}