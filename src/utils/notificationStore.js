import { reactive, computed } from 'vue'

export const notificationStore = reactive({
  // 상태 값
  chatUnreadCount: 0,   // 안 읽은 채팅 개수
  alertUnreadCount: 0,  // 안 읽은 시스템/소셜 알림 개수

  // 전체 합계 (종 모양 아이콘에 표시할 숫자)
  totalUnreadCount: computed(() => {
    return notificationStore.chatUnreadCount + notificationStore.alertUnreadCount
  }),

  // 채팅 카운트 설정
  setChatCount(count) {
    this.chatUnreadCount = count
  },
  
  // 채팅 카운트 1 증가 (실시간 수신 시)
  incrementChatCount() {
    this.chatUnreadCount++
  },

  // 알림 카운트 설정
  setAlertCount(count) {
    this.alertUnreadCount = count
  },

  // 알림 카운트 1 증가 (실시간 수신 시)
  incrementAlertCount() {
    this.alertUnreadCount++
  },
  
  // 알림 읽음 처리 등으로 감소 필요 시
  decrementAlertCount() {
    if (this.alertUnreadCount > 0) this.alertUnreadCount--
  }
})