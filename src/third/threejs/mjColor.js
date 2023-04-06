// 默认模型颜色
export const colorOfDefault = '#B38E6B';
export const colorTidEven = '#C41773';
export const colorTidOdd = '#20CB3C';


/**
 * /[^\d]/g 去除非数字
 * /[^\.\d]/g 去除非数字和小数点
 */
const primaryTeethList = [
    18,17,16,15,14,13,12,11,
    21,22,23,24,25,26,27,28,
    48,47,46,45,44,43,42,41,
    31,32,33,34,35,36,37,38,
]

/**
 * CT牙号的配置颜色
 */
export function getCtColorByName(name) {
    const tid = parseInt(name.replace(/[^1-9]/gi,''))
    if (tid > 0) {
        const index = primaryTeethList.indexOf(tid);
        if (index % 2 == 0) return colorTidOdd;
        return colorTidEven;
    }
    return colorOfDefault;
}