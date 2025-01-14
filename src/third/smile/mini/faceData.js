import { getTouchPoint, getFinger2Distance, maxImageSize, isSameDirection } from './utils';
import { UIType } from '../ui';
import { CurveObject, CurveType } from '../curve';
import { gConfigSmile } from '../helpConstant';
import { imageRotate, imageToBitmapWithHandle } from '../helpCanvas';
import { KPType, KeyPointPath, PathType } from '../math/path2d';
import { calcCoordinate } from '../math/space';
import { Point2SegDist, degree2Radian, radian2Degree, fourCornerPoint, copyPoint } from '../math/utils';
import { regression } from '../regression';
import { gConfigMini } from './config';
import { genImageUrl, updateTypeImage, canvasToTmpFilePath, getChangedColorValue, updateCanvasColorDirectly } from './image';
import { FaceDataBase, ImgHandleType } from '../faceBaseData';

/**
 * 参考XR-FRAME处理的关系
 * https://developers.weixin.qq.com/miniprogram/dev/framework/xr-frame/
 * 逻辑像素css
 * 物理像素渲染时
 * 
 * 物理像素 = 逻辑像素 * dpr=pixelRatio
 * 
 * 小程序为了适应各种屏幕,屏幕宽度固定750rpx
 * 
 */


/**
 * 
 */
class FaceData extends FaceDataBase {
    constructor() {
        super();
        this.isMini = true;
        this.keyAiData = '';
        this.attachColorData = undefined;
        this.attachColor = false;
        this.id = Date.now();
        this.cameraTranlate = {x:0, y: 0};
        this.cameraZoom = 1;
        this.preCameraZoom = 1;
        this.startDistance = 0;
        this.preTouches = []; // 按下时的触摸值
        this.fingers = 1;
        this.kp = null; // 选中的kp对象
        this.uiType = UIType.none;
        this.ai1 = {}; // ai1返回的数据
        this.ai2 = {}; // ai2返回的数据
        this.ai2Bk = []; // 数组
        this.canvas = null;
        this.ctx = null;
        this.canvasAux1 = null;
        this.ctxAux1 = null;
        this.dpr = 1;
        this.elRc = {};
        this.imgOrigin = null;
        this.imgRc = {};
        this.lastX = 0;
        this.lastY = 0;
        this.imgDataOrigin = {};
        this.sys = {};
        this.degreeByMiddle = 0;
        this.rectWindow = []; // 
        this.rc = {}; // 裁剪区域
        this.clipOffScreenCanvas = null;
        this.pathModifyClip = '';
        this.pathOrigin = '';
        this.pathModify = '';
        this.panUnit = gConfigMini.unitPan;
        this.imgiOS = null;
        this.imgClip = null; // 裁剪后的图片
        this.imgClipData = null;
    }
    initial(options = {}) {
      this.options = options;
    }    
    reset() {
        const { curveProxy } = this;
        this.pathModifyClip = '';
        this.pathOrigin = '';
        this.pathModify = '';
        this.imgiOS = null;
        this.imgClip = null;
        this.imgClipData = null;
        this.attachColorData = undefined;
        curveProxy.reset();
    }
    bindCanvas(canvas, options = {}) {
        const { curveProxy, options: inOptions } = this;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        curveProxy.bindCtx(this.ctx, inOptions);
        this.sys = options.sys || {};
        this.dpr = this.sys.pixelRatio;
        this.panUnit = gConfigMini.unitPan * this.dpr;
        // 微信返回的rc信息,是逻辑像素信息
        this.elRc = options.rc || {};
        this.elRc.width *= this.dpr;
        this.elRc.height *= this.dpr;
        canvas.width = this.elRc.width;
        canvas.height = this.elRc.height;
        this.canvasAux1 = options.canvasAux1;
        this.ctxAux1 = this.canvasAux1.getContext('2d');
    }
    setAi1Data(id, ai1, imgSrc, callback = ()=>{}) {
        const { canvas, ctx, elRc, kpList, sys, cameraTranlate, curveProxy,
         options: Inoptions, rectWindow } = this;
        //  清空旧数据
        curveProxy.reset();
        this.initIncisalCtrl = false;
        this.cameraZoom = 1;
        this.preCameraZoom = 1;
        cameraTranlate.x = 0;
        cameraTranlate.y = 0;
        kpList.length = 0;
        this.id = id;
        this.ai1 = ai1;
        this.attachColor = false;
        this.attachColorData = undefined;
        this.clipImage(imgSrc, (rc, resClip)=>{
            const imgRc = maxImageSize(elRc, rc.width, rc.height, sys);
            this.imgRc = imgRc;
            this.rc = rc;
            ai1.face_kp.map(e=>this.toPoint(e)).forEach((pt,i)=>{
                // 确保牙齿显示出来，就以眉心为页面顶部
                if (i==KPType.glaballa) {
                    cameraTranlate.y = -pt.y * 0.5;
                    if (cameraTranlate.y > 0) cameraTranlate.y *= -1;
                }
                kpList.push(new KeyPointPath(pt.x, pt.y, i, {canvas: canvas}));
            });
            // 坐标
            this.updateCoordinateFrame();
            // 牙齿曲线
            ai1.mod_teeth_counters.forEach(one=>{
                for (let k in one) {
                    curveProxy.addCurve(new CurveObject(ctx, one[k].map(e=>this.toPoint(e)), CurveType.teeth, k, Inoptions));
                }
            })
            curveProxy.computeInitValue();
            curveProxy.initCervialAndIncisal();
            curveProxy.initX();
            curveProxy.initKp17(ai1.mod_kp_point.map(e=>this.toPoint(e)));
            this.updateCurveAuxPoint(canvas);
            this.showSmileCurve(true);
            this.showSmileWindow(false);
            if (ai1.mouth_couter_set.length > 0) {
                const tmpPoints = ai1.mouth_couter_set.map(e=>{
                    const t = this.toPoint(e);
                    return [t.x, t.y];
                });
                const count = tmpPoints.length, tBegin = [tmpPoints[0][0], tmpPoints[0][1]], tEnd = [tmpPoints[count-1][0],tmpPoints[count-1][1]];
                // tmpPoints.unshift(tEnd);
                // tmpPoints.push(tBegin);
                const allControlPoint = tmpPoints.map(e=>({x:e[0], y:e[1]}));
                allControlPoint.forEach((pt,i)=>{
                    kpList.push(new KeyPointPath(pt.x, pt.y, KPType.smileWindow + i, {type: PathType.smileWindowPoint, canvas}));
                })

                const curveSmileWindow = new CurveObject(ctx, allControlPoint, CurveType.smileWindow, 0, Inoptions);
                curveProxy.addCurve(curveSmileWindow);                

                const res = fourCornerPoint(ai1.mouth_couter_set);
                // 存储原始点,因为图像是在原始基础上修改
                rectWindow.push(...res);
            }
            this.updateFrame();
            this.pathOrigin = resClip.tempFilePath;
            if (gConfigSmile.isIos) this.updateOriginImage();
            callback(resClip);            
        });
    }
    /**
     * 
     * @param {*} type 
     * @param {*} data 
     * @param {*} info {shapes: [], color:'' }
     * @param {*} callback 
     */
    setAi2Data(type, data, info, callback = ()=>{}, isFinal = false) {
        const {canvasAux1, ctxAux1, dpr, rectWindow } = this;
        if (Object.keys(data).length > 1) {
            this.ai2Bk = data;
        }
        // 最后效果不能覆盖之前的缓存，因为可能切换回来
        if (!isFinal) {
            this.ai2 = data;
            this.attachColor = true;
        }
        if (type == ImgHandleType.oneFromFour) {
            genImageUrl(canvasAux1, ctxAux1, data, {
                dpr,
                rect: rectWindow,
            }).then(res=>{            
                callback(res);
            });
        } else {
            const vKey = `${info.shapes[0]}_${info.color}`;
            this.keyAiData = vKey;
            if (!isFinal) this.updateTeethCouter(vKey);
            updateTypeImage(canvasAux1, ctxAux1, data, vKey, {
                type: ImgHandleType.stroke,
                rect: rectWindow,
                dpr,
                isFinal,
            }).then(()=>{
                this.updateFrame();
                callback();
            });
        }
    }
    getColorValue(info, isFinal) {
        const { canvasAux1, ctxAux1, ai2, rectWindow } = this;
        const vKey = `${info.shapes[0]}_${info.color}`;
        this.keyAiData = vKey;
        return getChangedColorValue(canvasAux1, ctxAux1, ai2, vKey, isFinal, {
            rect: rectWindow
        });
    }
    updateTeethCouter(vKey) {
        const { ai2, ai1, curveProxy } = this;
        const rc = ai1.cropped_loc;
        const newCouter = ai2[vKey].new_teeth_counter;
        const data = [];
        newCouter.forEach(one=>{
            for (let k in one) {
                data.push({
                    [k] :one[k].map(e=>[e[0] - rc[0], e[1] - rc[1]]),
                });
            }
        })
        data.forEach(one=>{
            for (let k in one) {
                const pointLike = one[k].map(e=>this.toPoint(e));
                const curve = curveProxy.curveList.filter(e=>e.type==CurveType.teeth&&e.code==k)[0];
                curve.update(pointLike, true);
                curveProxy.updateTeethData(curve);
            }
        })
        ai1.mod_teeth_counters = data;
        // 坐标
        this.updateCoordinateFrame();
        curveProxy.updateTooth();
    }
    /**
     * 传入模板type
     * @param {*} type 
     * @param {*} handleType 更新类型
     * @param {*} info 颜色的{hue,saturation,brightness} 
     */
    updateSubImage(type, handleType, info = undefined, callback = ()=>{}) {
        const {ai2, canvasAux1, ctxAux1, dpr, rectWindow } = this;
        this.updateTeethCouter(type);
        // 确保每次都是原图基础上修改
        if (this.imgClipData) {
            ctxAux1.putImageData(this.imgClipData, 0, 0);
        } else {
            const rc = this.rcClip;
            ctxAux1.drawImage(this.imgClip, rc.left, rc.top, rc.width, rc.height, 0, 0, rc.width, rc.height);
        }
        this.attachColorData = info;
        updateTypeImage(canvasAux1, ctxAux1, ai2, type, {
            type: handleType,
            rect: rectWindow,
            dpr,
            info,
        }).then(()=>{
            this.updateFrame();
            callback();
        });
    }
    touchStart(e) {
        const { dpr, kpList, ctx } = this;
        this.preTouches = JSON.parse(JSON.stringify(e.touches));
        this.fingers = e.touches.length;    
        if (this.fingers > 2) return;
        if (this.fingers == 2) {

        } else {
            // 转换到逻辑像素，乘以dpr
            this.uiType = UIType.none;
            const x = getTouchPoint(e, 0).x * dpr;
            const y = getTouchPoint(e, 0).y * dpr;
            this.kp = kpList.filter(e=>e.visible).find(e=>ctx.isPointInPath(e.getPath(), x, y));
            if (this.kp) {
                this.uiType = UIType.keyPoint;
                if (this.kp.type === PathType.faceKeyPoint) {
                    
                } else if (this.kp.type === PathType.auxIncisal) {
                  this.uiType = UIType.incisal;
                }
            } else {
            }
            this.lastX = getTouchPoint(e, 0).x;
            this.lastY = getTouchPoint(e, 0).y;
        }
    }
    touchMove(e) {
        const { ctx, fingers, preTouches, kp, dpr, cameraTranlate} = this;
        const { touches} = e;
        const theFingers = e.touches.length;
        if (theFingers > 2) return;
        if (fingers == 2 && preTouches.length == 2 && touches.length == 2) {
            // 双指方向一致时是平移
            // if (isSameDirection(preTouches[0], touches[0], preTouches[1], touches[1])) {
            //     cameraTranlate.x += getTouchPoint(e, 0).x - getTouchPoint(preTouches, 0).x;
            //     cameraTranlate.y += getTouchPoint(e, 0).y - getTouchPoint(preTouches, 0).y;
            // } else {
                // 缩放
                // const endDistance = getFinger2Distance(touches);
                // const diffDistance = this.startDistance - endDistance;
                // this.startDistance = endDistance;
                // const zoomCenter = {
                //     x: (getTouchPoint(e, 0).x + getTouchPoint(e, 1).x) / 2,
                //     y: (getTouchPoint(e, 0).y + getTouchPoint(e, 1).y) / 2,
                // }
                // this.zoomTo(this.preCameraZoom + gConfigMini.touchScaleStep * diffDistance, zoomCenter);
                const nowDistance = getFinger2Distance(touches);
                const preDistance = getFinger2Distance(preTouches);
                if (nowDistance > preDistance) this.zoomIn();
                else this.zoomOut();
            // }
            return;
        } else {
            const xOffset = getTouchPoint(e, 0).x - this.lastX;
            const yOffset = getTouchPoint(e, 0).y - this.lastY;
            const tranform = ctx.getTransform();
            if (this.uiType === UIType.keyPoint) {
                const newPt = {
                  x: kp.x + xOffset * dpr / tranform.a,
                  y: kp.y + yOffset * dpr / tranform.d,
                }
                if ([KPType.incisalLeft, KPType.incisalRight].includes(this.kp.kpType)) {

                } else {                    
                    kp.update(newPt);
                    if (this.kp.kpType >= KPType.smileWindow && this.kp.kpType < KPType.auxSpace) {
                        const idx = this.kp.kpType - KPType.smileWindow;
                        const curve = this.curveProxy.curveList.filter(e=>e.type==CurveType.smileWindow)[0];
                        curve.curve.points[idx] = copyPoint(this.kp);
                    } else if ([KPType.pupilLeft, KPType.pupilRight, KPType.philtrum].includes(this.kp.kpType)) {
                        this.updateCoordinateFrame();
                    }
                }
            } else if (this.uiType === UIType.incisal) {
              const newPt = {
                x: kp.x + xOffset * dpr / tranform.a,
                y: kp.y + yOffset * dpr / tranform.d,
              }
              const t1 = this.curveProxy.applyIncisalEdge(newPt, this.kp.kpType);
              newPt.x = null; // 只更新竖直方向的值
              if (t1.update) this.kp.update(newPt)
              else this.kp.update(t1.pt);
            } else {
                // 平移画面                
                ctx.translate(xOffset, yOffset);
                cameraTranlate.x += xOffset;
                cameraTranlate.y += yOffset;
            }
            this.lastX = getTouchPoint(e, 0).x;
            this.lastY = getTouchPoint(e, 0).y;
        }
        this.preTouches = touches;
        this.updateFrame();
    }
    touchEnd(e, callback) {
        const { kp, uiType} = this;
        if (kp && uiType === UIType.keyPoint) {
            if ([KPType.philtrum, KPType.pupilLeft, KPType.pupilRight].includes(kp.kpType)) {
                this.updateCoordinateFrame();
                this.updateFrame();
                callback();
            }
        }
    }
    zoomIn() {
        this.zoomTo(this.cameraZoom + gConfigMini.scaleStep);
    }
    zoomOut() {
        this.zoomTo(this.cameraZoom - gConfigMini.scaleStep);
    }
    zoomTo(zoom) {
        this.preCameraZoom = this.cameraZoom;
        this.cameraZoom = zoom;
        this.updateZoom();
        this.updateFrame();
    }
    updateZoom() {
        const { ctx, cameraZoom, elRc } = this;
        if (cameraZoom !== 1) {
            ctx.translate( elRc.width / 2, elRc.height / 2 );
            ctx.scale(cameraZoom, cameraZoom)
            // 测试旋转
            // ctx.rotate(degree2Radian(30));
            ctx.translate( -elRc.width / 2, -elRc.height / 2 );
        }
        // if (gConfigSmile.isDev) {
        //   console.log('zoom', cameraZoom, this.preCameraZoom, this.cameraTranlate)
        // }
    }
    updateCanvasClear() {
        const { ctx, cameraTranlate, elRc } = this;
        ctx.resetTransform();
        // if (gConfigSmile.isDev || gConfigSmile.isTrial) {
        //     console.log('ss', cameraTranlate)
        // }
        ctx.translate(cameraTranlate.x, cameraTranlate.y);
        ctx.clearRect(-cameraTranlate.x, -cameraTranlate.y, elRc.width, elRc.height);        
        this.updateZoom();
    }
    drawLine(pointLike, options = {}) {
        const { ctx, options: rootOptions, imgRc } = this;
        ctx.save();
        ctx.beginPath();
        if (options.genPerpendicular) {
            const {x, y} = options.kpPoint;
            let x2 = 0, y2 = 0;
            if (pointLike[0].y === pointLike[1].y) {
                // 相等
                x2 = (pointLike[0].x + pointLike[1].x) / 2;
                y2 = pointLike[0].y;
            } else {
                const tmp = Point2SegDist(x, y, pointLike[0].x,pointLike[0].y, pointLike[1].x,pointLike[1].y);
                x2 = tmp.x;
                y2 = tmp.y;
            }
            const { linear : regressionLinear } = regression();
            const { equation } = regressionLinear([[x,y],[x2,y2]], {precision:6});
            
            ctx.save();
            ctx.moveTo(0, equation[0] * 0 + equation[1]);
            ctx.lineTo(imgRc.wReal, equation[0] * imgRc.wReal + equation[1]);
            ctx.restore();

            const theta = Math.atan(Math.abs(((equation[0] * imgRc.wReal + equation[1]) - (equation[0] * 0 + equation[1])) / (imgRc.wReal - 0)));
            if (theta !== 0) {
                this.degreeByMiddle = parseFloat((90 - radian2Degree(theta)).toFixed(3));
                if (equation[0] < 0) this.degreeByMiddle *= -1;
            }
            // console.log(this.degreeByMiddle)
            ctx.save();
            ctx.stroke();
            ctx.setLineDash([3,2]);
            ctx.moveTo(pointLike[0].x, pointLike[0].y);
            ctx.lineTo(pointLike[1].x, pointLike[1].y);
            ctx.restore();
        } else {
            if (options.isSolid) {

            } else {
                ctx.setLineDash([3,2]);
            }
            pointLike.forEach((pt,index)=>{
                if (index === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
        }
        ctx.strokeStyle = rootOptions.fillColor;
        ctx.stroke();
        ctx.restore();
    }
    /**
     * 使用原图
     */
    useNoColorImage() {
        const { ctxAux1, imgClip, rcClip } = this;
        // 2024-3-7 需要原图
        ctxAux1.drawImage(imgClip, rcClip.left, rcClip.top, rcClip.width, rcClip.height, 0, 0, rcClip.width, rcClip.height);
    }
    /**
     * 2024-3-25
     * 直接替换还存在前提条件是必须存在一比一的像素值才可以
     */
    async attachIOsColorValue() {
        const {canvas, ctx, ai2, keyAiData, attachColorData, rectWindow} = this;
        if (attachColorData) {
            await updateCanvasColorDirectly(ctx, ai2[keyAiData], {
                width: canvas.width,
                height: canvas.height,
                type: ImgHandleType.replace,
                info: attachColorData,
                rect: rectWindow,
            });
        }
    }
    async updateFrame() {
        const {ctx, canvas, kpList, dpr, elRc, imgRc, curveProxy, options: rootOptions, attachColor } = this;
        const radius = gConfigMini.radius / 1;
        ctx.lineWidth = 1 / 1;
        
        this.updateCanvasClear();

        // 暂时解决ios绘制图片问题
        if (gConfigSmile.isIos) {
            // 等待加载完成
            if (!this.imgiOS) return;
            ctx.drawImage(this.imgiOS, 0, 0, imgRc.wReal, imgRc.hReal);
            // if (attachColor) await this.attachIOsColorValue();
        } else {
            ctx.drawImage(this.canvasAux1, 0, 0, imgRc.wReal, imgRc.hReal);
        }
        this.updateCurveAuxPoint(canvas);
        ctx.fillStyle = rootOptions.fillColor;    
        const linePupile = [], lineOris = [];
        ctx.save();
        ctx.beginPath();
        kpList.filter(e=>e.visible).forEach(path=>{
            // 小程序中因为笑窗的点很密集，需要缩小一些
            const isSmileWindow = path.kpType >= KPType.smileWindow && path.kpType < KPType.auxSpace;
            const theRadius = radius * dpr * ( isSmileWindow ? 0.75 : 1);
            path.update({radius: theRadius});
            if (path.type===PathType.faceKeyPoint) {
                if ([KPType.pupilLeft, KPType.pupilRight].includes(path.kpType)) {
                    linePupile.push(path);
                }
                if ([KPType.orisAngleLeft, KPType.orisAngleRight].includes(path.kpType)) {
                    lineOris.push(path);
                }
            }
            ctx.fill(path.getPath());
        })
        ctx.stroke();

        if (linePupile.length == 2) {
            this.drawLine(linePupile, {
                genPerpendicular : true,
                kpPoint: kpList.filter(e=>e.kpType===KPType.philtrum)[0],
            })
        }
        if (lineOris.length == 2) this.drawLine(lineOris);

        curveProxy.updateFrame();

        ctx.restore();
    }
    updateCoordinateFrame() {
        const {kpList, ai1, canvas, curveProxy} = this;
        const tmp1 = calcCoordinate({
            points: [
                kpList.filter(e=>e.kpType==KPType.pupilLeft)[0],
                kpList.filter(e=>e.kpType==KPType.pupilRight)[0],
                kpList.filter(e=>e.kpType==KPType.philtrum)[0],
            ],
            t11: ai1.mod_teeth_counters.filter(e=>e['11'])[0]['11'].map(e=>this.toPoint(e)),
            t21: ai1.mod_teeth_counters.filter(e=>e['21'])[0]['21'].map(e=>this.toPoint(e)),
        });
        // if (gConfigSmile.showSpaceDebug) {
        //     const auxKpoints = kpList.filter(e=>e.type==PathType.auxSpacePoint);
        //     const existKpSpace = auxKpoints.length > 0;
        //     tmp1.points.forEach((pt,i)=>{
        //         if (existKpSpace) {
        //             const the = auxKpoints.filter(e=>e.kpType===(i+KPType.auxSpace))[0];
        //             the.x = pt.x;
        //             the.y = pt.y;
        //             the.update();
        //         } else {
        //             kpList.push(new KeyPointPath(pt.x, pt.y, KPType.auxSpace + i, {type: PathType.auxSpacePoint, canvas: canvas})); 
        //         }
        //     })
        //     kpList.filter(e=>e.type==PathType.auxSpacePoint).forEach(kp=>kp.setVisible(true));
        // }
        this.infoSpace = tmp1;
        curveProxy.setFrame(tmp1.mat);
    }
    toY(yNatural, reverse = false) {
        const { imgRc } = this;
        if (reverse) {
            return yNatural / imgRc.ratioY;
        }
        return yNatural * imgRc.ratioY;
    }
    toX(xNatural, reverse = false) {
        const { imgRc } = this;
        if (reverse) {
            return xNatural / imgRc.ratioX;
        }
        return xNatural * imgRc.ratioX;
    }
    toPoint(points) {
        if (Array.isArray(points) && points.length === 2) {
            return {
                x: this.toX(points[0]),
                y: this.toY(points[1]),
            };
        }
        throw `toPoint need array points`;
    }
    clipImage(imgSrc, callback) {
        const {ai1, canvasAux1, ctxAux1 } = this;
        const crop = ai1.cropped_loc;
        const rc = {
            left: crop[0],
            top: crop[1],
            width: crop[2] - crop[0],
            height: crop[3] - crop[1],
        }
        this.imgClipData = null;
        this.rcClip = rc;
        this.imgClip = canvasAux1.createImage();
        this.imgClip.onload = () => {
            // 处理旋转
            const aiAngle = ai1.image_rotat_angle;
            if (aiAngle[0] > 0 || aiAngle[1] > 0) {
              const degree = aiAngle[1] ==3 ? 270:(aiAngle[1] == 2 ? 180 : 0);
              imageRotate(this.imgClip, degree, {
                canvas: canvasAux1,
              }, true).then(info=>{
                const imgData = info.ctx.getImageData(rc.left, rc.top, rc.width, rc.height);
                this.imgClipData = imgData;
                canvasAux1.width = rc.width;
                canvasAux1.height = rc.height;
                ctxAux1.putImageData(imgData, 0, 0);
                canvasToTmpFilePath(canvasAux1, {key:'originPath', dpr: 1}).then((res)=>{
                    callback(rc, res);
                })
              });
            } else {
                canvasAux1.width = rc.width;
                canvasAux1.height = rc.height;
                ctxAux1.drawImage(this.imgClip, rc.left, rc.top, rc.width, rc.height, 0, 0, rc.width, rc.height);
                canvasToTmpFilePath(canvasAux1, {key:'originPath', dpr: 1}).then((res)=>{
                    callback(rc, res);
                })
            }
        }
        this.imgClip.src = imgSrc;
    }
    updateOriginImage() {
        /**
         * 2023-12
         * 小程序中，drawImage(HTMLCanvasElement)在ios上不支持
         * 2024-2-23
         * 临时解决方案，改成使用drawImage(Image)来实现
         * 更新问题，可以是否考虑一直使用image来代替canvas
         * 2024-3-7
         * 最后生成时需要原图，即必须保留原图
         */
        const {canvas} = this;
        this.imgiOS = canvas.createImage();
        this.imgiOS.onload = ()=>{
            this.updateFrame();
        }
        this.imgiOS.src = this.pathOrigin;
    }
    genResultPath(callback) {
        const { canvasAux1 } = this;
        canvasToTmpFilePath(canvasAux1, {
            key: 'result',
            dpr:1,
        }).then(res=>{
            this.pathModify = res.tempFilePath;
            callback(res);
        })
    }
    testZoom() {
      const {canvas, cameraTranlate} = this;
      const clipInfo = this.getClipArea();
      const scaleFactor = canvas.width / clipInfo.width;
      cameraTranlate.x = 0;
      cameraTranlate.y = 0;
      this.zoomTo(scaleFactor);
    }
    genThreePart(callback) {
        const offCanvas1 = wx.createOffscreenCanvas({type:'2d'});        
        const { canvas, ctx, elRc, sys, rc, dpr, imgRc, ctxAux1, imgClip, rcClip } = this;
        let code = 0;
        const imgOrigin = offCanvas1.createImage();
        imgOrigin.onload = () => {
            code += 1;
            if (code == 3) compose();
        }
        imgOrigin.src = this.pathOrigin;
        const imgModify = offCanvas1.createImage();
        imgModify.onload = () => {
            code += 2;
            if (code == 3) compose();
        }
        imgModify.src = this.pathModify;
        const clipInfo = this.getClipArea();
        // console.log(clipInfo);
        const compose = ()=>{
            const textHeight = 0, oneW = imgRc.wReal, oneH = oneW / imgRc.ratioImg;
            // console.log('size', rc, imgRc, oneW, oneH, elRc)
            return new Promise((resolve)=>{

                this.useNoColorImage();
                
                this.showSmileCurve(true);
                this.showSmileWindow(false);
                this.showKeyPoint(false);
                // 缩放系数, 减去一个常数，缩放比例减少，增加包含区域的内容 
                const scaleFactor = canvas.width / clipInfo.width - 0.3;
                // const ratioClip = clipInfo.width / clipInfo.height;
                const ratioClip = canvas.width / canvas.height;
                // 缩放的减去原来的距离
                let xOffset = clipInfo.x / (scaleFactor - 0) / dpr / 2;
                // 目前测试发现的数据，就是scaleFactor是否大于2.8，产生的效果就不一样
                const timesScale = scaleFactor > 2.8 ? 1 : 0;
                // 等比缩放，x的变化与y的变化应该一致，                
                let yOffset = clipInfo.y + clipInfo.x * (scaleFactor - timesScale) * ratioClip;
                if (gConfigSmile.isDev || gConfigSmile.isTrial) {
                  console.log('clip -- ', xOffset, yOffset, dpr, scaleFactor, ratioClip)
                }
                const wClip = canvas.width, hClip = (scaleFactor - 1) * wClip * 1; // clipInfo.height / clipInfo.width;
                this.cameraTranlate.x = xOffset;
                this.cameraTranlate.y = -yOffset;
                this.zoomTo(scaleFactor);                
                // 考虑脸型较长时，偏移一下
                const imgData1 = ctx.getImageData(0, 0, wClip, hClip);
                resolve({imgDataClip:imgData1}); 
            }).then((clip)=>{
                const clipW = clip.imgDataClip.width, clipH = clip.imgDataClip.height;
                let xStart = 0, yStart = 0, txtHeight = 5;
                offCanvas1.width = oneW * 2;
                offCanvas1.height = oneH + textHeight * 2 + clipH / this.dpr;
                const ctxRes = offCanvas1.getContext('2d');
                yStart = textHeight + txtHeight;
                ctxRes.drawImage(imgOrigin, 0, 0, imgOrigin.width, imgOrigin.height, 0, yStart, oneW, oneH);
                ctxRes.drawImage(imgModify, 0, 0, imgModify.width, imgModify.height, oneW, yStart, oneW, oneH);
                const xPos = (oneW * 2 - clipW) / 2;
                ctxRes.putImageData(clip.imgDataClip, xPos, yStart + oneH);
                canvasToTmpFilePath(offCanvas1, {
                    key: 'threeImage',
                    dpr: 1,
                }).then(res=>{
                    if (gConfigSmile.isDev) {
                      console.log(res);
                    }
                    callback(res);
                })
            });
        }
    }
}   
// FaceData.prototype = Object.assign(Object.create({}), {
// 	constructor: FaceData, 
    // satisfies() {
    // },
// });
export {
    FaceData,
}