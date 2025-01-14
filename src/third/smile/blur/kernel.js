/**
 * python那边根据高斯公式算出来的系数
 */
const pythonKernel9x9 = [
    0.00001, 0.00008, 0.00032, 0.00075, 0.00100, 0.00075, 0.00032, 0.00008, 0.00001,
    0.00008, 0.00057, 0.00231, 0.00538, 0.00713, 0.00538, 0.00231, 0.00057, 0.00008,
    0.00032, 0.00231, 0.00945, 0.02196, 0.02910, 0.02196, 0.00945, 0.00231, 0.00032,
    0.00075, 0.00538, 0.02196, 0.05107, 0.06765, 0.05107, 0.02196, 0.00538, 0.00075,
    0.00100, 0.00713, 0.02910, 0.06765, 0.08962, 0.06765, 0.02910, 0.00713, 0.00100,
    0.00075, 0.00538, 0.02196, 0.05107, 0.06765, 0.05107, 0.02196, 0.00538, 0.00075,
    0.00032, 0.00231, 0.00945, 0.02196, 0.02910, 0.02196, 0.00945, 0.00231, 0.00032,
    0.00008, 0.00057, 0.00231, 0.00538, 0.00713, 0.00538, 0.00231, 0.00057, 0.00008,
    0.00001, 0.00008, 0.00032, 0.00075, 0.00100, 0.00075, 0.00032, 0.00008, 0.00001,
];

// export 
function getGaussianKernel(rows, cols, sigmax, sigmay) {
    const y_mid = (rows - 1) / 2.0;
    const x_mid = (cols - 1) / 2.0;
    const x_spread = 1.0 / (sigmax * sigmax * 2);
    const y_spread = 1.0 / (sigmay * sigmay * 2);
    
    const gauss_x = [];
    for (let i=0; i < cols; i++) {
        let x = i - x_mid;
        gauss_x.push(Math.exp(-x * x * x_spread));
    }
    const n_rows = x_mid - y_mid;
    let sum = 0;
    const kernel = new Float32Array(rows * cols);
    for (let i = 0; i < rows; i++) {
        const tmp = gauss_x[n_rows + i]
        for (let j = 0; j < cols; j++) {
            const v = gauss_x[j] * tmp;
            sum += v;
            kernel[i * rows + j] = v;
        }
    }
    const res = [];
    for (let i =0; i < kernel.length; i++) {
        kernel[i] = kernel[i] / sum;
        res.push(kernel[i]);
    }
    // return kernel;
    return res;
}

// 9x9
// console.log(getGaussianKernel(9,9,(9-1)/6.0,(9-1)/2.0));
// console.log(getGaussianKernel(51,51,(51-1)/6.0,(51-1)/2.0));

export const gkSize9 = 11, gkSize51 = 51;
export const gaussianKernel9x9 = getGaussianKernel(gkSize9, gkSize9, (gkSize9 - 1) / 6.0);
export const gaussianKernel51x51 = getGaussianKernel(gkSize51, gkSize51, (gkSize51 - 1) / 6.0);