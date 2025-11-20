import { reactive } from 'vue'

// 팝업 위치 상숫값
const BASE_X = 20
const BASE_Y = 20
const POPUP_OFFSET = 340 // 팝업 간 간격

export const chatStore = reactive({
  openChats: [],
  zIndexCounter: 1000,

  openChat(receiverId, receiverName) {
    const existingChat = this.openChats.find(chat => chat.receiverId === receiverId)

    if (existingChat) {
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
    this.realignChats()
  },

  realignChats() {
    this.openChats.forEach((chat, index) => {
      chat.x = BASE_X + (index * POPUP_OFFSET)
    })
  }
})