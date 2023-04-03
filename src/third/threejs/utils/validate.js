const blobPattern = new RegExp('^blob:')

export function isBlob(url) {
  if (blobPattern.test(url)) return true
  return false
}
export function checkUrl() {
  const isBlob = (url) => {
    if (blobPattern.test(url)) return true
    return false
  }
  return {
    isBlob,
  }
}
export const fname = (filename) => {
  const pos = filename.lastIndexOf('.')
  return filename.substr(0, pos)
}

export const uniqueName = (filename) => {
  const idx = filename.lastIndexOf('.')
  const prefix = filename.substr(0, idx)
  const postfix = filename.substr(idx)
  return `${prefix}.${Date.now()}${postfix}`
}

// 生产模型类型
// rXXX 保持器 最后保持器与步长保持器
// mesh or Template 常规模型与模板
// 切割线 cutline
export const modelTypeList = [
  { src: 'lowerMesh', dst: 'urlLower' },
  { src: 'upperMesh', dst: 'urlUpper' },
  { src: 'lowerTemplate', dst: 'urlLowerTemplate' },
  { src: 'upperTemplate', dst: 'urlUpperTemplate' },
  { src: 'rlower', dst: 'urlRLower' }, 
  { src: 'rupper', dst: 'urlRUpper' },
  { src: 'rstepLower', dst: 'urlRStepLower' },
  { src: 'rstepUpper', dst: 'urlRStepUpper' },
  { src: 'lowerCutline', dst: 'urlLowerCutline' },
  { src: 'upperCutline', dst: 'urlUpperCutline' },
]