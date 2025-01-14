/**
 * 计算多项式值
 * @param {*} input 
 * @param {*} coefficients 
 */
export function computeWithCoefficients(input, coefficients) {
    let res = 0;
    if (Array.isArray(coefficients)) {
        const len = coefficients.length;
        coefficients.forEach((e,i)=> {
            if (i + 1 === len) {
                res += e;
            } else {
                res += e * Math.pow(input, len - 1 - i);
            }
        });
        return res;
    }
    throw 'coefficients must array'
}

/**
 * 返回多项式对应的点
 * @param {*} inputList 
 * @param {*} coefficients 
 */
export function computePolynomialValue(inputList, coefficients) {
    const outputList = [];
    inputList.forEach(e=>outputList.push(computeWithCoefficients(e, coefficients)));
    return outputList;
}

/**
 * https://numpy.org/doc/stable/reference/generated/numpy.linspace.html
 * numpy.linspace
 * @param {*} xSet 
 * @param {*} coefficients 
 */
export function numpyLikelinearSpace(coefficients, xSet, num = 50, fractionStart = 1/5, fractionEnd = 1/5) {
    const minX = Math.min(...xSet), maxX = Math.max(...xSet);
    const startX = minX - (maxX - minX) * fractionStart, endX = maxX + (maxX - minX) * fractionEnd;
    const xList = [];
    const gap = (endX - startX) / num;
    for (let i = 0; i < num; i++) {
        xList.push(startX + gap * i);
    }
    const yList = computePolynomialValue(xList, coefficients);
    return { xList, yList };
}

/**
 * 线性回归得到斜率
 * @param {*} data 
 */
export function computeLinearRegression(data) {
    if (!Array.isArray(data)) throw 'need array data';
    let xsum = 0, ysum = 0, count = data.length;
    for (let i = 0; i < count; i++) {
        xsum += data[i].x;
        ysum += data[i].y;
    }
    const xmean = xsum / count;
    const ymean = ysum / count;
    let num = 0, denom = 0;
    for (let i = 0; i < count; i++) {
        let x = data[i].x;
        let y = data[i].y;
        num += (x - xmean) * (y - ymean);
        denom += (x - xmean) * (x - xmean);
    }
    const m = num / denom;
    const b = ymean - (m * xmean);
    return { m, b, xmean, ymean };
}

/**
 * 
 */
export function degree2Radian(degree) {
    return degree * (Math.PI / 180.0);
}
export function radian2Degree(radian) {
    return radian * 180.0 / Math.PI;
}

/**
 * 判断点是否在圆中
 * @param {*} ox 原点
 * @param {*} oy 原点
 * @param {*} tx 目标点
 * @param {*} ty 目标点
 * @param {*} radius 半径
 * @returns 
 */
export function isInCircle(ox, oy, tx, ty, radius) {
    return ((tx - ox) * (tx - ox) + (ty - oy) * (ty - oy)) <= radius * radius;
}

/**
 * 获取四个角落的值
 * 0 left-top
 * 1 right-top
 * 2 right-bottom
 * 3 left-bottom
 * 0 ---> x
 *  |
 *  |
 * \ /
 *  y
 * @param {*} points 
 */
export function fourCornerPoint(points) {
    const res = [];
    res[0] = [points[0][0], points[0][1]];
    res[1] = [points[1][0], points[1][1]];
    res[2] = [points[2][0], points[2][1]];
    res[3] = [points[3][0], points[3][1]];
    points.forEach((pt)=>{
        // x
        [0,3].forEach((e)=> res[e][0] = Math.floor(Math.min(res[e][0], pt[0])));
        [1,2].forEach((e)=> res[e][0] = Math.ceil(Math.max(res[e][0], pt[0])));
        // y
        [0,1].forEach((e)=> res[e][1] = Math.floor(Math.min(res[e][1], pt[1])));
        [2,3].forEach((e)=> res[e][1] = Math.ceil(Math.max(res[e][1], pt[1])));
    })
    return res;
}

/**
 * https://www.cnblogs.com/flyinggod/p/9359534.html
 * @param {*} x 
 * @param {*} y 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
export function Point2SegDist(x, y, x1, y1, x2, y2) {
    const cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) throw 'three point not online';

    const d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) throw 'three point not online';

    const r = cross / d2;
    const px = x1 + (x2 - x1) * r;
    const py = y1 + (y2 - y1) * r;
    return { x: px, y: py };
}

/**
 * 不能使用对象
 */
export function copyPoint(pointLike) {
    return {x: pointLike.x, y: pointLike.y};
}
