/**
 * 判断点是否在圆形半径内
 * @param {Point} point 点
 * @param {Point} center 圆心
 * @param {number} radius 圆半径
 */
export function isInCircle(point, center, radius) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
}

/**
 * 获取多边形中心点坐标
 * @param {array} points 多边形点坐标
 * @returns 2触摸点距离
 */
export function getPolygonCenterPoint(points) {
    const result = {x:0, y:0};
    points.forEach((p)=>{
        result.x += p.x;
        result.y += p.y;
    });
    result.x /= points.length;
    result.y /= points.length;
    return result;
}

/**
 * 获取2触摸点距离
 * @param {object} e 触摸对象
 * @returns 2触摸点距离
 */
export function getFinger2Distance(touches) {
    if (touches.length < 2) return 0;
    const xMove = touches[1].x - touches[0].x;
    const yMove = touches[1].y - touches[0].y;
    return Math.sqrt(xMove * xMove + yMove * yMove);
}

/** 使用向量的方式来判断两个坐标是否处于相同方向 */
export function isSameDirection(p1, p2, p3, p4) {
    const vector1 = {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
    }
    const vector2 = {
        x: p4.x - p3.x,
        y: p4.y - p3.y,
    }
    if (vector1.x === 0 && vector1.y === 0 &&
        vector2.x === 0 && vector2.y === 0) {
        return true;
    }
    if ((vector1.x === 0 && vector1.y === 0) ||
        (vector2.x === 0 && vector2.y === 0)) {
        return false;
    }
    const res = !(
        (vector1.x < 0 && vector2.x > 0) ||
        (vector1.y < 0 && vector2.y > 0) ||
        (vector1.x > 0 && vector2.x < 0) ||
        (vector1.y > 0 && vector2.y < 0)
    );
    return res;
}

/**
 * 
 * @param {*} e 
 * @param {*} index 
 * @returns 
 */
export function getTouchPoint(e, index) {
    if (e.touches && e.touches[index]) return e.touches[index];
    return e.changedTouches && e.changedTouches[index];
}


/**
 * https://developers.weixin.qq.com/community/develop/article/doc/0004cef0f980407630dfa1e2956013
 */
export function updateImage(canvas, ctx, width, height) {
    const u8Arr = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < u8Arr.length; i+=4) {
        u8Arr[i + 0] = 0;
        u8Arr[i + 1] = 255;
        u8Arr[i + 2] = 0;
        u8Arr[i + 3] = 255;
    }
    const imgData = canvas.createImageData(u8Arr, width, height);
    ctx.putImageData(imgData, 0, 0);
}

/**
 * 
 * @param {*} elRc 
 * @param {*} wNatural 
 * @param {*} hNatural 
 * @param {*} options
 */
export function maxImageSize(elRc, wNatural, hNatural, options = {}) {
    const res = {
        ratioImg: wNatural / hNatural,
        top: 0,
        left: 0,
        wNatural,
        hNatural,
    };

    // 强制以竖屏方式
    if (options.deviceOrientation == 'portrait') {
        res.wReal = elRc.width;
        res.hReal = Math.ceil(elRc.width / res.ratioImg);
        res.left = 0;
        res.top = (elRc.height - res.hReal) / 2;
    } else {
        throw 'not handle for landscape'
    }
    res.ratioX = res.wReal / wNatural;
    res.ratioY = res.hReal / hNatural;   
    // console.log(res, elRc, options) 
    return res;
}

export function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }        
    }
}
