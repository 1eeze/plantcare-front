<template>
  <transition name="chat-fade">
    <div
      v-if="visible"
      class="chat-popup"
      :style="popupStyle"
      ref="popup"
      @keydown.esc.prevent="emitClose"
      tabindex="0"
    >
      <!-- 헤더 (드래그 핸들) -->
      <div class="chat-header" @mousedown="startDrag" @touchstart="startDrag">
        <div class="chat-title">
          <span class="dot online"></span>
          <strong>{{ title }}</strong>
        </div>
        <div class="chat-actions">
          <button class="btn" @click="toggleMinimize" :title="minimized ? '열기' : '최소화'">
            {{ minimized ? '▢' : '—' }}
          </button>
          <button class="btn close" @click="emitClose" title="닫기">✕</button>
        </div>
      </div>

      <!-- 본문 (최소화 시 숨김) -->
      <div v-show="!minimized" class="chat-body">
        <div class="messages" ref="listEl">
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="message"
            :class="m.me ? 'me' : 'you'"
          >
            <div class="bubble">{{ m.text }}</div>
            <div class="meta">{{ formatTime(m.at) }}</div>
          </div>
        </div>

        <form class="chat-input" @submit.prevent="send">
          <input
            v-model="draft"
            type="text"
            placeholder="메시지를 입력하세요…"
            ref="inputEl"
          />
          <button type="submit" class="send-btn">보내기</button>
        </form>
      </div>

      <!-- 크기 조절 핸들 (최소화 시 숨김) -->
      <div
        v-show="!minimized"
        class="resize-handle"
        @mousedown="startResize"
        @touchstart="startResize"
        title="크기 조절"
      />
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'

const HEADER_H = 44
const MIN_W = 280
const MIN_H = 260
const MARGIN = 16

const props = defineProps({
  title: { type: String, default: '채팅' },
  initialMessages: {
    type: Array,
    default: () => [
      { text: '안녕하세요! 무엇을 도와드릴까요?', me: false, at: Date.now() }
    ]
  },
  visible: { type: Boolean, default: true },
  startX: { type: Number, default: 0 },
  startY: { type: Number, default: 0 },
  startWidth:  { type: Number, default: 320 },
  startHeight: { type: Number, default: 420 },
})

const emit = defineEmits(['close', 'update:visible', 'send'])

const messages = ref([...props.initialMessages])
const draft = ref('')
const minimized = ref(false)

const popup = ref(null)
const listEl = ref(null)
const inputEl = ref(null)

const pos = ref({ x: props.startX || 0, y: props.startY || 0 })
const size = ref({ w: props.startWidth, h: props.startHeight })

const dragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const resizing = ref(false)
const resizeStart = ref({ x: 0, y: 0 })
const sizeStart   = ref({ w: size.value.w, h: size.value.h })

const popupStyle = computed(() => ({
  left: `${pos.value.x}px`,
  top: `${pos.value.y}px`,
  width: `${size.value.w}px`,
  height: minimized.value ? `${HEADER_H}px` : `${size.value.h}px`,
}))

function startDrag(e) {
  dragging.value = true
  const point = getPoint(e)
  dragOffset.value = { x: point.x, y: point.y }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', endDrag)
}

function onDrag(e) {
  if (!dragging.value) return
  const point = getPoint(e)
  const dx = point.x - dragOffset.value.x
  const dy = point.y - dragOffset.value.y
  dragOffset.value = point

  const maxX = Math.max(0, window.innerWidth  - size.value.w)
  const maxY = Math.max(0, window.innerHeight - size.value.h)
  const nx = clamp(pos.value.x + dx, 0, maxX)
  const ny = clamp(pos.value.y + dy, 0, maxY)
  pos.value = { x: nx, y: ny }
  e.preventDefault?.()
}

function endDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', endDrag)
}

function startResize(e) {
  resizing.value = true
  const pt = getPoint(e)
  resizeStart.value = { x: pt.x, y: pt.y }
  sizeStart.value   = { ...size.value }
  window.addEventListener('mousemove', onResizing)
  window.addEventListener('mouseup', endResize)
  window.addEventListener('touchmove', onResizing, { passive: false })
  window.addEventListener('touchend', endResize)
}

function onResizing(e) {
  if (!resizing.value) return
  const pt = getPoint(e)
  const dx = pt.x - resizeStart.value.x
  const dy = pt.y - resizeStart.value.y

  const maxW = Math.max(MIN_W, window.innerWidth  - pos.value.x - MARGIN)
  const maxH = Math.max(MIN_H, window.innerHeight - pos.value.y - MARGIN)

  const w = clamp(sizeStart.value.w + dx, MIN_W, maxW)
  const h = clamp(sizeStart.value.h + dy, MIN_H, maxH)
  size.value = { w, h }
  e.preventDefault?.()
}

function endResize() {
  resizing.value = false
  window.removeEventListener('mousemove', onResizing)
  window.removeEventListener('mouseup', endResize)
  window.removeEventListener('touchmove', onResizing)
  window.removeEventListener('touchend', endResize)
}

function getPoint(e) {
  if (e.touches?.[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  return { x: e.clientX, y: e.clientY }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  const item = { text, me: true, at: Date.now() }
  messages.value.push(item)
  emit('send', item)
  draft.value = ''
  scrollToBottom()
  focusInputSoon()
}

function formatTime(t) {
  const d = new Date(t)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toggleMinimize() {
  minimized.value = !minimized.value
  if (!minimized.value) {
    // 다시 펼치면 입력 포커스 + 스크롤 하단
    focusInputSoon()
    scrollToBottom()
  }
}

function emitClose() {
  emit('update:visible', false)
  emit('close')
}

function scrollToBottom() {
  nextTick(() => {
    listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
  })
}

function focusInputSoon() {
  nextTick(() => inputEl.value?.focus())
}

/** 메시지 추가될 때 자동으로 하단 스크롤 */
watch(messages, () => scrollToBottom(), { deep: true })

watch(() => props.visible, (v) => {
  if (v) {
    focusInputSoon()
    scrollToBottom()
  }
})

function clampIntoViewport() {
  const maxX = Math.max(0, window.innerWidth  - size.value.w)
  const maxY = Math.max(0, window.innerHeight - size.value.h)
  pos.value = { x: clamp(pos.value.x, 0, maxX), y: clamp(pos.value.y, 0, maxY) }
  size.value = {
    w: clamp(size.value.w, MIN_W, window.innerWidth  - pos.value.x - MARGIN),
    h: clamp(size.value.h, MIN_H, window.innerHeight - pos.value.y - MARGIN),
  }
}
function onWindowResize() { clampIntoViewport() }

onMounted(() => {
  if (!props.startX && !props.startY) {
    nextTick(() => {
      const w = size.value.w
      const h = size.value.h
      pos.value = {
        x: Math.max(0, window.innerWidth  - w - MARGIN),
        y: Math.max(0, window.innerHeight - h - MARGIN),
      }
    })
  }
  focusInputSoon()
  scrollToBottom()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  endDrag()
  endResize()
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>
.chat-fade-enter-active, .chat-fade-leave-active {
  transition: opacity .15s ease, transform .15s ease;
}
.chat-fade-enter-from, .chat-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.chat-popup {
  position: fixed;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;   
  outline: none;
  z-index: 9999;
}

.chat-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0ea5e9;
  color: white;
  padding: 0 10px;
  cursor: grab;
  user-select: none;
}
.chat-header:active { cursor: grabbing; }

.chat-title { display: flex; align-items: center; gap: 8px; }
.dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e;
}
.chat-actions { display: flex; align-items: center; gap: 4px; }
.btn {
  border: none; background: transparent; color: white;
  font-size: 14px; line-height: 1; padding: 4px; cursor: pointer;
  border-radius: 6px;
}
.btn:hover { background: rgba(255,255,255,0.2); }
.btn.close:hover { background: rgba(0,0,0,0.2); }

.chat-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  flex: 1;
  min-height: 0;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;           
  min-height: 0;     
  overflow-y: auto;
  padding-right: 2px;
}

.message { display: flex; flex-direction: column; max-width: 80%; }
.message.me { align-self: flex-end; align-items: flex-end; }
.message.you { align-self: flex-start; align-items: flex-start; }
.bubble {
  padding: 8px 10px; border-radius: 12px;
  background: #f3f4f6; color: #111827;
}
.message.me .bubble { background: #dbeafe; }
.meta { font-size: 11px; color: #6b7280; margin-top: 3px; }

.chat-input {
  display: flex; gap: 8px; margin-top: auto;
}
.chat-input input {
  flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 10px;
  outline: none;
}
.chat-input input:focus {
  border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
}
.send-btn {
  border: none; border-radius: 10px; padding: 8px 12px; cursor: pointer;
  background: #0ea5e9; color: white;
}
.send-btn:hover { filter: brightness(0.95); }

/* 크기 조절 핸들 */
.resize-handle {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  background: repeating-linear-gradient(
    135deg,
    rgba(0,0,0,0.12) 0 2px,
    rgba(0,0,0,0.05) 2px 4px
  );
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
}
</style>