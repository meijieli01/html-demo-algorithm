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
  'NIGHT': {
    component: () => import('../views/NightGuard.vue'),
    functionName: 'NightGuard',
    functionCode: 'ViewerCrown',
    functionId: '103',
  },
  'BRACKER': {
    component: () => import('../views/BrackerRemove.vue'),
    functionName: 'BrackerRemove',
    functionCode: 'ViewerCrown',
    functionId: '104',
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
