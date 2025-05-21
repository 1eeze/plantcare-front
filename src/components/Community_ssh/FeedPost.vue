<template>
  <div class="post">
    <div class="img-wrap">
      <img :src="post.image" alt="게시물 이미지" />
    </div>
    <div class="content">
      <p>{{ post.content }}</p>
      <div class="post-actions">
        <button @click="$emit('toggle-like', post.id)">
          <span v-if="post.liked">❤️</span>
          <span v-else>🤍</span>
          {{ post.likes }}
        </button>
        <button @click="showComment = !showComment">
          💬 댓글 {{ post.comments.length }}
        </button>
      </div>
      <FeedComment
        v-if="showComment"
        :comments="post.comments"
        @add-comment="onAddComment"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FeedComment from './FeedComment.vue'
const props = defineProps({ post: Object })
const emit = defineEmits(['toggle-like', 'add-comment'])

const showComment = ref(false)

function onAddComment(text) {
  emit('add-comment', props.post.id, text)
}
</script>

<style scoped>
.post {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 8px #0002;
  padding: 16px;
}
.img-wrap {
  text-align: center;
  margin-bottom: 10px;
}
.img-wrap img {
  width: 100%;
  max-height: 350px;
  object-fit: cover;
  border-radius: 12px;
}
.content p { margin: 6px 0 12px 0; }
.post-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 6px;
  justify-content: flex-start;
}
.post-actions button {
  background: none;
  border: none;
  font-size: 17px;
  cursor: pointer;
}
</style>