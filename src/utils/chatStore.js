import { reactive } from 'vue'

// 팝업 위치 상숫값
const BASE_X = 20
const BASE_Y = 20
const POPUP_OFFSET = 340 // 팝업 간 간격

export const chatStore = reactive({
  openChats: [], // 열려있는 채팅방 목록
  zIndexCounter: 1000,

  // 채팅방 열기 (이미 있으면 포커스, 없으면 추가)
  openChat(receiverId, receiverName) {
    const existingChat = this.openChats.find(chat => chat.receiverId === receiverId)

    if (existingChat) {
      // 이미 열려있으면 z-index만 높여서 맨 앞으로
      this.zIndexCounter++
      existingChat.zIndex = this.zIndexCounter
      return
    }

    // 새 채팅방 추가
    this.zIndexCounter++
    const count = this.openChats.length
    
    this.openChats.push({
      id: receiverId, // 고유 ID
      receiverId: receiverId,
      title: receiverName || '대화',
      x: BASE_X + (count * POPUP_OFFSET), // 위치 오프셋
      y: BASE_Y,
      zIndex: this.zIndexCounter,
      minimized: false
    })
  },

  // 채팅방 닫기
  closeChat(receiverId) {
    this.openChats = this.openChats.filter(chat => chat.receiverId !== receiverId)
    // 닫고 나서 남은 채팅창들 위치 재정렬 (선택사항)
    this.realignChats()
  },

  // 위치 재정렬 (팝업 하나 닫았을 때 빈공간 메우기)
  realignChats() {
    this.openChats.forEach((chat, index) => {
      chat.x = BASE_X + (index * POPUP_OFFSET)
    })
  }
})