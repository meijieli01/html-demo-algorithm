// 默认模型颜色
export const colorModelDefault = '#B38E6B';
const opacityOfDefault = 1;
/**
 * /[^\d]/g 去除非数字
 * /[^\.\d]/g 去除非数字和小数点
 */
const primaryTeethList = [
    18,17,16,15,14,13,12,11,
    21,22,23,24,25,26,27,28,
    48,47,46,45,44,43,42,41,
    31,32,33,34,35,36,37,38,
]

/**
 * CT牙号的配置颜色
 */
export const colorTidEven = '#C41773';
export const colorTidOdd = '#20CB3C';
const colorCrown = '#808080';
const colorTransXXX = '#34B249';
const colorImplantGuid = '#C62A2A';
const colorNerve = '#891FA6';
const colorOfTeethList = {
    '18': '#80561e',
    '17': '#438299',
    '16': '#a37920',
    '15': '#87f879',
    '14': '#be13ed',
    '13': '#e1a1a7',
    '12': '#2a0ef9',
    '11': '#062147',
    '21': '#f19b71',
    '22': '#07ec38',
    '23': '#469066',
    '24': '#536140',
    '25': '#2ff92a',
    '26': '#dc47ba',
    '27': '#736b8e',
    '28': '#b64291',
    '31': '#f171f7',
    '32': '#881aa0',
    '33': '#2ec28e',
    '34': '#ccceef',
    '35': '#5edeed',
    '36': '#cac82d',
    '37': '#b947af',
    '38': '#6b873f',
    '41': '#248d00',
    '42': '#0078ea',
    '43': '#a8471d',
    '44': '#ec258b',
    '45': '#477875',
    '46': '#0c412f',
    '47': '#d47036',
    '48': '#544e97',
}

export function getCtMeshMaterialByName(name) {
    const info = {
        color: colorModelDefault,
        opacity: opacityOfDefault,
    }
    if (name.indexOf('upper_jaw') > -1 || name.indexOf('lower_jaw') > -1) {        
        info.opacity = 0.5;
        info.color = name.indexOf('upper_jaw') > -1 ? '#E23659' : colorTidOdd;
        return info;
    }
    if (name.startsWith('mesh_')) {
        info.color = colorCrown;
        return info;
    }
    if (name.startsWith('trans_')) {
        info.color = colorTransXXX;
        return info;
    }
    if (name.startsWith('implant_guide')) {
        info.color = colorImplantGuid;
        return info;
    }
    if (name.startsWith('nerve')) {
        info.color = colorNerve;
        return info;
    }
    const tid = name.replace(/[^1-9]/gi,'');
    if (tid.length > 0) {
        info.color = colorOfTeethList[tid] || colorModelDefault;
        return info;
    }
    return info;
}

export function getCrownMeshMaterialByName(name) {
    const info = {
        color: colorModelDefault,
        opacity: opacityOfDefault,
    }
    if (name.indexOf('crown') > -1) {        
        info.color = colorTidOdd;
        return info;
    }
    return info;
}

export function getMeshMaterialByName(name, tag) {
    const info = {
        color: colorModelDefault,
        opacity: opacityOfDefault,
    }
    if (tag == 'AI_NightGuard' && name.indexOf('nng') > -1) {        
        info.color = colorTidOdd;
        return info;
    } else if (tag == 'AI_BracketRemove' && name.indexOf('mesh') > -1) {        
        info.color = colorTidOdd;
        return info;
    }
    return info;
}