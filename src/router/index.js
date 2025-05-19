// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import SignupView from '../components/Signup/SignupView.vue'
import SignupStep1 from '../components/Signup/SignupStep1.vue'
import SignupEmail from '../components/Signup/SignupEmail.vue'
import SignupStep2 from '../components/Signup/SignupStep2.vue'
import SignupStep3 from '../components/Signup/SignupStep3.vue'
import SignupComplete from '../components/Signup/SignupComplete.vue'
import Community from '../components/Community/Container.vue'
import WritePost from '../components/Community/WritePost.vue'

const routes = [
  { path: '/', component: LoginForm },
  { path: '/signup', component: SignupView },
  { path: '/signup-step1', component: SignupStep1 },
  { path: '/signup-email', component: SignupEmail },
  { path: '/signup-step2', component: SignupStep2 },
  { path: '/signup-step3', component: SignupStep3 },
  { path: '/signup-complete', component: SignupComplete },
  { path: '/community', component: Community },
  { path: '/write', component: WritePost},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
