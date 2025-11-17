// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
// (팀원 코드) Login.vue가 아닌 @/components/Login.vue 사용
import Login from '@/components/Login.vue' 
import { supabase } from '@/utils/supabase' // (우리 코드) supabase import
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
// (팀원 코드) LoginSuccess import 추가
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
        // (팀원 코드) meta: { requiresAuth: true }로 변경
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        name: 'Profile',
        component: Profile,
        // (팀원 코드) meta: { requiresAuth: true }로 변경
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    // (팀원 코드) LoginSuccess 라우트 추가
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

// (우리 코드) 네비게이션 가드 사용
// (팀원의 DEV 자동 로그인 로직 대신, 우리의 '문지기' 로직을 최종본으로 선택)
router.beforeEach(async (to, from, next) => {
  // 1. 로그인/회원가입/로그인 성공 페이지는 누구나 접근 가능
  const publicPaths = ['/login', '/signup', '/login-success']
  if (publicPaths.includes(to.path) || to.path.startsWith('/signup')) {
    next() // 통과
    return
  }

  // 2. 그 외 모든 페이지는 로그인이 필요함
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // 세션이 없으면 로그인 페이지로 보냄
    next('/login')
  } else {
    // 3. 세션이 있으면 프로필 정보를 확인
    const { data: profile, error } = await supabase
      .from('Users')
      .select('name')
      .eq('id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('프로필 조회 에러 (라우트 가드):', error)
      next() // 에러 발생 시 일단 통과
      return
    }

    // 4. 닉네임이 없고 (profile이 없거나 name이 null)
    //    현재 가는 경로가 회원가입 페이지가 아니라면
    if ((!profile || !profile.name) && !to.path.startsWith('/signup')) {
      // 닉네임 입력 페이지(2단계)로 강제 이동
      alert('추가 정보(닉네임) 입력이 필요합니다.')
      next('/signup/step2')
    } else {
      // 닉네임이 있거나, 이미 회원가입 페이지로 가고 있다면 통과
      next() 
    }
  }
})

export default router