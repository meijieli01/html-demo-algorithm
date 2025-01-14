export function backTraceNode(el) {
    if (!el?.children?.length) {
      return [el]
    }
    return [el, ...Array.from(el.children).map(backTraceNode)].flat()
}
// 1、从html字符串中提取出bolb文件临时路径
const getVideoListByHtml = (html) => {
    const dom = document.createElement('div')
    dom.innerHTML = html
    return backTraceNode(dom)
      .filter((item) => item.nodeName === 'VIDEO')
      .map((v) => v.src)
}
  
// 2、根据临时路径，生成相应的File
const getFileFromBlobUrl = async (blobUrlList) => {
    const pList = list.map((url) => {
      return fetch(url)
    })
    const data = await Promise.all(pList)
    const blobList = data.map((v) => v.blob())
    const res = await Promise.all(blobList)
    return res.map(blob=>{
      return new File([blob], 'video.webm', { type: 'video/webm' })
    })
}
  
// 3、文件上传并替换对应的url
const replaceVideoUrl = (html, hashUrlMapList) => {
    const dom = document.createElement('div')
    dom.innerHTML = html
    const videoList = backTraceNode(dom).filter((item) => item.nodeName === 'VIDEO')
    videoList.forEach((el) => {
      el.src = 'https:' + findUrlByHash(el.src, hashUrlMapList)
    })
    return dom.innerHTML
}

/**
 * 是否支持MediaRecorder
 * @returns 
 */
export const isSupportRecorder = () => {
    const types = ['video/webm; codecs=vp9', 'video/webm']
    const isTypeSupport = types.some((v) => MediaRecorder.isTypeSupported(v))
    const isApiSupport = Boolean(navigator.mediaDevices)
    return isApiSupport && isTypeSupport
}

export function getMediaRecorder() {
    return new Promise(async (resolve)=>{
        // 获取用户屏幕录制的权限
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        })

        // 确认当前环境所支持的屏幕录制文件类型
        const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ? 'video/webm; codecs=vp9' : 'video/webm'

        // 需要用到步骤1stream流和和步骤2的mimeType
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: mime
        })

        resolve(mediaRecorder);
    })
}
