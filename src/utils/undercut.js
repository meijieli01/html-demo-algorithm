import * as UnderCutModule from '../../public/libs/cut/DirectDaoao'
import { alias3 } from '../third/mq-webui/viewer.es'

let wasmModule;
export class UnderCut {
    constructor() {
        this.moduleUpper = undefined;
        this.moduleLower = undefined;
    }
    async init() {
        wasmModule = await UnderCutModule.default();
        this.moduleUpper = new wasmModule.DirectDaoao();
        this.moduleLower = new wasmModule.DirectDaoao();
    }
    setData(isUpper, vertices, indexes) {
        const { moduleUpper, moduleLower } = this;
        if ((isUpper && !moduleUpper) || (!isUpper && !moduleLower)) {
            throw new Error('un-init UnderCut');
        }
        const vecVertex = new wasmModule.VectorFloat();
        const vecIndex = new wasmModule.VectorInt();
        vertices.forEach(e => vecVertex.push_back(e));
        indexes.forEach(e => vecIndex.push_back(e));
        if (isUpper) moduleUpper.setMesh(vecVertex, vecIndex);
        else moduleLower.setMesh(vecVertex, vecIndex);
        if (import.meta.env.DEV) {
            console.log('data ', vertices.length / 3, indexes.length / 3, vecVertex.size() / 3, vecIndex.size() / 3);
        }
    }
    fetchIndex(isUpper, direction, voxelSize = 0.25) {
        const { moduleUpper, moduleLower } = this;
        const vectorFloat = new wasmModule.VectorFloat();
        if (Array.isArray(direction)) {
            const dir = new alias3.Vector3().fromArray(direction);
            vectorFloat.push_back(dir.x);
            vectorFloat.push_back(dir.y);
            vectorFloat.push_back(dir.z);
            // direction.forEach(e => vectorFloat.push_back(e));
        } else throw new Error('only support array data')
        if (import.meta.env.DEV) {
            console.log('before set direction ', direction);
        }
        if (isUpper && !moduleUpper.setDirect(vectorFloat) || !isUpper && !moduleLower.setDirect(vectorFloat))
            throw new Error('direction with some problem');
        return this.toJsArray(isUpper ? moduleUpper.getDaoaoFaceIdxs(voxelSize) : moduleLower.getDaoaoFaceIdxs(voxelSize), 'int32');
    }
    toJsArray(vecData, type='float') {
        let res;
        const total = vecData.size();
        if (type == 'float') res = new Float32Array(total);
        else if (type == 'int32') res = new Int32Array(total);
        for (let i = 0; i < total; i++) {
            res[i] = vecData.get(i);
        }
        return res;
    }
}