<template>
  <transition name="slide-up">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="comment-modal">
        <div class="modal-header">
          <p>Comments</p>
          <button @click="close" class="close-btn">
            <img src="../../assets/icons/x.png" alt="닫기" class="close-icon" />
          </button>
        </div>

        <div class="comment-input-area">
        <img class="profile-img" src="../../assets/user-profile.png" alt="프로필" />
        <div class="comment-input-wrapper">
            <input
                type="text"
                class="comment-input"
                v-model="newComment"
                placeholder="댓글을 입력하세요..."
            />
            <img
                src="../../assets/icons/send-data.png"
                alt="업로드"
                class="send-icon"
                @click="submitComment"
            />
        </div>
        </div>

        <div class="modal-body">
          <p>댓글 목록 (Post ID: {{ postId }})</p>
          <!-- 여기에 댓글 리스트 렌더링 -->
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    postId: Number,
  },
  methods: {
    close() {
      this.$emit("close");
    },
     submitComment() {
      console.log("댓글 전송:", this.newComment);
      this.newComment = '';
    }
  },
  data() {
    return {
        newComment: ''
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.comment-modal {
  position: absolute;
  bottom: 0;
  width: 90%;
  max-width: 460px;
  left: 50%;
  transform: translateX(-50%);
  height: 60%;
  background: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.comment-input-area {
  display: flex;
  align-items: center;
  margin: 12px 0 16px;
  padding: 0 6px;
}

.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.comment-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 18px;
  background: #fff;
  padding: 0 12px;
}

.comment-input {
  width: 100%;
  height: 30px;
  border: none;
  font-size: 14px;
  padding-right: 30px;
  outline: none;
}

.send-icon {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* 슬라이드 애니메이션 */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
