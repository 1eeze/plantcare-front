<template>
  <div id="app">
    <SplashScreen v-if="initialLoading" />

    <router-view v-else />

    <div class="global-chat-container">
      <ChatPopup
        v-for="chat in chatStore.openChats"
        :key="chat.id"
        :title="chat.title"
        :receiverId="chat.receiverId"
        :startX="chat.x"
        :startY="chat.y"
        :zIndex="chat.zIndex"
        @close="chatStore.closeChat(chat.receiverId)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import SplashScreen from '@/components/common/SplashScreen.vue'
import ChatPopup from '@/components/chat/ChatPopup.vue'
import { chatStore } from '@/utils/chatStore'

const initialLoading = ref(true)
const router = useRouter()

onMounted(async () => {
  // 앱 켜지자마자 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  if (!isLoggedIn) {
    // 로그인 안 되어있으면 로그인 화면으로
    router.replace({ name: 'LoginPage' })
  } else {
    // 로그인 되어있으면 홈 화면으로 (혹은 마지막 페이지 유지)
    if (router.currentRoute.value.name === 'LoginPage') {
      router.replace({ name: 'HomePage' }) 
    }
  }

  setTimeout(() => {
    initialLoading.value = false
  }, 800)
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* 스플래시를 화면 꽉 채우기 위해 margin-top: 0 적용 */
  margin-top: 0;
  min-height: 100vh;
}

body, html, #app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
}

/* 업로드 모달 스타일 */
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

.global-chat-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999; /* 가장 위에 표시 */
  pointer-events: none; /* 컨테이너 자체는 클릭 통과 */
  width: 100%;
  height: 0;
}

/* ChatPopup 내부에서 pointer-events: auto로 복구되어 있음 */
.global-chat-container > * {
  pointer-events: auto;
}
</style>