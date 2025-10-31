<template>
  <div 
    class="chat-popup" 
    :class="{ minimized }"
    :style="popupStyle"
  >
    <div class="chat-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <div class="header-controls">
        <button @click="toggleMinimize" class="control-btn">─</button>
        <button @click="$emit('close')" class="control-btn">×</button>
      </div>
    </div>
    
    <div class="chat-content">
      <div class="chat-messages" ref="messageContainer">
        <div v-for="msg in messages" 
             :key="msg.id" 
             :class="['message', msg.sender_id === currentUser?.id ? 'my-message' : 'other-message']">
          <div class="message-content">{{ msg.content }}</div>
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
    ></div>
  </div>
</template>

<script>
import { supabase } from '../../utils/supabase'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    initialMessages: {
      type: Array,
      default: () => []
    },
    startX: {
      type: Number,
      default: 20
    },
    startY: {
      type: Number,
      default: 20
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    receiverId: {
      type: String,
      required: true
    }
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
      maxWidth: 500,
      maxHeight: 600,
      minWidth: 280,
      minHeight: 320,
      dragStartX: 0,
      dragStartY: 0,
      left: null,
      top: null,
      currentUser: null,
      subscription: null
    }
  },

  async created() {
    // localStorage에서 사용자 정보 가져오기
    const userId = localStorage.getItem('user_id')
    if (userId) {
      this.currentUser = { id: userId }
    } else {
      console.warn('로그인된 사용자가 없습니다.')
      return
    }

    this.loadMessages()
    this.subscribeToMessages()
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
      supabase.removeSubscription(this.subscription)
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

      if (error) {
        console.error('메시지 로드 실패:', error)
        return
      }

      this.messages = data
      this.$nextTick(this.scrollToBottom)
    },

    subscribeToMessages() {
      this.subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${this.receiverId},receiver_id=eq.${this.currentUser.id}`
          },
          (payload) => {
            this.messages.push(payload.new)
            this.scrollToBottom()
          }
        )
        .subscribe()
    },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.currentUser) return

      const message = {
        content: this.newMessage,
        sender_id: this.currentUser.id,
        receiver_id: this.receiverId
      }

      const { error } = await supabase
        .from('messages')
        .insert(message)

      if (error) {
        console.error('메시지 전송 실패:', error)
        return
      }

      this.newMessage = ''
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
        const width = Math.min(this.maxWidth, Math.max(this.minWidth, 
          this.width + (e.clientX - this.dragStartX)))
        const height = Math.min(this.maxHeight, Math.max(this.minHeight, 
          this.height + (e.clientY - this.dragStartY)))
        
        if (width !== this.width) this.width = width
        if (height !== this.height) this.height = height
        
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
        this.width = this.savedWidth
        this.height = this.savedHeight
        this.$nextTick(this.scrollToBottom)
      }
    },

    scrollToBottom() {
      if (this.$refs.messageContainer) {
        this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight
      }
    },

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
  transition: width 0.3s ease, height 0.3s ease;
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
  transition: all 0.3s ease;
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
</style>