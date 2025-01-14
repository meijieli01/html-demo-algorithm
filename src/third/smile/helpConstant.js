/**
 * 全局配置
 */
export const gConfigSmile = {
    // 辅助笑窗AABB
    auxSmileWindowAABB: true,
    // 测试牙齿点的极值是否正确
    auxShowTeethPoint: false,
    showLogRatio: false,
    debugColor: [0, 255, 0],
    // 长度单位
    unitLength: 0.02,
    factorLength: 0.3,
    // 长宽比
    unitRatio: 0.02,
    ratioDown: 70,
    ratioUp: 90,
    ratioMin: 0.7,
    ratioMax: 0.9,
    // 
    unitCorridor: 0.01,
    factorCorridor: 0.4,
    // 测试坐标点
    showSpaceDebug: false,
    isDev: false,
    isTrial: false, // 小程序使用
    isIos: false, // 小程序使用，判断是否是ios
    pollGapSecond: 1000 * 3, // 3秒请求一次
    showColorDebug: false,
}

/**
 * 11和21门牙数据
 */
export const ConfigTemplateImage = {
    strokeCount: 9, // 模板类型10=0~9
    colorCount: 6, // 颜色类型7=0~6
}

export const ValidTeethNum = [16,15,14,13,12,11,21,22,23,24,25,26];