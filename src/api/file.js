import request from '@/utils/request';
import qs from 'qs'
import store from '../store';

/**
 * @description 系统集成数据
 */
export function upload(data) {
  return request({
    url: '/admin/upload',
    // headers: { 'content-type': 'application/x-www-form-urlencoded' },
    headers: { 'content-type': 'multipart/form-data' },
    method: 'POST',
    data: data,
  })
}

/**
 * @description 系统集成数据
 */
export function callAi(data) {
  return request({
    url: '/admin/callAi',
    headers: { 'content-type': 'multipart/form-data' },
    method: 'POST',
    data: data,
  })
}
