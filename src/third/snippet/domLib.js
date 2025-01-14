import { ToolBase64 } from './toolStr';
import { saveBinaryFile } from './toolkit';
/**
 * 绑定事件
 * event.dataTransfer.types
 * 通过types来判断是否是外部拖入['Files']还是内部拖拽位置更改['text/plain', 'text/uri-list', 'text/html'] 
 * 这个方案目前看来还行，是因为在内部拖拽的对象中是一个复杂的对象，有文字，有图像等内容
 */
/**
 * 绑定drop事件
 * @param {*} el 
 * @param {*} cbStart 
 * @param {*} cbDrop 
 * @param {*} options 
 */
export function domBindDropEvent(el, cbStart, cbDrop, options = {}) {
    const clsName = options.clsName || 'mq-image-shadow';
    if (options.hasDragStart) {
        el.addEventListener('dragstart', (event) => {
            cbStart(event);
        });
    }
    el.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        el.classList.add(clsName);
    });
    el.addEventListener('dragenter', (event) => {
        event.preventDefault();
        event.stopPropagation();
        el.classList.add(clsName);
    }, false);
    el.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        el.classList.remove(clsName);
    }, false);
    el.addEventListener('drop', (event) => {
      el.classList.remove(clsName);
      if (cbDrop) cbDrop(event);
    });
} 
/**
 * 2023-9-6
 * 可能拖拽的是文件夹，不能解析文件夹
 * @param {*} event 
 * @param {*} isImage 
 * @returns 
 */
export function parseDropEventFile(event, isImage = true) {
    const srcTarget = event.dataTransfer;
    const dropFiles = [];
    const validFile = (file) => {
        if (file.size > 0) {
            if (isImage) {
                if (file.type.startsWith('image')) dropFiles.push(file);
            } else {
                dropFiles.push(file);
            }
        }
    }
    if (srcTarget.items) {
        for (let i = 0; i < srcTarget.items.length; i++) {
            if (srcTarget.items[i].kind == "file") {
                let file = srcTarget.items[i].getAsFile();
                validFile(file);
            }
        }
    } else {
        for (let i = 0; i < srcTarget.files.length; i++) {
            let curFile = srcTarget.files[i];      
            validFile(curFile);
        }
    }
    return dropFiles;
}

export function dynImportScriptFile(srcPath) {
    let elScript = document.createElement('script');
    elScript.type = 'text/javascript';
    elScript.src = srcPath;
    document.body.appendChild(elScript);
}

/**
 * 缩放和平移对象
 * 增加旋转
 * @param {*} elParent 
 * @param {*} elChild 
 * @param {*} options rotateLeft逆时针90旋转  rotateRight顺时针90旋转
 */
export function elAddZoomAndPan(elParent, elChild, options = {}) {    
    const info = {
        x: 0,
        y: 0,
        rotate: 0,
    }
    const zoom = (e) => {
        let mat = new DOMMatrix(elChild.style.transform);
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        mat.a *= factor;
        mat.b *= factor;
        mat.c *= factor;
        mat.d *= factor;
        elChild.style.transform = mat.toString();
        // console.log('zoom', e.deltaY, mat)        
    }
    elParent.addEventListener('wheel', zoom);
    elParent.addEventListener('mousedown', (e)=>{
        info.x = e.clientX;
        info.y = e.clientY;
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    });
    const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    }
    const mouseMove = (e) => {
        let moveX = e.clientX - info.x;
        let moveY = e.clientY - info.y;
        // 更新
        info.x = e.clientX;
        info.y = e.clientY;  
        let mat = new DOMMatrix(elChild.style.transform);
        let matN = new DOMMatrix().translate(moveX, moveY);
        matN = matN.multiplySelf(mat);
        elChild.style.transform = matN.toString();
    }
    options.rotateLeft = () => updateRotate(-90);
    options.rotateRight = () => updateRotate(90);
    const updateRotate = (deg) => {
        info.x = 0;
        info.y = 0;
        info.rotate += deg;
        let matOld = new DOMMatrix(elChild.style.transform);
        let matNew = new DOMMatrix().rotate(deg);
        matNew = matNew.multiplySelf(matOld);
        elChild.style.transform = matNew.toString();
    }
}

/**
 * 文件展示
 */
export function bindImage2Body(url, options = {}) {
    const maxSize = options.maxSize === false ? false : true;
    const opacity = options.opacity || 0.8;
    const elContainer = document.createElement('div');
    elContainer.style.position = 'absolute';
    elContainer.style.width = '100vw';
    elContainer.style.height = '100vh';
    elContainer.style.zIndex = 15000;
    elContainer.style.top = '0';
    // elContainer.style.opacity = opacity;
    elContainer.style.backgroundColor = 'lightgray';
    const elClose = document.createElement('button');
    elClose.style.position = 'absolute';
    elClose.style.top = '20px';
    elClose.style.right = '20px';
    elClose.classList.add('btn-close','bg-primary');
    elClose.setAttribute('aria-label', 'Close');
    elClose.addEventListener('click', ()=> {
        document.body.removeChild(elContainer);
    });

    const elTool = document.createElement('div');
    elTool.style.bottom = '20px';
    elTool.classList.add('position-absolute', 'd-flex', 'w-100', 'justify-content-center');
    const elRotateLeft = document.createElement('button');
    elRotateLeft.style.opacity = 0.5;
    elRotateLeft.classList.add('btn','bg-primary','mx-2');
    elRotateLeft.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"/>
    </svg>`;
    elTool.appendChild(elRotateLeft);
    const elRotateRight = document.createElement('button');
    elRotateRight.style.opacity = 0.5;
    elRotateRight.classList.add('btn','bg-primary','mx-2');
    elRotateRight.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-90deg-right" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4z"/>
    </svg>`;
    elTool.appendChild(elRotateRight);
    const elDownload = document.createElement('button');
    elDownload.style.opacity = 0.5;
    elDownload.classList.add('btn','bg-primary','mx-2');
    elDownload.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>`;
    elTool.appendChild(elDownload);    
    
    const elImgWrap = document.createElement('div');
    elImgWrap.style.display = 'flex';
    elImgWrap.style.flexDirection = 'column';
    elImgWrap.style.justifyContent = 'center';
    elImgWrap.style.height = '100%';
    elImgWrap.style.overflow = 'auto';
    const elImg = document.createElement('img');
    elImg.style.margin = 'auto';
    elImg.draggable = false;
    if (maxSize) {
        elImg.style.maxWidth = '100%';
        elImg.style.maxHeight = '100%';
    }
    const rotateOptions = {
        rotateLeft: ()=>{},
        rotateRight: ()=>{},
    };
    elAddZoomAndPan(elImgWrap, elImg, rotateOptions);
    elRotateLeft.addEventListener('click', ()=>rotateOptions.rotateLeft());
    elRotateRight.addEventListener('click', ()=>rotateOptions.rotateRight());
    elDownload.addEventListener('click', ()=>{
        fetch(url).then(res=>res.arrayBuffer()).then(buffer=>{
            saveBinaryFile(buffer, options.filename || `${Date.now()}.jpg`);
        })
    });
    elImg.src = url;
    elImgWrap.appendChild(elImg);

    elContainer.appendChild(elImgWrap);
    elContainer.appendChild(elClose);
    elContainer.appendChild(elTool);
    document.body.appendChild(elContainer);
}

/**
 * 打开url，使用默认情况还是展示内容，如PDF
 * pdf的MIMETYPE必须是application/pdf，如果是application/octet-stream就会直接下载拉
 * 但是带域名的网站好像不受这个影响了
 * @param {*} url 
 * @param {*} options 
 */
export function openUrl4Show(url, options = {}) {
    const useBase64 = options.useBase64;
    const useUrl = options.useUrl;
    if (useBase64) {    
        const title = options.title || '资质文件';
        if (useUrl) {
            const pdfWin = window.open('','_blank');
            pdfWin.document.write(`
            <iframe width="100%" height="100%" src="${url}" allow="fullscreen">
            </iframe>
            `)
            pdfWin.document.title = title;
            const body = pdfWin.document.body;
            body.style.margin = '0';
            body.style.overflow = 'hidden';        
        } else {
            // https://help.aliyun.com/noticelist/articleid/1060057906.html
            // 升级内容：出于安全考虑，从2019年9月23日起，针对之后新建的Bucket，直接使用OSS提供的默认域名，从互联网访问OSS上该Bucket的图片类型文件
            fetch(url).then(res=>res.arrayBuffer()).then(buffer=>{
                const dataBase64 = `data:application/pdf;base64,${ToolBase64.encodeBuffer(buffer)}`
                const pdfWin = window.open('','_blank');
                pdfWin.document.write(`
                <iframe width="100%" height="100%" src="${dataBase64}" allow="fullscreen">
                </iframe>
                `);
                pdfWin.document.title = title;
                const body = pdfWin.document.body;
                body.style.margin = '0';
                body.style.overflow = 'hidden';
            });
        }
    } else {
        window.open(url, '_blank');
    }
}

/**
 * 防抖函数
 * https://juejin.cn/post/7003123145649422349
 * @param {*} func 
 * @param {*} wait 
 * @param {*} immediate true立即执行 false非立即执行
 */
export function debounce(fn, wait, immediate = false) {
    let timeout = null;
    return function() {
        let context = this;
        let args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            let callNow = !timeout;
            timeout = setTimeout(()=>{
                timeout = null;
            }, wait);
            if (callNow) func.apply(context, args);
        } else {
            timeout = setTimeout(() => {
                fn.apply(context, args);
            }, wait);
        }
    }
}

/**
 * 函数节流
 * https://juejin.cn/post/7003123145649422349
 * @param {*} fn 
 * @param {*} wait 延迟执行毫秒数
 * @param {*} type 1表示时间戳 2表示定时器
 */
export function throttle(fn, wait, type = 1) {
    let pre = null;
    let timeout = null;
    if (type === 1) {
        pre = 0;
    }
    return function() {
        let context = this;
        let args = arguments;
        if (type === 1) {
            let now = new Date().getTime();
            if (now - pre > wait) {
                fn.call(context, args);
                pre = now;
            }
        } else {
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null;
                    fn.call(context, args);
                }, wait);
            }
        }
    }
}