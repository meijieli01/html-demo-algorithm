import { degree2Radian } from './math/utils';
import { getCanvasSetting } from './h5Image';
import { ExifOrientationCode } from './helpExif'

/**
 * 旋转角度
 * @param {*} img 
 * @param {*} rotateDegree 
 * @param {*} options 
 * @param {*} isMini 
 * @returns 
 */
export function imageRotate(img, rotateDegree, options = {}, isMini = false) {
    return new Promise((resolve)=>{
        const canvas = isMini ? wx.createOffscreenCanvas({type:'2d'}) : document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d', getCanvasSetting());
        if (rotateDegree == 90) {
            canvas.width = img.height;
            canvas.height = img.width;
            ctx.rotate(degree2Radian(rotateDegree));
            ctx.drawImage(img, 0, -img.height, img.width, img.height);
        } else if (rotateDegree == 180) {
            ctx.rotate(degree2Radian(rotateDegree));
            ctx.drawImage(img, -img.width, -img.height, img.width, img.height);
        } else if (rotateDegree == 270) {
            canvas.width = img.height;
            canvas.height = img.width;
            ctx.rotate(degree2Radian(-90));
            ctx.drawImage(img, -img.width, 0, img.width, img.height);
        } else {
            ctx.drawImage(img, 0, 0, img.width, img.height);
        }
        if (isMini) {
            resolve({canvas,ctx});
        } else {
            const bitmap = options.doClip ? createImageBitmap(ctx.getImageData(0, 0, canvas.width, canvas.height), options.x, options.y, options.width, options.height) :
            createImageBitmap(ctx.getImageData(0, 0, canvas.width, canvas.height));
            resolve(bitmap);
        }
    });
}


/**
 * 
 * @param {*} image 
 * @param {*} direction L or R, 不支持其他的值
 * @param {*} isCrop
 * @returns 
 */
export function rotateImageLeftOrRight(image, direction, options = {}) {
    let isCrop = true;
    if (options.isCrop !== undefined) isCrop = options.isCrop;
    const canvas = document.createElement('canvas');
    let imgWidth = image.width, imgHeight = image.height;
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d', getCanvasSetting());
    ctx.drawImage(image, 0, 0);

    const originData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    if (ExifOrientationCode.includes(options.orientation)) {
        return createImageBitmap(originData, options.x, options.y, options.width, options.height)
    }
    const imgDataTranspose = new ImageData(imgHeight, imgWidth);
    const imgDataFinal = new ImageData(imgHeight, imgWidth);
    let dt0 = originData.data;
    let dt1 = imgDataTranspose.data;
    let dt2 = imgDataFinal.data;
    //  transpose
    let r = 0, r1 = 0;
    for (let y = 0, lenH = imgHeight; y < lenH; y++) {
        for (let x = 0, lenW = imgWidth; x < lenW; x++) {
            r = (x + lenW * y) * 4;
            r1 = (y + lenH * x) * 4;
            dt1[r1 + 0] = dt0[r + 0];
            dt1[r1 + 1] = dt0[r + 1];
            dt1[r1 + 2] = dt0[r + 2];
            dt1[r1 + 3] = dt0[r + 3];
        }
    }
    if (!['L','R'].includes(direction)) throw 'not support more rotate image type'
    // reverse width/height
    for (let y = 0, lenH = imgWidth; y < lenH; y++) {
        for (let x = 0, lenW = imgHeight; x < lenW; x++) {
            r = (x + lenW * y) * 4;
            r1 = direction === 'L' ? (x + lenW * (lenH - 1 - y)) * 4 : ((lenW - 1 - x) + lenW * y) * 4;
            dt2[r1 + 0] = dt1[r + 0];
            dt2[r1 + 1] = dt1[r + 1];
            dt2[r1 + 2] = dt1[r + 2];
            dt2[r1 + 3] = dt1[r + 3];
        }
    }
    //         
    return isCrop ? createImageBitmap(imgDataFinal, options.x, options.y, options.width, options.height) : createImageBitmap(imgDataFinal);
}


/**
 * 
 * @param {*} file 
 * @param {*} options 
 * @returns 
 */
export function imageToBitmapWithHandle(file, options = {}) {
    const aiAngle = options.aiAngle;
    // 未携带meta旋转且未人为旋转
    if (aiAngle[1] == 0 && !ExifOrientationCode.includes(aiAngle[0])) {
        // 这里不会处理图像本身的旋转信息，必须drawImage到canvas上去才能对应图像旋转
        return createImageBitmap(file, options.x, options.y, options.width, options.height);
    }
    return new Promise((resolve)=>{
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
            URL.revokeObjectURL(url)
            let orienteDir = '';
            let degree = 0;
            // 携带meta信息的
            if (ExifOrientationCode.includes(aiAngle[0])) {                
                resolve(imageRotate(img, degree, {
                    x: options.x,
                    y: options.y,
                    width: options.width,
                    height: options.height,
                    doClip: true,
                }));
            } else {
                if (aiAngle[1] == 3) degree = 270;
                else if (aiAngle[1] == 2) degree = 180;
                // 未携带meta
                resolve(imageRotate(img, degree, {
                    x: options.x,
                    y: options.y,
                    width: options.width,
                    height: options.height,
                    doClip: true,
                }));
            }
        }
    });
}
