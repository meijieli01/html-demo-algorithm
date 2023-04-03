import request from '@/utils/request'
import qs from 'qs'

/**
 * @description 登录
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export function adminLogin(data) {
  return request({
    url: '/admin/login',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
    // data: data,
    data: qs.stringify(data),
  })
}

/**
 * @description 登录并返回用户信息
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export function adminLoginBackInfo(data) {
  return request({
    url: '/admin/loginBackInfo',
    method: 'POST',
    data: data,
  })
}

/**
 * @description 退出登录
 */
export function adminLogout(data) {
  return request({
    url: '/admin/logout',
    method: 'POST',
    data: data,
  })
}
