export function calcPer(count, total) {
    return Math.round(100 * count / total).toFixed(0);
}

export function ext(filename) {
    return filename.substr(filename.lastIndexOf('.'));
}

export function toYYMMDDHHmmss(timestamp) {
    const date = new Date(parseInt(timestamp));
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function filterFile(e) {
    return !(e.endsWith('.json') || e.endsWith('.gz'));
}
