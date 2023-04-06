import { FileType, toFileType } from './utils/modelfile'
import {
  Color,
  MeshPhongMaterial,
  DoubleSide,
  VertexColors,
  ObjectSpaceNormalMap,
  Mesh,
  Float32BufferAttribute,
} from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

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

export const mjFileType = FileType;
export class FileLoader extends CommonLoader {
  constructor(ftype) {
    super();
    this.loader = setLoaderType(ftype);
  }
  load(file, cb = () => {}) {
    const url = URL.createObjectURL(file);
    return this.loader.loadAsync(url, cb);
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

export function addColor2Mesh(bufferGeo, options = {}) {
  return new Promise((resolve)=>{
    const color = new Color(options.color) || new Color('rgb(179,142,107)')
    let material = new MeshPhongMaterial({
      color: color,
      vertexColors: VertexColors,
      specular: 0x111111,
      flatShading: options.flatShading || false,
      shininess: 10,
      normalMapType: ObjectSpaceNormalMap,
      side: DoubleSide,
      transparent: options.opacity < 1 ? true : false,
    })
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
    const mesh = new Mesh(bufferGeo, material)
    mesh.name = options.name || Date.now().toString();
    resolve(mesh);
  })
}

export function updateMeshColor(mesh, strColor) {
  const color = new Color(strColor);
  const geo = mesh.geometry;
  let colors = []
  for (let i = 0; i < geo.attributes.position.count; i++) {
    colors.push(color.r)
    colors.push(color.g)
    colors.push(color.b)
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geo.attributes.color.needsUpdate = true;
}

export function updateMeshOpacity(mesh, opacity) {
  mesh.material.opacity = opacity;
  mesh.material.transparent = !(opacity == 1);
  mesh.material.needsUpdate = true;
}