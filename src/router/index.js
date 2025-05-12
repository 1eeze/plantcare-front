// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import SignupView from '../components/Signup/SignupView.vue'
import SignupStep1 from '../components/Signup/SignupStep1.vue'
import SignupEmail from '../components/Signup/SignupEmail.vue'
import SignupStep2 from '../components/Signup/SignupStep2.vue'
import SignupStep3 from '../components/Signup/SignupStep3.vue'
import SignupComplete from '../components/Signup/SignupComplete.vue'

const routes = [
  { path: '/', component: LoginForm },
  { path: '/signup', component: SignupView, children: [
    { path: 'step1', component: SignupStep1 },
    { path: 'step2', component: SignupStep2 },
    { path: 'step3', component: SignupStep3 },
    { path: 'email', component: SignupEmail },
    { path: 'complete', component: SignupComplete }
  ]}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
