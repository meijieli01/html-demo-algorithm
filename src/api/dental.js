
import request from '../utils/requestDental';

/**
 * @description inQueue
 */
export function dentalStep1(data) {
    return request({
        url: '/AI_oral_GPT',    
        method: 'POST',
        data: data,
    });
}

/**
 * @description smile ai1
 */
export function dentalStep2(data, options = {}) {
    const apiDental = `https://studio-china-dev--treatment-generation-fastapi-app.modal.run/generate`;
    return fetch(apiDental, {
        body: data,
        mode: 'cors',
        method: 'POST',
        ...options,            
    });
}

