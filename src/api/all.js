import request from '@/utils/request';
import qs from 'qs'

/**
 * @description 上传文件
 */
export function upload(data) {
  return request({
    url: '/admin/uploadFile',
    headers: { 'content-type': 'multipart/form-data' }, // 有文件要这个格式
    method: 'POST',
    data: data,
  })
}

/**
 * @description 调用AI
 */
export function callAi(data) {
  return request({
    url: '/admin/callAiRequest',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    timecount: 1000*60*10, // 十分钟
    data: qs.stringify(data),
  })
}


/**
 * @description 调用AI
 */
export function callAiRetainer(data) {
  return request({
    url: '/admin/retainerRequest',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    timecount: 1000*60*10, // 十分钟
    data: qs.stringify(data),
  })
}


/**
 * @description 调用AI
 */
export function callAiRetainerNew(data) {
  return request({
    url: '/admin/retainerRequestNew',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    timecount: 1000*60*10, // 十分钟
    data: qs.stringify(data),
  })
}


/**
 * @description 加载调用成功历史记录
 */
export function getHistory(data) {
  return request({
    url: '/admin/getAiRequest',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    data: qs.stringify(data),
  })
}
