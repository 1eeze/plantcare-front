<template>
  <div class="container">
    <!-- 게시물 목록 -->
    <Post />
    <Post />
    <Post />

    <!-- 오른쪽 하단 고정 글쓰기 버튼 -->
    <button class="fab" @click="goToWrite">+</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import Post from './Post.vue'

export default {
  components: {
    Post
  },
  setup() {
    const router = useRouter()
    const goToWrite = () => {
      router.push('/write')
    }
    return {
      goToWrite
    }
  }
}
</script>

<style scoped>
/* 플로팅 버튼 (FAB) 스타일 */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #568265;
  color: white;
  font-size: 32px;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: background-color 0.3s ease;
}

.fab:hover {
  background-color: #456b4f;
}
</style>
