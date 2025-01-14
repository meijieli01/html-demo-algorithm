class ToolStr {
    ext
    // Filename Extension
    extPdf(filename) {
        if (filename) return filename.endsWith('.pdf');
        return false;
    }
    path2Fname(path, pattern='/') {
        if (path) return path.split(pattern).pop();
        return '';
    }
    // 获取后缀
    getExt(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
    // 去掉后缀
    getName(filename) {
        return filename.substring(0, filename.lastIndexOf('.'));
    }
}
export const toolStr = new ToolStr();

export const supportModelExtFile = (filename) => {
    const ext = toolStr.getExt(filename).toLowerCase();
    return ['mq','stl','drc','ply',].includes(ext);
}

export class ToolBase64 {
    static encode(json) {
        return btoa(encodeURIComponent(JSON.stringify(json)));
    }
    static encodeBuffer(buffer) {
        let  binaryBytes = '';
        const bytes = new Uint8Array(buffer);
        for (let len = bytes.byteLength, i = 0; i < len; i++) {
            binaryBytes += String.fromCharCode(bytes[i]);
        }
        return btoa(binaryBytes);
    }
    static decode(str) {
        return JSON.parse(decodeURIComponent(window.atob(str)));
    }
}

