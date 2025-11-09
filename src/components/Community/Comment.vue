<template>
  <transition name="modal" appear>
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="comment-modal" @click.stop>
        <!-- 상단 핸들 -->
        <div class="modal-handle"></div>
        
        <!-- 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">
            댓글 <span class="comment-count">{{ comments.length }}</span>
          </h3>
          <button @click="close" class="close-btn" aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 댓글 리스트 -->
        <div class="comments-container" ref="commentsContainer">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>댓글을 불러오는 중...</p>
          </div>

          <div v-else-if="comments.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h4>첫 번째 댓글을 남겨보세요!</h4>
            <p>이 식물에 대한 궁금한 점이나 관심을 표현해주세요</p>
          </div>

          <div v-else class="comments-list">
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="comment-item"
              :class="{ 'is-author': comment.isAuthor }"
            >
              <div class="comment-avatar">
                <img 
                  :src="comment.avatar || '/assets/default-avatar.png'" 
                  :alt="`${comment.username}의 프로필`"
                  class="avatar-image"
                />
                <div v-if="comment.isAuthor" class="author-badge">작성자</div>
              </div>

              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-username">{{ comment.username }}</span>
                  <div class="comment-meta">
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    <button v-if="comment.canEdit" @click="editComment(comment.id)" class="edit-btn">수정</button>
                    <button v-if="comment.canDelete" @click="deleteComment(comment.id)" class="delete-btn">삭제</button>
                  </div>
                </div>

                <div class="comment-text">
                  <p v-if="!comment.isEditing">{{ comment.text }}</p>
                  <div v-else class="edit-input-wrapper">
                    <input 
                      v-model="comment.editText"
                      @keydown.enter="saveEdit(comment.id)"
                      @keydown.esc="cancelEdit(comment.id)"
                      class="edit-input"
                      ref="editInput"
                    />
                    <div class="edit-actions">
                      <button @click="saveEdit(comment.id)" class="save-btn">저장</button>
                      <button @click="cancelEdit(comment.id)" class="cancel-btn">취소</button>
                    </div>
                  </div>
                </div>

                <div class="comment-actions">
                  <button 
                    @click="toggleLike(comment.id)"
                    class="action-btn like-btn"
                    :class="{ liked: comment.isLiked }"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" :fill="comment.isLiked ? 'currentColor' : 'none'" :stroke="comment.isLiked ? 'none' : 'currentColor'" stroke-width="1.5"/>
                    </svg>
                    <span v-if="comment.likes > 0">{{ comment.likes }}</span>
                  </button>

                  <button @click="replyToComment(comment.id)" class="action-btn reply-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 10H13C17.4183 10 21 13.5817 21 18V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M7 6L3 10L7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    답글
                  </button>
                </div>

                <!-- 답글 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-avatar">
                      <img :src="reply.avatar || '/assets/default-avatar.png'" :alt="`${reply.username}의 프로필`" class="avatar-image small"/>
                    </div>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-username">{{ reply.username }}</span>
                        <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                      </div>
                      <p class="reply-text">{{ reply.text }}</p>
                      <button 
                        @click="toggleLike(reply.id, true)"
                        class="action-btn like-btn small"
                        :class="{ liked: reply.isLiked }"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" :fill="reply.isLiked ? 'currentColor' : 'none'" :stroke="reply.isLiked ? 'none' : 'currentColor'" stroke-width="1.5"/>
                        </svg>
                        <span v-if="reply.likes > 0">{{ reply.likes }}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- 댓글 입력 영역 -->
        <div class="comment-input-section">
          <div v-if="replyingTo" class="reply-indicator">
            <span>{{ replyingTo.username }}님에게 답글 작성 중</span>
            <button @click="cancelReply" class="cancel-reply-btn">✕</button>
          </div>
          
          <div class="comment-input-area">
            <div class="current-user-avatar">
              <img 
                :src="currentUser.avatar || '/assets/default-avatar.png'" 
                :alt="`${currentUser.username}의 프로필`"
                class="avatar-image"
              />
            </div>
            
            <div class="input-wrapper">
              <textarea
                v-model="newComment"
                @keydown.enter.exact.prevent="submitComment"
                @keydown.shift.enter.exact="addNewLine"
                @input="adjustTextareaHeight"
                ref="commentInput"
                class="comment-input"
                placeholder="댓글을 입력하세요... (Shift+Enter로 줄바꿈)"
                rows="1"
                maxlength="500"
              ></textarea>
              
              <button 
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmitting"
                class="send-btn"
                :class="{ active: newComment.trim() && !isSubmitting }"
              >
                <svg v-if="!isSubmitting" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="loading-spinner small"></div>
              </button>
            </div>
          </div>
          
          <div class="input-footer">
            <span class="char-count">{{ newComment.length }}/500</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Comment',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    postId: {
      type: [Number, String],
      required: true
    }
  },

  data() {
    return {
      newComment: '',
      isSubmitting: false,
      loading: true,
      replyingTo: null,
      currentUser: {
        id: 1,
        username: '현재사용자',
        avatar: '/assets/user-profile.png'
      },
      comments: []
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadComments()
        this.$nextTick(() => {
          this.focusInput()
        })
      } else {
        this.resetState()
      }
    }
  },

  methods: {
    close() {
      this.$emit('close')
    },

    resetState() {
      this.newComment = ''
      this.replyingTo = null
      this.isSubmitting = false
    },

    focusInput() {
      if (this.$refs.commentInput) {
        this.$refs.commentInput.focus()
      }
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.commentInput
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'
      }
    },

    addNewLine() {
      this.newComment += '\n'
      this.$nextTick(() => {
        this.adjustTextareaHeight()
      })
    },

    async loadComments() {
      this.loading = true
      try {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.comments = [
          {
            id: 1,
            username: 'PlantMaster',
            avatar: 'https://picsum.photos/40?random=1',
            text: '정말 예쁜 식물이네요! 키우기 어렵나요?',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
            likes: 5,
            isLiked: false,
            isAuthor: false,
            canEdit: false,
            canDelete: false,
            replies: [
              {
                id: 101,
                username: '식물판매자',
                avatar: 'https://picsum.photos/40?random=2',
                text: '키우기 어렵지 않아요! 물만 일주일에 한 번 주시면 됩니다.',
                createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5시간 전
                likes: 2,
                isLiked: true
              }
            ]
          },
          {
            id: 2,
            username: '그린핑거',
            avatar: 'https://picsum.photos/40?random=3',
            text: '가격 협상 가능한가요?',
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
            likes: 1,
            isLiked: false,
            isAuthor: false,
            canEdit: false,
            canDelete: false,
            replies: []
          },
          {
            id: 3,
            username: '현재사용자',
            avatar: '/assets/user-profile.png',
            text: '관심있어요! 직거래 가능한가요?',
            createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
            likes: 0,
            isLiked: false,
            isAuthor: false,
            canEdit: true,
            canDelete: true,
            replies: []
          }
        ]
      } catch (error) {
        console.error('댓글 로딩 실패:', error)
      } finally {
        this.loading = false
      }
    },

    async submitComment() {
      if (!this.newComment.trim() || this.isSubmitting) return

      this.isSubmitting = true
      
      try {
        const newCommentData = {
          id: Date.now(),
          username: this.currentUser.username,
          avatar: this.currentUser.avatar,
          text: this.newComment.trim(),
          createdAt: new Date(),
          likes: 0,
          isLiked: false,
          isAuthor: false,
          canEdit: true,
          canDelete: true,
          replies: []
        }

        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500))

        if (this.replyingTo) {
          // 답글 추가
          const parentComment = this.comments.find(c => c.id === this.replyingTo.id)
          if (parentComment) {
            parentComment.replies.push({
              ...newCommentData,
              id: Date.now() + 1000 // 고유 ID 보장
            })
          }
        } else {
          // 새 댓글 추가
          this.comments.push(newCommentData)
        }

        this.newComment = ''
        this.replyingTo = null
        
        // 댓글 컨테이너를 맨 아래로 스크롤
        this.$nextTick(() => {
          this.scrollToBottom()
          this.adjustTextareaHeight()
        })

      } catch (error) {
        console.error('댓글 전송 실패:', error)
        alert('댓글 전송에 실패했습니다. 다시 시도해주세요.')
      } finally {
        this.isSubmitting = false
      }
    },

    scrollToBottom() {
      if (this.$refs.commentsContainer) {
        this.$refs.commentsContainer.scrollTop = this.$refs.commentsContainer.scrollHeight
      }
    },

    toggleLike(commentId, isReply = false) {
      if (!isReply) {
        const comment = this.comments.find(c => c.id === commentId)
        if (comment) {
          comment.isLiked = !comment.isLiked
          comment.likes += comment.isLiked ? 1 : -1
        }
      } else {
        // 답글 좋아요 처리
        this.comments.forEach(comment => {
          const reply = comment.replies.find(r => r.id === commentId)
          if (reply) {
            reply.isLiked = !reply.isLiked
            reply.likes += reply.isLiked ? 1 : -1
          }
        })
      }
    },

    replyToComment(commentId) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        this.replyingTo = { id: commentId, username: comment.username }
        this.focusInput()
      }
    },

    cancelReply() {
      this.replyingTo = null
    },

    editComment(commentId) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        comment.isEditing = true
        comment.editText = comment.text
        this.$nextTick(() => {
          const editInput = this.$refs.editInput?.[0]
          if (editInput) editInput.focus()
        })
      }
    },

    saveEdit(commentId) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment && comment.editText?.trim()) {
        comment.text = comment.editText.trim()
        comment.isEditing = false
        delete comment.editText
      }
    },

    cancelEdit(commentId) {
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        comment.isEditing = false
        delete comment.editText
      }
    },

    async deleteComment(commentId) {
      if (confirm('댓글을 삭제하시겠어요?')) {
        try {
          // API 호출 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 300))
          
          this.comments = this.comments.filter(c => c.id !== commentId)
        } catch (error) {
          console.error('댓글 삭제 실패:', error)
          alert('댓글 삭제에 실패했습니다.')
        }
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
      
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.comment-modal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(100%, 500px);
  max-height: 80vh;
  background: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 12px auto 0;
  flex-shrink: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.comment-count {
  color: #568265;
  font-weight: 700;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.comments-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.comments-list {
  padding: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 16px;
  transition: background-color 0.2s ease;
}

.comment-item:hover {
  background: #f8f9fa;
}

.comment-item.is-author {
  background: linear-gradient(135deg, #f0f8f4, #e8f5ee);
}

.comment-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.avatar-image.small {
  width: 32px;
  height: 32px;
}

.author-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #568265;
  color: white;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  border: 2px solid white;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-username {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: color 0.2s ease;
}

.edit-btn:hover {
  color: #568265;
}

.delete-btn:hover {
  color: #e74c3c;
}

.comment-text p {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.edit-input-wrapper {
  margin-bottom: 12px;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #568265;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  outline: none;
  margin-bottom: 8px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn,
.cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #568265;
  color: white;
}

.save-btn:hover {
  background: #4a7058;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(86, 130, 101, 0.1);
  color: #568265;
}

.like-btn.liked {
  color: #e74c3c;
}

.like-btn.small {
  padding: 4px 6px;
  font-size: 11px;
}

.replies-container {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-username {
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
}

.reply-time {
  font-size: 11px;
  color: #999;
}

.reply-text {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #2c3e50;
}
</style>