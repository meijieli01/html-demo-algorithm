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
  'IMPLANT': {
    component: () => import('../views/ViewerImplant.vue'),
    functionName: 'Implant',
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
    functionCode: 'ViewerNight',
    functionId: '103',
  },
  'BRACKER': {
    component: () => import('../views/BrackerRemove.vue'),
    functionName: 'BracketRemoval',
    functionCode: 'ViewerBracket',
    functionId: '104',
  },
  'RETAINER': {
    component: () => import('../views/ViewerRetainer.vue'),
    functionName: 'Retainer',
    functionCode: 'ViewerRetainer',
    functionId: '105',
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
