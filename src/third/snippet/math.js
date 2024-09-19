/**
 * 处理Math的逻辑
 */

export function degree2Radian(degree) {
    return degree * (Math.PI / 180.0);
}
export function radian2Degree(radian) {
    return radian * 180.0 / Math.PI;
}

/**
 * 
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
export function getRandomInt(max, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#arcs
 * 
 * @param {*} centerX 
 * @param {*} centerY 
 */
export function svgArcPath(centerX, centerY, radius, angleStart, angleSweep, unitType = 'degree' ) {
    if (unitType == 'radians') {

    } else {
        angleStart = degree2Radian(angleStart);
        angleSweep = degree2Radian(angleSweep);
    }
    let startX = centerX + radius * Math.sin(angleStart);
    let startY = centerY - radius * Math.cos(angleStart);
    let endX = centerX + radius * Math.sin(angleStart + angleSweep);
    let endY = centerY - radius * Math.cos(angleStart + angleSweep);
    /**
     * An arc path in SVG defines an ellipse/curve between two points.
     * The `x_axis_rotation` parameter defines how an ellipse is rotated,
     * if at all, but circles don't change under rotation, so it's irrelevant.
     */
    const xAxisRotation = 0

    /**
     * For a given radius, there are two circles that intersect the 
     * 
     * start/end points.
     *
     * The `sweep-flag` parameter determines whether we move in 
     * a positive angle (=clockwise) or negative (=counter-clockwise).
     * I'only doing clockwise sweeps, so this is constant.
     */
    const flagSweep = 1

    /**
     * There are now two arcs available: one that's more than 180 degrees, 
     * one that's less than 180 degrees (one from each of the two circles).
     * The `large-arc-flag` decides which to pick.
     */
    const flagLargeArc = angleSweep > Math.PI ? 1 : 0;   
    return `M${startX} ${startY} A ${radius} ${radius} ${xAxisRotation} ${flagLargeArc} ${flagSweep} ${endX} ${endY}`;
}