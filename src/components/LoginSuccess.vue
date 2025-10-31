<template>
  <div>로그인 중입니다... 잠시만 기다려주세요.</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const userId = urlParams.get('user_id')

  if (token) {
    // localStorage에 토큰 저장
    localStorage.setItem('access_token', token)

    // user_id가 URL에 있으면 저장
    if (userId) {
      localStorage.setItem('user_id', userId)
    }

    console.log('로그인 성공! 토큰:', token)

    // 홈으로 이동
    router.push('/')
  } else {
    console.error('토큰이 전달되지 않았습니다.')
    router.push('/login')
  }
})
</script>
