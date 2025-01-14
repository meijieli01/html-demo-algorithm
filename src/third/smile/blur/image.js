import { rgb2HsvUpdate } from '../color';
import { ImgHandleType } from '../faceBaseData';
/**
 * 
 * @param {*} imageData 原始图像
 * @param {*} value 
 * @param {*} options 
 * @param {*} isMini 
 */
export function blurSubImageData(imageData, value, options = {}, isMini = false) {
    const rect = options.rect;
    const rc = { x: 0, y: 0, width: 0, height: 0};        
    rc.x = rect[0][0];
    rc.y = rect[0][1];
    rc.width = rect[2][0] - rc.x;
    rc.height = rect[2][1] - rc.y;
    // console.log(rc, options.type, options.info, value);
    value.p.forEach((pt,i)=>{
        const c = value.c[i];        
        // 所有颜色都在返回的ai值基础上修改
        let nColor = { r: 0, g: 0, b: 0 };
        if (c) {
            nColor.r = c[0];
            nColor.g = c[1];
            nColor.b = c[2];
        }        
        let idx = pt[0] * 4 * imageData.width + pt[1] * 4;
        if (options.type == ImgHandleType.replace) {
            idx = (pt[0] - rc.y) * 4 * rc.width + (pt[1] - rc.x) * 4;
        } else {
            idx = pt[0] * 4 * imageData.width + pt[1] * 4;
            if ([ImgHandleType.oneFromFour, ImgHandleType.stroke, ImgHandleType.final].includes(options.type)) {
                // 最终效果由ai返回，前端不需要处理
                if (options.type === ImgHandleType.final) {
                    
                } else {
                    if (options.info) {
                        nColor = rgb2HsvUpdate(nColor, options.info);
                    }
                }
            } else {
                if (options.info) {
                    nColor = rgb2HsvUpdate(nColor, options.info);
                } else {
                    throw 'must given color info data';
                }
            }
        }
        if (nColor.r !== 0 && nColor.g !== 0 && nColor.b !== 0) {
            imageData.data[idx + 0] = nColor.r;
            imageData.data[idx + 1] = nColor.g;
            imageData.data[idx + 2] = nColor.b;
            imageData.data[idx + 3] = 255;
        }
    })
}