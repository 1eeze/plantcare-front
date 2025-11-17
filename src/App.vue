<template>
  <div id="app">
    <!-- 1) 앱 처음 로딩 & 로그인 상태 확인 중일 때 -->
    <SplashScreen v-if="initialLoading" />

    <!-- 2) 다 확인되면 실제 페이지 렌더링 -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import SplashScreen from '@/components/common/SplashScreen.vue'

const initialLoading = ref(true)
const router = useRouter()

onMounted(async () => {
  // ✅ 앱 켜지자마자 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  if (!isLoggedIn) {
    // 로그인 안 되어있으면 로그인 화면으로
    router.replace({ name: 'LoginPage' })   // 🔁 'Login' → 'LoginPage'
  } else {
    // 로그인 되어있으면 홈 화면으로 (혹은 마지막 페이지 유지)
    if (router.currentRoute.value.name === 'LoginPage') {
      router.replace({ name: 'HomePage' }) // 🔁 'Home' → 'HomePage'
    }
  }

  // 스플래시를 잠깐 더 보여주고 싶으면 setTimeout으로 살짝 딜레이도 가능
  setTimeout(() => {
    initialLoading.value = false
  }, 800) // 0.8초 정도
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* 스플래시를 화면 꽉 채우고 싶으면 margin-top 은 빼는 게 좋아 */
  margin-top: 0;
  min-height: 100vh;
}

body, html, #app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 업로드 모달 */
.upload-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  background: none;
}
.modal-bg {
  position: absolute; left: 0; top: 0; right: 0; bottom: 0;
  background: #0006;
}
.modal-content {
  position: relative;
  background: #fff;
  padding: 26px 22px;
  border-radius: 18px;
  z-index: 10;
  width: 330px;
  min-width: 330px;
  max-width: 96vw;
  box-sizing: border-box;
  box-shadow: 0 6px 28px #0003;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 auto;
  left: 0; right: 0;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-text {
  font-size: 17px;
  color: #333;
}
.modal-img {
  width: 340px; max-width: 72vw;
  border-radius: 9px; margin-bottom: 14px;
}
</style>