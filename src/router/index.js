// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import SignupForm from '../components/SignupForm.vue'
import SignupEmail from '../components/SignupEmail.vue'

const routes = [
  { path: '/', component: LoginForm },
  { path: '/signup', component: SignupForm },
  { path: '/signup-email', component: SignupEmail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
