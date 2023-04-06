// 默认模型颜色
export const colorOfDefault = '#B38E6B';
export const colorTidEven = '#C41773';
export const colorTidOdd = '#20CB3C';


/**
 * /[^\d]/g 去除非数字
 * /[^\.\d]/g 去除非数字和小数点
 */

/**
 * CT牙号的配置颜色
 */
export function getCtColorByName(name) {
    const tid = parseInt(name.replace(/[^1-9]/gi,''))
    if (tid > 0) {
        if (tid%2==0) return colorTidOdd;
        return colorTidEven;
    }
    return colorOfDefault;
}