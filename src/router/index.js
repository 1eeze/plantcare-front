// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// ✅ [추가] 로그인 여부를 확인하는 전역 가드에 필요한 스토어 임포트
import { useAuthStore } from '../store/authStore'

import LoginForm from '../components/LoginForm.vue'
import SignupForm from '../components/SignupForm.vue'
import SignupEmail from '../components/SignupEmail.vue'

// ✅ [추가] 로그인 후 진입 가능한 페이지들
import FeedView from '../views/FeedView.vue'
import WritePostView from '../views/WritePostView.vue'
import ProfileView from '../views/ProfileView.vue'

// ✅ [수정] 기존 라우트 배열에 로그인 후 접근 가능한 라우트 추가
const routes = [
  { path: '/', component: LoginForm },
  { path: '/signup', component: SignupForm },
  { path: '/signup-email', component: SignupEmail },

  // ✅ 로그인 후 접근 가능한 화면 - 인증 필요 표시
  { path: '/feed', component: FeedView, meta: { requiresAuth: true } },
  { path: '/write', component: WritePostView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ [추가] 인증되지 않은 사용자는 특정 라우트에 접근 못하도록 전역 가드 설정
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next('/') // 로그인 페이지로 리디렉션
  } else {
    next()
  }
})

export default router