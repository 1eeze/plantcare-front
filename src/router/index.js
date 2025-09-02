// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/LoginForm.vue'
import SignupView from '../components/Signup/SignupView.vue'
import SignupStep1 from '../components/Signup/SignupStep1.vue'
import SignupEmail from '../components/Signup/SignupEmail.vue'
import SignupStep2 from '../components/Signup/SignupStep2.vue'
import SignupStep3 from '../components/Signup/SignupStep3.vue'
import SignupComplete from '../components/Signup/SignupComplete.vue'
import MainLayout from '../components/MainLayout.vue'
import Home  from '../components/Home.vue'
import Community from '../components/Community/Community.vue'
import WritePost from '../components/Community/WritePost.vue'
import Profile from '../components/Profile/ProfileView.vue'

const routes = [
  { path: '/', component: MainLayout, children: [
      { path: '', component: Home },
      { path: 'community', component: Community },
      { path: 'write', component: WritePost },
      { path: 'profile', component: Profile }
  ] },
  { path: '/signup', component: SignupView, children: [
    { path: 'step1', component: SignupStep1 },
    { path: 'step2', component: SignupStep2 },
    { path: 'step3', component: SignupStep3 },
    { path: 'email', component: SignupEmail },
    { path: 'complete', component: SignupComplete },
  ] },
  { path: '/login', component: Login }

  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
