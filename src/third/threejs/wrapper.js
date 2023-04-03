import mqThree from './threejs';
import { mqLoader } from './threeLoader';
const { loadByLoader } = mqLoader();
// 把上下颌显示放在一起的逻辑
export function updateModelInThree(jaw) {    
    mqThree.threeLoading(true);
    return loadByLoader(jaw.ossurl, {
        name: jaw.originalName,
        type: jaw.fileType,
    }).then((mesh) => {
        mqThree.threeRemoveByName(mesh.name);
        mqThree.threeAdd(mesh);
        mqThree.threeLoading(false);
    })
    .catch((err) => {
        mqThree.threeLoading(false);
        console.error('load err', err);
    });
}

export const JawTypeNames = ['UpperJaw', 'LowerJaw', 'Occlusion'];

export function showJawType(jawType) {
    const jawUpper = mqThree.group.children.filter((e) => e.name == JawTypeNames[0]);
    const jawLower = mqThree.group.children.filter((e) => e.name == JawTypeNames[1]);
    const jawBite = mqThree.group.children.filter((e) => e.name == JawTypeNames[2]);
    if (jawType == JawTypeNames[0]) {
        jawUpper.forEach(e => e.visible = true);
        jawLower.forEach(e => e.visible = false);
        jawBite.forEach(e => e.visible = false);
    } else if (jawType == JawTypeNames[1]) {
        jawUpper.forEach(e => e.visible = false);
        jawLower.forEach(e => e.visible = true);
        jawBite.forEach(e => e.visible = false);
    } else if (jawType == JawTypeNames[2]) {
        jawUpper.forEach(e => e.visible = false);
        jawLower.forEach(e => e.visible = false);
        jawBite.forEach(e => e.visible = true);
    } else {
        jawUpper.forEach(e => e.visible = true);
        jawLower.forEach(e => e.visible = true);
        jawBite.forEach(e => e.visible = false);
    }
    mqThree.threeFrame();
}
