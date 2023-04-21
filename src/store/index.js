import Vuex from 'vuex'
import moduleUser from './user'
import moduleAuth from './auth'
const store = new Vuex.Store({
  state: {
    appName: import.meta.env.VITE_APP_NAME,
    appMode: import.meta.env.VITE_APP_MODE,
  },
  getters: {
    appName: (state) => state.appName,
    appMode: (state) => state.appMode,
  },
  mutations: {
    
  },
  actions: {
    
  },
  modules: {
    user: moduleUser,
    auth: moduleAuth,
  },
})

if (import.meta.env.DEV) {
  window.mjstore = store
}

export default store
