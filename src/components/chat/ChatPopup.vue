<template>
  <div 
    class="chat-popup" 
    :class="{ minimized }"
    :style="popupStyle"
    @mousedown="focusPopup"
  >
    <div class="chat-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <div class="header-controls" @mousedown.stop>
        <button @click="toggleMinimize" class="control-btn">─</button>
        <button @click="$emit('close')" class="control-btn">×</button>
      </div>
    </div>
    
    <div class="chat-content" v-show="!minimized">
      <div class="chat-messages" ref="messageContainer">
        
        <div v-if="messages.length === 0" class="empty-state">
          <p>대화를 시작해보세요!</p>
        </div>

        <div v-for="msg in messages" 
             :key="msg.id" 
             :class="['message', msg.sender_id === currentUser?.id ? 'my-message' : 'other-message']">
          
          <div class="message-row">
            <span v-if="msg.sender_id === currentUser?.id && !msg.is_read" class="unread-mark">읽지 않음</span>
            <div class="message-content">{{ msg.content }}</div>
          </div>
          
          <div class="message-time">{{ formatTime(msg.created_at) }}</div>
        </div>
      </div>

      <div class="chat-input">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="메시지를 입력하세요..."
        />
        <button @click="sendMessage">전송</button>
      </div>
    </div>

    <div 
      class="resize-handle"
      @mousedown.stop="startResize"
      v-show="!minimized"
    ></div>
  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  props: {
    visible: { type: Boolean, default: true },
    title: { type: String, required: true },
    initialMessages: { type: Array, default: () => [] },
    startX: { type: Number, default: 20 },
    startY: { type: Number, default: 20 },
    zIndex: { type: Number, default: 1000 },
    receiverId: { type: String, required: true }
  },

  data() {
    return {
      messages: this.initialMessages || [],
      newMessage: '',
      minimized: false,
      dragging: false,
      resizing: false,
      x: this.startX,
      y: this.startY,
      width: 320,
      height: 420,
      savedWidth: 320,
      savedHeight: 420,
      maxWidth: 600,
      maxHeight: 700,
      minWidth: 280,
      minHeight: 300,
      dragStartX: 0,
      dragStartY: 0,
      left: null,
      top: null,
      currentUser: null,
      subscription: null
    }
  },

  async created() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      this.currentUser = user
      this.loadMessages()
      this.subscribeToMessages()
    } else {
      this.$emit('close')
    }
  },

  mounted() {
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('mouseup', this.onMouseUp)
    this.scrollToBottom()
  },

  beforeUnmount() {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
    if (this.subscription) {
      supabase.removeChannel(this.subscription)
    }
  },

  computed: {
    popupStyle() {
      const style = {
        width: this.minimized ? '280px' : `${this.width}px`,
        height: this.minimized ? '40px' : `${this.height}px`,
        zIndex: this.zIndex
      }

      if (this.left !== null && this.top !== null) {
        style.left = `${this.left}px`
        style.top = `${this.top}px`
      } else {
        style.right = `${this.x}px`
        style.bottom = `${this.y}px`
      }

      return style
    }
  },

  methods: {
    async loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${this.receiverId}),and(sender_id.eq.${this.receiverId},receiver_id.eq.${this.currentUser.id})`)
        .order('created_at', { ascending: true })

      if (!error) {
        this.messages = data
        // 처음 로드될 때는 창이 열려있으므로 읽음 처리
        if (!this.minimized) {
          await this.markMessagesAsRead()
        }
        this.scrollToBottom()
      }
    },

    async markMessagesAsRead() {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', this.currentUser.id)
        .eq('sender_id', this.receiverId)
        .eq('is_read', false)
    },

    subscribeToMessages() {
      const channelName = `popup_${[this.currentUser.id, this.receiverId].sort().join('_')}`
      if (this.subscription) supabase.removeChannel(this.subscription)

      this.subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new
            if (
              (newMsg.sender_id === this.receiverId && newMsg.receiver_id === this.currentUser.id) ||
              (newMsg.sender_id === this.currentUser.id && newMsg.receiver_id === this.receiverId)
            ) {
              if (!this.messages.some(m => m.id === newMsg.id)) {
                this.messages.push(newMsg)
                
                // [수정] 최소화 상태가 아닐 때만 읽음 처리
                if (newMsg.sender_id === this.receiverId && !this.minimized) {
                    this.markMessagesAsRead()
                }
                
                this.scrollToBottom()
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            const target = this.messages.find(m => m.id === payload.new.id)
            if (target) {
              target.is_read = payload.new.is_read
            }
          }
        )
        .subscribe()
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return
      const text = this.newMessage
      this.newMessage = ''

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: text,
          sender_id: this.currentUser.id,
          receiver_id: this.receiverId,
          is_read: false
        })
        .select()
        .single()

      if (error) {
        alert('메시지 전송에 실패했습니다.')
        return
      }

      if (data) {
        this.messages.push(data)
        this.scrollToBottom()
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
            if (this.$refs.messageContainer) {
            this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight
            }
        }, 50) 
      })
    },

    startDrag(e) {
      if (e.target.closest('.control-btn') || e.target.closest('.resize-handle')) return
      const rect = this.$el.getBoundingClientRect()
      this.left = rect.left
      this.top = rect.top
      this.dragging = true
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      e.preventDefault()
    },

    startResize(e) {
      this.resizing = true
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      e.preventDefault()
    },

    onMouseMove(e) {
      if (this.dragging) {
        const dx = e.clientX - this.dragStartX
        const dy = e.clientY - this.dragStartY
        this.left = Math.max(0, this.left + dx)
        this.top = Math.max(0, this.top + dy)
        this.dragStartX = e.clientX
        this.dragStartY = e.clientY
      }
      else if (this.resizing && !this.minimized) {
        const dx = e.clientX - this.dragStartX
        const dy = e.clientY - this.dragStartY
        this.width = Math.max(this.minWidth, Math.min(this.maxWidth, this.width + dx))
        this.height = Math.max(this.minHeight, Math.min(this.maxHeight, this.height + dy))
        this.savedWidth = this.width
        this.savedHeight = this.height
        this.dragStartX = e.clientX
        this.dragStartY = e.clientY
      }
    },

    onMouseUp() {
      this.dragging = false
      this.resizing = false
    },

    toggleMinimize() {
      this.minimized = !this.minimized
      if (!this.minimized) {
        // [추가] 최소화 해제(창 열기) 시 읽음 처리
        this.markMessagesAsRead()
        
        this.width = this.savedWidth
        this.height = this.savedHeight
        this.scrollToBottom()
      }
    },
    
    focusPopup() {},

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },

  watch: {
    initialMessages: {
      immediate: true,
      handler(newVal) {
        this.messages = newVal || []
        this.$nextTick(this.scrollToBottom)
      }
    },
    visible(newVal) {
      if (newVal) {
        this.$nextTick(this.scrollToBottom)
      }
    }
  }
}
</script>

<style scoped>
.chat-popup {
  position: fixed;
  min-width: 280px;
  min-height: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #ccc;
}

.chat-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #568265;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  height: 40px;
  box-sizing: border-box;
  user-select: none;
  z-index: 2;
}

.chat-content {
  margin-top: 40px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-popup.minimized .chat-content {
  display: none;
}

.header-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 8px;
  max-width: 80%;
}

.my-message {
  margin-left: auto;
  text-align: right;
}

.other-message {
  margin-right: auto;
  text-align: left;
}

.message-row {
    display: flex;
    align-items: flex-end; 
    gap: 5px;
    justify-content: flex-end; 
}

.other-message .message-row {
    justify-content: flex-start; 
    flex-direction: row-reverse; 
}

.unread-mark {
    font-size: 10px;
    color: #568265;
    font-weight: bold;
    margin-bottom: 2px;
    white-space: nowrap;
}

.message-content {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 16px;
  background: #f0f0f0;
  word-break: break-word;
}

.my-message .message-content {
  background: #568265;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  background: white;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.chat-input button {
  padding: 8px 16px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.chat-input button:hover {
  background: #456b4f;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  z-index: 2;
}

.resize-handle::before {
  content: '';
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 12px;
  height: 12px;
  border-right: 2px solid #ccc;
  border-bottom: 2px solid #ccc;
}

.loading-spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #568265;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 20px; color: #999; font-size: 12px; }
</style>