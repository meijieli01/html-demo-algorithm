import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter'
import { DRACOExporter } from 'three/examples/jsm/exporters/DRACOExporter'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'

export const export2ply = (mesh) => {
  return new Promise((resolve) => {
    const exporter = new PLYExporter()
    exporter.parse(
      mesh,
      (buffer) => {
        resolve(buffer)
      },
      {
        binary: true,
      }
    )
  })
}
export const export2stl = (mesh, { isBinary }) => {
  return new Promise((resolve) => {
    const exporter = new STLExporter()
    resolve(exporter.parse(mesh, {binary: isBinary}))
  })
}
export const export2drc = (mesh) => {
  return new Promise((resolve) => {
    const exporter = new DRACOExporter()
    resolve(
      exporter.parse(mesh, {
        exportColor: false,
        exportUvs: false,
        exportNormals: false,
        quantization: [14, 8, 8, 8, 8],
      })
    )
  })
}
