import request from '@/utils/request'

/**
 * @description 登录
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export function adminLogin(data) {
  return request({
    url: '/admin/login',
    method: 'POST',
    data: data,
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

/**
 * @description 根据用户名获取通用用户信息       这个主要是用户认证 远程调用使用
 */
export function adminLoadByUsername(data) {
  return request({
    url: '/admin/loadByUsername',
    method: 'GET',
    params: data,
  })
}

/**
 * @description 当前用户信息
 */
export function adminCUserInfo(data) {
  return request({
    url: '/admin/cUserInfo',
    method: 'POST',
    data: data,
  })
}

/**
 * @description 当前用户信息并返回菜单树
 */
export function adminCUserInfoBackTree(data) {
  return request({
    url: '/admin/cUserInfoBackTree',
    method: 'POST',
    data: data,
  })
}

/**
 * @description 登录并返回用户信息和菜单树
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export function adminLoginBackInfoTree(data) {
  return request({
    url: '/admin/loginBackInfoTree',
    method: 'POST',
    data: data,
  })
}
