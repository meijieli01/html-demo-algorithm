import { adminLogin } from '../api/admin';
import router, {mapComponent2LocalFile} from '../router';
import { getRootRouter, emptyRouter } from '../third/snippet/hooks/menuRoute';

const state = {
  token: sessionStorage.getItem('token'),
  info: {},
}

const getters = {
  token: (state) => state.token,
  info: (state) => state.info,
}

const mutations = {
  setToken: (state, token) => {
    state.token = token
  },
  setInfo: (state, info) => {
    state.info = info
  },
}

const actions = {
  // 登陆 && 获取用户信息
  login({ commit }, loginForm) {
    return new Promise((resolve, reject) => {
      adminLogin(loginForm)
        .then((res) => {
          commit('setToken', res.data)
          sessionStorage.setItem('token', res.data)
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  // 获取用户信息并返回可访问路由
  getInfo({ commit, rootGetters  }) {
    return new Promise((resolve, reject) => {
      if (true) {
        const root = Object.assign({}, getRootRouter('front', 'viewer'), {meta:{},children:[]});
        root.meta.label = 'viewerRoot';
        root.meta.code = '1000';
        root.meta.id = '100';
        for (let k in mapComponent2LocalFile) {
          const item = mapComponent2LocalFile[k];
          const child = Object.assign({}, emptyRouter, {meta:{},children:[]});
          child.path = `${item.functionId}`;
          child.component = item.component;
          child.meta.label = item.functionName || k;
          child.meta.code = item.functionCode;
          child.meta.id = item.functionId;
          child.hidden = true;
          root.children.push(child);
        }
        root.hidden = false;
        root.redirect = `${root.path}/${root.children[0].path}`;
        router.options.routes.push(root);
        router.addRoute(root);
      }
      const routes = router.getRoutes();
      for (let i = 0; i < routes.length; i++) {
        if (routes[i].meta.id) {
          const resPath = {
            path: '/',
            redirect: routes[i].path,
            hidden: true,
          }
          router.options.routes.push(resPath)
          router.addRoute(resPath)
          break
        }
      }
      commit('setInfo', {userId:1})
      resolve()
    })
    .catch((err) => {
      reject(err)
    })
  },
  // 注销
  logout() {
    return new Promise((resolve) => {
      this.dispatch('user/resetToken')
      resolve()
    })
  },
  // 重置
  resetToken({ commit }) {
    return new Promise((resolve) => {
      sessionStorage.removeItem('token')
      commit('setToken', '')
      commit('setInfo', {})
      resolve()
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
