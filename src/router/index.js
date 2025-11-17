import { createRouter, createWebHistory } from 'vue-router'
// (수정) Login.vue -> LoginPage.vue로 경로 변경
import LoginPage from '@/components/LoginPage.vue' 
import { supabase } from '@/utils/supabase'
import SignupView from '@/components/Signup/SignupView.vue'
import SignupStep1 from '@/components/Signup/SignupStep1.vue'
import SignupStep2 from '@/components/Signup/SignupStep2.vue'
import SignupStep3 from '@/components/Signup/SignupStep3.vue'
import SignupComplete from '@/components/Signup/SignupComplete.vue'
import MainLayout from '@/components/MainLayout.vue'
// (수정) Home.vue -> HomePage.vue로 경로 변경
import HomePage from '@/components/Home/HomePage.vue' 
import PlantDetail from '@/components/Home/PlantDetail.vue'
import AddPlant from '@/components/Home/AddPlant.vue'
import Notification from '@/components/Home/Notification.vue'
import MarketPrice from '@/components/MarketPrice/MarketPrice.vue'
import PriceDetail from '@/components/MarketPrice/PriceDetail.vue'
import Community from '@/components/Community/Community.vue'
import WritePost from '@/components/Community/WritePost.vue'
// (수정) ProfilePage.vue로 경로 변경
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
        name: 'HomePage', // (팀원 변경 사항)
        component: HomePage, // (수정)
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
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        name: 'ProfilePage', // (팀원 변경 사항)
        component: ProfilePage, // (수정)
        meta: { requiresAuth: true }
      },
      {
        path: 'profile/edit',
        name: 'ProfileEdit', // (팀원 추가)
        component: ProfileEdit,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'LoginPage', // (팀원 변경 사항)
    component: LoginPage // (수정)
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: LoginSuccess
  },
  {
    path: '/auth/callback', // (팀원 추가)
    name: 'AuthCallback',
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

// (우리 코드) "문지기" 로직 (팀원의 이름 변경 사항 반영)
router.beforeEach(async (to, from, next) => {
  
  // 1. 공개 페이지 ('/auth/callback' 포함)
  const publicPaths = ['/login', '/signup', '/login-success', '/auth/callback']
  if (publicPaths.includes(to.path) || to.path.startsWith('/signup')) {
    next() // 통과
    return
  }

  // 2. 세션 확인
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // 세션이 없으면 로그인 페이지로 보냄
    next({ 
      name: 'LoginPage', // (수정)
      query: { redirect: to.fullPath } 
    })
    return
  }

  // 3. 로그인한 사용자가 /login으로 가면 홈으로
  if (to.name === 'LoginPage') { // (수정)
    next({ name: 'HomePage' }) // (수정)
    return
  }

  // 4. 닉네임이 있는지 확인
  try {
    const { data: profile, error } = await supabase
      .from('Users')
      .select('name')
      .eq('id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // '행 없음' 외의 에러

    if ((!profile || !profile.name) && !to.path.startsWith('/signup')) {
      // 닉네임 없으면 강제 이동
      alert('추가 정보(닉네임) 입력이 필요합니다.')
      next('/signup/step2')
    } else {
      // 닉네임 있으면 최종 통과
      next() 
    }
  } catch (error) {
    console.error('프로필 조회 에러 (라우트 가드):', error)
    next() // 에러 시 일단 통과
  }
})

export default router