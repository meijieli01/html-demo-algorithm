import {
  BufferGeometry,
  Color,
  Mesh,
  Line,
  LineBasicMaterial,
  SphereGeometry,
  TubeGeometry,
  CatmullRomCurve3,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Vector3,
} from 'three/build/three.module'

export const parseMasteralign = (str) => {
  return new Promise((resolve, reject) => {    
    try {
      const logoList = []
      const pointList = []
      str.split('\n').forEach((line) => {
        if (typeof line === 'string' && line.length > 0) {
          if (line.startsWith('logo')) {
            let substr = line.substring(line.indexOf('=')+1, line.indexOf('/'))
            logoList.push(substr.split(' ').map(e=>parseFloat(e)))
          } else if (line.startsWith('HEAD') || line.startsWith('END')) {

          } else {
            pointList.push(line.split(' ').map(e=>parseFloat(e)))  
          }
        }
      })
      resolve({
        marks: logoList,
        points: pointList,
      })
    } catch(err) {
      reject(err)
    }
  })
}
export const parseEbrace = (str) => {
  return new Promise((resolve, reject) => {
    try {
      const markList = []
      const pointList = []
      const keyMark = 'UDE/MARKLOCATION/'
      const keyPoint = 'GOTO/'
      str.split('\n').forEach((line) => {
        if (typeof line === 'string' && line.length > 0) {
          if (line.startsWith(keyMark)) {
              markList.push(line.split(keyMark).pop().split(',').map(e=>parseFloat(e)))
          } else if (line.startsWith(keyPoint)) {
              pointList.push(line.split(keyPoint).pop().split(',').map(e=>parseFloat(e)))
          }
        }
      })
      resolve({
        marks: markList,
        points: pointList,
      })
    } catch(err) {
      reject(err)
    }
  })
}

const template = {
  markGeo: null,
  color: null, 
  colorTube: null, 
  markMaterial: new MeshLambertMaterial({color: 0xff0000}),
  tubeMaterial: new MeshLambertMaterial({color: 0xff0000}),
  lineMaterial: new LineBasicMaterial({color: 0xff0000}),
  pathMaterial: new LineBasicMaterial({color: 0xff0000}),
}
export const createMark = (point, options) => {
  if (!template.markGeo) {
    template.markGeo = new SphereGeometry( options.sphereRadius || 0.75, 32, 32)
  }
  if (!template.color) {
    template.color = new Color(options.color || 0xff00ff)    
  }
  template.markMaterial.color = template.color
  const mark = new Mesh(template.markGeo, template.markMaterial)
  mark.position.fromArray(point)
  return mark
}
export const createLine = (points, options) => {
  if (!template.color) {
    template.color = new Color(options.color || 0xff00ff)    
  }
  template.lineMaterial.color = template.color
  if (!(Array.isArray(points) && points.length == 6)) {
    throw `not valid ${points.toString()}`
  }
  const pointBegin = new Vector3().fromArray(points)
  const normal = new Vector3().fromArray(points, 3)
  const pointEnd = new Vector3()
  const count = options.count || 20
  pointEnd.addVectors(pointBegin, normal.multiplyScalar(2))
  const pointList = []
  for (let i = 1; i <= count; i++) {
    let tmp = new Vector3().lerpVectors(pointBegin, pointEnd, i / count)
    pointList.push(tmp)  
  }
  const geo = new BufferGeometry().setFromPoints(pointList)
  return new Line(geo, template.lineMaterial)
}
export const createPath = (points, options) => {
  if (!template.color) {
    template.color = new Color(options.color || 0xff00ff)    
  }
  template.pathMaterial.color = template.color
  template.pathMaterial.linewidth = options.lineWidth || 4
  const pointList = []
  points.forEach((point) => {
    if (Array.isArray(point) && point.length == 6) {
      pointList.push(new Vector3().fromArray(point))
    }
  })
  const geo = new BufferGeometry().setFromPoints(pointList)
  return new Line(geo, template.pathMaterial)
}

export const createTubePath = (points, options) => {
  if (!template.colorTube) {
    template.colorTube = new Color(options.colorTube || 0xf0f0f0)    
  }
  template.tubeMaterial.color = template.colorTube
  const pointList = []
  points.forEach((point) => {
    if (Array.isArray(point) && point.length == 6) {
      pointList.push(new Vector3().fromArray(point))
    }
  })
  // todo tube管线还是依赖了曲线，直线的没有曲率，采样点步数峰值，两点采样会穿模型  
  const curve = new CatmullRomCurve3(pointList, true, 'catmullrom')
  const geo = new TubeGeometry(curve, 20, 0.3, 8, true)
  return new Mesh(geo, template.tubeMaterial)
  // const geo = new BufferGeometry().setFromPoints(curve.getPoints(20))
  // return new LineLoop(geo, template.pathMaterial)
}

export const loadMasteralign = (url, options) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.text())
      .then((res) => parseMasteralign(res))
      .then((data) => {
        const meshList = []
        data.marks.forEach((point) => {
          meshList.push(createMark(point, options))
        })
        data.points.forEach((posAndNormal) => {
          if (Array.isArray(posAndNormal) && posAndNormal.length == 6) {
            meshList.push(createLine(posAndNormal, options))
            meshList.push(createMark(posAndNormal, options))
          }
        })
        // meshList.push(createPath(data.points, options))
        // meshList.push(createTubePath(data.points, options))
        resolve(meshList)
      }, (err) => {
        reject(err)
      })  
  })
}

export const loadEbrace = (url, options) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.text())
      .then((res) => parseEbrace(res))
      .then((data) => {
        const meshList = []
        data.marks.forEach((point) => {
          meshList.push(createMark(point, options))
        })
        data.points.forEach((posAndNormal) => {
          if (Array.isArray(posAndNormal) && posAndNormal.length == 6) {
            meshList.push(createLine(posAndNormal, options))
            meshList.push(createMark(posAndNormal, options))
          }
        })
        // meshList.push(createPath(data.points, options))
        // meshList.push(createTubePath(data.points, options))
        resolve(meshList)
      }, (err) => {
        reject(err)
      })  
  })
}