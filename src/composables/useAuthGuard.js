import { supabase } from '@/utils/supabase'
import { useRouter } from 'vue-router'

export function useAuthGuard() {
  const router = useRouter()

  // DEV 자동로그인 시도 → 실패하면 로그인 화면
  const ensureSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return true

    if (import.meta.env.DEV) {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'dev@example.com',
        password: 'dev123456'
      })
      if (!error) {
        // 세션 리프레시
        const { data: { session: s2 } } = await supabase.auth.getSession()
        if (s2) return true
      }
    }
    // 여기까지 오면 세션 없음
    alert('로그인이 필요합니다.')
    router.push('/login')
    return false
  }

  return { ensureSession }
}
