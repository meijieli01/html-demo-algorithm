// 保存为文件
function save2File(fileType, blob, filename) {
    const tagA = document.createElement('a');
    const herf = window.URL.createObjectURL(new Blob([blob], {type: fileType}));
    tagA.href = herf;
    tagA.download = filename;
    tagA.click();
}
export function savePdf(blob, filename) {
    save2File('application/pdf;chartset=UTF-8', blob, filename || `${Date.toString()}.pdf`);
}
// .rar    application/x-rar-compressed, application/octet-stream
// .zip    application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip
export function saveZip(blob, filename) {
    save2File('application/zip;chartset=UTF-8', blob, filename || `${Date.toString()}.zip`);
}
export function saveBinaryFile(blob, filename) {
    save2File('application/octet-stream', blob, filename);
}
export function saveExcel(blob, filename) {
    save2File('application/vnd.ms-excel;chartset=UTF-8', blob, filename || `${Date.toString()}.xlsx`);
}

// 时间
// 获取当前时区时间
export function getLocalNow(timeStamp = Date.now()) {
    let tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(timeStamp - tzOffset);
}
// yyyy-MM-dd
function formatYyyyMMdd(year, month, date) {
    return `${year.toString()}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
}
export function getYyyyMMDD(timeStamp = Date.now()) {
    const tmp = getLocalNow(timeStamp);
    return formatYyyyMMdd(tmp.getFullYear(), tmp.getMonth()+1, tmp.getDate());
}
// for mac, not support new Date(str)
// 接收str的时间格式是 str 2003-10-15 00:00:00
export function toISODatetime(str) {
    if (navigator.userAgent.includes('Mac OS')) {
        let tmp = getLocalNow();
        if (str.length >= 4) tmp.setFullYear(parseInt(str.substring(0, 4)));
        if (str.length >= 7) tmp.setMonth(parseInt(str.substring(5, 7)) - 1);
        if (str.length >= 10) tmp.setDate(parseInt(str.substring(8, 10)));
        if (str.length >= 13) tmp.setHours(parseInt(str.substring(11, 13)));
        if (str.length >= 16) tmp.setMinutes(parseInt(str.substring(14, 16)));
        if (str.length >= 19) tmp.setSeconds(parseInt(str.substring(17, 19)));
        return tmp;
    }
    return new Date(str);
}
// 提取时间
function getHHMMSS(strTime) {
    const timePattern = /\d+:\d+:\d+/g;
    return `${strTime.match(timePattern)[0] || ''}`;
}

// 
export function dynImportScriptFile(srcPath) {
    let elScript = document.createElement('script');
    elScript.type = 'text/javascript';
    elScript.src = srcPath;
    document.body.appendChild(elScript);
}
