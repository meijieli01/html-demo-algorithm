import { toRaw } from 'vue';
/**
 * 上传单个URL
 * @param {*} url 
 * @param {*} path 
 * @param {*} client 
 * @returns 
 */
export function uploadSingleUlrFile(url, path, client) {
    return fetch(url)
          .then((res) => res.arrayBuffer())
          .then((buffer) => {
            return client.put(path, new Blob([buffer]));
          });
}

export function uploadBuffer(client, path, buffer) {
    return client.put(path, new Blob([buffer]));
}

export function signPath(client, path, options = {}) {
    return client.signatureUrl(path, { 
        expires: options.expires || 24 * 3600,
    });
}

export function getPathBuffer(client, path) {
    return new Promise((resolve)=>{
        const url = signPath(client, path);
        fetch(url).then((res) => res.arrayBuffer()).then(buffer=>resolve(buffer));
    })
}

export function url2Buffer(url) {
    return fetch(url).then((res) => res.arrayBuffer());    
}


/**
 * 
 * @param {*} client 
 * @param {*} buffer arrayBuffer
 * @param {*} path string path
 * @returns 
 */
export function putBufferFile(client, buffer, path) {
    return new Promise((resolve) => {
        return client.put(path, buffer).then((res) => {
            if (res.res.statusCode !== 200) console.error(res);
            resolve();
        });
    });
}

/**
 * 上传文件到oss中
 * @param {*} fileList 数组对象, 必须包含两部分，path和file字段
 * @param {*} client 
 * @param {*} cb 
 */
export function uploadFileList(fileList, client, cb = () => {}) {
    return new Promise((resolve) => {
        resolve(recursionUploadFile(fileList, client, fileList.length, 0, cb));
    });
}
function recursionUploadFile(fileList, client, count, index = 0, cb=()=>{}) {
    if (count > 0 && index < count) {
      if (cb) cb({index:index+1, count:count});
        const target = fileList[index];
        return putBufferFile(client, toRaw(target.file), target.path)
            .then(() => {
                target.upload = false;
                return recursionUploadFile(fileList, client, count, ++index, cb);
            }, (res) => {
                console.error(res);
            });
    }
    if (index==count && cb) cb({index:index, count:count, complete:true});
    return index;
}

export const ifExpired10Minute = (time) => (new Date().getTime() - time) / 1000 / 60 > 10
