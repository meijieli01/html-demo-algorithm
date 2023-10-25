import { DRACOExporter } from 'three/examples/jsm/exporters/DRACOExporter';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';

export function mesh2drc(mesh) {
    return new Promise((resolve) => {
        const exporter = new DRACOExporter();
        resolve(
            exporter.parse(mesh, {
                exportColor: false,
                exportUvs: false,
                exportNormals: false,
                quantization: [14, 8, 8, 8, 8],
            })
        );
    });
}

export function mesh2ply(mesh, { isBinary = true }) {
    return new Promise((resolve) => {
        const exporter = new PLYExporter();
        exporter.parse(
            mesh,
            (buffer) => {
                resolve(buffer)
            },
            {
                binary: isBinary,
            }
        );
    });
}

export function mesh2stl(mesh, { isBinary = true }) {
    return new Promise((resolve) => {
        const exporter = new STLExporter();
        resolve(exporter.parse(mesh, {binary: isBinary}));
    });
}
