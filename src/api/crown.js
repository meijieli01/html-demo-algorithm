import request from '@/utils/request';
import qs from 'qs'

/**
 * @description 上传文件
 */
export function upload(data) {
  return request({
    url: '/admin/uploadCrown',
    // headers: { 'content-type': 'application/x-www-form-urlencoded' }, // 无文件使用此格式
    headers: { 'content-type': 'multipart/form-data' }, // 有文件要这个格式
    method: 'POST',
    data: data,
  })
}

/**
 * @description 调用AI-crown
 */
export function callAiCrown(data) {
  return request({
    url: '/admin/callAiCrown',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    timecount: 1000*60*5, // 五分钟
    data: qs.stringify(data),
  })
}

/**
 * @description 加载Crown调用成功历史记录
 */
export function getHistoryCrown(data) {
  return request({
    url: '/admin/getCrownRequest',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    data: qs.stringify(data),
  })
}
