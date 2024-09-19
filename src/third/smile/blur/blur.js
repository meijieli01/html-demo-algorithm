import { rgb2HsvUpdate } from '../color';
import { gaussianKernel9x9, gaussianKernel51x51, gkSize9, gkSize51 } from './kernel';
import { ImgHandleType } from '../faceBaseData';

/**
 * 通过二值图像算高斯系数
 * @param {*} binaryImageU8Arr 
 * @param {*} gkernel 
 * @param {*} kernelSize 
 * @param {*} rc 
 * @returns 
 */
function computeCoeff(binaryImageU8Arr, gkernel, kernelSize, rc) {
    const half = parseInt(kernelSize / 2);
    const coeffF32Arr = new Float32Array(rc.width * rc.height);
    for (let y0=0; y0 < rc.height; y0++) {
        for (let x0=0; x0 < rc.width; x0++) {            
            let mean = 0;
            let idx0 = y0 * rc.width + x0;
            // 方块系数遍历
            for (let y1=-half; y1 <= half; y1++) {
                for (let x1=-half; x1 <= half; x1++) {
                    let idx1 = (y1 + half) * kernelSize + (x1 + half); // 0开始索引
                    let x2 = x0 + x1;
                    let y2 = y0 + y1;                    
                    //  区域外都是0
                    let isOut = x2 < 0 || y2 < 0 || x2 > rc.width || y2 > rc.height;
                    if (!isOut) {                        
                        // 区域内的1和系数相乘
                        let idx2 = y2 * rc.width + x2;
                        if (binaryImageU8Arr[idx2]) {
                            const t1 = ( binaryImageU8Arr[idx2] * gkernel[idx1] );
                            mean += t1;
                        }
                    }
                }
            }
            coeffF32Arr[idx0] = mean;
        }
    }
    return coeffF32Arr;
}

function updateImageData(imageData, coeff, rc, option = {}) {
    let u8ArrR1 = new Uint8ClampedArray(rc.width * rc.height * 4);
    for (let y0=0; y0 < rc.height; y0++) {
        for (let x0=0; x0 < rc.width; x0++) {            
            let idx0 = y0 * rc.width * 4 + x0 * 4;
            let idx1 = y0 * rc.width + x0;
            // 原始图坐标
            let xOrigin = (x0 + rc.x), yOrigin = (y0 + rc.y);
            let idx2 = yOrigin * imageData.width * 4 + xOrigin * 4;
            let exist = false, i = 0;
            let oColor = { r: 0, g: 0, b: 0 };
            let nColor = { r: 0, g: 0, b: 0 };
            if (option.testBlend) {
                u8ArrR1[idx0 + 0] = parseInt(coeff[idx1]);
                u8ArrR1[idx0 + 1] = 0;
                u8ArrR1[idx0 + 2] = 0;
                u8ArrR1[idx0 + 3] = 255;
            } else if (option.testShadow) {
                const k = 10;
                u8ArrR1[idx0 + 0] = parseInt(coeff[idx1] * 255 * k);
                u8ArrR1[idx0 + 1] = parseInt(coeff[idx1] * 255 * k);
                u8ArrR1[idx0 + 2] = parseInt(coeff[idx1] * 255 * k);
                u8ArrR1[idx0 + 3] = 255;
            } else if (option.blend) {
                // 模板值
                const alpha = coeff[idx1];
                const beta = 1 - alpha;
                oColor.r = imageData.data[idx2 + 0];
                oColor.g = imageData.data[idx2 + 1];
                oColor.b = imageData.data[idx2 + 2];
                const value = option.value;
                for (i = 0; i < value.p.length; i++) {
                    if (value.p[i][0] == yOrigin && value.p[i][1] == xOrigin) {
                        exist = true;
                        break;
                    }
                }
                const c = value.c[i];
                if (exist && c) {
                    nColor.r = c[0];
                    nColor.g = c[1];
                    nColor.b = c[2];

                    if (option.info) {
                        const tmp = rgb2HsvUpdate(nColor, option.info);
                        nColor.r = tmp.r;
                        nColor.g = tmp.g;
                        nColor.b = tmp.b;
                    }

                    imageData.data[idx2 + 0] = oColor.r * beta + nColor.r * alpha;
                    imageData.data[idx2 + 1] = oColor.g * beta + nColor.g * alpha;
                    imageData.data[idx2 + 2] = oColor.b * beta + nColor.b * alpha;

                    u8ArrR1[idx0 + 0] = oColor.r * beta + nColor.r * alpha;
                    u8ArrR1[idx0 + 1] = oColor.g * beta + nColor.g * alpha;
                    u8ArrR1[idx0 + 2] = oColor.b * beta + nColor.b * alpha;
                    u8ArrR1[idx0 + 3] = imageData.data[idx2 + 3];
                } else {
                    // 因为模板边缘是空虚，会造成黑边
                    // u8ArrR1[idx0 + 0] = imageData.data[idx2 + 0] * beta;
                    // u8ArrR1[idx0 + 1] = imageData.data[idx2 + 1] * beta;
                    // u8ArrR1[idx0 + 2] = imageData.data[idx2 + 2] * beta;
                    u8ArrR1[idx0 + 0] = imageData.data[idx2 + 0];
                    u8ArrR1[idx0 + 1] = imageData.data[idx2 + 1];
                    u8ArrR1[idx0 + 2] = imageData.data[idx2 + 2];
                    u8ArrR1[idx0 + 3] = imageData.data[idx2 + 3];
                }
            } else if (option.shadow) {
                // 看出效果值来
                const alpha = coeff[idx1];
                const beta = alpha;
                u8ArrR1[idx0 + 0] = imageData.data[idx2 + 0] * beta;
                u8ArrR1[idx0 + 1] = imageData.data[idx2 + 1] * beta;
                u8ArrR1[idx0 + 2] = imageData.data[idx2 + 2] * beta;
                u8ArrR1[idx0 + 3] = imageData.data[idx2 + 3];
            }
        }
    }
    return u8ArrR1;
}

/**
 * 
 * @param {*} imageData 
 * @param {*} value 
 * @param {*} options 
 * @param {*} isMini 
 */
export function blurShadowSubImageData(imageData, value, options = {}, isMini = false) {
    const isDebug = isMini ? false : true;
    const rect = options.rect;
    const rcLeft = rect[0][0], rcTop = rect[0][1],
        rcRight = rect[2][0],
        rcWidth = rcRight - rect[0][0],
        rcHeight = rect[2][1] - rect[0][1];
    const rc1 = { x: 0, y: 0, width: 0, height: 0};
    const margin1 = 5, margin2 = 25;     
    
    rc1.x = rcLeft - margin1;
    rc1.y = rcTop - margin1;
    rc1.width = rcWidth + 2 * margin1;
    rc1.height = rcHeight + 2 * margin1;

    // console.log('blur', options.type)
    // 第一次返回四个模板的数据，不做模糊处理
    if (options.type == ImgHandleType.oneFromFour) {
        value.p.forEach((pt,i)=>{
            let idx = pt[0] * 4 * imageData.width + pt[1] * 4;
            const c = value.c[i];
            imageData.data[idx + 0] = c[0];
            imageData.data[idx + 1] = c[1];
            imageData.data[idx + 2] = c[2];
        });
        return;
    }
    const rc2 = { x: 0, y: 0, width: 0, height: 0};   
    rc2.x = rcLeft - margin2;
    rc2.y = rcTop - margin2;
    rc2.width = rcWidth + 2 * margin2;
    rc2.height = rcHeight + 2 * margin2;
    
    // 0000000000000000000000000
    let u8ArrOrigin = null;
    if (isDebug) {
        u8ArrOrigin = new Uint8ClampedArray(rc1.width * rc1.height * 4);
        for (let y0=0; y0 < rc1.height; y0++) {
            for (let x0=0; x0 < rc1.width; x0++) {            
                let idx0 = y0 * rc1.width * 4 + x0 * 4;
                // 原始图坐标
                let xOrigin = (x0 + rc1.x), yOrigin = (y0 + rc1.y);
                let idx2 = yOrigin * imageData.width * 4 + xOrigin * 4;
                u8ArrOrigin[idx0 + 0] = imageData.data[idx2 + 0];
                u8ArrOrigin[idx0 + 1] = imageData.data[idx2 + 1];
                u8ArrOrigin[idx0 + 2] = imageData.data[idx2 + 2];
                u8ArrOrigin[idx0 + 3] = imageData.data[idx2 + 3];
            }
        }
        value.p.forEach((pt,i)=>{
            let x1 = pt[1] - rcLeft + margin1,
                y1 = pt[0] - rcTop + margin1;
            let idx1 = y1 * rc1.width * 4 + x1 * 4;
        
            const c = value.c[i];
            u8ArrOrigin[idx1 + 0] = c[0];
            u8ArrOrigin[idx1 + 1] = c[1];
            u8ArrOrigin[idx1 + 2] = c[2];
        });
    }    
    // 0000000000000000000000000

    // console.log(rc2);
    // 第一步1.笑窗融合
    // 掩码图二值图，默认0
    let maskU8Arr = new Uint8ClampedArray(rc1.width * rc1.height);
    value.p.forEach((pt)=>{
        let x = pt[1] - rcLeft + margin1,
            y = pt[0] - rcTop + margin1;
        let idx = y * rc1.width + x;
        maskU8Arr[idx] = 1;
    })
    // 2.笑窗融合系数
    const maskCoeffF32Arr = computeCoeff(maskU8Arr, gaussianKernel9x9, gkSize9, rc1);
    // 3.笑窗融合结果
    const blendU8ArrTemplate = updateImageData(imageData, maskCoeffF32Arr, rc1, {
        value: value,
        ...options,
        blend: true,
        // testBlend: true,
    });
    // console.log(blendU8ArrTemplate)
    // 第二步阴影
    // 1. 二值图
    let shadowU8Arr = new Uint8ClampedArray(rc2.width * rc2.height);
    /**
     * 通过笑窗点拟合一条闭合曲线，由闭合曲线拿到所有的点坐标，内填充区域内的点
     * https://www.opencv.org.cn/opencvdoc/2.3.2/html/modules/core/doc/drawing_functions.html?highlight=fillpoly#void%20fillPoly(Mat&%20img,%20const%20Point**%20pts,%20const%20int*%20npts,%20int%20ncontours,%20const%20Scalar&%20color,%20int%20lineType,%20int%20shift,%20Point%20offset)
     * cv2.FillPoly(img, polys, color, lineType=8, shift=0) 
     * 
     */
    const couter = [];
    for (let i = rcLeft; i <= rcRight; i++) {
        const list = value.p.filter(e=>e[1]==i);
        const allY = list.map(e=>e[0]);
        if (allY.length > 0) {
            const minY = Math.min(...allY), maxY = Math.max(...allY);
            let x = i - rcLeft + margin2, 
                y1 = minY - rcTop + margin2, 
                y2 = maxY - rcTop + margin2;            
            shadowU8Arr[y1 * rc2.width + x] = 1;
            shadowU8Arr[y2 * rc2.width + x] = 1;
            couter.push([i, minY]);
            couter.push([i, maxY]);
        }
    }
    // 2. 阴影系数
    const shadowCoeffF32Arr = computeCoeff(shadowU8Arr, gaussianKernel51x51, gkSize51, rc2);
    const shadowU8ArrR1 = updateImageData(imageData, shadowCoeffF32Arr, rc2, {
        value: value,
        couter,
        // shadow: true,
        testShadow: true,
    });
    // 3. 填充带阴影的模糊    
    let shadowMaskU8Arr = new Uint8ClampedArray(rc2.width * rc2.height * 4);
    // console.log(shadowMaskU8Arr)
    for (let y0=0; y0 < rc2.height; y0++) {
        for (let x0=0; x0 < rc2.width; x0++) {            
            let idx = y0 * rc2.width * 4 + x0 * 4;
            let idx0 = y0 * rc2.width + x0;
            // 原始图坐标
            let xOrigin = (x0 + rc2.x), yOrigin = (y0 + rc2.y);
            let idx2 = yOrigin * imageData.width * 4 + xOrigin * 4;            
            // rc1
            let idx1 = -1;
            if (xOrigin >= rcLeft && xOrigin <= rcLeft + rcWidth && 
                yOrigin >= rcTop && yOrigin <= rcTop + rcHeight) {
                let x1 = xOrigin - rc1.x,
                    y1 = yOrigin - rc1.y;
                idx1 = y1 * rc1.width * 4 + x1 * 4;
            }
            
            const alpha = shadowCoeffF32Arr[idx0];
            const beta = 1 - alpha;
            let exist = false, i = 0;
            for (i = 0; i < value.p.length; i++) {
                if (value.p[i][0] == yOrigin && value.p[i][1] == xOrigin) {
                    exist = true;
                    break;
                }
            }
            // exist = couter.filter(e=>e[0]==xOrigin&&e[1]==yOrigin).length > 0;
            if (exist) {
                shadowMaskU8Arr[idx + 0] = 255 * alpha;
                shadowMaskU8Arr[idx + 1] = 255 * alpha;
                shadowMaskU8Arr[idx + 2] = 255 * alpha;
                shadowMaskU8Arr[idx + 3] = 255;
                if (!(idx1 < 0)) {
                    imageData.data[idx2 + 0] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 0] * beta;
                    imageData.data[idx2 + 1] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 1] * beta;
                    imageData.data[idx2 + 2] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 2] * beta;
                }
            } else {
                shadowMaskU8Arr[idx + 0] = 0;
                shadowMaskU8Arr[idx + 1] = 0;
                shadowMaskU8Arr[idx + 2] = 0;
                shadowMaskU8Arr[idx + 3] = 255;
            }
            if (!(idx1 < 0)) {
                imageData.data[idx2 + 0] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 0] * beta;
                imageData.data[idx2 + 1] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 1] * beta;
                imageData.data[idx2 + 2] = (exist ? (255 * alpha) : 0) + blendU8ArrTemplate[idx1 + 2] * beta;
            }
        }
    }
    if (isDebug) {
        const tmpCanvas0 = document.createElement('canvas');
        tmpCanvas0.width = rc1.width;
        tmpCanvas0.height = rc1.height;
        const tmpCtx0 = tmpCanvas0.getContext('2d');
        tmpCtx0.putImageData(new ImageData(u8ArrOrigin, rc1.width, rc1.height), 0, 0);
        document.body.appendChild(tmpCanvas0);
 
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = rc1.width;
        tmpCanvas.height = rc1.height;
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.putImageData(new ImageData(blendU8ArrTemplate, rc1.width, rc1.height), 0, 0);
        document.body.appendChild(tmpCanvas);

        const tmpCanvas2 = document.createElement('canvas');
        tmpCanvas2.width = rc2.width;
        tmpCanvas2.height = rc2.height;
        const tmpCtx2 = tmpCanvas2.getContext('2d');
        tmpCtx2.putImageData(new ImageData(shadowU8ArrR1, rc2.width, rc2.height), 0, 0);
        document.body.appendChild(tmpCanvas2);

        const tmpCanvas3 = document.createElement('canvas');
        tmpCanvas3.width = rc2.width;
        tmpCanvas3.height = rc2.height;
        const tmpCtx3 = tmpCanvas3.getContext('2d');
        tmpCtx3.putImageData(new ImageData(shadowMaskU8Arr, rc2.width, rc2.height), 0, 0);
        document.body.appendChild(tmpCanvas3);
    }
}