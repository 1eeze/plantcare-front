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
import { useNotificationSystem } from '@/composables/useNotificationSystem'
import { notificationStore } from '@/utils/notificationStore'

const initialLoading = ref(true)
const router = useRouter()
const { initNotifications } = useNotificationSystem()

onMounted(async () => {
  // 1. 초기 진입 시 세션 체크
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    console.log("✅ [App] 초기 세션 확인됨 -> 알림 연결")
    initNotifications()
  } else {
    router.replace({ name: 'LoginPage' })
  }

  // 2. 로그인 상태 변경 감지 (중복 실행 방지 로직 추가)
  supabase.auth.onAuthStateChange((event, session) => {
    // console.log(`[Auth Debug] 이벤트: ${event}`) // 디버깅 필요시 주석 해제

    if (event === 'SIGNED_IN' && session) {
      // 로그인 직후에만 연결 시도
      initNotifications()
    } else if (event === 'SIGNED_OUT') {
      console.log("👋 로그아웃 -> 알림 카운트 초기화")
      notificationStore.setChatCount(0)
      notificationStore.setAlertCount(0)
    }
  })

  setTimeout(() => {
    initialLoading.value = false
  }, 800)
})
</script>

<style>
/* 기존 스타일 그대로 유지 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
  z-index: 9999;
  pointer-events: none;
  width: 100%;
  height: 0;
}

.global-chat-container > * {
  pointer-events: auto;
}
</style>