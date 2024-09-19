import { 
    Mesh, Color, MeshPhongMaterial, Float32BufferAttribute, DoubleSide,
    ObjectSpaceNormalMap, Matrix4,
} from './mq-render/viewer.es';
// 默认模型颜色
const colorModelDefault = '#B38E6B'; // 'rgb(179,142,107)'
const colorModelSelectDefault = '#d9342a'; // 'rgb(217,52,42)'
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
const colorTidEven = '#C41773';
const colorTidOdd = '#20CB3C';
const colorCrown = '#808080';
const colorTransXXX = '#A3A8A7';
const colorImplantGuid = '#635DB1';
const colorNerve = '#C000F5';
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

/**
 * 获取材质参数
 * @param {*} name 
 * @param {*} options tag是算法AI展示使用
 * @returns 
 */
export function getMeshMaterialOption(name, options = {}) {
    const tag = options.tag || '';
    const info = {
        color: colorModelDefault,
        opacity: opacityOfDefault,
    }
    if (tag) {
        if (['AI_NightGuard','AI_Retainer'].includes(tag) && name.indexOf('nng') > -1) {        
            info.color = colorTidOdd;
        } else if (tag == 'AI_BracketRemove' && name.indexOf('mesh') > -1) {        
            info.color = colorTidOdd;
        } else if (tag == 'CROWN' && name.indexOf('crown') > -1) {        
            info.color = colorTidOdd;
        } else if (tag == 'AI_Clean' && name.indexOf('cleaned') > -1) {        
            info.color = colorTidOdd;
        } else if (tag == 'AI_Oc_Re' && name.indexOf('orig_lower') > -1) {        
            info.color = colorTidOdd;
        } else if (tag == 'IMPLANT') {        
            if (name.indexOf('upper_jaw') > -1 || name.indexOf('lower_jaw') > -1) {        
                info.opacity = 0.5;
                info.color = name.indexOf('upper_jaw') > -1 ? '#E23659' : colorTidOdd;
            } else if (name.startsWith('mesh_')) {
                info.color = colorCrown;
            } else if (name.startsWith('trans_')) {
                info.color = colorTransXXX;
            } else if (name.startsWith('implant_guide')) {
                info.color = colorImplantGuid;
            } else if (name.startsWith('nerve')) {
                info.color = colorNerve;
            } else {
                const tid = name.replace(/[^1-9]/gi,'');
                if (tid.length > 0) {
                    info.color = colorOfTeethList[tid] || colorModelDefault;
                }
            }
        }
    }
    return info;
}

/**
 * @deprecated 使用getMeshMaterialOption
 * @param {} name 
 * @returns 
 */
export function getMeasureMaterialByName(name) {
    const info = {
        color: colorTidOdd,
        opacity: opacityOfDefault,
    }
    return info;
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
  
export function addColor2Mesh(bufferGeo, options = {}) {  
    const hasColor = typeof options.hasColor == 'boolean' ? options.hasColor : true;
    return new Promise((resolve)=>{
      const color = new Color(options.color || 'rgb(179,142,107)');
      let material = new MeshPhongMaterial({
        color: color,
        specular: 0x111111,
        reflectivity: 0.2,
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
  
  export function arrayVectorToMatrix(arrVector) {
    const mat = new Matrix4();
    mat.set(
        arrVector[0][0], arrVector[0][1], arrVector[0][2], arrVector[0][3], 
        arrVector[1][0], arrVector[1][1], arrVector[1][2], arrVector[1][3], 
        arrVector[2][0], arrVector[2][1], arrVector[2][2], arrVector[2][3], 
        arrVector[3][0], arrVector[3][1], arrVector[3][2], arrVector[3][3], 
    )
    return mat;
}

export function bindDracoEncoder(drcPath) {
    let elScript = document.createElement('script');
    elScript.type = 'text/javascript';
    elScript.src = drcPath || '/js/libs/draco/draco_encoder.js';
    document.body.appendChild(elScript);
  }
  