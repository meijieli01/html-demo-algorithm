import { FileType } from './utils/modelfile'
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

function setLoaderType(ftype) {
  let loader = null;
  switch (ftype) {
    case FileType.DRC:
    case FileType.MQ: {
      loader = new DRACOLoader()
      loader.setDecoderPath('/js/libs/draco/')
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

export const mjFileType = FileType;
export class FileLoader {
  constructor(ftype) {
    this.loader = setLoaderType(ftype);
  }
  load(file, cb = () => {}) {
    const url = URL.createObjectURL(file);
    return this.loader.loadAsync(url, cb);
  }
}

export function addColor2Mesh(bufferGeo, options = {}) {
  return new Promise((resolve)=>{
    const color = options.color || new Color('rgb(179,142,107)')
    let material = new MeshPhongMaterial({
      color: color,
      vertexColors: VertexColors,
      specular: 0x111111,
      flatShading: options.flatShading || false,
      shininess: 10,
      normalMapType: ObjectSpaceNormalMap,
      side: DoubleSide,
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