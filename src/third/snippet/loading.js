import { svgArcPath, getRandomInt } from './math';
// 设置一个loading的动态层
const UiType = {
    infinity: 'Infinity',
    percentage: 'Percentage',
}

const ud = {
    zIndex: 5,
    elParent: null,
    elLoading: null,
    elSvgParent: null,
    elText: null,
    message: '',
    colorBegin: '--bs-primary',
    colorEnd: '--bs-info',
    colorText: 'text-info',
    uiType: UiType.infinity,
}

function createLoadingElement(hasImage = true, showClose = true, showText = true) {
    // 页面容器
    const domElement = document.createElement('div');
    domElement.id = `idLoading${Date.now()}`
    domElement.classList.add('position-absolute', 'top-0', 'start-0', 'w-100', 'h-100', 'd-flex', 'flex-column', 'justify-content-center');
    domElement.style.zIndex = ud.zIndex;
    // 遮层
    const elWrapper = document.createElement('div');
    elWrapper.classList.add('position-absolute', 'top-0', 'start-0', 'h-100', 'w-100', 'bg-light');
    elWrapper.style.opacity = 0.5;
    elWrapper.style.zIndex = ud.zIndex + 1;
    // 文字提示
    const elChild1 = document.createElement('div');
    elChild1.classList.add('w-100', 'text-center', 'position-relative', 'd-flex', 'flex-column', 'justify-content-center');
    if (showClose) {
        let elBtnClose = document.createElement('button');
        elBtnClose.type = 'button';
        elBtnClose.classList.add('btn-close', 'm-auto');
        elBtnClose.setAttribute('aria-label', 'close');
        elBtnClose.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            hide(0);
        });
        elChild1.appendChild(elBtnClose);
    }    
    if (showText) {
        ud.elText = document.createElement('label');
        elChild1.appendChild(ud.elText);
    }
    elChild1.style.zIndex = ud.zIndex + 2;
    domElement.appendChild(elChild1);
    let elChild2 = null;
    if (hasImage) {
        elChild2 = document.createElement('div');
        elChild2.style.height = '100px';
        elChild2.classList.add('position-relative', 'bg-transparent');        
        const elSvgWrap = document.createElement('div');
        elSvgWrap.classList.add('position-absolute', 'w-100', 'h-100')
        elSvgWrap.innerHTML = `
        <svg class="percentage" version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            xmlns:xlink="http://www.w3.org/1999/xlink" 
            x="0px" y="0px" viewBox="0 0 100 100"
            style="enable-background:new 0 0 100 100;height:100%;width:100%" xml:space="preserve"
        ></svg>
        `;
        elChild2.appendChild(elSvgWrap);
        elChild2.style.zIndex = ud.zIndex + 2;
    }
    domElement.appendChild(elWrapper);
    if (hasImage) {
        domElement.appendChild(elChild2);
        ud.elSvgParent = elChild2;
        updateSvgInnerHtml();
    }
    return domElement;
}

function show(elParent, {zIndex, message, onlyMsg, showClose, type}) {
    if (ud.elParent && ud.elLoading &&  elParent != ud.elParent) {
        ud.elParent.removeChild(ud.elLoading);
        ud.elLoading = null;
    }
    if (!ud.elLoading) {
        ud.zIndex = zIndex || 50;
        ud.elParent = elParent;
        ud.elLoading = createLoadingElement(onlyMsg ? false : true, showClose);
        ud.elParent.appendChild(ud.elLoading);
        update(message, type);
    } else {
        update(message, type);
    }
}

function tip(message, zIndex = 500, onlyMsg = false, showClose = false) {
    show(document.body, {message, zIndex, onlyMsg, showClose});
}
function hide(delayTime = 1500) {
    setTimeout(() => {
        if (ud.elParent) {
            if (ud.elLoading) {
                ud.elParent.removeChild(ud.elLoading);
                ud.elLoading = null;
            }
        }
    }, delayTime);
}

function updateSvgInnerHtml() {
    if (ud.elSvgParent) {
        ud.elSvgParent.children[0].children[0].innerHTML = svgInnerHtml();
    }
}
function svgInnerHtml() {
    let html = '';
    if (ud.uiType == UiType.percentage) {
        html = `
        <defs>
            <linearGradient id="gradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="00%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue(ud.colorBegin)}" stop-opacity="1" />
                <stop offset="100%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue(ud.colorEnd)}" stop-opacity="1" />
            </linearGradient>
        </defs>
        <!-- <rect x="0" y="0" width="100" height="100" fill="none" stroke="url(#gradient1)" stroke-width="1" /> -->
        <path d="M 50 50 A 47 47 0 1 0 50 3" fill="none" stroke="gray" stroke-width="6"></path>
        <path d="M 50 50 A 47 47 0 1 0 50 3" fill="none" stroke="url(#gradient1)" stroke-width="6"></path>
        `;
    } else {
        html = `
        <defs>
            <linearGradient id="gradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="00%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue(ud.colorBegin)}" stop-opacity="1" />
                <stop offset="100%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue(ud.colorEnd)}" stop-opacity="0" />
            </linearGradient>
        </defs>
        <!-- <rect x="0" y="0" width="100" height="100" fill="none" stroke="url(#gradient1)" stroke-width="1" /> -->
        <path d="M3 50 A47 47 00 1 0 50 3" fill="none" stroke="url(#gradient1)" stroke-width="6">
            <animateTransform attributeName="transform"  begin="0s" dur="2s"  type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
        </path>
        `;
    }
    return html;
}

/**
 * 
 * @param {*} message 
 * @param {*} type 样式
 */
function update(message, type) {
    if (ud.uiType !== UiType.infinity) {
        ud.uiType = UiType.infinity;
        updateSvgInnerHtml();
    }
    if (ud.elLoading) {
        ud.elLoading.style.zIndex = ud.zIndex;
        ud.elText.textContent = message;
        ud.elText.className = '';
        ud.elText.classList.add(type || ud.colorText);
        ud.message = message;
    }
}

function updatep(per, message, isStatic = true) {
    if (isStatic) {
        if (ud.uiType !== UiType.percentage) {
            ud.uiType = UiType.percentage;
            updateSvgInnerHtml();
        }
    } else {
        ud.uiType = UiType.infinity;
        updateSvgInnerHtml();
    }
    if (ud.elLoading) {
        const elSvg = ud.elLoading.querySelector('.percentage')
        if (isStatic) {
        const pathList = elSvg.querySelectorAll('path');
            pathList[1].setAttribute('d', svgArcPath(50, 50, 47, 0, 3.60 * per));
            pathList[0].setAttribute('d', svgArcPath(50, 50, 47, 0, 3.60 * 100));
        }
        ud.elLoading.style.zIndex = ud.zIndex;
        ud.elText.textContent = message;
        ud.elText.className = '';
        ud.elText.classList.add(ud.colorText);
        ud.message = message;
    }
}

function updatepOffset(base = 90, max = 10, min = 0, isStatic = true) {
    const per = base < 100 ? base + getRandomInt(max, min) : 100;
    updatep(per, `${per}%`, isStatic);
}

function config(options = {}) {
    if (options.colorBegin) ud.colorBegin = options.colorBegin;
    if (options.colorEnd) ud.colorEnd = options.colorEnd;
    if (options.colorText) ud.colorText = options.colorText;
}

const index = {
    state: ud,
    show: show,
    hide: hide,
    update: update,
    updatep: updatep,
    config: config,
    tip: tip,
    updatepOffset,
};

export default index;