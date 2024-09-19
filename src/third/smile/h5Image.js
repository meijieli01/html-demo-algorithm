import { ConfigColor, ConfigBitmapOption, } from './color';
import { IroColor } from './iro/iro-core.es';
import { blurSubImageData } from './blur/image';
import { blurShadowSubImageData } from './blur/blur';
import { ImgHandleType } from './faceBaseData';
import { degree2Radian } from './math/utils';
import { gConfigSmile } from './helpConstant';
import { UiConfig, UiScreenType } from './ui';

/**
 * 
 * @param {*} options 
 * @returns 
 */
export function getCanvasSetting(options = {}) {
    return Object.assign({
        // colorSpace: 'display-p3', // 
        colorSpace: "srgb",
        alpha: false,
    }, options);
}

function toBinFile(blob, name) {
    const tagA = document.createElement('a');
    const herf = window.URL.createObjectURL(new Blob([blob], {type: 'application/octet-stream'}));
    tagA.href = herf;
    tagA.download = `${name || Date.now()}`;
    tagA.click();
}

function appendCanvas(width, height, u8Arr, name) {
    const canvas1 = document.createElement('canvas');
    canvas1.width = width;
    canvas1.height = height;
    const ctx1 = canvas1.getContext('2d', getCanvasSetting());
    ctx1.putImageData(new ImageData(u8Arr, width, height), 0, 0);
    canvas1.toBlob(async (blob)=>{
        toBinFile(blob, name);
    }, ConfigColor.imgType, ConfigColor.imgQulity);
    document.body.appendChild(canvas1);
}

/**
 * 闭包反馈更新图像大小
 * 使用原图大小
 * @param {*} imgBitmap 
 * @param {*} wReal 
 * @param {*} hReal 
 * @returns 
 */
export function ClosureCanvasUpdateImage(bitmap, options = {}) {
    const cahceData = {
        data: {},
    };
    const imgW = bitmap.width, imgH = bitmap.height;
    const canvasCache = document.createElement('canvas');
    canvasCache.width = imgW;
    canvasCache.height = imgH;
    const ctxCache = canvasCache.getContext('2d', getCanvasSetting({willReadFrequently : true}));
    const enableSmooth = options.enableSmooth || true;
    const oneImageData = ({key,value}, options1={}) => {
        return new Promise((resolve)=>{
            const elCanvas = document.createElement('canvas');
            elCanvas.width = imgW;
            elCanvas.height = imgH;
            const ctx = elCanvas.getContext('2d', getCanvasSetting());
            ctx.imageSmoothingEnabled = enableSmooth;
            ctx.drawImage(bitmap, 0, 0);        
            const imageData = ctx.getImageData(0, 0, imgW, imgH);
            blurSubImageData(imageData, value, {
                ...options1,
            });
            ctx.putImageData(imageData, 0, 0);
            if (options1.type === ImgHandleType.oneFromFour) {
                elCanvas.toBlob(async (blob)=>{
                    resolve({key, url: URL.createObjectURL(blob)});
                }, ConfigColor.imgType, ConfigColor.imgQulity);
            } else {
                createImageBitmap(imageData, ConfigBitmapOption).then(res=>resolve(res));
            }
        })
    }
    /**
     * ai2返回的数据结果
     * @param {*} data 原图坐标数据
     * @returns 
     */
    const updateSubImage = (imgHType, data, options1 = {}) => {
        cahceData.data = data;
        const arrPromise = [];
        for (const [key,value] of Object.entries(data)) {
            arrPromise.push(oneImageData({key,value}, {
                ...options1,
                type: imgHType,
            }));
        }
        return Promise.all(arrPromise);
    }

    const replaceAiResult = (newBitmap, data, options1 = {}) => {
        const key = 'Result';
        const value = data[key];
        if (value.p.length < 1 || value.p.color < 1) {
            console.warn(`not correct type ${key}_${options1.idxColor}`);
        }
        return new Promise((resolve)=>{  
            ctxCache.drawImage(newBitmap, 0, 0);    
            const imageData = ctxCache.getImageData(0, 0, newBitmap.width, newBitmap.height, getCanvasSetting());            
            blurSubImageData(imageData, value, {
                type: ImgHandleType.final,
                ...options1,
            });

            if (gConfigSmile.showColorDebug) {
                const rect = options1.rect;
                const rc = { x: 0, y: 0, width: 0, height: 0};        
                rc.x = rect[0][0];
                rc.y = rect[0][1];
                rc.width = rect[2][0] - rc.x;
                rc.height = rect[2][1] - rc.y;
                let str1 = '';
                ctxCache.drawImage(bitmap, 0, 0);
                value.p.forEach((pt,i)=>{
                    let idx = pt[0] * 4 * imageData.width + pt[1] * 4;
                    const rgb = value.c[i];
                    // if (pt[1] === 1115 && pt[0] === 2388) {
                        str1 += `${pt[1]} ${pt[0]} ${0} ${rgb[0]} ${rgb[1]} ${rgb[2]}\n`;
                    // }
                });
                toBinFile(str1, 'final.asc');
            }
            
            createImageBitmap(imageData, ConfigBitmapOption).then(res=>resolve(res));
        })
    }
    
    /**
     * 更改色彩空间
     * @param {*} code 
     * @param {*} imgHType
     * @param {*} infoColor 
     */
    const updateImageColorInfo = (newBitmap, imgHType, infoColor, options1 = {}) => {
        const key = ConfigColor.shapes[options1.idxStroke];
        const value = cahceData.data[`${key}_${options1.idxColor}`];
        if (value.p.length < 1 || value.p.color < 1) {
            console.warn(`not correct type ${key}_${options1.idxColor}`);
        }
        return new Promise((resolve)=>{  
            ctxCache.drawImage(newBitmap, 0, 0);    
            const imageData = ctxCache.getImageData(0, 0, newBitmap.width, newBitmap.height, getCanvasSetting());
            // 只有最后一步是模糊加阴影
            // if (imgHType == ImgHandleType.final) {                
            //     blurShadowSubImageData(imageData, value, {
            //         type: imgHType,
            //         info: infoColor,
            //         ...options1,
            //     });
            // } else {                
                blurSubImageData(imageData, value, {
                    type: imgHType,
                    info: infoColor,
                    ...options1,
                });
            // }
            createImageBitmap(imageData, ConfigBitmapOption).then(res=>resolve(res));
        })
    }
    const saveData = (bitmap, options = {}) => {
        const key = ConfigColor.shapes[options.idxStroke];
        const value = cahceData.data[`${key}_${options.idxColor}`];
        return new Promise((resolve)=>{            
            // if (!gConfigSmile.showColorDebug) {
            //     resolve();
            // };
            const rect = options.rect;
            const rc = { x: 0, y: 0, width: 0, height: 0};        
            rc.x = rect[0][0];
            rc.y = rect[0][1];
            rc.width = rect[2][0] - rc.x;
            rc.height = rect[2][1] - rc.y;
            const rgbData = [];
            const posData = [];
            // let str1 = '';
            // let u8Arr = new Uint8ClampedArray(rc.width * rc.height * 4);
            ctxCache.drawImage(bitmap, 0, 0);
            const imageData = ctxCache.getImageData(0, 0, bitmap.width, bitmap.height, getCanvasSetting());
            value.p.forEach((pt,i)=>{
                let idx = pt[0] * 4 * imageData.width + pt[1] * 4;
                // let idx0 = (pt[0] - rc.y) * 4 * rc.width + (pt[1] - rc.x) * 4;
                // u8Arr[idx0 + 0] = imageData.data[idx + 0];
                // u8Arr[idx0 + 1] = imageData.data[idx + 1];
                // u8Arr[idx0 + 2] = imageData.data[idx + 2];
                // u8Arr[idx0 + 3] = imageData.data[idx + 3];

                posData.push([pt[0], pt[1]]);
                rgbData.push([
                    imageData.data[idx + 0], 
                    imageData.data[idx + 1], 
                    imageData.data[idx + 2], 
                ]);

                // const rgb = value.c[i];
                // if (pt[1] === 1115 && pt[0] === 2388) {
                    // const info = options.info;
                    // const inHsv = IroColor.rgbToHsv({
                    //     r: rgb[0],
                    //     g: rgb[1],
                    //     b: rgb[2],
                    // });
                    // const outHsv = {
                    //     h: Math.max(0, Math.min(360, inHsv.h * parseFloat(info.hue))) ,
                    //     s: Math.max(0, Math.min(100, inHsv.s * parseFloat(info.saturation))) ,
                    //     v: Math.max(0, Math.min(100, inHsv.v * parseFloat(info.brightness))),
                    // }
                    // const outRgb = IroColor.hsvToRgb(outHsv);
                    // str1 += `${pt[1]} ${pt[0]} ${0} ${imageData.data[idx + 0]} ${imageData.data[idx + 1]} ${imageData.data[idx + 2]}\n`;
                    // str1 += `${pt[1]} ${pt[0]} ${0} ${rgb[0]} ${rgb[1]} ${rgb[2]}\n`;
                    // str1 += `${pt[1]} ${pt[0]} ${0} ${inHsv.h} ${inHsv.s} ${inHsv.v}\n`;
                    // str1 += `${pt[1]} ${pt[0]} ${0} ${outHsv.h} ${outHsv.s} ${outHsv.v}\n`;
                    // str1 += `${pt[1]} ${pt[0]} ${0} ${outRgb.r} ${outRgb.g} ${outRgb.b}\n`;
                // }
            });
            // toBinFile(str1, 'adjust.asc');
            // appendCanvas(rc.width, rc.height, u8Arr, 'adjust.png');
            resolve(JSON.stringify({p:posData,c:rgbData}));
        })
    }
    const genImageByBitmap = (bitmap)=>{
        return new Promise((resolve)=>{
            const canvas1 = document.createElement('canvas');
            canvas1.width = bitmap.width;
            canvas1.height = bitmap.height;
            const ctx1 = canvas1.getContext('2d',getCanvasSetting());
            ctx1.imageSmoothingEnabled = enableSmooth;
            ctx1.drawImage(bitmap, 0, 0);        
            canvas1.toBlob(async (blob)=>{
                resolve(URL.createObjectURL(blob));
            }, ConfigColor.imgType, ConfigColor.imgQulity);
        })
    }
    /**
     * 生成一张图片，一张原图，一张效果图，最后是口的裁剪区域
     * @param {*} info 
     * @returns 
     */
    const genImageCompare = (info, data, isUrl = true) => {
        const { bitmapOrigin, bitmapNow, clipPoints, ctxClip } = info;
        const fetchUrlImage = (url)=>{
            return new Promise((resolve)=>{
                const img = new Image();
                img.addEventListener('load', ()=>{
                    resolve(img);
                })
                img.src = url;
            })
        }
        // console.log(data.degree)
        // data.degree = -10;
        const rotateCanvas = (bitmap) => {
            return new Promise((resolve)=>{
                // const offCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
                // const ctx = offCanvas.getContext('2d',getCanvasSetting());
                // ctx.translate(offCanvas.width/2, offCanvas.height/2);
                // ctx.rotate(degree2Radian(data.degree));
                // ctx.drawImage(bitmap, -bitmap.width/2, -bitmap.height/2);
                // ctx.translate(-offCanvas.width/2, -offCanvas.height/2);
                // ctx.rotate(-degree2Radian(data.degree));
                // ctx.restore();
                // resolve(offCanvas);

                const canvas1 = document.createElement('canvas');
                canvas1.width = bitmap.width;
                canvas1.height = bitmap.height;
                const ctx = canvas1.getContext('2d',getCanvasSetting());
                // 平移到中心点
                ctx.translate(canvas1.width/2, canvas1.height/2);
                ctx.rotate(degree2Radian(data.degree));
                // 图片也绘制在中心处理
                ctx.drawImage(bitmap, -bitmap.width/2, -bitmap.height/2);
                // 还原坐标系
                ctx.translate(-canvas1.width/2, -canvas1.height/2);
                ctx.rotate(-degree2Radian(data.degree));
                ctx.restore();
                // document.body.appendChild(canvas1);
                resolve(canvas1);
            })
        }
        return new Promise(async (resolve)=>{
            if (gConfigSmile.isDev) {
                console.log('clip doing ', clipPoints)
            }
            // 偏移量，居中
            const clipOffset = { left: 0, top: 0, width: 0, height: 0 };
            const imageData1 = ctxClip.getImageData(clipPoints.x - clipOffset.left, clipPoints.y - clipOffset.top, clipPoints.width + clipOffset.width, clipPoints.height + clipOffset.height);
            const clipBitmap = await createImageBitmap(imageData1);
            Promise.all([
                fetchUrlImage(data.logo),
                rotateCanvas(clipBitmap),
                rotateCanvas(bitmapOrigin),
                rotateCanvas(bitmapNow),
            ]).then(res=>{                
                const bitmapClip = res[1];
                // if (gConfigSmile.isDev) {
                //     const canvas1 = document.createElement('canvas');
                //     canvas1.width = clipPoints.width, 
                //     canvas1.height = clipPoints.height;
                //     const ctx1 = canvas1.getContext('2d',getCanvasSetting());
                //     ctx1.drawImage(bitmapClip, 0, 0);
                //     document.body.appendChild(canvas1);
                // }
                const canvas = document.createElement('canvas');                
                const textHeight = 50;
                let oneW = Math.min(800, bitmapOrigin.width);
                if (UiConfig.screenType == UiScreenType.size21to9) {
                    oneW = bitmapOrigin.width/2;
                } else {
                    oneW = Math.ceil(bitmapOrigin.width * 0.9);
                }
                const oneH = oneW / info.ratio;
                canvas.width = oneW * 3;
                canvas.height = oneH + 2 * textHeight;
                const margin = 10;
                let xStart = margin, yStart = margin;
                const ctx = canvas.getContext('2d', getCanvasSetting());                
                ctx.imageSmoothingEnabled = enableSmooth;
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const text1 = `医生姓名：${data.doctorName}`;
                const text2 = `患者姓名：${data.patientName}`;
                const now = new Date();
                const text3 = `时间：${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
                ctx.fillStyle = 'white';
                ctx.font = `normal normal normal 36px ${data.font.family || 'serif'}`;
                const hHeight = textHeight / 2;
                yStart = margin + hHeight;
                // head
                ctx.fillText(text1, xStart, yStart);
                ctx.fillText(text2, (canvas.width / 2 - ctx.measureText(text2).width / 2), yStart);
                ctx.fillText(text3, (canvas.width - ctx.measureText(text3).width) - xStart, yStart);
                // 
                const barHeight = 5;
                ctx.fillRect(0, textHeight, canvas.width, barHeight);
                yStart = textHeight + barHeight;
                // 
                ctx.drawImage(res[2], 0, 0, bitmapOrigin.width, bitmapOrigin.height, 0, yStart, oneW, oneH);
                ctx.drawImage(res[3], 0, 0, bitmapNow.width, bitmapNow.height, oneW, yStart, oneW, oneH);       
                const clipW = oneW - margin * 2, clipH = clipW * bitmapClip.height / bitmapClip.width;                
                ctx.drawImage(bitmapClip, 0, 0, bitmapClip.width, bitmapClip.height, oneW * 2 + (oneW - clipW) / 2, (canvas.height - yStart * 2 - clipH) / 2, clipW, clipH);
                // bottom-bar
                const text4 = 'BEFORE', text5 = 'AFTER';
                ctx.fillText(text4, oneW - ctx.measureText(text4).width - margin, canvas.height - margin);
                ctx.fillText(text5, oneW * 2 - ctx.measureText(text5).width - margin, canvas.height - margin);
                // logo
                const hLogo = res[0].height, wLogo = res[0].width;
                const wDst = textHeight * wLogo / hLogo;
                ctx.drawImage(res[0], 0, 0, wLogo, hLogo, canvas.width - wDst - margin, canvas.height - textHeight - barHeight, wDst, textHeight);
                canvas.toBlob(async (blob)=>{
                    if (isUrl) resolve(URL.createObjectURL(blob));
                    else resolve(blob);
                }, ConfigColor.imgType, ConfigColor.imgQulity);
            });
        })
    }
    /**
     * 裁剪二次返回的轮廓线的坐标，平移一个裁剪区域
     * @param {*} type 
     * @param {*} rc 
     * @returns 
     */
    const getNewTeethCouter = (type, rc)=>{
        const tmp = cahceData.data[type].new_teeth_counter;
        if (tmp) {
            const data = [];
            tmp.forEach(one=>{
                for (let k in one) {
                    data.push({
                        [k] :one[k].map(e=>[e[0] - rc[0], e[1] - rc[1]]),
                    });
                }
            })
            return data;
        }
        return undefined;
    }
    return {
        replaceAiResult,
        updateSubImage,
        updateImageColorInfo,
        genImageCompare,
        genImageByBitmap,
        getNewTeethCouter,
        saveData,
    };
}

