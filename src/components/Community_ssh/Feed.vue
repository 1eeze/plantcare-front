<template>
  <div class="feed">
    <h2>식물 커뮤니티 피드 데모</h2>
    <!-- 업로드 모달 -->
    <div v-if="showUpload" class="upload-modal">
      <div class="modal-bg" @click="showUpload = false"></div>
      <form class="modal-content" @submit.prevent="addPost">
        <h3>새 게시물 업로드</h3>
        <input v-model="newPost.content" placeholder="내용을 입력하세요" required />
        <input type="file" @change="onFileChange" accept="image/*" required />
        <div class="actions">
          <button type="button" @click="showUpload = false">취소</button>
          <button type="submit">업로드</button>
        </div>
      </form>
    </div>
    <!-- 게시물 리스트 -->
    <div v-if="posts.length === 0" class="empty">아직 게시물이 없습니다.</div>
    <div v-for="post in sortedPosts" :key="post.id" class="feed-post">
      <FeedPost
        :post="post"
        @toggle-like="toggleLike"
        @add-comment="addComment"
      />
    </div>
    <!-- 플로팅 네비 바 -->
    <FloatingBar @show-upload="showUpload = true" />
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import FeedPost from './FeedPost.vue'
import FloatingBar from './FloatingBar.vue'

const newPost = ref({
  content: '',
  image: null
})
const posts = ref([]) // 게시물 배열

provide('posts', posts)

let nextId = 1

const showUpload = ref(false)

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      newPost.value.image = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function addPost() {
  if (!newPost.value.content || !newPost.value.image) return
  posts.value.unshift({
    id: nextId++,
    content: newPost.value.content,
    image: newPost.value.image,
    likes: 0,
    liked: false,
    comments: [],
    author: "me"
  })
  newPost.value.content = ''
  newPost.value.image = null
  showUpload.value = false
}

function toggleLike(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.liked = !post.liked
    post.likes += post.liked ? 1 : -1
  }
}

function addComment(postId, commentText) {
  const post = posts.value.find(p => p.id === postId)
  if (post && commentText) {
    post.comments.push({
      id: Date.now(),
      text: commentText
    })
  }
}

// 최신순 정렬
const sortedPosts = computed(() =>
  posts.value.slice().sort((a, b) => b.id - a.id)
)
</script>

<style scoped>
.feed {
  max-width: 800px;
  margin: 40px auto 70px auto;
  padding: 20px;
  background: #f7fff5;
  border-radius: 20px;
  box-shadow: 0 4px 12px #0001;
  min-height: 65vh;
  position: relative;
}
.empty { text-align: center; color: #999; margin: 32px 0; }
.feed-post + .feed-post { margin-top: 25px; }
</style>