import { IroColor } from './iro/iro-core.es';

export const ConfigColor = {
    // 色调
    hueMin: 0,
    hueMax: 2,
    hueDefault: 1,
    // 饱和度
    saturationMin: 0.5,
    saturationMax: 2,
    saturationDefault: 1,
    // 亮度 相对于当前的亮度值
    brightnessMin: 0.7,
    brightnessMax: 1.4,
    brightnessDefault: 1,
    // 色温
    kelvinMin: 2000,
    kelvinMax: 40000, 
    kelvinStep: 1,
    kelvinValue: 5000,
    // 单位
    unit: 0.01,

    tHue: 'hue',
    tSaturation: 'saturation',
    tBrightness: 'brightness',
    tKelvin: 'kelvin', // 色温    

    // 模板索引
    shapes: ['F01','F02','F06','F07','F08','F10','F26','J01','M05','M08'],
    colors: ['0','1','2','3','4','5','6'],
    shapeInfo: [
        { index: 5, label: '卵圆型' },
        { index: 1, label: '尖圆型' },
        { index: 7, label: '方圆型' },
        { index: 8, label: '混合型' },
    ],
    // imgType: 'image/jpeg',
    imgType: 'image/png',
    imgQulity: 1,
};

export const ConfigBitmapOption = {
    colorSpaceConversion: 'none',
    resizeQuality: 'high'
}

export function toShapeColor(iShape, iColor) {
    return `${ConfigColor.shapes[iShape]}_${ConfigColor.colors[iColor]}`;
}

export function parseShapeColor(type) {
    const tmp = type.split('_');
    return {
        iStroke: ConfigColor.shapes.indexOf(tmp[0]),
        iColor: ConfigColor.colors.indexOf(tmp[1]),
    }
}

/**
 * 色温转换
 * @param {*} type kelvin 
 */
export function updateColorWithOptions(type, options = {}) {
    const toFloat = (field) => {
        if (typeof(options[field]) == 'string') {
            return parseFloat(options[field]); 
        }
        return options[field];
    }
    const res = { 
        hue: toFloat('hue'), 
        saturation: toFloat('saturation'), 
        brightness: toFloat('brightness'), 
        kelvin: toFloat('kelvin'), 
    };
    if (ConfigColor.tKelvin == type) {
        const res1 = IroColor.kelvinToRgb(res.kelvin);
        const res2 = IroColor.rgbToHsv(res1);
        res.hue = res2.h;
        res.saturation = res2.s;
        res.brightness = res2.v;
    } else {
        const res1 = IroColor.hsvToRgb({h: res.hue, s: res.saturation, v: res.brightness});
        res.kelvin = Math.round(IroColor.rgbToKelvin(res1));
    }
    return res;
}

/**
 * 颜色更新
 * @param {*} inRgb 
 * @param {*} info // 类型值
 * @returns 
 */
export function rgb2HsvUpdate(inRgb, info) {
    const inHsv = IroColor.rgbToHsv(inRgb);
    const outHsv = {
        h: Math.max(0, Math.min(360, inHsv.h * parseFloat(info.hue))) ,
        s: Math.max(0, Math.min(100, inHsv.s * parseFloat(info.saturation))) ,
        v: Math.max(0, Math.min(100, inHsv.v * parseFloat(info.brightness))),
    }
    const outRgb = IroColor.hsvToRgb(outHsv);
    // console.log('-in-rgb', inRgb, '-hsv-', outHsv, '-out-rgb-', outRgb)
    return outRgb;
}