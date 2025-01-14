import { degree2Radian } from "./math/utils";
import decomposeDommatrix from './decompose/decomposeDommatrix';
import { ExifOrientationCode } from './helpExif'
import { ConfigColor } from './color';
import { imageRotate } from './helpCanvas';

/**
 * 变换节点
 */
export class mjElementTransform {
    constructor(options = {}) {
        this.elParent = null;
        this.elChild = null;
        this.options = options;
        const info = {
            x: 0,
            y: 0,
        }
        this.info = info;
        const zoom = (e) => {
            let mat = new DOMMatrix(this.elChild ? this.elChild.style.transform : '');
            const factor = e.deltaY < 0 ? 1.1 : 0.9
            mat.a *= factor;
            mat.b *= factor;
            mat.c *= factor;
            mat.d *= factor;
            this.update(mat);
        }
        this.zoom = zoom;
        const mousedown = (e) => {
            info.x = e.clientX;
            info.y = e.clientY;
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
        }
        this.mousedown = mousedown;
        const mouseUp = () => {
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        }
        this.mouseUp = mouseUp;
        const mouseMove = (e) => {
            let moveX = e.clientX - info.x;
            let moveY = e.clientY - info.y;
            // 更新
            info.x = e.clientX;
            info.y = e.clientY;  
            let mat = new DOMMatrix(this.elChild ? this.elChild.style.transform : '');
            mat.translateSelf(moveX, moveY);
            this.update(mat);
        }
        this.mouseMove = mouseMove;
        const updateRotate = (deg) => {
            info.x = 0;
            info.y = 0;
            let mat = null;
            if (this.elChild.style.transform) {
                mat = new DOMMatrix(this.elChild.style.transform);
                const res = decomposeDommatrix(mat);
                mat = new DOMMatrix();
                mat.scaleSelf(res.scaleX, res.scaleY, res.scaleZ);
                mat.translateSelf(res.translateX, res.translateY, res.translateZ);
                mat.rotateSelf(deg);
            } else {
                mat = new DOMMatrix();
                mat.rotateSelf(degree2Radian(deg));
            }
            this.update(mat);
        }
        this.updateRotate = updateRotate;
    }
    bind(elParent, elChild) {
        this.info.x = 0;
        this.info.y = 0;
        this.elParent = elParent;
        this.elChild = elChild;        
        elParent.addEventListener('wheel', this.zoom);
        elParent.addEventListener('mousedown', this.mousedown);
    }
    unbind() {
        const { elParent } = this;
        elParent.removeEventListener('wheel', this.zoom);
        elParent.removeEventListener('mousedown', this.mousedown);
    }
    update(mat) {
        const {elChild, options} = this;
        elChild.style.transform = mat.toString();
        if (options.callback) options.callback(mat);
    }
}

/**
 * dom小工具
 */
export class DomToolkit {
    constructor() {

    }
    /**
     * 当前element旋转角度
     * @param {*} deg 
     * @param {*} el 
     * @returns 
     */
    static rotate = (deg, scale = 1.5, el = '') => {
        if (deg) {
            let mat = new DOMMatrix(el ? el.style.transform: '');
            mat.rotateSelf(deg);
            mat.scaleSelf(scale);
            return mat.toString();
        }
        return '';
    }
    /**
     * element的class name
     * @param {*} el 
     * @param {*} pattern 
     */
    static clsName(el, pattern) {
        let names = [];
        if (typeof(el.className) == 'string') {
            names = el.className.split(' ');            
        }
        if (names.length > 0) {
            names = names.filter(e=>e.startsWith(pattern));
            if (names.length > 0) return names;
        }
        if (el.parentElement !== document.body) {
            return this.clsName(el.parentElement, pattern);
        }
        return names;
        return el.className.split(' ').filter(e=>e.startsWith(pattern));
    }
    
    /**
     * element的class name
     * @param {*} el 
     * @param {*} listClsName 
     */
    static findClsName(el, listClsName) {
        let idx = -1;
        let names = [];
        if (typeof(el.className) == 'string') {
            names = el.className.split(' ');
            idx = names.findIndex(e=>listClsName.indexOf(e) > -1);
        }
        if (idx > -1) {
            return listClsName.indexOf(names[idx]);
        }
        if (el.parentElement !== document.body) {
            return this.findClsName(el.parentElement, listClsName);
        }
        return idx;
    }
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
        matUpdate(mat);
    }
    elParent.addEventListener('wheel', zoom);
    elParent.addEventListener('mousedown', mousedown);
    const mousedown = (e) => {
        info.x = e.clientX;
        info.y = e.clientY;
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    }
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
        mat.translateSelf(moveX, moveY);
        elChild.style.transform = mat.toString();
        matUpdate(mat);
    }
    options.rotateLeft = () => updateRotate(-90);
    options.rotateRight = () => updateRotate(90);
    const matUpdate = (mat) => {
        if (options.callback) options.callback(mat);
    }
    const updateRotate = (deg) => {
        info.x = 0;
        info.y = 0;
        info.rotate += deg;
        let matOld = new DOMMatrix(elChild.style.transform);
        let matNew = new DOMMatrix().rotate(deg);
        matNew = matNew.multiplySelf(matOld);
        elChild.style.transform = matNew.toString();
        matUpdate(mat);
    }
}

/**
 * http://phrogz.net/tmp/canvas_zoom_to_cursor.html
 * @param {*} elCanvas 
 * @param {*} callback 
 */
export function bindCanvasPanZoom(elCanvas, options = {}) {
    const callback = options.updateFrame || (()=>{});
    const isMininumZoom = options.minimumZoom || false;
    let lockZoom = false;
    if (options.lockZoom === true) lockZoom = true;
    const fnDegree = options.degree || (()=>0);
    const ctx = elCanvas.getContext('2d', { willReadFrequently : true });

    const redraw = () => {
        // Clear the entire canvas
        const p1 = ctx.transformedPoint(0,0);
        const p2 = ctx.transformedPoint(elCanvas.width, elCanvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
        callback();
    }
    // 追加事件处理svg
    trackTransforms(ctx);
    // 第一次默认旋转角度
    ctx.rotate(degree2Radian(fnDegree()));

    let lastX = elCanvas.width / 2, lastY = elCanvas.height / 2,
        dragStart, dragged = false,
        scaleFactor = 1.1;
        
	// elCanvas.addEventListener('mousedown', function(event){
    //     lastX = event.offsetX || (event.pageX - elCanvas.offsetLeft);
    //     lastY = event.offsetY || (event.pageY - elCanvas.offsetTop);
    //     dragStart = ctx.transformedPoint(lastX,lastY);
    //     dragged = false;
	// }, false);

	// elCanvas.addEventListener('mousemove',function(event) {
    //     lastX = event.offsetX || (event.pageX - elCanvas.offsetLeft);
    //     lastY = event.offsetY || (event.pageY - elCanvas.offsetTop);
    //     dragged = true;
    //     if (dragStart){
    //         var pt = ctx.transformedPoint(lastX, lastY);
    //         ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
    //         redraw();
    //     }
    // },false);
    // elCanvas.addEventListener('mouseup',function(event){
    //     dragStart = null;
    //     if (!dragged) zoom(event.shiftKey ? -1 : 1 );
    // }, false);

    const zoom = function(clicks){
        var pt = ctx.transformedPoint(lastX,lastY);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        if (lockZoom) {
            // ctx.scale(factor, factor);
        } else {
            ctx.scale(factor, factor);
        }
        // 需要设置最小的缩放比例
        if (isMininumZoom && !lockZoom) {
            const cur = ctx.getTransform();
            if (cur.a < 1) {
                ctx.setTransform(1,0,0,1,cur.e, cur.f);
                ctx.rotate(degree2Radian(fnDegree()));
            }
        }
        ctx.translate(-pt.x, -pt.y);
        redraw();
    }

    const handleScroll = function(event){
        var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
        if (delta) zoom(delta);
        return event.preventDefault() && false;
    };
    elCanvas.addEventListener('DOMMouseScroll',handleScroll,false);
    elCanvas.addEventListener('mousewheel',handleScroll,false);

    // 处理svg
    function trackTransforms(ctx){
		let xform = new DOMMatrix();
		ctx.getTransform = function(){ return xform; };
		
		const savedTransforms = [];
		var save = ctx.save;
		ctx.save = function(){
			savedTransforms.push(xform.translate(0,0));
			return save.call(ctx);
		};
		var restore = ctx.restore;
		ctx.restore = function(){
			xform = savedTransforms.pop();
			return restore.call(ctx);
		};

		var scale = ctx.scale;
		ctx.scale = function(sx,sy){
			xform = xform.scale(sx,sy);
			return scale.call(ctx,sx,sy);
		};
		var rotate = ctx.rotate;
		ctx.rotate = function(radians){
			xform = xform.rotate(radians*180/Math.PI);
			return rotate.call(ctx,radians);
		};
		var translate = ctx.translate;
		ctx.translate = function(dx,dy){
			xform = xform.translate(dx,dy);
			return translate.call(ctx,dx,dy);
		};
		var transform = ctx.transform;
		ctx.transform = function(a,b,c,d,e,f){
			let m2 = new DOMMatrix();
			m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
			xform = xform.multiply(m2);
			return transform.call(ctx,a,b,c,d,e,f);
		};
		var setTransform = ctx.setTransform;
		ctx.setTransform = function(a,b,c,d,e,f){
			xform.a = a;
			xform.b = b;
			xform.c = c;
			xform.d = d;
			xform.e = e;
			xform.f = f;
			return setTransform.call(ctx,a,b,c,d,e,f);
		};
		let pt  = new DOMPoint();
		ctx.transformedPoint = function(x,y){
			pt.x=x; pt.y=y;
			return pt.matrixTransform(xform.inverse());
		}

        /**
         * 屏幕像素偏移量
         * @param {*} xPixel 
         * @param {*} yPixel 
         * @param {*} ox 
         * @param {*} oy 
         * @returns 
         */
        ctx.screenToCanvas = function(xPixel, yPixel, ox, oy) {
            let x = ox + xPixel / xform.a;
            let y = oy + yPixel / xform.d;
            return {x, y}
        }
        ctx.canvasToScreen = function(ox, oy) {
            let x = ox / xform.a;
            let y = oy / xform.d;
            return {x, y}
        }
        ctx.reset = function() {
            const mat = xform.inverse();
            ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.e, mat.f);
        }
        ctx.testScale = function(xCenter, yCenter, factor) {
            var pt = ctx.transformedPoint(xCenter, yCenter);
            ctx.translate(pt.x, pt.y);
            ctx.scale(factor, factor);
            ctx.translate(-pt.x, -pt.y);
        }
	}

    return ctx;
}

/**
 * 
 * @param {*} bitmap 
 * @returns 
 */
export function bitmap2ImageUrl(bitmap) {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    return new Promise((resolve)=>{
        canvas.toBlob(blob=>{
            resolve(URL.createObjectURL(blob));
        }, ConfigColor.imgType, ConfigColor.imgQulity);
    });
}

export function save2File(blob, filename) {
    const aLink = document.createElement('a');
    const herf = window.URL.createObjectURL(new Blob([blob]));
    aLink.href = herf;
    aLink.download = filename;
    aLink.click();
}
