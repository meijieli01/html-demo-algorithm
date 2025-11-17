
export const truncationImage = (file, opt = {}) => {
    let url = URL.createObjectURL(file);
    const qualityFactor = opt.quality || 0.7;
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.src = url
        img.addEventListener('load', () => {
          URL.revokeObjectURL(url)
            resolve(img)
        })
        img.addEventListener('error', (err) => {
            URL.revokeObjectURL(url)
        reject(`${file.name}图片文件加载失败${err}`)
        })
    }).then((image) => {
        let width = 0
        let height = 0
        let ratio = image.width / image.height
        const maxSize = opt.maxSize || 1000
        if (image.width > image.height) {
            if (maxSize < image.width) width = maxSize
            else width = image.width
            height = width / ratio
        } else {
            if (maxSize < image.height) height = maxSize
            else height = image.height
            width = height * ratio
        }
        // width = image.width;
        // height = image.height;
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = width
        canvas.height = height
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
                resolve({
                    blob,
                    width,
                    height,
                    owidth: image.width,
                    oheight: image.height,
                    filename: file.name,
                })
            },'image/jpeg', qualityFactor)
        })
    })
}

const base64Jpeg = 'data:image/jpeg;base64,';
const base64Png = 'data:image/png;base64,';

export const imageToBase64 = (buffer, urlOrPath) => {
    const isPng = urlOrPath.substr(urlOrPath.lastIndexOf('.')) == '.png';
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return (isPng ? base64Png : base64Jpeg) + window.btoa(binary);
}

