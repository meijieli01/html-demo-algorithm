import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import TreeMenu from './third/snippet/layout/TreeMenu.vue';

const whiteList = ['/login'] // 白名单
const newPageList = ['/editor', '/assigned'] // 跳转新页面
router.beforeEach(async (to, from, next) => {
    const hasToken = store.getters['user/token']
    if (hasToken) {
        if (to.path === '/login') next({ path: '/' })
        else {
            if (store.getters['user/info'].userId) {
                next()
            } else {
                try {
                    await store.dispatch('user/getInfo')
                    if (newPageList.indexOf(to.path) !== -1) next()
                    else next({ path: to.fullPath })
                } catch (error) {
                    await store.dispatch('user/resetToken')
                    next(`/login`)
                }
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) next()
        else next(`/login`)
    }
})
console.log('env', import.meta.env)
createApp(App)
.use(router)
.use(store)
.component('TreeMenu', TreeMenu)
.mount('#app')
