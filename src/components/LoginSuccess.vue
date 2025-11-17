<template>
  <div>로그인 중입니다... 잠시만 기다려주세요.</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const query = route.query

  const accessToken = query.token || query.access_token || null
  const refreshToken = query.refresh_token || null
  const userId = query.user_id || null

  console.log('OAuth 콜백 쿼리:', query)

  if (!accessToken) {
    console.error('토큰이 전달되지 않았습니다.')
    return router.replace('/login')
  }

  // 1) 우리 쪽 localStorage에도 저장 (필요하다면)
  localStorage.setItem('access_token', accessToken)
  if (userId) localStorage.setItem('user_id', userId)

  // 2) Supabase 세션으로도 등록(정석은 access + refresh 둘 다)
  //    → 백엔드에서 refresh_token도 같이 넘겨주는 구조로 바꾸는 게 제일 좋음
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || undefined
    })

    if (error) {
      console.error('Supabase 세션 설정 에러:', error)
      alert('로그인 세션 설정에 실패했습니다. 다시 로그인해주세요.')
      return router.replace('/login')
    }

    console.log('Supabase 세션 설정 완료:', data)
  } catch (e) {
    console.error('Supabase 세션 설정 중 예외:', e)
    alert('로그인 중 오류가 발생했습니다.')
    return router.replace('/login')
  }

  // 3) redirect가 있으면 그쪽으로, 없으면 홈으로
  const redirectPath = query.redirect || '/'
  router.replace(redirectPath)
})
</script>
