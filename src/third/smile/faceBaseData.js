import { SmileCurveProxy, CurveType } from './curve';
import { KeyPointPath, PathType, KPType, ArrowPath } from './math/path2d';
import { copyPoint } from './math/utils';
import { gConfigSmile } from './helpConstant';

export const ImgHandleType = {
    oneFromFour: 1, // 四选一时不需要处理太多
    stroke: 2, // 轮廓
    color: 3, // 颜色
    final: 4, // 生成最终效果
    replace: 5, // iOS目前只能是替换
}

export class FaceDataBase {
    constructor() {
        this.kpList = [];
        this.curveProxy = new SmileCurveProxy();
        this.dpr = 1; // 设备像素
        this.smileIdxExclude = [];
        this.initIncisalCtrl = false;
        this.isMini = false; // 是否是小程序
    }
    updateFrame() {

    }
    /**
     * 关键点
     * @param {*} visible 
     */
    showKeyPoint(visible) {
        const { kpList } = this;
        kpList.filter(e=>e.getType()==PathType.faceKeyPoint).forEach(kp=>{
            kp.setVisible(visible);
        });
        this.updateFrame();
    }
    showSmileWindow(visible) {
        const { isMini, curveProxy, kpList, smileIdxExclude } = this;
        const target = curveProxy.curveList.filter(e=>e.type==CurveType.smileWindow)[0];
        if (target) target.setVisible(visible);
        // if (gConfigSmile.isDev) {
        //     kpList.filter(e=>e.type==PathType.auxSmilePoint).forEach(kp=>kp.setVisible(visible));
        // }
        const canMoveControlPoints = kpList.filter(e=>e.type==PathType.smileWindowPoint&&!smileIdxExclude.includes(e.kpType))
        canMoveControlPoints.forEach(kp=>kp.setVisible(visible));
        const len = canMoveControlPoints.length;
        if (isMini && len > 0) {
            // 第一个和第四个控制点是不起作用的
            canMoveControlPoints[0].visible = false;
            canMoveControlPoints[len - 1].visible = false;
        }
        this.updateFrame();
    }
    showSmileCurve(visible) {
        const { curveProxy, kpList } = this;
        const curveList = curveProxy.curveList.filter(e=>e.type!==CurveType.smileWindow);
        curveList.forEach(e=>e.setVisible(visible));
        kpList.filter(e=>e.getType()==PathType.auxIncisal).forEach(kp=>{
            kp.setVisible(visible);
        })
        this.updateFrame();
    }
    toX(e) {
        return e;
    }
    toY(e) {
        return e;
    }
    getSmileWind() {
        const { curveProxy } = this;
        const curve = curveProxy.curveList.filter(e=>e.type === CurveType.smileWindow)[0];
        const ptList = curve.curve.points;
        const updatePoints = ptList.slice(1, ptList.length-1);
        return JSON.stringify(updatePoints.map(e=>([this.toX(e.x, true), this.toY(e.y, true)])));
    }
    getFactor() {
        const { curveProxy } = this;        
        return JSON.stringify(curveProxy.teethData.getFactor(curveProxy.symmetry));
    }
    getKeyPoint() {
        const { curveProxy } = this;
        const kp17List =  curveProxy.teethData.kp17;
        return JSON.stringify(kp17List.map(e=>([this.toX(e.x, true), this.toY(e.y, true)])));
    }
    getClipArea() {
        const { kpList, isMini } = this;
        const offset = 10;
        const kpPhitrum = kpList.filter(e=>e.type==PathType.faceKeyPoint&&e.kpType==KPType.philtrum)[0];
        const kpOrisLeft = kpList.filter(e=>e.type==PathType.faceKeyPoint&&e.kpType==KPType.orisAngleLeft)[0];
        const kpOrisRight = kpList.filter(e=>e.type==PathType.faceKeyPoint&&e.kpType==KPType.orisAngleRight)[0];
        const kpSmile = kpList.filter(e=>e.type==PathType.smileWindowPoint&&e.kpType==KPType.smileWindow)[0];
        const windowHeight = kpSmile.y - kpPhitrum.y;
        const windowWidth = kpOrisRight.x - kpOrisLeft.x;
        let x = 0, y = 0, width = 0, height = 0;
        if (isMini) {
            y = kpPhitrum.y - offset;
            x = kpOrisLeft.x - offset;
            width = windowWidth + offset * 2;
            height = (kpSmile.y - y) + offset * 2 + offset;
        } else {
            y = kpPhitrum.y - offset;
            x = kpOrisLeft.x - offset;
            width = windowWidth + offset * 2;
            height = windowHeight + offset * 2 + offset;
        }
        if (gConfigSmile.isDev) {
            console.log(' clip area ', x, y, width, height)
        }
        return { x, y, width, height };
    }
    updateCurveAuxPoint(inCanvas) {
        const { curveProxy, kpList } = this;
        if (this.initIncisalCtrl === false) {
            const incisalEdge = curveProxy.curveList.filter(e=>e.type==CurveType.incisal)[0];
            if (incisalEdge) {
                const ptSet = incisalEdge.points;
                const ptLeft = copyPoint(ptSet[1]), ptRight = copyPoint(ptSet[ptSet.length - 2]);

                let kpIncisalLeft = kpList.filter(e=>e.kpType==KPType.incisalLeft)[0];
                if (kpIncisalLeft) kpIncisalLeft.update(ptLeft);
                else kpList.push(new KeyPointPath(ptLeft.x, ptLeft.y, KPType.incisalLeft, {type: PathType.auxIncisal, canvas: inCanvas}));

                let kpIncisalRight = kpList.filter(e=>e.kpType==KPType.incisalRight)[0];
                if (kpIncisalRight) kpIncisalRight.update(ptRight);
                else kpList.push(new KeyPointPath(ptRight.x, ptRight.y, KPType.incisalRight, {type: PathType.auxIncisal, canvas: inCanvas}));

                this.initIncisalCtrl = true;
            }
        }
        // const tmp1 = kpList.filter(e=>e.kpType==KPType.originIncisalCtrl);
        // if (curveProxy.incisalCtrlLBk && tmp1.length < 1) {
        //     kpList.push(new KeyPointPath(curveProxy.incisalCtrlLBk.x, curveProxy.incisalCtrlLBk.y, KPType.originIncisalCtrl, {type: PathType.auxIncisal}));
        //     kpList.push(new KeyPointPath(curveProxy.incisalCtrlRBk.x, curveProxy.incisalCtrlRBk.y, KPType.originIncisalCtrl, {type: PathType.auxIncisal}));
        //     kpList.filter(e=>e.kpType==KPType.originIncisalCtrl).forEach(kp=>kp.setVisible(true));
        // }
    }
}
