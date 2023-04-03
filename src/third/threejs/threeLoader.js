import { toFileType, FileType } from './utils/modelfile'
import { isBlob } from './utils/validate'
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
export function mqLoader() {
  const that = {
    loader: null,
    ftype: FileType.UNKNOWN,
  }
  const setLoaderType = (ftype) => {
    // 相同文件的模型不需要重复设置加载器
    if (ftype == that.ftype && that.loader) return
    that.ftype = ftype
    switch (ftype) {
      case FileType.DRC:
      case FileType.MQ: {
        that.loader = new DRACOLoader()
        that.loader.setDecoderPath('/js/libs/draco/')
        that.loader.setDecoderConfig({ type: 'js' })
        that.loader.preload()
        break
      }
      case FileType.STL: {
        that.loader = new STLLoader()
        break
      }
      case FileType.PLY: {
        that.loader = new PLYLoader()
        break
      }
      case FileType.OBJ: {
        that.loader = new OBJLoader()
        break
      }
      default: {
        that.loader = null
        throw `暂未支持文件格式，支持格式有STL、PLY、DRC、MQ`
      }
    }
  }
  // opts
  //     name: filename, 为了定位文件类型
  //     type: mesh name
  const loadByLoader = (url, opts) => {
    opts = opts || {}
    if (isBlob(url)) {
      setLoaderType(toFileType(opts.name))
    } else {
      setLoaderType(toFileType(url))
    }
    return new Promise((resolve, reject) => {
      if (that.loader == null) {
        resolve(null)
      } else {
        return that.loader.load(url, (geo) => {
          // model file is empty, with no data
          if (geo.type == 'BufferGeometry' && geo.attributes.position.count < 1) {
            resolve(null)
          }
          // for Object loader
          if (geo.type == 'Group') {
            if (geo.children.length > 0) {
              geo = geo.children[0].geometry
            } else {
              resolve('obj file type no data')
            }
          }
          const color = opts.color || new Color('rgb(179,142,107)')
          let material = new MeshPhongMaterial({
            color: color,
            vertexColors: VertexColors,
            specular: 0x111111,
            flatShading: true, // 因为是后台数据，给内部人员看，把三角形显示出来，渲染不需要太平滑
            shininess: 10,
            normalMapType: ObjectSpaceNormalMap,
            side: DoubleSide,
          })
          let colors = []
          for (let i = 0; i < geo.attributes.position.count; i++) {
            colors.push(color.r)
            colors.push(color.g)
            colors.push(color.b)
          }
          geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
          geo.computeVertexNormals()
          geo.normalizeNormals()
          geo.attributes.color.needsUpdate = true
          let mesh = new Mesh(geo, material)
          mesh.url = url
          mesh.name = opts.type
          resolve(mesh)
        }, () => {

        }, (err) => reject(err));
      }
    })
  }

  return {
    loadByLoader,
  }
}
