import { blurSubImageData } from '../blur/image';
import { ImgHandleType } from '../faceBaseData';

function canavsToImage(canvas, ctx, key, value, options = {}) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    blurSubImageData(imgData, value, { canvas, ...options }, true);
    ctx.putImageData(imgData, 0, 0);
    return canvasToTmpFilePath(canvas, {
        key, 
        dpr: options.dpr,
    })
}

export function canvasToTmpFilePath(canvas, options = {}) {
    return new Promise((resolve)=>{
        wx.canvasToTempFilePath({
            x: 0, y: 0,
            width: canvas.width,
            height: canvas.height,
            destWidth: canvas.width * options.dpr,
            destHeight: canvas.height * options.dpr,
            canvas: canvas,
            success: (res)=>{
                resolve({
                    key: options.key, 
                    tempFilePath: res.tempFilePath,
                })
            },
            // complete: ()=>{
            //     console.log(`${key} save image is over`)
            // }
        })
    });
}

/**
 * 替换canavs中的某些数据并导出图片
 * @param {*} canavs 
 * @param {*} data 
 * @returns 
 */
export function genImageUrl(canvas, ctx, data, options = {}) {
    const arr = [];
    for (const [key, value] of Object.entries(data)) {
        arr.push(canavsToImage(canvas, ctx, key, value, { type: ImgHandleType.oneFromFour, ...options }));
    }
    return Promise.all(arr);
}

/**
 * 更新颜色值
 * @param {*} canvas 
 * @param {*} ctx 
 * @param {*} data 
 * @param {*} type 
 * @param {*} options 
 * @returns 
 */
export function updateTypeImage(canvas, ctx, data, type, options) {
    const value = options.isFinal ? data.Result : data[type];
    return new Promise((resolve)=>{
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        blurSubImageData(imgData, value, { canvas, ...options }, true);
        ctx.putImageData(imgData, 0, 0);
        resolve();
    })
}

/**
 * IOs不能使用drawImage(canvas)接口，导致不能直接更新颜色值
 * 现在直接在canvas中更新像素值
 * @param {*} ctx 
 * @param {*} value 
 * @param {*} options 
 * @returns 
 */
export function updateCanvasColorDirectly(ctx, value, options = {}) {
    return new Promise((resolve)=>{
        const imgData = ctx.getImageData(0, 0, options.width, options.height);
        // console.log('directly change color', options, imgData)
        blurSubImageData(imgData, value, options, true);
        ctx.putImageData(imgData, 0, 0);
        resolve();
    })
}

/**
 * 拿到前端调整的颜色
 * @param {*} canvas 
 * @param {*} ctx 
 * @param {*} data 
 * @param {*} type 
 * @param {*} options 
 * @returns 
 */
export function getChangedColorValue(canvas, ctx, data, type, isFinal, options = {}) {
    const value = data[type];
    return new Promise((resolve)=>{
        if (!isFinal) resolve();
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rect = options.rect;
        const rc = { x: 0, y: 0, width: 0, height: 0};        
        rc.x = rect[0][0];
        rc.y = rect[0][1];
        rc.width = rect[2][0] - rc.x;
        rc.height = rect[2][1] - rc.y;
        const rgbData = [];
        const posData = [];
        value.p.forEach((pt,i)=>{
            let idx = pt[0] * 4 * canvas.width + pt[1] * 4;
            posData.push([pt[0], pt[1]]);
            rgbData.push([
                imgData.data[idx + 0], 
                imgData.data[idx + 1], 
                imgData.data[idx + 2], 
            ]);
        });
        resolve(JSON.stringify({p:posData,c:rgbData}));
    })
}