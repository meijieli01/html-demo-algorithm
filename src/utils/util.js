export function calcPer(count, total) {
    return Math.round(100 * count / total).toFixed(0);
}

export function ext(filename) {
    return filename.substr(filename.lastIndexOf('.'));
}