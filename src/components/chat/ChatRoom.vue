<template>
  <div class="chat-room-container">
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
      </button>
      
      <div class="chat-info" @click="goToProfile">
        <span class="receiver-name">{{ customRoomName || receiverName }}</span>
        <span v-if="isNotificationMuted" style="font-size: 12px; margin-left: 5px;">🔕</span>
      </div>
      
      <button @click="openMenu" class="menu-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>

    <div class="chat-messages" ref="messageContainer">
      <div v-if="loadingMessages" class="loading-state">
        <div class="loading-spinner"></div>
        <p>메시지 로드 중...</p>
      </div>
      
      <div v-else-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>대화를 시작해보세요!</p>
      </div>

      <template v-for="msg in messages" :key="msg.id">
        
        <div v-if="msg.content === '::SYSTEM_LEAVE::'" class="system-message">
          <p v-if="msg.sender_id === currentUser?.id">당신이 채팅방을 나갔습니다.</p>
          <p v-else>{{ receiverName }}님이 채팅방을 나갔습니다.</p>
        </div>

        <div v-else
             class="message-row"
             :class="msg.sender_id === currentUser?.id ? 'my-message' : 'other-message'">
          
          <div v-if="msg.sender_id !== currentUser?.id" class="profile-col">
            <img :src="receiverAvatar" class="msg-avatar" @click="goToProfile" />
          </div>

          <div class="message-content-wrapper">
            <span v-if="msg.sender_id !== currentUser?.id" class="sender-name">{{ receiverName }}</span>

            <div class="bubble-row">
              <div v-if="msg.sender_id === currentUser?.id" class="message-meta my-meta">
                <span v-if="!msg.is_read" class="unread-text">읽지 않음</span>
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>

              <div class="message-bubble">
                {{ msg.content }}
              </div>

              <div v-if="msg.sender_id !== currentUser?.id" class="message-meta other-meta">
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div v-if="isDeletedUser" class="system-message">
        <p>알 수 없는 사용자입니다.</p>
      </div>

      <div ref="bottomElement" class="bottom-spacer"></div>
    </div>

    <div class="chat-input-area">
      <input 
        :value="newMessage"
        @input="onInput"
        @keyup.enter="sendMessage"
        :placeholder="isDeletedUser ? '대화가 불가능합니다.' : '메시지를 입력하세요...'"
        :disabled="isDeletedUser"
      />
      <button @click="sendMessage" :disabled="!newMessage.trim() || isDeletedUser">전송</button>
    </div>

    <div v-if="showMenuModal" class="menu-overlay" @click="closeMenu">
      <div class="menu-content" @click.stop>
        <h3>채팅방 설정</h3>
        <button class="menu-item" @click="changeRoomName">
          <span class="icon">✏️</span>
          <span>채팅방 이름 변경</span>
        </button>
        <button class="menu-item" @click="toggleNotification">
          <span class="icon">{{ isNotificationMuted ? '🔔' : '🔕' }}</span>
          <span>알림 {{ isNotificationMuted ? '켜기' : '끄기' }}</span>
        </button>
        <button class="menu-item danger" @click="leaveChatRoom">
          <span class="icon">🚪</span>
          <span>채팅방 나가기</span>
        </button>
        <button class="close-menu-btn" @click="closeMenu">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase.js'
import defaultAvatar from '@/assets/user-profile.png'

const router = useRouter()
const route = useRoute()

const messages = ref([])
const newMessage = ref('')
const currentUser = ref(null)
const receiverId = ref(route.params.id)
const receiverName = ref('상대방')
const receiverAvatar = ref(defaultAvatar)
const customRoomName = ref('')
const loadingMessages = ref(true)
const messageContainer = ref(null)
const bottomElement = ref(null)
let subscription = null

const showMenuModal = ref(false)
const isNotificationMuted = ref(false)

const isDeletedUser = computed(() => {
  return receiverId.value === 'deleted' || receiverName.value === '(알 수 없음)'
})

// [추가] 한글 입력 즉시 반영을 위한 핸들러
const onInput = (e) => {
  newMessage.value = e.target.value
}

const loadChatSettings = async () => {
  if (!currentUser.value || isDeletedUser.value) return

  const { data } = await supabase
    .from('chat_settings')
    .select('custom_name, is_muted')
    .eq('user_id', currentUser.value.id)
    .eq('partner_id', receiverId.value)
    .single()

  if (data) {
    if (data.custom_name) customRoomName.value = data.custom_name
    isNotificationMuted.value = data.is_muted
  }
}

const saveChatSettings = async (updates) => {
  if (!currentUser.value || isDeletedUser.value) return

  const { error } = await supabase
    .from('chat_settings')
    .upsert({
      user_id: currentUser.value.id,
      partner_id: receiverId.value,
      ...updates
    })
  
  if (error) console.error('설정 저장 실패:', error)
}

const loadUserInfo = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/login')
        currentUser.value = user

        if (receiverId.value === 'deleted') {
            receiverName.value = '(알 수 없음)'
            receiverAvatar.value = defaultAvatar
            return
        }

        const { data: partnerData, error: partnerError } = await supabase
            .from('Users')
            .select('name, avatar_url')
            .eq('id', receiverId.value)
            .single()

        if (partnerError || !partnerData) {
            receiverName.value = '(알 수 없음)'
            receiverAvatar.value = defaultAvatar
        } else {
            receiverName.value = partnerData.name
            receiverAvatar.value = partnerData.avatar_url
        }
        
        await loadChatSettings()
    } catch (e) {
        console.error('사용자 정보 로드 실패:', e)
    }
}

const loadMessages = async () => {
    loadingMessages.value = true
    try {
        let query = supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (receiverId.value === 'deleted') {
            query = query.or(`and(sender_id.eq.${currentUser.value.id},receiver_id.is.null),and(sender_id.is.null,receiver_id.eq.${currentUser.value.id})`)
        } else {
            query = query.or(`and(sender_id.eq.${currentUser.value.id},receiver_id.eq.${receiverId.value}),and(sender_id.eq.${receiverId.value},receiver_id.eq.${currentUser.value.id})`)
        }

        const { data, error } = await query
        if (error) throw error

        messages.value = data
        await markMessagesAsRead()
        scrollToBottom()
    } catch (e) {
        console.error('메시지 로드 실패:', e)
    } finally {
        loadingMessages.value = false
    }
}

const markMessagesAsRead = async () => {
    if (!currentUser.value) return
    let query = supabase.from('messages').update({ is_read: true }).eq('receiver_id', currentUser.value.id).eq('is_read', false)
    
    if (receiverId.value === 'deleted') {
        query = query.is('sender_id', null)
    } else {
        query = query.eq('sender_id', receiverId.value)
    }
    await query
}

const subscribeToMessages = () => {
    if (!currentUser.value) return

    const channelName = (receiverId.value === 'deleted')
        ? `chat_deleted_${currentUser.value.id}`
        : `chat_${[currentUser.value.id, receiverId.value].sort().join('_')}`
    
    if (subscription) {
        subscription.unsubscribe()
        subscription = null
    }
    
    subscription = supabase
        .channel(channelName) 
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
             const newMsg = payload.new
             const myId = currentUser.value.id
             
             let isRelevant = false
             if (receiverId.value === 'deleted') {
                 isRelevant = (newMsg.sender_id === myId && newMsg.receiver_id === null) ||
                              (newMsg.sender_id === null && newMsg.receiver_id === myId)
             } else {
                 isRelevant = (newMsg.sender_id === myId && newMsg.receiver_id === receiverId.value) ||
                              (newMsg.sender_id === receiverId.value && newMsg.receiver_id === myId)
             }

             if (isRelevant) {
                 // 중복 방지 로직
                 if (!messages.value.find(m => m.id === newMsg.id)) {
                     messages.value.push(newMsg)
                     if (newMsg.sender_id !== myId) {
                         markMessagesAsRead()
                     }
                     scrollToBottom()
                 }
             }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
            const targetMsg = messages.value.find(m => m.id === payload.new.id)
            if (targetMsg) targetMsg.is_read = payload.new.is_read
        })
        .subscribe()
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !currentUser.value) return
    if (isDeletedUser.value) return

    const content = newMessage.value.trim()
    newMessage.value = ''

    const message = {
        content: content,
        sender_id: currentUser.value.id,
        receiver_id: receiverId.value,
        is_read: false
    }

    const { data, error } = await supabase.from('messages').insert(message).select().single()

    if (error) {
        alert('전송 실패')
    } else if (data) {
        await saveChatSettings({ is_hidden: false })
        if (!messages.value.find(m => m.id === data.id)) {
            messages.value.push(data)
            scrollToBottom() 
        }
    }
}

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (bottomElement.value) bottomElement.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50) 
  })
}

const goBack = () => router.back()
const openMenu = () => { showMenuModal.value = true }
const closeMenu = () => { showMenuModal.value = false }

const changeRoomName = async () => {
  const newName = prompt('변경할 채팅방 이름을 입력하세요:', customRoomName.value || receiverName.value)
  if (newName) {
    customRoomName.value = newName
    await saveChatSettings({ custom_name: newName })
  }
}

const toggleNotification = async () => {
  isNotificationMuted.value = !isNotificationMuted.value
  await saveChatSettings({ is_muted: isNotificationMuted.value })
}

const leaveChatRoom = async () => {
  if (!confirm('채팅방을 나가시겠습니까?')) return

  try {
    // Case 1: 탈퇴한 유저와의 채팅 -> 영구 삭제
    if (isDeletedUser.value) {
        const messageIds = messages.value.map(m => m.id)
        if (messageIds.length > 0) {
            const { error } = await supabase
                .from('messages')
                .delete()
                .in('id', messageIds)
            if (error) throw error
        }
    } 
    // Case 2: 일반 유저 -> 시스템 메시지 및 숨김
    else {
        await supabase.from('messages').insert({
            content: '::SYSTEM_LEAVE::',
            sender_id: currentUser.value.id,
            receiver_id: receiverId.value,
            is_read: false
        })
        await saveChatSettings({ is_hidden: true })
    }
    
    router.replace('/notification')

  } catch (e) {
    console.error('채팅방 나가기 실패:', e)
    alert('오류가 발생했습니다.')
  }
}

const goToProfile = () => {
  if (receiverId.value && !isDeletedUser.value) router.push(`/profile/${receiverId.value}`)
}
const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const initializeChatRoom = async () => {
    loadingMessages.value = true
    await loadUserInfo()
    if (currentUser.value) {
        await loadMessages()
        subscribeToMessages()
    }
}

watch(() => route.params.id, (newId) => {
    receiverId.value = newId
    initializeChatRoom()
})

onMounted(initializeChatRoom)

onBeforeUnmount(() => {
    if (subscription) subscription.unsubscribe()
})
</script>

<style scoped>
/* 스타일은 변경 없음 */
.chat-room-container { display: flex; flex-direction: column; height: 100vh; max-width: 600px; margin: 0 auto; background-color: #f7f7f7; overflow: hidden; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #568265; color: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1); flex-shrink: 0; z-index: 10; }
.chat-info { display: flex; align-items: center; gap: 4px; cursor: pointer; justify-content: center; flex: 1; }
.receiver-name { font-size: 18px; font-weight: 600; color: white; margin: 0; }
.back-btn, .menu-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }

.chat-messages { flex-grow: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; background-color: #f7f7f7; }

.message-row { display: flex; width: 100%; align-items: flex-start; }
.my-message { justify-content: flex-end; }
.other-message { justify-content: flex-start; }

.profile-col { margin-right: 6px; display: flex; flex-direction: column; justify-content: flex-start; }
.msg-avatar { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; border: 1px solid #eee; background: white; cursor: pointer; }

.message-content-wrapper { display: flex; flex-direction: column; max-width: 70%; }
.my-message .message-content-wrapper { align-items: flex-end; }
.other-message .message-content-wrapper { align-items: flex-start; }

.sender-name { font-size: 13px; color: #666; margin-bottom: 4px; margin-left: 0; margin-top: 2px; }

.bubble-row { display: flex; align-items: flex-end; gap: 6px; }
.my-message .bubble-row { flex-direction: row; }
.other-message .bubble-row { flex-direction: row; }

.message-bubble { padding: 10px 14px; border-radius: 16px; word-wrap: break-word; white-space: pre-wrap; font-size: 15px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); position: relative; }
.my-message .message-bubble { background-color: #568265; color: white; border-top-right-radius: 2px; }
.other-message .message-bubble { background-color: white; color: #333; border: 1px solid #eee; border-top-left-radius: 2px; }

.message-meta { display: flex; flex-direction: column; justify-content: flex-end; min-width: fit-content; }
.my-meta { align-items: flex-end; text-align: right; }
.other-meta { align-items: flex-start; }

.message-time { font-size: 11px; color: #999; white-space: nowrap; }
.unread-text { font-size: 10px; color: #568265; font-weight: bold; margin-bottom: 2px; }

.system-message { text-align: center; margin: 10px 0; font-size: 12px; color: #666; background: rgba(0,0,0,0.05); padding: 4px 10px; border-radius: 10px; align-self: center; }
.system-message p { margin: 0; }

.bottom-spacer { height: 20px; }

.chat-input-area { display: flex; padding: 10px 12px; background-color: #fff; border-top: 1px solid #eee; flex-shrink: 0; gap: 10px; padding-bottom: calc(10px + env(safe-area-inset-bottom)); box-shadow: 0 -2px 10px rgba(0,0,0,0.03); }
.chat-input-area input { flex-grow: 1; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 24px; font-size: 15px; outline: none; background: #f9f9f9; transition: border-color 0.2s; }
.chat-input-area input:focus { border-color: #568265; background: white; }
.chat-input-area button { padding: 0 20px; background-color: #568265; color: white; border: none; border-radius: 24px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; font-size: 14px; white-space: nowrap; }
.chat-input-area button:disabled { background-color: #e0e0e0; color: #999; cursor: not-allowed; }

.loading-state, .empty-state { text-align: center; padding: 60px 20px; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
.loading-spinner { border: 3px solid #f3f3f3; border-top: 3px solid #568265; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.menu-content { background: white; width: 80%; max-width: 300px; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.menu-content h3 { margin: 0 0 16px 0; font-size: 18px; text-align: center; color: #333; }
.menu-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; border: none; background: #f9f9f9; border-radius: 12px; margin-bottom: 8px; cursor: pointer; font-size: 15px; color: #333; transition: background 0.2s; }
.menu-item:hover { background: #f0f0f0; }
.menu-item.danger { color: #e74c3c; background: #fff5f5; }
.menu-item.danger:hover { background: #ffecec; }
.menu-item .icon { font-size: 18px; }
.close-menu-btn { width: 100%; padding: 12px; margin-top: 8px; background: #568265; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }

@media (max-width: 480px) { .chat-room-container { max-width: 100%; } }
</style>