<template>
  <transition name="modal" appear>
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="comment-modal" @click.stop>
        <div class="modal-handle"></div>
        
        <div class="modal-header">
          <h3 class="modal-title">
            댓글
          </h3>
          <button @click="close" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6L18 18"/></svg>
          </button>
        </div>

        <div class="comments-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>로딩 중...</p>
          </div>

          <div v-else-if="comments.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h4>첫 댓글을 남겨주세요!</h4>
          </div>

          <div v-else class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-group">
              
              <div class="comment-item">
                <div class="comment-avatar">
                  <img :src="comment.avatar" class="avatar-image" />
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">{{ comment.username }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                  
                  <div class="comment-actions-row">
                    <button @click="setReply(comment)" class="reply-btn">답글 달기</button>
                    <button v-if="comment.isAuthor" @click="deleteComment(comment.id)" class="delete-btn">삭제</button>
                  </div>
                </div>
              </div>

              <div v-if="comment.replies.length > 0" class="replies-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply-item">
                  <div class="comment-avatar small">
                    <img :src="reply.avatar" class="avatar-image small" />
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-username">{{ reply.username }}</span>
                      <span class="comment-time">{{ formatTime(reply.createdAt) }}</span>
                    </div>
                    <p class="comment-text">{{ reply.text }}</p>
                    
                    <div class="comment-actions-row">
                      <button v-if="reply.isAuthor" @click="deleteComment(reply.id)" class="delete-btn">삭제</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="comment-input-section">
          <div v-if="replyingTo" class="replying-bar">
            <span><b>{{ replyingTo.username }}</b>님에게 답글 작성 중</span>
            <button @click="cancelReply">취소</button>
          </div>

          <div class="comment-input-area">
            <div class="input-wrapper">
              <input 
                v-model="newComment" 
                @keyup.enter="submitComment"
                type="text" 
                :placeholder="replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'" 
                class="comment-input"
              />
              <button @click="submitComment" :disabled="!newComment.trim()" class="send-btn">등록</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { supabase } from '@/utils/supabase'

export default {
  name: 'Comment',
  
  props: {
    visible: { type: Boolean, default: false },
    postId: { type: [Number, String], required: true }
  },

  data() {
    return {
      newComment: '',
      isSubmitting: false,
      loading: false,
      comments: [],      // 계층 구조로 정리된 댓글 목록
      currentUser: null,
      replyingTo: null   // 현재 답글을 달고 있는 대상 댓글 { id, username }
    }
  },

  mounted() {
    if (this.visible) {
      this.initialize()
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.initialize()
      }
    }
  },

  methods: {
    async initialize() {
      this.loading = true
      try {
        const { data: { user } } = await supabase.auth.getUser()
        this.currentUser = user || null 
        await this.loadComments()
      } finally {
        this.loading = false
      }
    },

    close() {
      this.$emit('close')
    },

    async loadComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id, content, created_at, user_id, parent_id,
            Users ( name, avatar_url )
          `)
          .eq('post_id', this.postId)
          .order('created_at', { ascending: true }) // 오래된 순으로 정렬

        if (error) throw error

        // 1. 데이터 가공 (Raw Data)
        const allComments = data.map(c => ({
          id: c.id,
          text: c.content,
          parentId: c.parent_id, // 부모 ID
          username: c.Users?.name || '알 수 없음',
          avatar: c.Users?.avatar_url || '/assets/default-avatar.png',
          createdAt: new Date(c.created_at),
          isAuthor: this.currentUser && c.user_id === this.currentUser.id,
          replies: [] // 대댓글 담을 배열
        }))

        // 2. 부모-자식 분리 및 연결 (Parent-Child Mapping)
        const rootComments = []
        const commentMap = {}

        // 먼저 맵(Map)에 모두 등록
        allComments.forEach(c => {
          commentMap[c.id] = c
        })

        // 부모가 있으면 부모의 replies에 넣고, 없으면 rootComments에 넣음
        allComments.forEach(c => {
          if (c.parentId && commentMap[c.parentId]) {
            commentMap[c.parentId].replies.push(c)
          } else {
            rootComments.push(c)
          }
        })

        this.comments = rootComments

      } catch (e) {
        console.error('댓글 로드 실패:', e)
      }
    },

    // 댓글/대댓글 작성
    async submitComment() {
      if (!this.newComment.trim()) return
      if (!this.currentUser) {
        alert('로그인이 필요합니다.')
        return
      }

      this.isSubmitting = true

      try {
        // 보낼 데이터 준비
        const payload = {
          post_id: this.postId,
          user_id: this.currentUser.id,
          content: this.newComment,
          parent_id: this.replyingTo ? this.replyingTo.id : null // 답글이면 부모 ID 포함
        }

        const { error } = await supabase.from('comments').insert(payload)

        if (error) throw error

        this.newComment = ''
        this.replyingTo = null // 답글 모드 해제
        await this.loadComments() // 목록 새로고침
        
        // 부모 컴포넌트에 알림 (댓글 수 증가용)
        this.$emit('comment-added', this.postId)

      } catch (e) {
        alert('댓글 등록 실패: ' + e.message)
      } finally {
        this.isSubmitting = false
      }
    },

    // 답글 달기 버튼 클릭 시
    setReply(comment) {
      this.replyingTo = { id: comment.id, username: comment.username }
      // 입력창으로 포커스 이동
      this.$nextTick(() => {
        // 템플릿의 ref="commentInput"으로 포커스
        const inputEl = this.$el.querySelector('.comment-input')
        if(inputEl) inputEl.focus()
      })
    },

    // 답글 취소
    cancelReply() {
      this.replyingTo = null
      this.newComment = ''
    },

    async deleteComment(commentId) {
      if (!confirm('삭제하시겠습니까?')) return
      try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId)
        if (error) throw error
        
        await this.loadComments()
        this.$emit('comment-deleted', this.postId)
      } catch (e) {
        alert('삭제 실패: ' + e.message)
      }
    },
    
    formatTime(date) {
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return '방금'
      if (diffMins < 60) return `${diffMins}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 7) return `${diffDays}일 전`
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    },

    focusInput() { /* 템플릿에서 직접 처리하거나 유지 */ },
    adjustTextareaHeight(e) {
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 100) + 'px'
    },
    addNewLine() {
      this.newComment += '\n'
    },
    resetState() {
      this.newComment = ''
      this.replyingTo = null
    },
    toggleLike() {},
    editComment() { alert('수정 기능 준비 중') },
    saveEdit() {},
    cancelEdit() {}
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 3000; backdrop-filter: blur(2px); display: flex; align-items: flex-end; justify-content: center; }
.comment-modal { width: 100%; max-width: 500px; height: 80vh; background: white; border-top-left-radius: 24px; border-top-right-radius: 24px; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -4px 20px rgba(0,0,0,0.2); }
.modal-handle { width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 12px auto; flex-shrink: 0; }
.modal-header { display: flex; justify-content: space-between; padding: 0 20px 16px; border-bottom: 1px solid #f0f0f0; }
.modal-title { font-size: 18px; font-weight: 600; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; color: #666; }

.comments-container { flex: 1; overflow-y: auto; padding: 20px; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.loading-state { text-align: center; padding: 40px; color: #999; }

.comment-group { margin-bottom: 24px; }
.comment-item { display: flex; gap: 12px; }
.reply-item { margin-top: 12px; padding-left: 44px; /* 대댓글 들여쓰기 */ }

.comment-avatar { flex-shrink: 0; }
.avatar-image { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.avatar-image.small { width: 28px; height: 28px; }

.comment-content { flex: 1; }
.comment-header { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
.comment-username { font-weight: 600; font-size: 14px; }
.comment-time { font-size: 11px; color: #999; }
.comment-text { font-size: 14px; color: #333; margin: 0 0 4px 0; line-height: 1.4; word-break: break-word; }

.comment-actions-row { display: flex; gap: 12px; }
.reply-btn, .delete-btn { font-size: 12px; color: #999; background: none; border: none; cursor: pointer; padding: 0; font-weight: 500; }
.reply-btn:hover { color: #568265; }
.delete-btn:hover { color: #e74c3c; }

/* 입력창 스타일 */
.comment-input-section { border-top: 1px solid #eee; background: white; }
.replying-bar { background: #f0f8f4; padding: 8px 20px; font-size: 12px; color: #568265; display: flex; justify-content: space-between; align-items: center; }
.replying-bar button { background: none; border: none; font-size: 12px; color: #666; cursor: pointer; }

.comment-input-area { padding: 12px 16px; }
.input-wrapper { display: flex; gap: 8px; }
.comment-input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 14px; }
.comment-input:focus { border-color: #568265; }
.send-btn { padding: 0 20px; background: #568265; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; }
.send-btn:disabled { background: #ccc; }
</style>