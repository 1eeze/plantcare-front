// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import { supabase } from '@/utils/supabase'
import SignupView from '@/components/Signup/SignupView.vue'
import SignupStep1 from '@/components/Signup/SignupStep1.vue'
import SignupStep2 from '@/components/Signup/SignupStep2.vue'
import SignupStep3 from '@/components/Signup/SignupStep3.vue'
import SignupComplete from '@/components/Signup/SignupComplete.vue'
import MainLayout from '@/components/MainLayout.vue'
import HomePage from '@/components/Home/HomePage.vue'
import PlantDetail from '@/components/Home/PlantDetail.vue'
import AddPlant from '@/components/Home/AddPlant.vue'
import Notification from '@/components/Home/Notification.vue'
import MarketPrice from '@/components/MarketPrice/MarketPrice.vue'
import PriceDetail from '@/components/MarketPrice/PriceDetail.vue'
import Community from '@/components/Community/Community.vue'
import WritePost from '@/components/Community/WritePost.vue'
import ProfilePage from '@/components/Profile/ProfilePage.vue'
import ProfileEdit from '@/components/Profile/ProfileEdit.vue';
import LoginSuccess from '@/components/LoginSuccess.vue'


const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { 
        path: '', 
        name: 'HomePage',
        component: HomePage,
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
        component: AddPlant,
        meta: { requiresAuth: true, showBottomNav: true } 
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
        name: 'ProfilePage',
        component: ProfilePage,
        // 로그인이 필요한 페이지라면
        // meta: { requiresAuth: true }
      },
      {
        path: '/profile/edit',
        name: 'ProfileEdit',
        component: ProfileEdit
      }
    ]
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
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

/**
 * 전역 네비게이션 가드
 * - requiresAuth 라우트: 세션 확인
 * - DEV: dev@example.com 자동 로그인 1회 시도
 * - 실패 시 /login 으로 리다이렉트 (원래 목적지는 redirect 쿼리로 보존)
 */
router.beforeEach(async (to) => {
  const needsAuth = to.matched.some(r => r.meta?.requiresAuth)
  if (!needsAuth) return true

  // 현재 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return true

  // DEV 환경이면 자동 로그인 시도
  if (import.meta.env.DEV) {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'dev@example.com',
      password: 'dev123456'
    })
    if (!error) {
      const { data: { session: s2 } } = await supabase.auth.getSession()
      if (s2) return true
    }
  }

  // 세션 없음 → 로그인 페이지로
  alert('로그인이 필요합니다.')
  return { name: 'Login', query: { redirect: to.fullPath } }
})

export default router