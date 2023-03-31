import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    hidden: true,
  },
]

export const mapComponent2LocalFile = {
  
}

export const mapComponent2LocalFileTest = {
  // 测试
  'VIEWER': {
    component: () => import('../views/page/viewer.vue'),
    functionName: 'viewer',
    functionCode: 'ViewerCT',
    functionId: '100',
  },
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

if (import.meta.env.DEV) {
  window.mjrouter = router
}

export default router
