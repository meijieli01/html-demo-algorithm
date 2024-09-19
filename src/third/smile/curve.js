import { gConfigSmile, ValidTeethNum } from './helpConstant';
import { regression } from './regression';
import { numpyLikelinearSpace, copyPoint } from './math/utils';
import { MjMatrix, pointApplyMatrix3 } from './math/matrix';
import { KPType } from './math/path2d';
import { catmullRomSpline } from './catmull/catmull';
/**
 * 曲线类型
 * 颈缘和切缘曲线是一条CatmullRom
 */
export const CurveType = {
    teeth: 0, // 牙齿
    cervial: 1, // 颈缘
    incisal: 3, // 切缘
    smileWindow: 5, // 笑窗
}

const CDrawType = {
    line: 0, // 直接连线
    bezier: 1, // bezier曲线
    catmullRom: 2, // catmull-rom
}
/**
 * 绘制曲线
 */
class CurveHandler {
    constructor(ctx, points, type, options = {}) {
        this.ctx = ctx; // 2d context
        this.type = type; // CurveType
        if (!Array.isArray(points)) throw 'points must array';
        this.points = points; // 点集
        this.options = options; // 其他参数
        this.cDrawType = CDrawType.line;
        this.closePath = false;
        if ([CDrawType.line, CDrawType.bezier, CDrawType.catmullRom].includes(options.cDrawType)) this.cDrawType = options.cDrawType;
        if (options.closePath) this.closePath = options.closePath;
    }
    bezier(time) {
        const { points } = this;
        /**
         * 绘制bezier曲线，支持N阶
         * 贝塞尔公式调用 
         * B(t) = sum_{i=0}^{n}(_{i}^{n})P_{i}(1-t)^{n-i}t^{i}
         */
        let x = 0, y = 0, n = points.length - 1;
        points.forEach((item, index) => {
            const nonFactorial = Math.pow((1 - time), n - index) * Math.pow(time, index); 
            if(index===0) {
                x += item.x * nonFactorial; 
                y += item.y * nonFactorial; 
            } else {
                x += this.factorial(n) / this.factorial(index) / this.factorial(n - index) * item.x * nonFactorial; 
                y += this.factorial(n) / this.factorial(index) / this.factorial(n - index) * item.y * nonFactorial;
            }
        });
        return { x, y };    
    }
    factorial(num) {
        //递归阶乘
        if (num <= 1) {
            return 1;
        } else {
            return num * this.factorial(num - 1);
        }
    }
    drawCurve() {
        const { points, ctx, options, cDrawType, type } = this;
        const len = points.length;
        if (cDrawType === CDrawType.bezier) {
            if (len === 2) {
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.strokeStyle = options.color || 'red';
                ctx.stroke();
            } else if (len === 3) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                // control point and end point
                ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
                ctx.strokeStyle = options.color || 'red';
                ctx.stroke();
            } else if (len === 4) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                // control two point and one end point
                ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
                ctx.strokeStyle = options.color || 'red';
                ctx.stroke();
            } else {            
                const bezierArr = []; // 生成的点集
                for (let time = 0; time < 1; time += 0.01) {
                    bezierArr.push(this.bezier(time));
                }
                bezierArr.forEach((item,index)=>{
                    if (index !== 0) {
                        ctx.beginPath();
                        ctx.moveTo(bezierArr[index - 1].x, bezierArr[index - 1].y);
                        ctx.lineTo(item.x, item.y);
                        ctx.strokeStyle = options.color || 'red';
                        ctx.stroke();
                    }
                })
            }
        } else if (cDrawType === CDrawType.catmullRom) {
            ctx.beginPath();
            const catmullPoints = catmullRomSpline(points.map(e=>([e.x,e.y])), {
                knot: 0.5,
                samples: 50,
            }).map(e=>({x:e[0],y:e[1]}));
            catmullPoints.forEach((pt,i)=>{
                if (i === 0) {
                    ctx.moveTo(pt.x, pt.y);
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            })
            if ([CurveType.smileWindow].includes(type)) {
                ctx.lineTo(catmullPoints[0].x, catmullPoints[0].y);
            }
            ctx.strokeStyle = options.color || 'red';
            ctx.stroke();
        } else if (cDrawType === CDrawType.line) {
            ctx.beginPath();
            points.forEach((pt,i)=>{
                if (i === 0) {
                    ctx.moveTo(pt.x, pt.y);
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            });
            if ([CurveType.incisal, CurveType.cervial].includes(type)) {
            } else {
                ctx.lineTo(points[0].x, points[0].y);
            }
            ctx.strokeStyle = options.color || 'red';
            ctx.stroke();
        } else {
            throw `no support curve draw type ${cDrawType}`;
        }
    }
}

/**
 * 
 */
export class CurveObject {
    constructor(ctx, pointLike, type, code = 0, options = {}) {
        this.options = options;
        this.ctx = ctx;
        this.points = pointLike;
        this.type = type;
        this.code = code; // 编码 type == CurveType.teeth 未牙号，其他未指定则为0
        this.curve = this.update(pointLike);
        this.visible = true;
    }
    setVisible(visible) {
        this.visible = visible;
    }
    /**
     * 入参必须是独立的，不能影响原来的数据，方便回退
     * @param {*} pointLike 
     * @param {*} coverPoint 是否覆盖原始数据
     * @returns 
     */
    update(pointLike, coverPoint = false) {
        if (!pointLike) throw 'update curve objects need implicit points';
        const { ctx, type, options } = this;
        if (coverPoint) {
            this.points = pointLike;
        }
        const drawType = [CurveType.incisal, CurveType.cervial, CurveType.smileWindow].includes(type) ? CDrawType.catmullRom : CDrawType.line;
        const bezierMark = new CurveHandler(ctx, pointLike, type, {
            color: options.fillColor,
            cDrawType: drawType,
        });
        this.curve = bezierMark;
        return bezierMark;
    }
    /**
     * 更新坐标
     * @param {*} mat 
     */
    teethUpdate(mat) {
        const { points } = this;
        const tmp = [];
        points.forEach((e,i)=>{
            tmp.push(pointApplyMatrix3(e, mat));
        });
        this.update(tmp);
    }
}

/**
 * 极值方向
 */
export const ExtreDir = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
}
/**
 * 极值点
 */
class Extremum {
    constructor(code) {
        this.code = code; // 牙号
        // 实时
        this.data = new Array(4).fill({x:0,y:0});
        // 原始备份
        this.dataBk = new Array(4).fill({x:0,y:0});
        this.index = new Array(4).fill(0);
        this.xLen = 0;
        this.yLen = 0;
        this.ratio = 1;
        this.initial = false;
        this.ratioBk = undefined; // 原始值的保存
        this.width = undefined;
        this.height = undefined;
    }
    update(points, force = false) {
        const {data, dataBk, index} = this;
        // 初始四个值
        if ( force === false && this.initial) {
            data[ExtreDir.top] = copyPoint(points[index[ExtreDir.top]]);
            data[ExtreDir.bottom] = copyPoint(points[index[ExtreDir.bottom]]);
            data[ExtreDir.right] = copyPoint(points[index[ExtreDir.right]]);
            data[ExtreDir.left] = copyPoint(points[index[ExtreDir.left]]);            
        } else {
            this.initial = true;
            /**
             * 图像坐标
             * 0---x top
             * | left  right
             * |     bottom
             * y
             * 
             */
            data[ExtreDir.top] = copyPoint({x: 0, y: Number.MAX_VALUE});
            data[ExtreDir.bottom] = copyPoint({x: 0, y: Number.MIN_VALUE});
            data[ExtreDir.right] = copyPoint({x: Number.MIN_VALUE, y: 0});
            data[ExtreDir.left] = copyPoint({x: Number.MAX_VALUE, y: 0});
            points.forEach((pt,i)=>{
                // y-top
                if (pt.y < data[ExtreDir.top].y) {
                    data[ExtreDir.top] = copyPoint(pt);
                    index[ExtreDir.top] = i;
                }
                // y-bottom
                if (pt.y > data[ExtreDir.bottom].y) {
                    data[ExtreDir.bottom] = copyPoint(pt);
                    index[ExtreDir.bottom] = i;
                }
                // x-right
                if (pt.x > data[ExtreDir.right].x) {
                    data[ExtreDir.right] = copyPoint(pt);
                    index[ExtreDir.right] = i;
                }
                // x-left
                if (pt.x < data[ExtreDir.left].x) {
                    data[ExtreDir.left] = copyPoint(pt);
                    index[ExtreDir.left] = i;
                }
            });
            data.forEach((e,i)=>dataBk[i] = copyPoint(e));
        }
        // 
        this.xLen = data[ExtreDir.right].x - data[ExtreDir.left].x;
        this.yLen = data[ExtreDir.bottom].y - data[ExtreDir.top].y;
        this.ratio = this.xLen / this.yLen;        
        if (this.ratioBk === undefined) {
            this.width = Number(this.xLen);
            this.height = Number(this.yLen);
            this.ratioBk = Number(this.ratio);
        }
    }
    getIdx(dir) {
        return this.index[dir];
    }
    copy(target) {
        const { data, index } = this;
        target.data.forEach((e,i)=>{
            data[i] = {
                x: e.x,
                y: e.y,
            };
        });
        target.index.forEach((e,i)=>index[i]=e);
        this.code = target.code;
        this.xLen = target.xLen;
        this.yLen = target.yLen;
        this.ratio = target.ratio;
        this.initial = target.initial;
        this.ratioBk = target.ratioBk;
        this.width = target.width;
        this.height = target.height;
        return this;
    }
}


/**
 * 极值方向
 */
const MatMapType = {
    incisal: 0,
    corridor: 1,
    height: 2,
    ratio: 3,
}

/**
 * 记录牙齿的上下左右四个最值点
 * 采样的点由AI返回
 * 每个牙齿的矩阵信息
 * 
 */
class TeethData {
    constructor() {
        this.map = new Map();
        // 矩阵
        this.mapIncisal = new Map();
        this.mapCorridor = new Map();
        this.mapHeight = new Map();
        this.mapRatio = new Map();
        this.matPan = new MjMatrix(); // 平移
        // 曲度调整时Y轴方向的值
        this.yIncisalL = 0; // 
        this.yIncisalR = 0;
        this.kp17 = [];
        this.kp17BK = [];
    }
    /**
     * ai关心的17个点
     * 21管0、1、2；    22管3、4；      23管5、6；      24管7、8
     * 11管9、10；      12管11、12；    13管13、14；    14管15、16
     * 
     */
    initKp17(kp17List) {
        const {kp17BK} = this;
        this.kp17 = kp17List;
        kp17BK.length = 0;
        kp17List.forEach(e=>kp17BK.push(copyPoint(e)));
    }
    updateKp17(mat, teethCode) {
        const {kp17, kp17BK} = this;
        const upK17 = (idxList)=>{
            idxList.forEach(i=>{
                kp17[i] = pointApplyMatrix3(kp17BK[i], mat);
            })
        }
        if (teethCode=='21') upK17([0,1,2]);
        else if (teethCode=='22') upK17([3,4]);
        else if (teethCode=='23') upK17([5,6]);
        else if (teethCode=='24') upK17([7,8]);
        else if (teethCode=='11') upK17([9,10]);
        else if (teethCode=='12') upK17([11,12]);
        else if (teethCode=='13') upK17([13,14]);
        else if (teethCode=='14') upK17([15,16]);
    }
    update(points, teethCode, force = false) {
        const {map} = this;
        if (ValidTeethNum.includes(parseInt(teethCode))) {
            let extremum = map.get(teethCode);
            if (extremum) {
                extremum.update(points, force);
            } else {
                extremum = new Extremum(teethCode);
                extremum.update(points, force);
                map.set(teethCode, extremum);
            }
        }
    }
    /**
     * 更新牙齿的矩阵
     * @param {*} inMat 
     * @param {*} teethCode 
     * @param {*} mmType 
     */
    updateMat(inMat, teethCode, mmType) {
        let map = null;
        if (mmType === MatMapType.incisal) {
            map = this.mapIncisal;
        } else if (mmType === MatMapType.corridor) {
            map = this.mapCorridor;
        } else if (mmType === MatMapType.height) {
            map = this.mapHeight;
        } else if (mmType === MatMapType.ratio) {
            map = this.mapRatio;
        } else {
            throw `unknown type ${mmType}, ${mmType.toString()}`;
        }
        let mat = map.get(teethCode);
        if (mat) mat.copy(inMat);
        else {
            mat = new MjMatrix();
            mat.copy(inMat);
            map.set(teethCode, mat);
        }
    }
    /**
     * 返回当前的缩放系数
     * 对称时左右相等、不对称时可能不相等
     * 未修改时,默认传1;如果有修改,就是修改后的与原始比modify/origin
     * 长度两个--左右 1,1
     * 笑线两个--左右 [],[]
     * 宽度两个--左右1-6号牙 1,1
     * 颊廊两个--左右4-6号牙 1,1
     * [1,1, 1,1, 1,1, 1,1] --> [1,1, [16,15,14,13,12,11],[21,22,23,24,25,26], 1,1, 1,1]
     * 
     * @param {*} symmetry
     */
    getFactor(symmetry) {
        if (symmetry === undefined) throw 'factor must need symmetry value';
        const { mapCorridor, mapHeight, mapRatio, mapIncisal } = this;
        let corridorL = 1, corridorR = corridorL,
            incisalL = [1,1,1,1,1,1], incisalR = [1,1,1,1,1,1],
            lengthL = corridorL, lengthR = lengthL,
            widthL = corridorL, widthR = widthL;
        // 如果没有调整，会出现如下情况
        // 左
        const m11 = mapHeight.get('11'), m14 = mapCorridor.get('14');
        if (m11) {
            widthL = m11.elements[0];
            lengthL = m11.elements[4];
        }
        const m11Ratio = mapRatio.get('11');
        if (m11Ratio) {
            widthL *= m11Ratio.elements[0];
            lengthL *= m11Ratio.elements[4];
        }
        if (m14) corridorL = m14.elements[0];
        const incisalValue = (code,idx, isRight = false)=>{
            const t = mapIncisal.get(code.toString());
            if (t) {
                // Y 轴的缩放
                if (isRight) incisalR[idx] = t.elements[4];
                else incisalL[idx] = t.elements[4];
            }
        }
        [16,15,14,13,12,11].forEach((code,i)=>incisalValue(code, i));
        // 右
        if (symmetry) {
            incisalR.length = 0;
            incisalL.forEach(e=>incisalR.unshift(e));
            widthR = widthL;
            lengthR = lengthL;
            corridorR = corridorL;
        } else {
            const m21 = mapHeight.get('21'), m24 = mapCorridor.get('24');
            if (m21) {
                widthR = m21.elements[0];
                lengthR = m21.elements[4];
            }
            const m21Ratio = mapRatio.get('21');
            if (m21Ratio) {
                widthR *= m21Ratio.elements[0];
                lengthR *= m21Ratio.elements[4];
            }
            if (m24) corridorR = m24.elements[0];
            [21,22,23,24,25,26].forEach((code,i)=>incisalValue(code, i, true));
        }
        return [
            lengthL,
            lengthR,
            incisalL,
            incisalR,
            widthL,
            widthR,
            corridorL,
            corridorR,
        ];
    }
}

const TeethCodeList = [11,12,13,14,15,16,21,22,23,24,25,26];
/**
 * 笑窗曲线
 */
export class SmileCurveProxy {
    constructor() {
        this.ctx = null;
        this.options = {};
        this.symmetry = true; // 默认对称
        // 左右，如果对称，两个值相等 否则各算各的
        this.ratio11 = 1;
        this.ratio11Bk = 1;
        this.ratio21 = 1;
        this.ratio21Bk = 1;
        this.ratioLimitMin = 0;
        this.ratioLimitMax = 0;
        // 长度
        this.t1xValue = 0;
        this.t1xValueBk = 0;
        this.t1xMax = 0;
        this.t1xMin = 0;
        this.t1xHeightMin = 0;
        this.t1xHeightMax = 0;
        // 颊廊
        this.corridor1 = 0;
        this.corridor1bk = 0;
        this.corridor2 = 0;
        this.corridor2bk = 0;
        this.corridorMax = 0;
        this.corridorMin = 0;
        // 
        this.teethData = new TeethData(); // 保持当前的
        this.unitOfOffset = 0.1;
        this.curveList = [];
        this.xratio = 0;
        this.yratio = 0;
        // 
        this.matFrame = new MjMatrix();
        this.matFrameInv = new MjMatrix();
        this.incisalCtrlLBk = null;
        this.incisalCtrlRBk = null;
        this.cacheX = new Map();
        this.mapInitHeight = new Map();
    }
    setSymmetry(value) {
        this.symmetry = value;
    }
    setFrame(mat) {
        const {matFrame, matFrameInv} = this;
        matFrame.copy(mat);
        matFrameInv.copy(mat);
        matFrameInv.invert();
    }
    initX() {
        const { matFrame, teethData, curveList, cacheX } = this;
        // 计算初始化位置差
        const teethList = curveList.filter(e=>e.type==CurveType.teeth);     
        TeethCodeList.forEach(code=>{
            const teeth = teethList.filter(e=>e.code==code)[0];            
            const txx = teethData.map.get(teeth.code);
            const left = pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.left)]), matFrame);
            const right = pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.right)]), matFrame);            
            let gap = 0;
            if (code == 11) {
                gap = right.x;
            } else if (code == 21) {
                gap = left.x;
            } else {
                const codeNext = code - 1;
                if (code < 20) gap = cacheX.get(codeNext).left.x - right.x;
                else gap = right.x - cacheX.get(codeNext).left.x;
            }
            cacheX.set(code, { left, right, gap });
        });
    }
    initKp17(kp17Arr) {
        this.teethData.initKp17(kp17Arr);
    }
    updatePan(x, y) {
        const { teethData } = this;
        teethData.matPan.translate(x, y);
        this.updateTooth();
        this.spline4PolynomialByTeeth(1, true);
        this.spline4PolynomialByTeeth(2, true);
    }
    bindCtx(ctx, options = {}) {
        this.ctx = ctx;
        this.options = options;
    }
    /**
     * 图像原始宽高与渲染宽高比
     * @param {*} xratio 
     * @param {*} yratio 
     * @param {*} imgRatio 图像宽高比 
     */
    bindRatio(xratio, yratio, imgRatio) {
        this.xratio = xratio;
        this.yratio = yratio;
        this.imgRatio = imgRatio;
    }
    addCurve(objCurve) {
        const { curveList, teethData } = this;
        curveList.push(objCurve);
        teethData.update(objCurve.points, objCurve.code);
    }
    computeInitValue() {
        const { teethData, symmetry } = this;
        const map = teethData.map;
        const t11 = map.get('11'), t21 = map.get('21'), 
            t14 = map.get('14'), t16 = map.get('16'),
            t24 = map.get('24'), t26 = map.get('26');
        
        const theTeethHeightMax = Math.max(t11.data[ExtreDir.bottom].y, t21.data[ExtreDir.bottom].y);
        const theTeethHeightMin = Math.min(t11.data[ExtreDir.top].y, t21.data[ExtreDir.top].y);
        this.t1xValueBk = this.t1xValue = (theTeethHeightMax - theTeethHeightMin);
        this.t1xMin = this.t1xValue * (1 - gConfigSmile.factorLength);
        this.t1xMax = (1 + gConfigSmile.factorLength) * this.t1xValue;
        
        this.ratioLimitMax = t11.ratioBk / gConfigSmile.ratioMin;
        this.ratioLimitMin = t11.ratioBk / gConfigSmile.ratioMax;
            
        if (symmetry) {
            this.ratio11 = this.ratio21 = t11.ratioBk;
            this.ratio11Bk = this.ratio11;
            this.ratio21Bk = this.ratio21;
            this.corridor1 = this.corridor1bk = t14.data[ExtreDir.right].x - t16.data[ExtreDir.left].x;        
            this.corridor2 = this.corridor2bk = this.corridor1;
        } else {
            this.ratio11 = t11.ratioBk;
            this.ratio21 = t21.ratioBk;

            this.corridor1 = this.corridor1bk = t14.data[ExtreDir.right].x - t16.data[ExtreDir.left].x;
            this.corridor2 = this.corridor2bk = t26.data[ExtreDir.right].x - t24.data[ExtreDir.left].x;
        }
        this.corridorMin = this.corridor1 * (1 - gConfigSmile.factorCorridor);
        this.corridorMax = (1 + gConfigSmile.factorCorridor) * this.corridor1;
    }
    /**
     * 切缘曲线调整
     * 变化量应用到123456号牙齿
     * offset必须是标准坐标系下
     */
    applyIncisalEdge(ptImg, kpType) {
        const res = { update: false, pt: null };
        const isLeft = kpType === KPType.incisalLeft;
        const { curveList, teethData, symmetry, matFrame, matFrameInv, mapInitHeight } = this;
        const ptStd = pointApplyMatrix3(ptImg, matFrame);
        const updateLeft = symmetry || isLeft;
        const updateRight = symmetry || !isLeft;
        let teethList = curveList.filter(e=>e.type==CurveType.teeth);

        const tLCtrl = mapInitHeight.get('lCtrl'), tRCtrl = mapInitHeight.get('rCtrl');
        const t11 = teethData.map.get('11'), t21 = teethData.map.get('21'),
            t16 = teethData.map.get('16'), t26 = teethData.map.get('26');
        let yOffset = 0, minimumY = 0, maximumY = 0, pt6 = {x:0, y: 0};
        if (symmetry) {
            yOffset = ptStd.y - tLCtrl.pt.y;
            minimumY = pointApplyMatrix3(t11.data[ExtreDir.bottom], matFrame).y;
            maximumY = pointApplyMatrix3(t11.data[ExtreDir.top], matFrame).y;
            pt6 = pointApplyMatrix3(t16.data[ExtreDir.bottom], matFrame);
        } else {
            if (isLeft) {
                yOffset = ptStd.y - tLCtrl.pt.y;
                minimumY = pointApplyMatrix3(t11.data[ExtreDir.bottom], matFrame).y;
                maximumY = pointApplyMatrix3(t11.data[ExtreDir.top], matFrame).y;
                pt6 = pointApplyMatrix3(t16.data[ExtreDir.bottom], matFrame);
            } else {
                yOffset = ptStd.y - tRCtrl.pt.y;
                minimumY = pointApplyMatrix3(t21.data[ExtreDir.bottom], matFrame).y;
                maximumY = pointApplyMatrix3(t21.data[ExtreDir.top], matFrame).y;
                pt6 = pointApplyMatrix3(t26.data[ExtreDir.bottom], matFrame);
            }
        }
        // 控制范围
        if (yOffset > 0 && pt6.y > maximumY) {
            res.pt = isLeft ? tLCtrl.opt : tRCtrl.opt;
            return res;
        }
        if (yOffset < 0 && pt6.y < minimumY) {
            res.pt = isLeft ? tLCtrl.opt : tRCtrl.opt;
            return res;
        }
            
        // 只有左边
        if (updateLeft && !updateRight) teethList = teethList.filter(e=>e.code<20);
        // 只有右边
        if (!updateLeft && updateRight) teethList = teethList.filter(e=>e.code>20);

        teethList.forEach(teeth=>{
            const id = parseInt(teeth.code) % 10; // 牙号
            const txx = teethData.map.get(teeth.code);
            const ptTopStd = pointApplyMatrix3(txx.data[ExtreDir.top], matFrame), 
                ptBottomStd = pointApplyMatrix3(txx.data[ExtreDir.bottom], matFrame);
            const hTooth = ptTopStd.y - ptBottomStd.y;
            /**
             * 根据控制点的偏移来计算的
             * 相比牙齿本身的高度来求变化率scale
             */
            const initData = mapInitHeight.get(teeth.code);
            const theOffset = yOffset * initData.factor;            
            // const theHOrigin = initData.pt.y;
            const theHOrigin = hTooth;
            const alpha = (theHOrigin - theOffset) / theHOrigin;
            // console.log(teeth.code, alpha)
            const matScale = new MjMatrix();
            matScale.makeScale(1, alpha);
            
            const mat = new MjMatrix();
            mat.identity();
            // 标准坐标下
            mat.multiply(matFrame);
            mat.premultiply(new MjMatrix().makeTranslation(-ptTopStd.x, -ptTopStd.y));
            mat.premultiply(matScale);
            mat.premultiply(new MjMatrix().makeTranslation(ptTopStd.x, ptTopStd.y));
            mat.premultiply(matFrameInv);
            teethData.updateMat(mat, teeth.code, MatMapType.incisal);
        });
        this.updateTooth();
        this.spline4PolynomialByTeeth(1, true);
        this.spline4PolynomialByTeeth(2, true);
        res.update = true;
        return res;
    }
    setUnit(unit) {
        this.unitOfOffset = unit;
    }
    toPoint(points, needTransfer = true) {
        if (Array.isArray(points) && points.length === 2) {
            return { 
                x: needTransfer ? this.toX(points[0]) : points[0],
                y: needTransfer ? this.toY(points[1]) : points[1],
            };
        }
        throw `toPoint need array points`;
    }
    toX(xOrigin, reverse = false) {
        if (reverse) {
            return xOrigin / this.xratio;
        }
        return xOrigin * this.xratio;
    }
    toY(yOrigin, reverse = false) {
        if (reverse) {
            return yOrigin / this.yratio;
        }
        return yOrigin * this.yratio;
    }
    initCervialAndIncisal() {
        this.spline4PolynomialByTeeth(1);
        this.spline4PolynomialByTeeth(2);
    }
    /**
     * 使用前端的转换后的点数据
     * 保持了原图点坐标映射到渲染窗口点坐标
     * 实时绘制曲线
     * @param {*} code 0x1切缘曲线 0x2颈缘曲线
     * @returns 
     */
    spline4PolynomialByTeeth(code) {
        const { teethData, curveList, matFrame, mapInitHeight } = this;
        const isIncisal = code === 0x1;    
        const map = teethData.map;
        const t11 = map.get('11'), t13 = map.get('13').data, t16 = map.get('16').data,
            t21 = map.get('21').data, t23 = map.get('23').data, t26 = map.get('26').data;
        const sampleCount = 20, idx = isIncisal ? 2 : 0, cType = isIncisal ? CurveType.incisal : CurveType.cervial;
        // 利用牙齿高度来判断
        const gapHeight =  (t11.data[ExtreDir.top].y - t11.data[ExtreDir.bottom].y) / 3;
        // 修改的点
        const m16 = copyPoint(t16[idx]), m26 = copyPoint(t26[idx]);
        const teeth6Offset = gapHeight / 6;
        if (isIncisal) {
            m16.y -= teeth6Offset; m26.y -= teeth6Offset;
        } else {
            m16.y += teeth6Offset; m26.y += teeth6Offset;
        }
        // console.log('spline', code, gapHeight, t11.data)
        const pt = [
            m16, copyPoint(t13[idx]), copyPoint(t11.data[idx]), 
            copyPoint(t21[idx]), copyPoint(t23[idx]), m26,
        ];
        const curve = curveList.filter(e=>e.type == cType)[0];
        const { polynomial } = regression();
        const poly = polynomial(pt.map(e=>([e.x, e.y])), {precision:6, order:2});
        // console.log('22', poly)
        // 拟合后取两个边缘控制点
        const { xList, yList } = numpyLikelinearSpace(poly.equation, pt.map(e=>e.x), sampleCount, 1/6, 1/4);
        
        // 切缘和颈缘曲线的控制点额外个数    
        pt.unshift({x: xList[1], y: yList[1] + gapHeight/3 });
        pt.unshift({x: xList[0], y: yList[0] + gapHeight });
        pt.push({x: xList[sampleCount - 2], y: yList[sampleCount - 2] + gapHeight/3 });
        pt.push({x: xList[sampleCount - 1], y: yList[sampleCount - 1] + gapHeight });    
        if (!this.incisalCtrlLBk) {
            this.incisalCtrlLBk = copyPoint(pt[1]);
            this.incisalCtrlRBk = copyPoint(pt[pt.length-2]);
        }
        if (curve) {
            curve.update(pt);
        } else {            
            /**
             * 系数计算
             * 通过控制点的差异来跟随变化
             * 
             */
            if (cType === CurveType.incisal) {
                const ptL = pointApplyMatrix3(pt[1], matFrame);
                const ptR = pointApplyMatrix3(pt[pt.length-2], matFrame);
                mapInitHeight.set('lCtrl', {pt: copyPoint(ptL), opt: copyPoint(pt[1]), factor: 1});
                mapInitHeight.set('rCtrl', {pt: copyPoint(ptR), opt: copyPoint(pt[pt.length-2]), factor: 1});
                mapInitHeight.set('11', {factor: 0});

                const calcFactor = (code) => {
                    const thePt = pointApplyMatrix3(map.get(code).data[ExtreDir.bottom], matFrame);
                    mapInitHeight.set(code, {
                        pt: copyPoint(thePt), 
                        factor: ['11','21'].includes(code) ? 0 : thePt.y/ptL.y,
                    });
                }
                ['11','12','13','14','15','16'].forEach(code=>calcFactor(code));
                ['21','22','23','24','25','26'].forEach(code=>calcFactor(code));                
                // console.log('origin factor data', ptL, ptR, mapInitHeight)
            }
            this.addCurve(new CurveObject(this.ctx, pt, cType, 0, this.options));
        }
    }
    /**
     * 长度，即牙齿高度
     * 目前的逻辑是，切缘下唇曲线不更新，只更新颈缘上唇曲线
     * @param {*} info code=3调整长度,1调整长宽比左,2调整长宽比右
     */
    applyTeethHeight(info) {
        const { curveList, t1xValueBk, teethData,
            ratio11Bk, ratio21Bk, symmetry,
            ratioLimitMin, ratioLimitMax,
            matFrame, matFrameInv } = this;
        let teethList = curveList.filter(e=>e.type==CurveType.teeth);
        const matScale = new MjMatrix();
        // 长宽比的矩阵
        // 当前高度缩放系数
        const ratio = info.value / t1xValueBk;
        if (info.lockRatio) {
            matScale.makeScale(ratio, ratio);
        } else if (info.code == 3) {
            // 极值范围内            
            if (ratio < ratioLimitMax && ratio > ratioLimitMin) {
                matScale.makeScale(1, ratio);
            } else {
                if (ratio < ratioLimitMin) {
                    // 变窄,就减一个系数
                    matScale.makeScale(1 - (ratioLimitMin - ratio), ratio);
                } else {
                    // 变宽,增加一个系数
                    matScale.makeScale(1 + (ratio - ratioLimitMax), ratio);
                }
            }
        } else if (info.code == 1) {
            matScale.makeScale(info.lvalue / ratio11Bk, 1);
            if (!symmetry) teethList = teethList.filter(e=>e.code<20);
        } else if (info.code == 2) {
            matScale.makeScale(info.rvalue / ratio21Bk, 1);
            teethList = teethList.filter(e=>e.code>20);
        }
        const mat = new MjMatrix();
        teethList.forEach(teeth=>{
            const txx = teethData.map.get(teeth.code);
            // // 图像下的最低坐标点, 先转换到标准标准坐标下
            const ptStd = pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.bottom)]), matFrame);

            mat.identity();
            mat.multiply(matFrame);
            mat.premultiply(new MjMatrix().makeTranslation(-ptStd.x, -ptStd.y));
            mat.premultiply(matScale);
            mat.premultiply(new MjMatrix().makeTranslation(ptStd.x, ptStd.y));
            mat.premultiply(matFrameInv);
            
            teethData.updateMat(mat, teeth.code, info.code == 3 ? MatMapType.height : MatMapType.ratio);
            teethData.update(teeth.points, teeth.code);
        });
        this.updateTooth();
        this.spline4PolynomialByTeeth(1, true);
        this.spline4PolynomialByTeeth(2, true);
    }
    /**
     * 整体水平拉伸或压缩
     * @param {*} info
     * @param {*} code 1左边 2右边
     * @returns 
     */
    applyBuccalCorridor(info, code) {
        const { symmetry, corridor1bk, corridor2bk, teethData, matFrame, matFrameInv, curveList } = this;
        const matScale = new MjMatrix();
        if (symmetry) {
            matScale.makeScale( info.lvalue / corridor1bk, 1);            
        } else {
            if (code == 1) {
                matScale.makeScale(info.lvalue / corridor1bk, 1);
            } else if (code == 2) {
                matScale.makeScale(info.rvalue / corridor2bk, 1);
            }
        }
        const mat = new MjMatrix();
        const teethList = curveList.filter(e=>e.type==CurveType.teeth);
        teethList.forEach(teeth=>{
            const id = parseInt(teeth.code);
            const txx = teethData.map.get(teeth.code);            
            // 图像下的最低坐标点, 先转换到标准标准坐标下
            const ptBottom = pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.bottom)]), matFrame);
            let valid = false;
            if (symmetry && [14,15,16,24,25,26].includes(id)) {
                valid = true;
                // if ([24,25,26].includes(id)) {
                //     matScale.scale(-1, 1);
                // }
            } else {
                if (code == 1 && [14,15,16].includes(id)) {
                    valid = true;
                } else if (code == 2 && [24,25,26].includes(id)) {
                    valid = true;
                }
            }            
            if (valid) {
                mat.identity();
                // 标准坐标下
                mat.multiply(matFrame);
                // 平移到原点
                mat.premultiply(new MjMatrix().makeTranslation(-ptBottom.x, -ptBottom.y));                
                // 应用上去
                mat.premultiply(matScale);
                // 平移回去
                mat.premultiply(new MjMatrix().makeTranslation(ptBottom.x, ptBottom.y));
                // 回到图像坐标系
                mat.premultiply(matFrameInv);
                teethData.updateMat(mat, teeth.code, MatMapType.corridor);
            }
        })
        this.updateTooth();
        this.spline4PolynomialByTeeth(1, true);
        this.spline4PolynomialByTeeth(2, true);
    }
    updateTooth() {
        const { curveList, teethData, symmetry, matFrame, cacheX } = this;
        const teethList = curveList.filter(e=>e.type==CurveType.teeth);
        const mat = new MjMatrix();
        const matX = new MjMatrix();
        const matAcc = new MjMatrix();
        const cache = new Map();
        const tmpCacheX = new Map();

        teethList.forEach(teeth=>{
            // 按需缩放
            mat.identity();

            const matIncisal = teethData.mapIncisal.get(teeth.code);
            if (matIncisal) mat.multiply(matIncisal);            
            
            const matHeight = teethData.mapHeight.get(teeth.code);
            if (matHeight) mat.multiply(matHeight);            
            
            const matRatio = teethData.mapRatio.get(teeth.code);
            if (matRatio) mat.multiply(matRatio);   

            // 颊廊在所有牙齿的宽度基础上
            const matCorridor = teethData.mapCorridor.get(teeth.code);
            if (matCorridor) mat.multiply(matCorridor);
            cache.set(teeth.code, new MjMatrix().copy(mat));
        });
        TeethCodeList.forEach(code=>{
            const teeth = teethList.filter(e=>e.code==code)[0];            
            
            matX.identity();
            mat.identity();
            mat.copy(cache.get(teeth.code));       
            
            const txx = teethData.map.get(teeth.code);
            const left = pointApplyMatrix3(pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.left)]), mat), matFrame);
            const right = pointApplyMatrix3(pointApplyMatrix3(copyPoint(teeth.points[txx.getIdx(ExtreDir.right)]), mat), matFrame);
            let gap = 0;
            if (code == 11) {
                gap = right.x;
                matAcc.identity();
                // 注意相减的方向，会导致往那个方向平移
                matX.makeTranslation(cacheX.get(code).gap - gap, 0);
            } else if (code == 21) {
                gap = left.x;
                matAcc.identity();
                matX.makeTranslation(cacheX.get(code).gap - gap, 0);
            } else {
                const codeNext = code - 1;
                if (code < 20) gap = tmpCacheX.get(codeNext).left.x - right.x;
                else gap = right.x - tmpCacheX.get(codeNext).left.x;
                matX.makeTranslation(gap - cacheX.get(code).gap, 0);
            }
            tmpCacheX.set(code, { left, right, gap });
            // 累积前面牙齿的，从中线开始累积
            matAcc.multiply(matX);
            // 乘以近中的偏移量
            mat.premultiply(matAcc);
            // 乘以最终的偏移量
            mat.premultiply(teethData.matPan);
            // 更新数据
            teeth.teethUpdate(mat);
            teethData.updateKp17(mat, teeth.code);
            teethData.update(teeth.curve.points, teeth.code);
        })
        // console.log(tmpCacheX)

        const t11MatH = teethData.mapHeight.get('11'), 
            t21MatH = teethData.mapHeight.get('21');
        if (symmetry) {
            if (t11MatH) {
                this.ratio11 = teethData.map.get('11').ratioBk / t11MatH.elements[ 1 * 3 + 1];
            }
        } else {
            if (t11MatH) {
                this.ratio11 = teethData.map.get('11').ratioBk / t11MatH.elements[ 1 * 3 + 1];
            }
            if (t11MatH) {
                this.ratio21 = teethData.map.get('21').ratioBk / t21MatH.elements[ 1 * 3 + 1];
            }
        }
    }
    updateFrame() {
        this.curveList.filter(e=>e.visible).forEach(item=>{
            if (item.curve) item.curve.drawCurve();
        })
    }
    updateTeethData(curve) {
        const { teethData } = this;
        teethData.update(curve.points, curve.code, true);
    }
    reset() {
        this.curveList = [];
        this.teethData = new TeethData();
    }
}