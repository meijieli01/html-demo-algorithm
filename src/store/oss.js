// import { ossAuthorize } from '@/api/oss'
import { systemAuthorize } from '@/api/system'

const state = {
  ossClient: '',
  ossTime: '',
}

const mutations = {
  setOSSOptions: (state, options) => {
    // 清除
    if (!options) {
      state.ossClient = ''
      state.ossTime = ''
      return
    }
    const client = new options.OSS({
      accessKeyId: options.AccessKeyId,
      accessKeySecret: options.AccessKeySecret,
      stsToken: options.SecurityToken,
      endpoint: import.meta.env.VITE_APP_OSS_ENDPOINT,
      bucket: import.meta.env.VITE_APP_OSS_BUCKET,
    })
    state.ossClient = client
    state.ossTime = new Date().getTime()
  },
}

const actions = {
  getOSSToken: (function () {
    let process = false
    return () =>
      new Promise((resolve, reject) => {
        if (process) {
          reject('process')
          return
        }
        process = true
        Promise.all([
          // ossAuthorize(),
          systemAuthorize(),
          import(/* webpackChunkName: "alioss" */ 'ali-oss'),
        ])
          .then((res) => {
            mutations.setOSSOptions(state, {
              ...res[0].data,
              OSS: res[1].default,
            })
            process = false
            resolve(state)
          })
          .catch((err) => {
            reject(err)
          })
      })
  })(),
  getOSSUrl({ state, commit, dispatch }, address, options) {
    function createOSSSrc() {
      let option = { expires: 1200 }
      if (options && options.isImage) {
        option.process = options.process
      }
      return state.ossClient.signatureUrl(address, option)
    }
    return new Promise((resolve) => {
      // oss临时token过期,清除后重载
      const ifExpired = (new Date().getTime() - state.ossTime) / 1000 / 60 > 10
      if (state.ossTime && ifExpired) {
        commit('setOSSOptions', false)
        resolve(dispatch('getOSSUrl', address, options))
        return
      }
      // 存在ossClient直接解析返回
      if (state.ossClient) {
        resolve(createOSSSrc())
        return
      }
      dispatch('getOSSToken')
        .then(() => {
          resolve(createOSSSrc())
        })
        .catch((err) => {
          if (err === 'process') {
            setTimeout(() => {
              resolve(dispatch('getOSSUrl', address, options))
            }, 400)
          }
        })
    })
  },
  putOSSFile({ state, commit, dispatch }, { file, path }) {
    function upload(resolve) {
      state.ossClient.put(path, file).then((res) => {
        if (res.res.statusCode === 200) resolve(res.name)
      })
    }
    return new Promise((resolve) => {
      // oss临时token过期,清除后重载
      const ifExpired = (new Date().getTime() - state.ossTime) / 1000 / 60 > 10
      if (state.ossTime && ifExpired) {
        commit('setOSSOptions', false)
        resolve(dispatch('putOSSFile', { file, path }))
        return
      }
      if (state.ossClient) {
        upload(resolve)
        return
      }
      dispatch('getOSSToken')
        .then(() => {
          upload(resolve)
        })
        .catch((err) => {
          if (err === 'process') {
            setTimeout(() => {
              resolve(dispatch('putOSSFile', { file, path }))
            }, 400)
          }
        })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
