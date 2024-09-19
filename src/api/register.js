
/**
 * @description smile ai1
 */
export function registerAiSmile1(data, apiIdx = 0, options = {}) {
    const srcApiList = `${import.meta.env.VITE_APP_SMILE_BASE},${import.meta.env.VITE_APP_SMILE_BASE2}`.split(',');
    return fetch(`${srcApiList[apiIdx]}/AI_smile1`, {
        body: data,
        mode: 'cors',
        method: 'POST',
        ...options,            
    });
}

/**
 * @description smile ai2
 */
export function registerAiSmile2(data, apiIdx = 0, options = {}) {
    const srcApiList = `${import.meta.env.VITE_APP_SMILE_BASE},${import.meta.env.VITE_APP_SMILE_BASE2}`.split(',');
    return fetch(`${srcApiList[apiIdx]}/AI_smile2`, {
        body: data,
        mode: 'cors',
        method: 'POST',
        ...options,            
    });
}

/**
 * @description smile ai3
 */
export function registerAiSmile3(data, apiIdx = 0, options = {}) {
    const srcApiList = `${import.meta.env.VITE_APP_SMILE_BASE},${import.meta.env.VITE_APP_SMILE_BASE2}`.split(',');
    return fetch(`${srcApiList[apiIdx]}/AI_smile3`, {
        body: data,
        mode: 'cors',
        method: 'POST',
        ...options,            
    });
}

/**
 * @description smile ai4
 */
export function registerAiSmile4(data, apiIdx = 0, options = {}) {
    const srcApiList = `${import.meta.env.VITE_APP_SMILE_BASE},${import.meta.env.VITE_APP_SMILE_BASE2}`.split(',');
    return fetch(`${srcApiList[apiIdx]}/AI_smile4`, {
        body: data,
        mode: 'cors',
        method: 'POST',
        ...options,            
    });
}
