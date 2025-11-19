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
import ProfileEdit from '@/components/Profile/ProfileEdit.vue'
import LoginSuccess from '@/components/LoginSuccess.vue'
import UpdatePassword from '@/components/UpdatePassword.vue'
import ChatRoom from '@/components/chat/ChatRoom.vue'

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
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        name: 'ProfilePage',
        component: ProfilePage,
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile/:userId',
        name: 'UserProfile',
        component: ProfilePage,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile/edit',
        name: 'ProfileEdit',
        component: ProfileEdit,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/chat/:id',
    name: 'ChatRoom',
    component: ChatRoom,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/update-password',
    name: 'UpdatePassword',
    component: UpdatePassword
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: LoginSuccess
  },
  {
    path: '/auth/callback',
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

router.beforeEach(async (to, from, next) => {
  const publicPaths = ['/login', '/signup', '/login-success', '/auth/callback']
  if (publicPaths.includes(to.path) || to.path.startsWith('/signup')) {
    next()
    return
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    next({ 
      name: 'LoginPage',
      query: { redirect: to.fullPath } 
    })
    return
  }

  if (to.name === 'LoginPage') {
    next({ name: 'HomePage' })
    return
  }

  try {
    const { data: profile, error } = await supabase
      .from('Users')
      .select('name')
      .eq('id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if ((!profile || !profile.name) && !to.path.startsWith('/signup')) {
      alert('추가 정보(닉네임) 입력이 필요합니다.')
      next('/signup/step2')
    } else {
      next() 
    }
  } catch (error) {
    console.error('프로필 조회 에러 (라우트 가드):', error)
    next()
  }
})

export default router