import AliOSS from 'ali-oss';
import { getOssAuth } from '../api/admin';

const state = {
    ossClient: null,
    ossTime: 0,
}
  
const getters = {
    client: (state) => state.ossClient,
}
  
const mutations = {  
    setClient: (state, options) => {
        // 清除
        if (!options) {
            state.ossClient = null;
            state.ossTime = 0;
            return
        }
        state.ossClient = new AliOSS({
            accessKeyId: options.AccessKeyId,
            accessKeySecret: options.AccessKeySecret,
            stsToken: options.SecurityToken,
            endpoint: options.endpoint,
            bucket: options.bucket,
        })
        state.ossTime = new Date().getTime();
    },
}

const actions = {
    getAuth({commit}) {
        return new Promise((resolve, reject) => {
            // 设置10分钟超时
            const ifExpired = (new Date().getTime() - state.ossTime) / 1000 / 60 > 10;
            if (ifExpired) {
                return getOssAuth().then(res=>{
                    if (res.code == 200) {
                        commit('setClient', res.data);
                        resolve(state.ossClient);
                    } else {
                        reject(res.message);
                    }
                }).catch(err=>{
                    reject(err);
                });
            } else {
                resolve(state.ossClient);
            }
        });
    },     
    getUrl({ dispatch }, path, options = { expires: 1200 }) {
        return new Promise((resolve)=>{
            return dispatch('getAuth').then(client=>{
                resolve(client.signatureUrl(path, options));
            })
        })
    },
    putFile({ dispatch }, { file, path }) {
        return new Promise((resolve) => {
            return dispatch('getAuth').then(client=>{
                client.put(path, file).then(res=>resolve(res));
            })
        })
    },
}
  
export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
}