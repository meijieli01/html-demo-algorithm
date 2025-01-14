class PathObject {
    constructor(x = 0, y = 0, type = '', visible = true) {
        this.path = null;
        this.x = x;
        this.y = y;
        this.type = type;
        this.visible = visible; // 可见性
    }
    update() {

    }
    getType() {
        return this.type;
    }
    getPath() {
        return this.path;
    }
    setVisible(visible) {
        this.visible = visible;
    }
}

export const PathType = {
    faceKeyPoint: 'faceKeyPoint', // 面部关键点
    auxSmilePoint: 'smileWindowPoint', // 笑窗点
    auxTeethPoint: 'toothExtremumPoint', // 牙齿上下左右点
    auxSpacePoint: 'auxSpacePoint', // 辅助坐标系的点
    smileWindowPoint: 'smileWindowPointAxx', // 辅助坐标系的点
    auxIncisal: 'auxIncisalPoint', // 切缘曲线控制点
    svgArrow: 'svg-arrow',
}

/**
 * 类型
 */
export const KPType = {
    // 面部识别关键点
    pupilLeft : 0, // 左瞳孔
    pupilRight : 1, // 右瞳孔
    glaballa : 2, // 眉间
    nasalApex : 3, // 鼻尖
    orisAngleLeft : 4, // 左嘴角
    orisAngleRight : 5, // 右嘴角
    philtrum : 6, // 人中
    chin : 7, // 下巴

    // 辅助点
    incisalLeft: 8, // 下唇曲线左边
    incisalRight: 9, // 下唇曲线右边
    // 依次左上-右上-右下-左下
    auxSmileLT: 10, 
    auxSmileRT: 11,
    auxSmileRB: 12,
    auxSmileLB: 13,

    // 笑窗点
    smileWindow: 100,
    // 辅助坐标点
    auxSpace: 200,
    // 初始控制点
    originIncisalCtrl: 300,
}

/**
 * 创建关键点
 * @param {*} x 
 * @param {*} y 
 * @param {*} options 
 * @returns 
 */
export class KeyPointPath extends PathObject {
    constructor(x, y, kpType, options = {}) {
        const type = options.type || PathType.faceKeyPoint;
        super(x, y, type, type === PathType.faceKeyPoint);
        this.kpType = kpType;
        this.options = options;
        this.update();
    }
    update(info = {}) {
        // console.log('path update', info);
        const { options } = this;
        if (info.x) this.x = info.x;
        if (info.y) this.y = info.y;
        if (info.radius) options.radius = info.radius;
        const radius = options.radius || 1; 
        let kpPath = null;
        if (options.canvas) {
            // weixin-mini
            kpPath = options.canvas.createPath2D();
        } else {
            // web html5
            kpPath = new Path2D();
        }
        kpPath.arc(this.x, this.y, radius, 0, Math.PI * 2);
        this.path = kpPath;
        return kpPath;    
    }
    getKpType() {
        return this.kpType;
    }
}

const strArrowSvgPath = 'M9,18C9,18,0,27,0,27C0,27,2.115,29.115000000000002,2.115,29.115000000000002C2.115,29.115000000000002,7.5,23.745,7.5,23.745C7.5,23.745,7.5,36,7.5,36C7.5,36,10.5,36,10.5,36C10.5,36,10.5,23.745,10.5,23.745C10.5,23.745,15.885,29.115000000000002,15.885,29.115000000000002C15.885,29.115000000000002,18,27,18,27C18,27,9,18,9,18Z';
export class ArrowPath extends PathObject {
    constructor(x, y, dir, options = {}) {
        super(x, y, dir);
        this.options = options;
        this.radius = 10;
        this.update();        
    }
    update() {
        const { options, x, y, radius } = this;
        let kpPath = null;
        if (options.canvas) {
            // weixin-mini
            kpPath = options.canvas.createPath2D();            
        } else {
            // web html5
            kpPath = new Path2D();
            kpPath.addPath(new Path2D(strArrowSvgPath), new DOMMatrix([1, 0, 0, 1, x - radius / 2,y + radius / 2]));
        }
        kpPath.arc(this.x, this.y, radius, 0, Math.PI * 2);
        this.path = kpPath;
        return kpPath;
    }
}