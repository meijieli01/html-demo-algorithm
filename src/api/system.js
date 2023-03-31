import request from '@/utils/request'

/**
 * @description 系统集成数据
 */
export function systemSystemBaseDate(data) {
  return request({
    url: '/system/systemBaseDate',
    method: 'POST',
    data: data,
  })
}

/**
 * @description oss 认证相关信息
 */
export function systemAuthorize(data) {
  return request({
    url: '/system/authorize',
    method: 'POST',
    data: data,
  })
}

/**
 * @description 树形结构返回所有菜单列表
 */
export function systemTreeList(data) {
  return request({
    url: '/system/treeList',
    method: 'POST',
    data: data,
  })
}
