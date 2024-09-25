import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login2.vue'),
    hidden: true,
  },
]

export const mapComponent2LocalFile = {
  // 'IMPLANT': {
  //   component: () => import('../views/ViewerImplant.vue'),
  //   functionName: 'Implant',
  //   functionCode: 'ViewerCT',
  //   functionId: '101',
  // },
  // 'CROWN': {
  //   component: () => import('../views/ViewerCrown.vue'),
  //   functionName: 'Crown',
  //   functionCode: 'ViewerCrown',
  //   functionId: '102',
  // },
  'NIGHT': {
    component: () => import('../views/one/NightGuard.vue'),
    functionName: 'NightGuard',
    functionCode: 'ViewerNight',
    functionId: '103',
  },
  // 'NGRETAINER': {
  //   component: () => import('../views/one/NGRetainer.vue'),
  //   functionName: 'NGRetainer',
  //   functionCode: 'ViewerNGRetainer',
  //   functionId: '106',
  // },
  'AiClean': {
    component: () => import('../views/one/AiClean.vue'),
    functionName: 'AiClean',
    functionCode: 'AiClean',
    functionId: '107',
  },
  // 2024-4-16
  'AiOcclusionRecovery': {
    component: () => import('../views/one/AiOcclusionRecovery.vue'),
    functionName: 'OcclusionRecovery',
    functionCode: 'OcclusionRecovery',
    functionId: '108',
  },
  'BRACKER': {
    component: () => import('../views/one/BrackerRemove.vue'),
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
  'SMILE': {
    component: () => import('../views/Smile.vue'),
    functionName: 'Smile',
    functionCode: 'Smile',
    functionId: '201',
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
