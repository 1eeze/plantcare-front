<!-- <template>
  <div class="profile">
    <div class="header">
      <img :src="profileImg" alt="프로필" class="profile-img" />
      <div>
        <div class="nickname">내 프로필</div>
        <div class="post-count">게시글: {{ myPosts.length }}</div>
      </div>
    </div>
    <h3>내 게시물</h3>
    <div v-if="myPosts.length === 0" class="empty">아직 작성한 게시물이 없습니다.</div>
    <div v-for="post in myPosts" :key="post.id" class="feed-post">
      <FeedPost :post="post" />
    </div>
    <FloatingBar @show-upload="() => {}" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FeedPost from './FeedPost.vue'
import FloatingBar from './FloatingBar.vue'
import { inject } from 'vue'
import profileImg from '../../assets/character.png'

const posts = inject('posts', []) // Feed.vue에서 provide한 posts

const myPosts = computed(() =>
  posts ? posts.filter(p => p.author === "me") : []
)
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 40px auto 70px auto;
  padding: 20px;
  background: #f7fff5;
  border-radius: 20px;
  box-shadow: 0 4px 12px #0001;
  min-height: 65vh;
}
.header {
  display: flex; align-items: center; gap: 18px;
  margin-bottom: 28px;
}
.profile-img {
  width: 65px; height: 65px; border-radius: 50%; border: 3px solid #9ad67a;
}
.nickname {
  font-weight: 700; font-size: 20px; margin-bottom: 6px;
}
.post-count { color: #55a34a; }
.feed-post + .feed-post { margin-top: 22px; }
.empty { text-align: center; color: #999; margin: 32px 0; }
</style> -->

<template>
  <div class="profile-page">
    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <img :src="profileImg" alt="프로필" class="profile-img" />
      <div class="profile-meta">
        <div class="nickname">닉네임</div>
        <div class="stats">
          <span>게시물 <b>{{ myPosts.length }}</b></span>
          <span>팔로워 <b>0</b></span>
          <span>팔로잉 <b>0</b></span>
        </div>
      </div>
    </div>
    <!-- 게시글 그리드 -->
    <div v-if="myPosts.length === 0" class="empty">
      아직 게시물이 없습니다.
    </div>
    <div v-else class="post-grid">
      <div
        class="grid-item"
        v-for="post in myPosts"
        :key="post.id"
        @click="openModal(post)"
      >
        <img :src="post.image" alt="게시물 이미지" />
      </div>
    </div>
    <!-- 상세 모달: 피드와 똑같이! -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img :src="selectedPost.image" alt="상세" class="modal-img"/>
        <div class="modal-text">{{ selectedPost.content }}</div>
        <!-- 좋아요/댓글 부분 -->
        <div class="post-actions">
          <button @click="toggleLike(selectedPost)">
            <span v-if="selectedPost.liked">❤️</span>
            <span v-else>🤍</span>
            {{ selectedPost.likes }}
          </button>
          <button @click="showComment = !showComment">
            💬 댓글 {{ selectedPost.comments.length }}
          </button>
        </div>
        <div v-if="showComment" class="comment-section">
          <div v-if="selectedPost.comments.length === 0" class="no-comment">
            아직 댓글이 없습니다.
          </div>
          <ul class="comment-list">
            <li v-for="comment in selectedPost.comments" :key="comment.id">
              {{ comment.text }}
            </li>
          </ul>
          <form class="comment-form" @submit.prevent="addCommentModal">
            <input v-model="modalComment" placeholder="댓글을 입력하세요" required />
            <button type="submit">등록</button>
          </form>
        </div>
      </div>
    </div>
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
    <FloatingBar @show-upload="showUpload = true" />
  </div>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import FloatingBar from './FloatingBar.vue'
import profileImg from '../../assets/profile_pic.png'

// posts 배열은 Feed.vue에서 provide, 여기서 inject
const posts = inject('posts', ref([]))
const myPosts = computed(() =>
  posts.value ? posts.value.filter(p => p.author === 'me') : []
)

// 상세 모달 로직 (좋아요/댓글/모달)
const showModal = ref(false)
const showComment = ref(false)
const selectedPost = ref({})
const modalComment = ref('')

function openModal(post) {
  selectedPost.value = post
  showModal.value = true
  showComment.value = false
  modalComment.value = ''
}
function closeModal() {
  showModal.value = false
  selectedPost.value = {}
  showComment.value = false
  modalComment.value = ''
}
function toggleLike(post) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}
function addCommentModal() {
  if (!modalComment.value) return
  selectedPost.value.comments.push({
    id: Date.now(),
    text: modalComment.value
  })
  modalComment.value = ''
}

// === Feed.vue와 동일한 업로드 관련 로직 ===
const showUpload = ref(false)
const newPost = ref({
  content: '',
  image: null
})
let nextId = ref(posts.value.length + 1)

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
    id: nextId.value++,
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
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 40px auto 70px auto;
  padding: 20px;
  background: #f7fff5;
  border-radius: 20px;
  box-shadow: 0 4px 12px #0001;
  min-height: 65vh;
  position: relative;
}
.profile-header {
  display: flex; align-items: center; gap: 24px;
  margin-bottom: 24px;
}
.profile-img {
  width: 86px; height: 86px;
  border-radius: 50%; border: 3.5px solid #9ad67a;
  object-fit: cover;
}
.profile-meta {
  flex: 1;
}
.nickname {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 9px;
  color: #326c39;
}
.stats {
  display: flex; gap: 22px; color: #666;
  font-size: 15px;
}
.stats b { color: #227c39; font-weight: 700; }
.empty {
  text-align: center;
  color: #bbb;
  margin: 60px 0 50px 0;
  font-size: 18px;
}
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}
.grid-item {
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid #e4efde;
  background: #e7f9ec;
}
.grid-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

/* 추가: 상세 모달 스타일 */
.post-actions {
  display: flex;
  gap: 18px;
  align-items: center;
  margin: 14px 0 8px 0;
  justify-content: flex-start;
}
.post-actions button {
  background: none;
  border: none;
  font-size: 17px;
  cursor: pointer;
}
.comment-section {
  margin-top: 6px;
}
.no-comment {
  color: #bbb;
  margin-bottom: 6px;
}
.comment-list {
  padding-left: 14px;
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #222;
}
.comment-form {
  display: flex;
  gap: 7px;
  margin-top: 6px;
}
.comment-form input {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #cee4d8;
  border-radius: 7px;
  font-size: 15px;
}
.comment-form button {
  background: #7bc367;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0 13px;
  font-size: 15px;
  cursor: pointer;
}
</style>