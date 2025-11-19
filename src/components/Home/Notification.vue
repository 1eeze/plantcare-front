<template>
  <div class="messages-container">
    <div class="header">
      <div class="header-left">
        <button @click="handleHeaderBack" class="back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <h1 v-if="!isHeaderSearchActive">메시지</h1>
        <input 
          v-else
          ref="headerSearchInput"
          v-model="headerSearchKeyword"
          type="text" 
          class="header-search-input"
          :placeholder="activeTab === 'notifications' ? '알림 검색...' : '채팅방 검색...'"
          @keyup.enter="executeHeaderSearch"
        />
      </div>

      <div class="header-actions">
        <button @click="toggleHeaderSearch" class="search-btn" :class="{ active: isHeaderSearchActive }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button @click="openUserSearchModal" class="compose-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3L21 12L3 21V14.5L11 12L3 9.5V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

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

    <div class="content-area">
      <div v-if="activeTab === 'notifications'" class="notifications-section">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#ddd" stroke-width="1.5"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#ddd" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 v-if="headerSearchKeyword">검색 결과가 없어요</h3>
          <h3 v-else>새로운 알림이 없어요</h3>
          <p v-if="!headerSearchKeyword">식물 관리나 거래 알림이 오면 여기에 표시됩니다</p>
        </div>

        <div v-else class="message-list">
          <div 
            v-for="notification in filteredNotifications" 
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

      <div v-if="activeTab === 'chat'" class="chat-section">
        <div v-if="loadingChats" class="loading-state">
          <div class="loading-spinner small"></div>
          <p>대화 목록을 불러오는 중...</p>
        </div>
        <div v-else-if="filteredChatList.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#ddd" stroke-width="1.5"/>
            </svg>
          </div>
          <h3 v-if="headerSearchKeyword">검색된 채팅방이 없어요</h3>
          <h3 v-else>채팅이 없어요</h3>
          <p v-if="!headerSearchKeyword">다른 사용자와 대화를 시작해보세요</p>
          <button @click="openUserSearchModal" class="start-chat-btn">
            대화 상대 찾기
          </button>
        </div>

        <div v-else class="message-list">
          <div 
            v-for="chat in filteredChatList" 
            :key="chat.id"
            class="message-item chat-item"
            :class="{ unread: chat.unreadCount > 0 }"
            @click="openChat(chat)"
          >
            <div class="message-avatar">
              <img :src="chat.avatar || '/assets/default-avatar.png'" :alt="chat.name" class="user-avatar" />
              <div v-if="chat.unreadCount > 0" class="unread-count">{{ chat.unreadCount }}</div>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <h4 class="message-title">{{ chat.name }}</h4>
                <span class="message-time">{{ formatTime(chat.lastMessageTime) }}</span>
              </div>
              
              <p class="message-preview">
                <span v-if="chat.lastMessage.text === '::SYSTEM_LEAVE::'" style="color: #999; font-style: italic;">
                  상대방이 채팅방을 나갔습니다.
                </span>
                <span v-else>
                    <span v-if="chat.lastMessage.isOwn" class="own-message">나: </span>
                    {{ chat.lastMessage.text }}
                </span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="activeTab === 'chat'" @click="openUserSearchModal" class="floating-action-btn">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="showUserModal" class="modal-overlay" @click.self="closeUserSearchModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>새로운 대화 시작</h3>
          <button @click="closeUserSearchModal" class="close-modal-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#666" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="search-icon">
               <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
               <path d="m21 21-4.35-4.35" stroke="#999" stroke-width="2"/>
            </svg>
            <input 
              v-model="userSearchKeyword" 
              @input="searchUsers" 
              placeholder="사용자 이름 검색..." 
              class="user-search-input"
              autofocus
            />
          </div>
          
          <div class="search-results-list">
            <div v-if="isSearchingUsers" class="loading-indicator">
              <div class="loading-spinner small"></div>
            </div>
            <div v-else-if="userSearchResults.length === 0 && userSearchKeyword" class="no-results">
              검색 결과가 없습니다.
            </div>
            <div 
              v-for="user in userSearchResults" 
              :key="user.id" 
              class="user-result-item"
              @click="startNewChat(user)"
            >
              <img :src="user.avatar_url || '/assets/default-avatar.png'" class="user-avatar small" />
              <span class="user-name">{{ user.name }}</span>
              <span class="start-chat-text">대화하기</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const activeTab = ref('notifications')
const loadingChats = ref(false)
let messageSubscription = null 

const isHeaderSearchActive = ref(false)
const headerSearchKeyword = ref('')
const headerSearchInput = ref(null)

const toggleHeaderSearch = () => {
  isHeaderSearchActive.value = !isHeaderSearchActive.value
  if (isHeaderSearchActive.value) {
    nextTick(() => {
      headerSearchInput.value?.focus()
    })
  } else {
    headerSearchKeyword.value = ''
  }
}

const handleHeaderBack = () => {
  if (isHeaderSearchActive.value) {
    isHeaderSearchActive.value = false
    headerSearchKeyword.value = ''
  } else {
    router.back()
  }
}

const showUserModal = ref(false)
const userSearchKeyword = ref('')
const userSearchResults = ref([])
const isSearchingUsers = ref(false)
let searchTimeout = null

const openUserSearchModal = () => {
  showUserModal.value = true
  userSearchKeyword.value = ''
  userSearchResults.value = []
}

const closeUserSearchModal = () => {
  showUserModal.value = false
}

const searchUsers = async () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!userSearchKeyword.value.trim()) {
    userSearchResults.value = []
    return
  }

  isSearchingUsers.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('id, name, avatar_url')
        .ilike('name', `%${userSearchKeyword.value}%`)
        .limit(10)

      if (error) throw error

      const myId = currentUser.value?.id
      userSearchResults.value = data.filter(u => u.id !== myId)
    } catch (e) {
      console.error('User search failed', e)
    } finally {
      isSearchingUsers.value = false
    }
  }, 300)
}

const startNewChat = (targetUser) => {
  closeUserSearchModal()
  router.push(`/chat/${targetUser.id}`)
}

const notifications = ref([
  {
    id: 1,
    type: 'plant',
    title: '물주기 시간',
    message: '몬스테라에게 물을 줄 시간이에요',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    metadata: { plantName: '몬스테라' }
  },
  {
    id: 2,
    type: 'trade',
    title: '새로운 구매 문의',
    message: 'PlantLover님이 관심을 보이고 있어요',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    metadata: { price: 45000, plantName: '몬스테라 알보' }
  }
])

const chatList = ref([])
const currentUser = ref(null)

const filteredNotifications = computed(() => {
  if (!headerSearchKeyword.value) return notifications.value
  const keyword = headerSearchKeyword.value.toLowerCase()
  return notifications.value.filter(n => 
    n.title.toLowerCase().includes(keyword) || 
    n.message.toLowerCase().includes(keyword) ||
    (n.metadata?.plantName && n.metadata.plantName.toLowerCase().includes(keyword))
  )
})

const filteredChatList = computed(() => {
  if (!headerSearchKeyword.value) return chatList.value
  const keyword = headerSearchKeyword.value.toLowerCase()
  return chatList.value.filter(c => {
    // 시스템 메시지 검색 처리
    const text = c.lastMessage.text === '::SYSTEM_LEAVE::' 
        ? '상대방이 채팅방을 나갔습니다.' 
        : c.lastMessage.text
        
    return c.name.toLowerCase().includes(keyword) || text.toLowerCase().includes(keyword)
  })
})

const notificationCount = computed(() => notifications.value.filter(n => !n.read).length)
const chatCount = computed(() => chatList.value.reduce((sum, chat) => sum + chat.unreadCount, 0))

const loadChatList = async () => {
  loadingChats.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    currentUser.value = user

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const partnerIds = new Set()
    const conversations = {}

    messages.forEach(msg => {
      let partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!partnerId) partnerId = 'deleted'

      partnerIds.add(partnerId)
      
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          id: partnerId,
          name: partnerId === 'deleted' ? '(알 수 없음)' : '로딩 중...', 
          avatar: null,
          lastMessage: {
            text: msg.content,
            isOwn: msg.sender_id === user.id,
          },
          lastMessageTime: new Date(msg.created_at),
          unreadCount: 0,
          isMuted: false,
          isHidden: false // 숨김 상태 추가
        }
      }
      
      if (msg.receiver_id === user.id && !msg.is_read) {
        conversations[partnerId].unreadCount++
      }
    })

    const validIds = Array.from(partnerIds).filter(id => id !== 'deleted')
    
    if (validIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('Users')
        .select('id, name, avatar_url')
        .in('id', validIds)
      
      // [수정] 설정 가져올 때 is_hidden도 포함
      const { data: settings, error: settingsError } = await supabase
        .from('chat_settings')
        .select('partner_id, custom_name, is_muted, is_hidden')
        .eq('user_id', user.id)
        .in('partner_id', validIds)

      if (!profileError && profiles) {
        profiles.forEach(profile => {
          if (conversations[profile.id]) {
            conversations[profile.id].name = profile.name
            conversations[profile.id].avatar = profile.avatar_url
          }
        })
      }

      if (!settingsError && settings) {
        settings.forEach(setting => {
          const chat = conversations[setting.partner_id]
          if (chat) {
            if (setting.custom_name) chat.name = setting.custom_name
            chat.isMuted = setting.is_muted
            chat.isHidden = setting.is_hidden // 숨김 상태 반영
          }
        })
      }
    }

    // [수정] 숨김 처리된 채팅방은 목록에서 제외
    const visibleChats = []
    Object.values(conversations).forEach(chat => {
        if (chat.name === '로딩 중...') chat.name = '(알 수 없음)'
        if (chat.isMuted) chat.name += ' 🔕'
        
        // 숨김이 아니거나, 숨겨졌더라도 새 메시지가 있으면(로직 상 send시 unhide됨) 표시
        if (!chat.isHidden) {
            visibleChats.push(chat)
        }
    })

    chatList.value = visibleChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)

  } catch (e) {
    console.error('채팅 목록 로드 실패:', e)
  } finally {
    loadingChats.value = false
  }
}

const subscribeToMessageChanges = () => {
  if (!currentUser.value) return

  if (messageSubscription) supabase.removeChannel(messageSubscription)

  messageSubscription = supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        const newMsg = payload.new
        const oldMsg = payload.old
        const myId = currentUser.value.id

        // INSERT, UPDATE, DELETE 모두 내 관련인지 확인
        const isRelevant = 
          (newMsg && (newMsg.sender_id === myId || newMsg.receiver_id === myId)) ||
          (oldMsg && (oldMsg.sender_id === myId || oldMsg.receiver_id === myId))

        if (isRelevant) {
          loadChatList()
        }
      }
    )
    .subscribe()
}

onMounted(async () => {
  await loadChatList()
  subscribeToMessageChanges()
})

onBeforeUnmount(() => {
  if (messageSubscription) supabase.removeChannel(messageSubscription)
})

const setActiveTab = (tab) => { 
  activeTab.value = tab 
  isHeaderSearchActive.value = false
  headerSearchKeyword.value = ''
}

const openChat = (chat) => {
    router.push(`/chat/${chat.id}`)
}

const handleNotificationClick = (notification) => {
  notification.read = true
}

const getNotificationIcon = (type) => {
  const icons = { plant: '🌱', trade: '💰', social: '❤️', system: '⚙️' }
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
  
  return timestamp.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price) + '원'
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
.messages-container { background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%); min-height: 100vh; display: flex; flex-direction: column; }
.header { background: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 50; height: 72px; box-sizing: border-box; }
.header-search-input { border: none; background: #f8f9fa; padding: 8px 12px; border-radius: 8px; font-size: 16px; width: 100%; color: #2c3e50; outline: none; margin-left: 8px; }
.floating-action-btn { position: fixed; bottom: 100px; right: 20px; width: 56px; height: 56px; background: linear-gradient(135deg, #568265, #4a7058); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(86, 130, 101, 0.4); transition: all 0.3s ease; z-index: 50; }
.floating-action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(86, 130, 101, 0.5); }
.floating-action-btn:active { transform: translateY(0) scale(1); }

@media (max-width: 768px) {
  .header { padding: 12px 16px; }
  .header h1 { font-size: 20px; }
  .tab-container { padding: 12px 16px; }
  .tab-wrapper { max-width: none; }
  .message-item { padding: 16px; gap: 12px; }
  .user-avatar, .notification-icon { width: 44px; height: 44px; }
  .notification-icon { font-size: 20px; }
  .message-title { font-size: 16px; }
  .message-preview { font-size: 14px; }
  .floating-action-btn { width: 52px; height: 52px; bottom: 90px; right: 16px; }
}
@media (max-width: 480px) {
  .header-left { gap: 12px; }
  .header h1 { font-size: 18px; }
  .tab-content { font-size: 13px; gap: 6px; }
  .message-header { flex-direction: column; align-items: flex-start; gap: 4px; }
  .message-time { align-self: flex-end; margin-top: -20px; }
  .empty-state { padding: 60px 20px; }
  .empty-state h3 { font-size: 18px; }
  .empty-state p { font-size: 14px; }
  .start-chat-btn { padding: 12px 24px; font-size: 14px; }
}
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.message-item { animation: slideIn 0.3s ease-out; }

@media (prefers-reduced-motion: reduce) {
  .tab-slider, .message-item, .floating-action-btn, .tab-btn { transition: none; }
  .message-item { animation: none; }
}
@media (prefers-color-scheme: dark) {
  .messages-container { background: linear-gradient(135deg, #2c3e30 0%, #1a1f1c 100%); }
  .header, .tab-container, .content-area { background: #1a1a1a; color: #e0e0e0; }
  .tab-wrapper { background: #2a2a2a; }
  .tab-content { color: #b0b0b0; }
  .tab-btn.active .tab-content { color: white; }
  .message-item { border-bottom-color: #333; }
  .message-item:hover { background: #2a2a2a; }
  .message-title { color: #e0e0e0; }
  .message-preview { color: #b0b0b0; }
  .user-avatar { border-color: #333; }
  .empty-illustration svg path { stroke: #555; }
  .empty-state h3 { color: #e0e0e0; }
  .empty-state p { color: #999; }
  .header-search-input { background: #2a2a2a; color: #e0e0e0; }
  .modal-content { background: #2a2a2a !important; color: #e0e0e0; }
  .user-search-box { background: #333 !important; }
  .user-search-input { color: white !important; }
  .user-result-item:hover { background: #333 !important; }
}

.message-list::-webkit-scrollbar { width: 4px; }
.message-list::-webkit-scrollbar-track { background: transparent; }
.message-list::-webkit-scrollbar-thumb { background: rgba(86, 130, 101, 0.3); border-radius: 2px; }
.message-list::-webkit-scrollbar-thumb:hover { background: rgba(86, 130, 101, 0.5); }

.tab-btn:focus, .message-item:focus, .floating-action-btn:focus { outline: 2px solid #568265; outline-offset: 2px; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.message-item.loading { animation: pulse 1.5s infinite; }

.header-left { display: flex; align-items: center; gap: 16px; flex: 1; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; border-radius: 50%; cursor: pointer; color: #2c3e50; transition: all 0.2s ease; flex-shrink: 0; }
.back-btn:hover { background: #f8f9fa; }
.header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #2c3e50; }
.header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.search-btn, .compose-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: none; border: none; border-radius: 50%; cursor: pointer; color: #666; transition: all 0.2s ease; }
.search-btn:hover, .compose-btn:hover { background: #f8f9fa; color: #568265; }
.search-btn.active { color: #568265; background: #f0f7f2; }

.tab-container { background: white; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.tab-wrapper { position: relative; background: #f8f9fa; border-radius: 25px; padding: 4px; display: flex; max-width: 400px; margin: 0 auto; }
.tab-slider { position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); background: linear-gradient(135deg, #568265, #4a7058); border-radius: 21px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(86, 130, 101, 0.3); }
.tab-btn { flex: 1; background: none; border: none; cursor: pointer; padding: 12px 16px; border-radius: 21px; transition: all 0.3s ease; position: relative; z-index: 2; }
.tab-content { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 600; color: #666; transition: color 0.3s ease; }
.tab-btn.active .tab-content { color: white; }
.count-badge { background: #e74c3c; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; margin-left: 4px; }
.tab-btn.active .count-badge { background: rgba(255, 255, 255, 0.3); }

.content-area { flex: 1; background: white; overflow: hidden; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
.empty-illustration { margin-bottom: 24px; opacity: 0.6; }
.empty-state h3 { font-size: 20px; color: #2c3e50; margin: 0 0 12px 0; font-weight: 600; }
.empty-state p { font-size: 16px; color: #666; margin: 0 0 32px 0; line-height: 1.5; }
.start-chat-btn { padding: 14px 28px; background: linear-gradient(135deg, #568265, #4a7058); color: white; border: none; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3); }
.start-chat-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(86, 130, 101, 0.4); }

.message-list { padding: 0; }
.message-item { display: flex; align-items: flex-start; gap: 16px; padding: 20px; border-bottom: 1px solid #f8f9fa; cursor: pointer; transition: all 0.2s ease; position: relative; }
.message-item:hover { background: #f8f9fa; }
.message-item.unread { background: linear-gradient(90deg, rgba(86, 130, 101, 0.05), transparent); }
.message-item.unread::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(135deg, #568265, #4a7058); }
.message-avatar { position: relative; flex-shrink: 0; }
.user-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #f0f0f0; }
.notification-icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; font-weight: 600; }
.unread-indicator { position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; background: #e74c3c; border-radius: 50%; border: 3px solid white; }
.unread-count { position: absolute; top: -6px; right: -6px; background: #e74c3c; color: white; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 12px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

.message-content { flex: 1; min-width: 0; }
.message-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 12px; }
.message-title { font-size: 17px; font-weight: 600; color: #2c3e50; margin: 0; line-height: 1.3; }
.message-time { font-size: 13px; color: #999; white-space: nowrap; flex-shrink: 0; }
.message-preview { font-size: 15px; color: #666; line-height: 1.4; margin: 0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.own-message { color: #568265; font-weight: 500; }

/* 모달 스타일들 그대로 유지 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
.modal-content { background: white; width: 90%; max-width: 400px; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { margin: 0; font-size: 18px; color: #2c3e50; }
.close-modal-btn { background: none; border: none; cursor: pointer; padding: 4px; }
.user-search-box { display: flex; align-items: center; background: #f8f9fa; padding: 12px; border-radius: 12px; margin-bottom: 16px; }
.search-icon { margin-right: 10px; flex-shrink: 0; }
.user-search-input { border: none; background: none; width: 100%; font-size: 16px; outline: none; color: #2c3e50; }
.search-results-list { max-height: 300px; overflow-y: auto; }
.user-result-item { display: flex; align-items: center; padding: 10px; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
.user-result-item:hover { background: #f0f7f2; }
.user-avatar.small { width: 40px; height: 40px; margin-right: 12px; }
.user-name { flex: 1; font-weight: 600; color: #2c3e50; }
.start-chat-text { font-size: 13px; color: #568265; font-weight: 600; }
.loading-indicator { display: flex; justify-content: center; padding: 20px; }
.no-results { text-align: center; color: #999; padding: 20px; font-size: 14px; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.loading-spinner.small { width: 24px; height: 24px; border-width: 2px; }
</style>