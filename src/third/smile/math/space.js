import { MjMatrix } from './matrix';
import { copyPoint } from './utils';
/**
 * 两点成直线与直线外一点的最近距离
 * https://www.cnblogs.com/flyinggod/p/9359534.html
 * @param {*} p 
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
export function Point2SegDistance(p, p1, p2) {
    const cross = (p2.x - p1.x) * (p.x - p1.x) + (p2.y - p1.y) * (p.y - p1.y);
    if (cross <= 0) return mathDistance(p, p1);

    const d2 = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
    if (cross >= d2) return mathDistance(p, p2);

    const r = cross / d2;
    const px = p1.x + (p2.x - p1.x) * r;
    const py = p1.y + (p2.y - p1.y) * r;
    return distanceTwoPoint(p, {x:px, y:py});
}
/**
 * 两点成直线与直线外一点的交点
 * @param {*} p 
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
export function Point2SegNearestPoint(p, p1, p2) {
    const cross = (p2.x - p1.x) * (p.x - p1.x) + (p2.y - p1.y) * (p.y - p1.y);
    if (cross <= 0) throw 'three point not online';

    const d2 = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
    if (cross >= d2) throw 'three point not online';

    const r = cross / d2;
    const px = p1.x + (p2.x - p1.x) * r;
    const py = p1.y + (p2.y - p1.y) * r;
    return {x: px, y: py};
}


/**
 * subtracts vector p1 from vector p2
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
function vectorSubtract(p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    };
}

/**
 * 两点的欧几里得距离
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
function distanceTwoPoint(p1, p2) {
    return Math.sqrt(distanceSquareTwoPoint(p1, p2));
}

function distanceSquareTwoPoint(p1, p2) {
    const x = p1.x - p2.x, y = p1.y - p2.y;
    return x * x + y * y;
}

/**
 * https://blog.csdn.net/qq_45735851/article/details/114453558
 * @param {*} p 
 * @param {*} p1 
 * @param {*} p2 
 * @returns 
 */
function point2Projection(p, p1, p2) {
    const u = vectorSubtract(p2, p1), v = vectorSubtract(p, p1),
    dotuv = u.x*v.x+u.y*v.y, dotuu = u.x*u.x+u.y*u.y, scale = dotuv / dotuu;
    return {
        x: p1.x + u.x * scale,
        y: p1.y + u.y * scale,
    }
}

/**
 * 计算坐标系
 *  . . . . . . |  ........
 * .          . |  .       .
 *  .  11     . A  .  21   .
 *   .        . |  .      .
 *    . D1....  |  ...D2..
 *              B   
 *              |
 *              |
 *              C
 * Y轴是有两瞳孔和人中点确定的一个垂直线
 * A是11和21牙齿最近的点
 * C是A在Y轴方向上的延长点
 * B是11和21牙的最低点且垂直与Y轴,是计算坐标系的坐标原点
 * D1和D2是两个牙齿上与B点垂直于Y轴的点,所有X轴的方向正负需要判断
 * @param {*} points pupilLeft, pupilRight, philtrum
 */
export function calcCoordinate(info) {
    const { points, t11, t21 } = info;
    // console.log('origin', info)
    // 一条直线与直线外的点的最近垂直点
    const {x:x1, y:y1} = Point2SegNearestPoint(points[2], points[0], points[1]);
    // 方向
    const yDir = vectorSubtract(points[2], {x:x1,y:y1}), dirLen = -1 * distanceTwoPoint({x:0, y: 0}, yDir);
    yDir.x /= dirLen;
    yDir.y /= dirLen;
    // 1号牙齿最近的两个点,求其中点
    let x1121Len = Number.MAX_VALUE, p11Right, p21Left, 
        p1121Nearest, p1121Extend, extendLen = Number.MAX_VALUE, pExtendNeareset;
    t11.forEach((t1)=>{
        t21.forEach((t2)=>{
            let len = distanceSquareTwoPoint(t1, t2);
            if (len < x1121Len) {
                x1121Len = len;
                p11Right = copyPoint(t1);
                p21Left = copyPoint(t2);
            }
        })
        
    });
    // 最近点的中点
    p1121Nearest = copyPoint({
        x: (p11Right.x + p21Left.x) / 2,
        y: (p11Right.y + p21Left.y) / 2,
    })
    // Y轴向下的延长点
    p1121Extend = copyPoint({
        x: p1121Nearest.x - 20 * yDir.x,
        y: p1121Nearest.y - 20 * yDir.y, 
    });
    // 延长点离牙齿最近的投影点
    [].concat(t11, t21).forEach(t=>{
        let proj = point2Projection(t, p1121Nearest, p1121Extend),
            len = distanceTwoPoint(proj, p1121Extend);
        if (len < extendLen) {
            extendLen = len;
            pExtendNeareset = copyPoint(t);
        }
    })
    // 牙齿点投影在Y轴上离延长点最近的点作为原点
    const pOrigin = Point2SegNearestPoint(pExtendNeareset, p1121Nearest, p1121Extend);
    // 算出X轴方向
    const xDir = pOrigin.x < pExtendNeareset.x ? vectorSubtract(pExtendNeareset, pOrigin) 
        : vectorSubtract(pOrigin, pExtendNeareset),
        xdirLen = distanceTwoPoint({x:0, y: 0}, xDir);
    xDir.x /= xdirLen;
    xDir.y /= xdirLen;

    // 构造旋转矩阵
    const rmat = new MjMatrix();
    rmat.identity();
    rmat.elements[0 * 3 + 0] = xDir.x;
    rmat.elements[1 * 3 + 0] = xDir.y;
    rmat.elements[0 * 3 + 1] = yDir.x;
    rmat.elements[1 * 3 + 1] = yDir.y;
    rmat.invert();
    const tmat = new MjMatrix();
    tmat.identity();
    tmat.makeTranslation(-pOrigin.x, -pOrigin.y);
    // 坐标系
    const matFrame = rmat.multiply(tmat);
    return {
        points: [
            p1121Nearest, p1121Extend, pExtendNeareset, pOrigin,
        ],
        mat: matFrame,
    }
}