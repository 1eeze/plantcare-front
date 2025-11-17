import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { supabase } from '@/utils/supabase'

async function ensureDevSession() {
  if (import.meta.env.DEV) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await supabase.auth.signInWithPassword({
        email: 'dev@example.com',     // 미리 가입해둔 개발용 계정
        password: 'dev123456'
      })
    }
  }
}

async function bootstrap() {
  if (import.meta.env.DEV) {
    // await ensureDevSession();   // 함수 안에서 await → OK
  }
  createApp(App).use(router).mount('#app');
}

bootstrap();