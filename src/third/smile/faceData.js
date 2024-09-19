import { regression } from './regression';
import { radian2Degree, fourCornerPoint, Point2SegDist, copyPoint, degree2Radian } from './math/utils';
import { calcCoordinate } from './math/space';
import { KeyPointPath, PathType, KPType, ArrowPath } from './math/path2d';
import { SmileCurveProxy, CurveType, CurveObject } from './curve';
import { gConfigSmile } from './helpConstant';
import { save2File, DomToolkit } from './domLib';
import { UIType } from './ui';
import { FaceDataBase } from './faceBaseData';


const NavigateList = ['navigate-top', 'navigate-right', 'navigate-button', 'navigate-left'];

/**
 * 图像识别后的数据
 */
export class ImageFaceData extends FaceDataBase {
    constructor(options = {}) {
        super();
        this.options = options;
        this.scale = 1;
        this.wReal = 0;
        this.hReal = 0;
        this.wNatural = 0;
        this.hNatural = 0;
        this.ratioReal = 1;
        this.ctx = null;
        this.canvas = null;
        this.info = {};
        this.faceKeyPoint = [];
        this.kpList = [];
        this.timePointList = [];
        this.panUnit = 0.01;
        this.dpr = window.devicePixelRatio;
        // 左右原始点
        this.showLog = options.showLog || false;
        this.degreeByMiddle = 0; // 中线拟合后的旋转角度
        // 方向箭头
        const elTool = document.createElement('div');
        elTool.classList.add('content-tool-navigate');
        this.elTool = elTool;
        this.curveProxy = new SmileCurveProxy();
        // 缓存
        this.cache = {
            centerX: 0,
            centerY: 0,
            maxSide: 0,
            unit: 'px',
            kp: {},
            radius: 15,
            ptDown: {x:0,y:0},
            uiType: '',
            isDown: false,
            lastPt: {x:0,y:0},
        };
        this.infoSpace = null;
        this.initIncisalCtrl = false;
        this.rectWindow = []; // 
        // 再次调整曲线时，使用牙齿的原型
        this.againAdjustCurve = false;
        this.oldIncisalLeftX = 0;
        this.oldIncisalRightX = 0;
    }
    addTime(timestamp) {
        if (timestamp) this.timePointList.push(timestamp);
        else this.timePointList.length = 0;
    }
    /**
     * 绑定事件
     * @param {*} elCanvas 
     */
    bindCanvas(elCanvas, ctx, bitmap, svgList) {
        const { cache, options, curveProxy, kpList, dpr, elTool } = this;
        this.canvas = elCanvas;
        this.ctx = ctx;
        this.bitmapOrigin = bitmap;
        this.bitmap = bitmap;
        this.ctx.drawImage(bitmap, 0, 0);

        const elPan = document.createElement('div');
        elPan.classList.add('pan-list');
        elTool.appendChild(elPan);
        
        const elTop = document.createElement('div');
        elTop.innerHTML = `<svg class="wh-28"><use xlink:href="${svgList}#dir1"></use></svg>`;
        elTop.classList.add('pan-top', NavigateList[0]);
        elPan.appendChild(elTop);

        const elRight = document.createElement('div');
        elRight.innerHTML = `<svg class="wh-28"><use xlink:href="${svgList}#dir2"></use></svg>`;
        elRight.classList.add('pan-right', NavigateList[1]);
        elPan.appendChild(elRight);
        
        const elBottom = document.createElement('div');
        elBottom.innerHTML = `<svg class="wh-28"><use xlink:href="${svgList}#dir3"></use></svg>`;
        elBottom.classList.add('pan-bottom', NavigateList[2]);
        elPan.appendChild(elBottom);
        
        const elLeft = document.createElement('div');
        elLeft.innerHTML = `<svg class="wh-28"><use xlink:href="${svgList}#dir4"></use></svg>`;
        elLeft.classList.add('pan-left', NavigateList[3]);
        elPan.appendChild(elLeft);
        
        
        for (const btn of elPan.children) {
            btn.addEventListener('click', this.eventMouseMove);
        }

        curveProxy.bindCtx(this.ctx, options);
        const incisalCtrlUpdate = (res, pt) => {
            const ctrlList = kpList.filter(e=>[KPType.incisalLeft, KPType.incisalRight].includes(e.kpType));
            if (res.update) {
                ctrlList.forEach(e=>e.update(pt));
            } else {
                ctrlList.forEach(e=>e.update(res.pt));
            }
        }
        elCanvas.addEventListener('mousemove', (event)=>{
            const { offsetX, offsetY } = event;
            if (cache.isDown) {
                const theKpType = cache.kp.kpType;
                if (cache.uiType === UIType.keyPoint) {
                    // 移动某个path对象
                    let pt = ctx.screenToCanvas(offsetX - cache.lastPt.x, offsetY - cache.lastPt.y, cache.kp.x, cache.kp.y);                    
                    // console.log('offset', offsetX, offsetX - cache.lastPt.x, offsetY, offsetY - cache.lastPt.y)
                    cache.lastPt.x = offsetX;
                    cache.lastPt.y = offsetY;
                    if ( [KPType.incisalLeft, KPType.incisalRight].includes(theKpType)) {
                        // 注意
                    } else {
                        // console.log('move', offsetX, offsetY, pt.x, pt.y);
                        cache.kp.update(pt);
                        if (theKpType >= KPType.smileWindow && theKpType < KPType.auxSpace) {
                            // 如果更新的是笑窗的点,更新笑窗曲线
                            const idx = theKpType - KPType.smileWindow;
                            const curve = curveProxy.curveList.filter(e=>e.type==CurveType.smileWindow)[0];
                            // const ctrlCount = curve.curve.points.length;
                            curve.curve.points[idx] = copyPoint(cache.kp);                        
                            // if (idx > 0 && idx < ctrlCount-1) {
                            //     // 中间控制点直接更新
                            //     curve.curve.points[idx] = copyPoint(cache.kp);
                            // } else {
                            //     // 首尾控制点需要考虑是否重叠，保持连续性
                            //     curve.curve.points[idx] = copyPoint(cache.kp);
                            // }
                        } else if ([KPType.pupilLeft, KPType.pupilRight, KPType.philtrum].includes(theKpType)) {
                            this.updateCoordinateSpace();
                        }
                    }
                    this.updateFrame();
                } else if (cache.uiType == UIType.incisal) {
                    const pt = ctx.transformedPoint(offsetX, offsetY);
                    cache.lastPt.x = offsetX;
                    cache.lastPt.y = offsetY;
                    const tmp = curveProxy.applyIncisalEdge(pt, cache.kp.kpType);
                    // 只竖直方向上更改
                    pt.x = null;
                    if (tmp.update) cache.kp.update(pt);
                    else cache.kp.update(tmp.pt);
                    this.updateFrame();
                } else if (cache.uiType == UIType.arrow) {
                    
                } else {
                    // 整体移动
                    const ptNew = ctx.transformedPoint(offsetX, offsetY);
                    ctx.translate(ptNew.x - cache.ptDown.x, ptNew.y - cache.ptDown.y);                
                    this.updateFrame();
                }
            }
        });
        elCanvas.addEventListener('mouseup', (event)=>{
            const { offsetX, offsetY } = event;
            cache.isDown = false;
            if (cache.uiType == UIType.incisal) {
                const pt = ctx.transformedPoint(offsetX, offsetY);
                cache.lastPt.x = offsetX;
                cache.lastPt.y = offsetY;
                const tmp = curveProxy.applyIncisalEdge(pt, cache.kp.kpType);
                if (tmp.update) cache.kp.update(pt);
                else cache.kp.update(tmp.pt);
                this.updateFrame();
            } else if (cache.uiType == UIType.arrow) {
                console.log('arrow');
            }
        })
        elCanvas.addEventListener('mousedown', (event)=>{
            const { offsetX, offsetY } = event;
            cache.isDown = true;
            cache.ptDown = ctx.transformedPoint(offsetX, offsetY);
            const kp = kpList.filter(e=>e.visible).find((e)=>ctx.isPointInPath(e.getPath(), offsetX, offsetY));
            if (kp) { 
                cache.kp = kp;            
                cache.uiType = UIType.keyPoint;
                cache.lastPt.x = offsetX;
                cache.lastPt.y = offsetY;
                if ([KPType.incisalLeft, KPType.incisalRight].includes(cache.kp.kpType)) {
                    cache.uiType = UIType.incisal;
                } else if (kp.type==PathType.svgArrow) {
                    cache.uiType = UIType.arrow;
                }
            } else {
                cache.uiType = UIType.none;
            }
        })
    }
    updateToolPan(show, elContainer) {
        const { elTool } = this;
        if (show) {
            const x =  elContainer.offsetWidth / 2;
            const y = elContainer.offsetHeight - 100;
            
            if (gConfigSmile.isDev) {
                console.log('tool-pan position', x, y)
            }
            elTool.style.left = `${x}px`;
            elTool.style.top = `${y}px`;
            if (!elContainer.contains(elTool)) {
                elContainer.appendChild(elTool);
            }
        }
        elTool.style.display = show ? 'block' : 'none';
    }
    eventMouseMove = (event)=>{
        const { panUnit, curveProxy } = this;
        event.preventDefault();
        event.stopPropagation();
        const idx = DomToolkit.findClsName(event.target, NavigateList);
        if (idx == 0) curveProxy.updatePan(0, -panUnit);
        else if (idx == 1) curveProxy.updatePan(panUnit, 0);
        else if (idx == 2) curveProxy.updatePan(0, panUnit);
        else if (idx == 3) curveProxy.updatePan(-panUnit, 0);
        this.updateFrame();
    }
    bindData(json) {
        const { ctx, curveProxy, kpList, options, rectWindow } = this;
        this.initIncisalCtrl = false;
        kpList.length = 0;
        this.info = json;
        
        this.faceKeyPoint.length = 0;
        json.face_kp.forEach(e=>this.faceKeyPoint.push(this.toPoint(e)));
        
        this.faceKeyPoint.forEach((pt,index)=>{
            kpList.push(new KeyPointPath(pt.x, pt.y, index));
            // if (index == KPType.chin) {
            //     kpList.push(new ArrowPath(pt.x, pt.y, PathType.svgArrow));
            // }
        })
        // 创建坐标系
        this.updateCoordinateSpace();
        // 初始化牙齿点数据
        json.mod_teeth_counters.forEach(one=>{
            for (let k in one) {
                curveProxy.addCurve(new CurveObject(ctx, one[k].map(e=>this.toPoint(e)), CurveType.teeth, k, options));
            }
        });
        // 牙齿数据绑定后就可以得到宽高
        curveProxy.computeInitValue();
        curveProxy.initCervialAndIncisal();        
        this.updateCurveAuxPoint();
        this.showSmileCurve(true);
        // 测试辅助点是否找对
        if (gConfigSmile.auxShowTeethPoint) {
            [
                // 13,14,23,24
            ].forEach((code,i)=>{
                curveProxy.teethData.map.get(code.toString()).data.forEach((pt,j)=>{
                    kpList.push(new KeyPointPath(pt.x, pt.y, KPType.auxSmileLT + i + j * 10, {type: PathType.auxTeethPoint}));    
                })
            })
            kpList.filter(e=>e.type==PathType.auxTeethPoint).forEach(kp=>kp.setVisible(true));
        }
        if (json.mouth_couter_set.length > 0) {
            const tmpPoints = json.mouth_couter_set.map(e=>{
                const t = this.toPoint(e);
                return [t.x, t.y];
            });
            const count = tmpPoints.length, 
                tBegin = [tmpPoints[0][0], tmpPoints[0][1]], tEnd = [tmpPoints[count-1][0],tmpPoints[count-1][1]],
                tBegin2 = [tmpPoints[1][0], tmpPoints[1][1]], tEnd2 = [tmpPoints[count-2][0],tmpPoints[count-2][1]];
            // tmpPoints.unshift(tEnd2);
            tmpPoints.unshift(tEnd);
            tmpPoints.push(tBegin);
            // tmpPoints.push(tBegin2);
            const allControlPoint = tmpPoints.map(e=>({x:e[0], y:e[1]}));
            // 记住首尾两个点，不显示，因为catmull-Row的原因
            this.smileIdxExclude = [];
            this.smileIdxExclude.push(KPType.smileWindow + 0);
            // this.smileIdxExclude.push(KPType.smileWindow + 1);
            this.smileIdxExclude.push(KPType.smileWindow + allControlPoint.length - 1);
            // this.smileIdxExclude.push(KPType.smileWindow + allControlPoint.length - 2);
            allControlPoint.forEach((pt,i)=>{
                const thePath = new KeyPointPath(pt.x, pt.y, KPType.smileWindow + i, {type: PathType.smileWindowPoint});
                if (this.smileIdxExclude.includes(i)) {
                    thePath.setVisible(false);
                }
                kpList.push(thePath);
            });
                        
            const curveSmileWindow = new CurveObject(ctx, allControlPoint, CurveType.smileWindow, 0, options);
            curveProxy.addCurve(curveSmileWindow);
            // 笑窗默认不显示
            this.showSmileWindow(false);
            if (gConfigSmile.auxSmileWindowAABB) {
                rectWindow.length = 0; 
                const res = fourCornerPoint(json.mouth_couter_set);
                // 存储原始点,因为图像是在原始基础上修改
                rectWindow.push(...res);
                const leftTop = this.toPoint(res[0]), leftBottom = this.toPoint(res[3]);
                const yDistance = (leftBottom.y - leftTop.y) / 2;
                if (gConfigSmile.isDev) {
                    console.log('clip offset', yDistance);
                }
                if (gConfigSmile.isDev) {
                    res.forEach((e,i)=>{
                        const pt = this.toPoint(e);
                        if (i == 0) { pt.x -= yDistance; pt.y -= yDistance; }
                        else if (i == 1) { pt.x += yDistance; pt.y -= yDistance; }
                        else if (i == 2) { pt.x += yDistance; pt.y += yDistance; }
                        else if (i == 3) { pt.x -= yDistance; pt.y += yDistance; }
                        kpList.push(new KeyPointPath(pt.x, pt.y, KPType.auxSmileLT + i, {type: PathType.auxSmilePoint}));    
                    })
                    kpList.filter(e=>e.type==PathType.auxSmilePoint).forEach(kp=>kp.setVisible(false));
                }
            }
        }
        //
        curveProxy.initX(); 
        curveProxy.initKp17(json.mod_kp_point.map(e=>this.toPoint(e)));
        // curveProxy.initIncisalPolynomial();
    }
    updateCoordinateSpace() {
        const { info, kpList, curveProxy } = this;
        // 计算坐标系
        const tmp1 = calcCoordinate({
            points: [
                kpList.filter(e=>e.kpType==KPType.pupilLeft)[0], 
                kpList.filter(e=>e.kpType==KPType.pupilRight)[0], 
                kpList.filter(e=>e.kpType==KPType.philtrum)[0],
            ],
            t11: info.mod_teeth_counters.filter(e=>e['11'])[0]['11'].map(e=>this.toPoint(e)),
            t21: info.mod_teeth_counters.filter(e=>e['21'])[0]['21'].map(e=>this.toPoint(e)),
        })
        if (gConfigSmile.showSpaceDebug) {
            const auxKpoints = kpList.filter(e=>e.type==PathType.auxSpacePoint);
            const existKpSpace = auxKpoints.length > 0;
            tmp1.points.forEach((pt,i)=>{
                if (existKpSpace) {
                    const the = auxKpoints.filter(e=>e.kpType===(i+KPType.auxSpace))[0];
                    the.x = pt.x;
                    the.y = pt.y;
                    the.update();
                } else {
                    kpList.push(new KeyPointPath(pt.x, pt.y, KPType.auxSpace + i, {type: PathType.auxSpacePoint})); 
                }
            })
            kpList.filter(e=>e.type==PathType.auxSpacePoint).forEach(kp=>kp.setVisible(true));
            // 保存数据到文件使用meshlab可视化
            // let str = '';
            // tmp1.points.forEach((pt, i)=>{
            //     str += `${pt.x} ${pt.y} 0\n`;
            // });
            // save2File(str, 'points.asc');
        }
        this.infoSpace = tmp1;
        curveProxy.setFrame(tmp1.mat);
    }
    setImgData(wNatural, hNatural, wReal, hReal) {
        this.wNatural = wNatural;
        this.hNatural = hNatural;
        this.wReal = wReal;
        this.hReal = hReal;
        this.imgRatio = wReal / hReal;
        this.ratioX = this.wReal / this.wNatural;
        this.ratioY = this.hReal / this.hNatural;
        this.curveProxy.bindRatio(this.ratioX, this.ratioY, this.imgRatio);
        if (gConfigSmile.showLogRatio) {
            console.log('ratio', this.ratioX, this.ratioY);
        }
    }
    /**
     * 更换图像
     * @param {*} bitmap 
     * @param {*} isBK 是否保存图像，更新颜色不保存，但是更新其他就需要保存了
     * @param {*} newTeethCouter
     */
    updateBitmap(bitmap, isBk = false, newTeethCouter = undefined) {
        const { info, curveProxy } = this;
        this.bitmap = bitmap;
        if (isBk) {
            this.bitmapBk = bitmap;
        }
        if (Array.isArray(newTeethCouter)) {
            info.mod_teeth_counters = newTeethCouter;
            newTeethCouter.forEach(one=>{
                for (let k in one) {
                    const pointLike = one[k].map(e=>this.toPoint(e));
                    const curve = curveProxy.curveList.filter(e=>e.type==CurveType.teeth&&e.code==k)[0];
                    curve.update(pointLike, true);
                    curveProxy.updateTeethData(curve);
                }
            });
            this.updateCoordinateSpace();
            // 更新牙齿的调整的状态
            curveProxy.updateTooth();
        }
        this.updateFrame();
    }
    /**
     * 获取生成对比图的参数
     */
    getCompareInfo() {
        const { kpList, canvas, ctx } = this;
        const clipInfo = this.getClipArea();
        this.showSmileCurve(true);
        this.showSmileWindow(false);
        this.showKeyPoint(false);
        const kpCtrlList = kpList.filter(e=>e.type==PathType.auxIncisal);
        kpCtrlList.forEach(e=>e.setVisible(false));
        this.againAdjustCurve = true;
        ctx.reset();
        const xFactor = canvas.width / clipInfo.width, yFactor = canvas.height / clipInfo.height;
        const factor = Math.max(3, canvas.width / clipInfo.width);   
        const xCenter = clipInfo.x + clipInfo.width / 2, yCenter = clipInfo.y + clipInfo.height / 2;
        ctx.testScale(xCenter, yCenter, factor);
        clipInfo.width = Math.max(canvas.width, clipInfo.width * factor);
        clipInfo.height *= factor;
        clipInfo.x = Math.max(0, xCenter - clipInfo.width / 2);
        clipInfo.y = yCenter - clipInfo.height / 2;
        if (gConfigSmile.isDev) {
            console.log('new clip info ', xFactor, yFactor, clipInfo, factor);
        }
        this.updateFrame();    
        this.againAdjustCurve = false;
        return {
            bitmapOrigin: this.bitmapOrigin,
            bitmapNow: this.bitmap,
            ctxClip: this.ctx,
            ratio: this.imgRatio,
            clipPoints: clipInfo,
        };
    }
    /**
     * 是否使用原图
     * @param {*} visible 
     */
    setAgainCurve(visible) {
        this.againAdjustCurve = visible;
        this.showSmileCurve(visible);
    }
    /**
     * 数组转对象
     * @param {*} points 
     * @param {*} dimension 
     * @returns 
     */
    toPoint(points) {
        if (Array.isArray(points) && points.length === 2) {
            return { 
                x: this.toX(points[0]),
                y: this.toY(points[1]),
            };
        }
        throw `toPoint need array points`;
    }
    /**
     * 实际视图窗口与图形宽高的映射
     * @param {*} xNatural 
     * @param {*} reverse 
     * @returns 
     */
    toX(xNatural, reverse = false) {
        if (reverse) {
            return xNatural / this.ratioX;    
        }
        return xNatural * this.ratioX;
    }
    /**
     * 
     * @param {*} yNatural 
     * @param {*} reverse 
     * @returns 
     */
    toY(yNatural, reverse = false) {
        if (reverse) {
            return yNatural / this.ratioY;    
        }
        return yNatural * this.ratioY;
    }
    drawLine(pointLike, options = {}) {
        const { ctx, options : rootOptions } = this;
        ctx.save();
        ctx.beginPath();
        if (options.linearRegression) {
            const tmp = [];
            pointLike
            // .sort((a,b)=>a.x - b.x) // 排序无关
            .forEach(e=>tmp.push([e.x, e.y]));
            const { linear : regressionLinear } = regression();
            const linearReg = regressionLinear(tmp, {precision:6});
            // 取两个点特殊点：第一个点和最后一个点， 为了把边界画进来，都继续放大两倍
            let x1 = -2 * tmp[0][0], y1 = linearReg.equation[0] * x1 + linearReg.equation[1];
            let x2 = 2 * tmp[tmp.length-1][0], y2 = linearReg.equation[0] * x2 + linearReg.equation[1];
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            const theta = Math.atan(Math.abs((y2 - y1) / (x2 - x1)));
            this.degreeByMiddle = parseFloat((90 - radian2Degree(theta)).toFixed(3));
            if (linearReg.equation[0] < 0) this.degreeByMiddle *= -1;
        } else {
            // 中线绘制，是根据瞳孔连线为水平，求垂直的中线
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
                ctx.moveTo(0, equation[0] * 0 + equation[1]);
                ctx.lineTo(this.wReal, equation[0] * this.wReal + equation[1]);
                const theta = Math.atan(Math.abs(((equation[0] * this.wReal + equation[1]) - (equation[0] * 0 + equation[1])) / (this.wReal - 0)));
                if (theta !== 0) {
                    this.degreeByMiddle = parseFloat((90 - radian2Degree(theta)).toFixed(3));
                    if (equation[0] < 0) this.degreeByMiddle *= -1;
                }
                // console.log(this.degreeByMiddle)
                ctx.stroke();
                ctx.setLineDash([3,2]);
                ctx.moveTo(pointLike[0].x, pointLike[0].y);
                ctx.lineTo(pointLike[1].x, pointLike[1].y);                
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
        }
        ctx.strokeStyle = rootOptions.fillColor || 'red';
        ctx.stroke();
        ctx.restore();
    }
    updateFrame() {
        this.addTime(Date.now());
        const { ctx, canvas, bitmapOrigin, bitmap, wReal, hReal, options, kpList, curveProxy, infoSpace, againAdjustCurve } = this;
        // 
        const p1 = ctx.transformedPoint(0,0);
        const p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 
        const radius = 5 / this.scale;
        ctx.lineWidth = 0.6 * this.dpr;
        ctx.fillStyle = options.fillColor || 'red';
        const linePupile = [], lineOris = [];

        // 图片背景
        this.ctx.drawImage(againAdjustCurve ? bitmapOrigin : bitmap, 0, 0, wReal, hReal);
        this.updateCurveAuxPoint();
        kpList.filter(e=>e.visible).forEach(path=>{            
            path.update({radius: radius});
            if (path.getType()===PathType.faceKeyPoint) {
                const kpType = path.kpType;
                if ([KPType.pupilLeft, KPType.pupilRight].includes(kpType)) {
                    linePupile.push(path);
                }
                if ([KPType.orisAngleLeft, KPType.orisAngleRight].includes(kpType)) {
                    lineOris.push(path);
                }
            }
            ctx.fill(path.getPath());
        });

        if (linePupile.length == 2) {
            // 《口腔固定修复中的美学重建 第1卷》page44中参考使用上唇中点
            this.drawLine(linePupile, { 
                genPerpendicular : true,
                kpPoint: kpList.filter(e=>e.kpType===KPType.philtrum)[0], 
            });
        }
        if (lineOris.length == 2) this.drawLine(lineOris);
        if (gConfigSmile.showSpaceDebug && infoSpace) {
            if (Array.isArray(infoSpace.points)) {
                this.drawLine(infoSpace.points.slice(0, 2), {isSolid: true});
                this.drawLine(infoSpace.points.slice(2), {isSolid: true});
            }
        }
        // 辅助线，确认坐标系的原点方向
        // this.drawLine([{x:10,y:10},{x:100,y:100}]);

        curveProxy.updateFrame();

        this.addTime(Date.now());
        this.showTime();
    }
    showTime() {
        const { timePointList } = this;
        const len = timePointList.length;
        const elLog = document.getElementById('idLog');
        if (elLog) elLog.replaceChildren();
        for (let i = 0; i < len; i++) {
            if (i + 2 <= len) {
                const milliSeconds = timePointList[i+1] - timePointList[i]
                const text = `${i+1}th cost is ${milliSeconds}ms, ${Math.floor(milliSeconds/1000)}s`;
                if (this.showLog) {
                    console.log(`log: ${text}`);
                }
                if (elLog) {
                    const p = document.createElement('p');
                    p.innerText = text;
                    elLog.appendChild(p);
                }
            }
        }
        timePointList.length = 0;
    }
    setUnit(unit) {
        this.panUnit = unit;
    }
    /**
     * 
     */
    dispose() {

    }
}
