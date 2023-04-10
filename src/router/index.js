import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    hidden: true,
  },
]

export const mapComponent2LocalFile = {
  'CT': {
    component: () => import('../views/Viewer.vue'),
    functionName: 'CT',
    functionCode: 'ViewerCT',
    functionId: '101',
  },
  'CROWN': {
    component: () => import('../views/ViewerCrown.vue'),
    functionName: 'Crown',
    functionCode: 'ViewerCrown',
    functionId: '102',
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
