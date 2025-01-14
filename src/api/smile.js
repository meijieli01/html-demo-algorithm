import request from '../utils/request';

/**
 * @description inQueue
 * @param {string} id 唯一标识
 * @param {number} queue 1-队列12-队列2默认为1
 */
export function smileInQueue(data) {
    return request({
        url: '/smile/inQueue',    
        method: 'POST',
        data: data,
    });
}

/**
 * @description 获取结果 每5s请求一次
 * @param {string} id 唯一标识
 * @param {number} queue 1-队列12-队列2默认为1
 */
export function smileGetResult(data) {
    return request({
        url: '/smile/getResult',    
        method: 'POST',
        data: data,
    });
}

/**
 * @description 释放ai执行状态
 * @param {string} id 唯一标识
 * @param {number} queue 1-队列12-队列2默认为1
 */
export function smileRelease(data) {
    return request({
        url: '/smile/release',    
        method: 'POST',
        data: data,
    });
}

/**
 * @description 获取队列信息
 */
export function smileGetQueueInfo(data) {
    return request({
        url: '/smile/getQueueInfo',    
        method: 'GET',
        params: data,
    });
}

/**
 * @description 清空队列信息
 */
export function smileClearQueue(data) {
    return request({
        url: '/smile/clearQueue',    
        method: 'GET',
        params: data,
    });
}
