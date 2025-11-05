// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import SignupView from '@/components/Signup/SignupView.vue'
import SignupStep1 from '@/components/Signup/SignupStep1.vue'
import SignupStep2 from '@/components/Signup/SignupStep2.vue'
import SignupStep3 from '@/components/Signup/SignupStep3.vue'
import SignupComplete from '@/components/Signup/SignupComplete.vue'
import MainLayout from '@/components/MainLayout.vue'
import Home from '@/components/Home/Home.vue'
import PlantDetail from '@/components/Home/PlantDetail.vue'
import AddPlant from '@/components/Home/AddPlant.vue'
import Notification from '@/components/Home/Notification.vue'
import MarketPrice from '@/components/MarketPrice/MarketPrice.vue'
import PriceDetail from '@/components/MarketPrice/PriceDetail.vue'
import Community from '@/components/Community/Community.vue'
import WritePost from '@/components/Community/WritePost.vue'
import Profile from '@/components/Profile/ProfileView.vue'
import LoginSuccess from '@/components/LoginSuccess.vue'


const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { 
        path: '', 
        name: 'Home',
        component: Home,
        meta: { showBottomNav: true }
      },
      { 
        path: 'plant-detail/:id', 
        name: 'PlantDetail',
        component: PlantDetail, 
        props: true 
      },
      { 
        path: 'add-plant', 
        name: 'AddPlant',
        component: AddPlant 
      },
      { 
        path: 'notification', 
        name: 'Notification',
        component: Notification 
      },
      { 
        path: 'marketprice', 
        name: 'MarketPrice',
        component: MarketPrice 
      },
      { 
        path: 'plant/:id', 
        name: 'PriceDetail',
        component: PriceDetail, 
        props: true 
      },
      { 
        path: 'community', 
        name: 'Community',
        component: Community 
      },
      { 
        path: 'write', 
        name: 'WritePost',
        component: WritePost,
        // 로그인이 필요한 페이지라면
        // meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        name: 'Profile',
        component: Profile,
        // 로그인이 필요한 페이지라면
        // meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: LoginSuccess
  },
  {
    path: '/signup',
    component: SignupView,
    children: [
      { 
        path: '', 
        name: 'SignupStep1',
        component: SignupStep1 
      },
      { 
        path: 'step1', 
        name: 'SignupStep1Alt',
        component: SignupStep1 
      },
      { 
        path: 'step2', 
        name: 'SignupStep2',
        component: SignupStep2 
      },
      { 
        path: 'step3', 
        name: 'SignupStep3',
        component: SignupStep3 
      },
      { 
        path: 'complete', 
        name: 'SignupComplete',
        component: SignupComplete 
      }
    ]
  },
  // 404 페이지 처리
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드 예시 (필요시 추가)
// router.beforeEach((to, from, next) => {
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     // 로그인 체크 로직
//     if (!isAuthenticated()) {
//       next('/login')
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })

export default router