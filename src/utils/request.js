import axios from 'axios'
import store from '@/store'

const service = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BASE_API}${import.meta.env.VITE_APP_API_PREFIX}`, // api 的 base_url
  // withCredentials: true, // 跨域请求时发送 cookies
  // timeout: 5000
})

service.interceptors.request.use(
  (config) => {
    if (store.getters['user/token']) {
      config.headers['Authorization'] = store.getters['user/token']
      config.headers['uuid'] = store.getters['user/token']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) console.error(res.message);
    return res;
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
