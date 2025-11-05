<template>
  <div class="messages-container">
    <!-- 상단 헤더 -->
    <div class="header">
      <div class="header-left">
        <button @click="goBack" class="back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>메시지</h1>
      </div>
      <div class="header-actions">
        <button @click="showSearch" class="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button @click="composeMessage" class="compose-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3L21 12L3 21V14.5L11 12L3 9.5V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 탭 네비게이션 (동그란 형태) -->
    <div class="tab-container">
      <div class="tab-wrapper">
        <div 
          class="tab-slider" 
          :style="{ transform: `translateX(${activeTab === 'notifications' ? 0 : 100}%)` }"
        ></div>
        <button 
          @click="setActiveTab('notifications')"
          :class="{ active: activeTab === 'notifications' }"
          class="tab-btn"
        >
          <div class="tab-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>알림</span>
            <div v-if="notificationCount > 0" class="count-badge">{{ notificationCount }}</div>
          </div>
        </button>
        
        <button 
          @click="setActiveTab('chat')"
          :class="{ active: activeTab === 'chat' }"
          class="tab-btn"
        >
          <div class="tab-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>채팅</span>
            <div v-if="chatCount > 0" class="count-badge">{{ chatCount }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="content-area">
      <!-- 알림 탭 -->
      <div v-if="activeTab === 'notifications'" class="notifications-section">
        <div v-if="notifications.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ddd" stroke-width="1.5"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ddd" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>새로운 알림이 없어요</h3>
          <p>식물 관리나 거래 알림이 오면 여기에 표시됩니다</p>
        </div>

        <div v-else class="message-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="message-item notification-item"
            :class="{ unread: !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="message-avatar">
              <div class="notification-icon" :class="notification.type">
                {{ getNotificationIcon(notification.type) }}
              </div>
              <div v-if="!notification.read" class="unread-indicator"></div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <h4 class="message-title">{{ notification.title }}</h4>
                <span class="message-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <p class="message-preview">{{ notification.message }}</p>
              <div v-if="notification.metadata" class="message-tags">
                <span v-if="notification.metadata.price" class="tag price-tag">
                  {{ formatPrice(notification.metadata.price) }}
                </span>
                <span v-if="notification.metadata.plantName" class="tag plant-tag">
                  🌱 {{ notification.metadata.plantName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 채팅 탭 -->
      <div v-if="activeTab === 'chat'" class="chat-section">
        <div v-if="chatList.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#ddd" stroke-width="1.5"/>
            </svg>
          </div>
          <h3>채팅이 없어요</h3>
          <p>다른 사용자와 대화를 시작해보세요</p>
          <button @click="goToCommunity" class="start-chat-btn">
            커뮤니티에서 대화하기
          </button>
        </div>

        <div v-else class="message-list">
          <div 
            v-for="chat in chatList" 
            :key="chat.id"
            class="message-item chat-item"
            :class="{ unread: chat.unreadCount > 0 }"
            @click="openChat(chat)"
          >
            <div class="message-avatar">
              <img :src="chat.avatar" :alt="chat.name" class="user-avatar" />
              <div v-if="chat.isOnline" class="online-indicator"></div>
              <div v-if="chat.unreadCount > 0" class="unread-count">{{ chat.unreadCount }}</div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <h4 class="message-title">{{ chat.name }}</h4>
                <span class="message-time">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              <p class="message-preview">
                <span v-if="chat.lastMessage.isOwn" class="own-message">나: </span>
                {{ chat.lastMessage.text }}
              </p>
              <div v-if="chat.tradeInfo" class="message-tags">
                <span class="tag trade-tag">
                  거래 중: {{ chat.tradeInfo.plantName }}
                </span>
              </div>
            </div>

            <div class="message-actions">
              <button @click.stop="toggleChatPin(chat)" class="pin-btn" :class="{ pinned: chat.isPinned }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05L12.25 1.86C11.9607 1.57075 11.5681 1.40741 11.16 1.40741C10.7519 1.40741 10.3593 1.57075 10.07 1.86L8.66 3.27C8.1 3.83 8.1 4.74 8.66 5.3L10.39 7.03C10.39 7.03 9.61 8.39 8.29 9.71C6.97 11.03 5.61 11.81 5.61 11.81L3.88 10.08C3.32 9.52 2.41 9.52 1.85 10.08L0.44 11.49C0.15075 11.7793 -0.01259 12.1719 -0.01259 12.58C-0.01259 12.9881 0.15075 13.3807 0.44 13.67L9.63 22.86C9.91926 23.1493 10.3119 23.3126 10.72 23.3126C11.1281 23.3126 11.5207 23.1493 11.81 22.86L13.22 21.45C13.78 20.89 13.78 19.98 13.22 19.42L11.49 17.69C11.49 17.69 12.27 16.33 13.59 15.01C14.91 13.69 16.27 12.91 16.27 12.91L17.99 14.63C18.55 15.19 19.46 15.19 20.02 14.63L21.43 13.22C21.7193 12.9307 21.8826 12.5381 21.8826 12.13C21.8826 11.7219 21.7193 11.3293 21.43 11.04L21.44 11.05Z" :fill="chat.isPinned ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 플로팅 액션 버튼 -->
    <button v-if="activeTab === 'chat'" @click="composeMessage" class="floating-action-btn">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응성 데이터
const activeTab = ref('notifications')

// 알림 데이터
const notifications = ref([
  {
    id: 1,
    type: 'plant',
    title: '물주기 시간',
    message: '몬스테라에게 물을 줄 시간이에요',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    metadata: {
      plantName: '몬스테라'
    }
  },
  {
    id: 2,
    type: 'trade',
    title: '새로운 구매 문의',
    message: 'PlantLover님이 관심을 보이고 있어요',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    metadata: {
      price: 45000,
      plantName: '몬스테라 알보'
    }
  }
])

// 채팅 데이터
const chatList = ref([
  {
    id: 1,
    name: 'PlantLover',
    avatar: 'https://picsum.photos/48?random=1',
    lastMessage: {
      text: '안녕하세요~ 식물 상태가 어떤가요?',
      isOwn: false
    },
    lastMessageTime: new Date(Date.now() - 10 * 60 * 1000),
    unreadCount: 2,
    isOnline: true,
    isPinned: false,
    tradeInfo: {
      plantName: '몬스테라 알보'
    }
  },
  {
    id: 2,
    name: 'GreenMania',
    avatar: 'https://picsum.photos/48?random=2',
    lastMessage: {
      text: '네, 내일 거래하겠습니다',
      isOwn: true
    },
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    isOnline: false,
    isPinned: true
  }
])

// 계산된 속성들
const notificationCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const chatCount = computed(() => 
  chatList.value.reduce((sum, chat) => sum + chat.unreadCount, 0)
)

// 메서드들
const goBack = () => {
  router.back()
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const showSearch = () => {
  console.log('검색 기능')
}

const composeMessage = () => {
  router.push('/chat/new')
}

const goToCommunity = () => {
  router.push('/community')
}

const handleNotificationClick = (notification) => {
  notification.read = true
  
  switch (notification.type) {
    case 'plant':
      router.push('/plants')
      break
    case 'trade':
      router.push('/community')
      break
    default:
      console.log('알림 클릭:', notification)
  }
}

const openChat = (chat) => {
  router.push(`/chat/${chat.id}`)
}

const toggleChatPin = (chat) => {
  chat.isPinned = !chat.isPinned
  // 핀된 채팅을 맨 위로 정렬
  if (chat.isPinned) {
    const pinnedChats = chatList.value.filter(c => c.isPinned)
    const unpinnedChats = chatList.value.filter(c => !c.isPinned)
    chatList.value = [...pinnedChats, ...unpinnedChats]
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    plant: '🌱',
    trade: '💰',
    social: '❤️',
    system: '⚙️'
  }
  return icons[type] || '📋'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분`
  if (hours < 24) return `${hours}시간`
  if (days < 7) return `${days}일`
  
  return timestamp.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

onMounted(() => {
  console.log('메시지 컴포넌트 로드됨')
})
</script>

<style scoped>
.messages-container {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(86, 130, 101, 0.4);
  transition: all 0.3s ease;
  z-index: 50;
}

.floating-action-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 24px rgba(86, 130, 101, 0.5);
}

.floating-action-btn:active {
  transform: translateY(0) scale(1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .tab-container {
    padding: 12px 16px;
  }
  
  .tab-wrapper {
    max-width: none;
  }
  
  .message-item {
    padding: 16px;
    gap: 12px;
  }
  
  .user-avatar,
  .notification-icon {
    width: 44px;
    height: 44px;
  }
  
  .notification-icon {
    font-size: 20px;
  }
  
  .message-title {
    font-size: 16px;
  }
  
  .message-preview {
    font-size: 14px;
  }
  
  .floating-action-btn {
    width: 52px;
    height: 52px;
    bottom: 90px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 12px;
  }
  
  .header h1 {
    font-size: 18px;
  }
  
  .tab-content {
    font-size: 13px;
    gap: 6px;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .message-time {
    align-self: flex-end;
    margin-top: -20px;
  }
  
  .empty-state {
    padding: 60px 20px;
  }
  
  .empty-state h3 {
    font-size: 18px;
  }
  
  .empty-state p {
    font-size: 14px;
  }
  
  .start-chat-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}

/* 애니메이션 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-item {
  animation: slideIn 0.3s ease-out;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .tab-slider,
  .message-item,
  .floating-action-btn,
  .tab-btn {
    transition: none;
  }
  
  .message-item {
    animation: none;
  }
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .messages-container {
    background: linear-gradient(135deg, #2c3e30 0%, #1a1f1c 100%);
  }
  
  .header,
  .tab-container,
  .content-area {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .tab-wrapper {
    background: #2a2a2a;
  }
  
  .tab-content {
    color: #b0b0b0;
  }
  
  .tab-btn.active .tab-content {
    color: white;
  }
  
  .message-item {
    border-bottom-color: #333;
  }
  
  .message-item:hover {
    background: #2a2a2a;
  }
  
  .message-title {
    color: #e0e0e0;
  }
  
  .message-preview {
    color: #b0b0b0;
  }
  
  .user-avatar {
    border-color: #333;
  }
  
  .empty-illustration svg path {
    stroke: #555;
  }
  
  .empty-state h3 {
    color: #e0e0e0;
  }
  
  .empty-state p {
    color: #999;
  }
}

/* 스크롤바 스타일링 */
.message-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(86, 130, 101, 0.3);
  border-radius: 2px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(86, 130, 101, 0.5);
}

/* 포커스 스타일 */
.tab-btn:focus,
.message-item:focus,
.floating-action-btn:focus {
  outline: 2px solid #568265;
  outline-offset: 2px;
}

/* 로딩 애니메이션 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.message-item.loading {
  animation: pulse 1.5s infinite;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f8f9fa;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn,
.compose-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.search-btn:hover,
.compose-btn:hover {
  background: #f8f9fa;
  color: #568265;
}

.tab-container {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-wrapper {
  position: relative;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 4px;
  display: flex;
  max-width: 400px;
  margin: 0 auto;
}

.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background: linear-gradient(135deg, #568265, #4a7058);
  border-radius: 21px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(86, 130, 101, 0.3);
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 21px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: color 0.3s ease;
}

.tab-btn.active .tab-content {
  color: white;
}

.count-badge {
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.tab-btn.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

.content-area {
  flex: 1;
  background: white;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.start-chat-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.start-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 130, 101, 0.4);
}

.message-list {
  padding: 0;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.message-item:hover {
  background: #f8f9fa;
}

.message-item.unread {
  background: linear-gradient(90deg, rgba(86, 130, 101, 0.05), transparent);
}

.message-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #568265, #4a7058);
}

.message-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.notification-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  font-weight: 600;
}

.notification-icon.plant {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.notification-icon.trade {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.notification-icon.social {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.notification-icon.system {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.unread-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #e74c3c;
  border-radius: 50%;
  border: 3px solid white;
}

.online-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: #27ae60;
  border-radius: 50%;
  border: 3px solid white;
}

.unread-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #e74c3c;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 12px;
}

.message-title {
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.message-time {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

.message-preview {
  font-size: 15px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.own-message {
  color: #568265;
  font-weight: 500;
}

.message-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.price-tag {
  background: #e8f5e8;
  color: #27ae60;
}

.plant-tag {
  background: #f0f8f4;
  color: #568265;
}

.trade-tag {
  background: #fff3e0;
  color: #f57c00;
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.pin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
}

.pin-btn:hover {
  background: #f0f0f0;
  color: #568265;
}

.pin-btn.pinned {
  color: #f39c12;
  background: #fff8e7;
}

.floating-action-btn {
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>