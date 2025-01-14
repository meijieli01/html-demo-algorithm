
import exifr from './exifr.lite.esm';
import { gConfigSmile } from './helpConstant'

export function imageFileOrientation(file) {
    return new Promise((resolve)=>{
        exifr.orientation(file).then(res=>{
            // https://exiftool.org/TagNames/EXIF.html
            resolve(res);
        }).catch(err=>{
            console.log(err);
            resolve(-1);
        });
    });
}

/**
 * 1 水平，不需要更改
 * 2 水平镜像的
 */
export const ExifOrientationCode = [2,3,4,5,6,7,8];

/**
 * 
 * @param {*} aiCode 
 * @param {*} exifOrientation 
 */
export function diffImageAngle(aiCode, exifOrientation) {
    if (gConfigSmile.isDev) {
        console.log('ai', aiCode, 'dir', exifOrientation)
    }
    // 如果exif是旋转的，ai识别也是旋转的，但是在canvas.drawIamge中会直接绘制正确，即不需要处理
    if (ExifOrientationCode.includes(exifOrientation) && [1,3].includes(aiCode)) {
        return 0;
    }
    return aiCode * (-90);
}