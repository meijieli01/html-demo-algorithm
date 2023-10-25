/**
 * 处理缓存的数据
 */
function readStorage(key, isSession = false) {
    if (isSession) return sessionStorage.getItem(key);
    return localStorage.getItem(key);
}
export function writeToStorage(key, value, options = {isSession:false}) {
    if (options.isSession) sessionStorage.setItem(key, value);
    else localStorage.setItem(key, value);
}
export function readFromStorage(key, defaultVal = '0', options = {isSession:false, hasDefault:true}) {
    let tmp = readStorage(key, options.isSession);
    if (options.hasDefault && (tmp == null || tmp == undefined)) {
        writeToStorage(key, defaultVal, options.isSession); 
        tmp = defaultVal;
    }
    return tmp;
}
export function removeToStorage(key, options = {isSession:false}) {
    if (options.isSession) sessionStorage.removeItem(key);
    else localStorage.removeItem(key);
}
export const keyDownloadExcel = 'keyDonwloadExcelFile';
