import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store';
import { i18n } from './lang/index';
import './utils/b5.theme';

const newPageList = ['/editor', '/assigned'] // 跳转新页面
router.beforeEach(async (to, from, next) => {
    const hasToken = store.getters['user/token']
    if (hasToken) {
        if (store.getters['user/info'].userId) {
            next()
        } else {
            try {
                await store.dispatch('user/getInfo')
                if (newPageList.indexOf(to.path) !== -1) next()
                else next({ path: to.fullPath })
            } catch (error) {
                await store.dispatch('user/resetToken')
                next({path: '/login'});
            }
        }
    } else {
        if (to.path !== '/login') next({path: '/login'});
        else next();
    }
})
createApp(App)
.use(router)
.use(store)
.use(i18n)
.mount('#app')
