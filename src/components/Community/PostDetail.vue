<template>
  <div class="post-detail-container" v-if="post">
    <div class="detail-header">
      <button @click="$router.back()" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18L9 12L15 6"/></svg>
      </button>
      <div class="header-actions">
        <button class="icon-report-btn" @click="showReportModal = true" aria-label="신고하기">
          🚩
        </button>
        <template v-if="isOwner">
          <button @click="editPost" class="action-text-btn">수정</button>
          <button @click="deletePost" class="action-text-btn delete">삭제</button>
        </template>
      </div>
    </div>

    <div class="image-area" v-if="post.image">
      <img :src="post.image" alt="게시글 이미지" />
    </div>

    <div class="user-info-bar">
      <div class="profile-wrap" @click="goToProfile">
        <img :src="post.profile || defaultAvatar" class="avatar" />
        <div class="user-text">
          <span class="username">{{ post.name }}</span>
          <span class="location" v-if="post.location">{{ post.location }}</span>
        </div>
      </div>
      <div class="status-badge" :class="post.status">{{ getStatusText(post.status) }}</div>
    </div>

    <div class="content-area">
      <h1 class="title">{{ post.title }}</h1>
      <p class="date">{{ formatDate(post.created_at) }} · 조회 {{ post.views || 0 }}</p>
      <p class="price" v-if="post.price">{{ formatPrice(post.price) }}</p>
      <p class="description">{{ post.text }}</p>
<div v-if="sensorStatus !== null" class="sensor-summary">
        <div class="sensor-chip">
          <span class="chip-label">🌡 온도</span>
          <span class="chip-value">{{ formatSensor(sensorStatus.temp) }}°C</span>
        </div>
        <div class="sensor-chip">
          <span class="chip-label">💧 습도</span>
          <span class="chip-value">{{ formatSensor(sensorStatus.humidity) }}%</span>
        </div>
        <div class="sensor-chip">
          <span class="chip-label">☀️ 조도</span>
          <span class="chip-value">{{ formatSensor(sensorStatus.light) }} lux</span>
        </div>
      </div>
      
      <div class="tags" v-if="post.tags && post.tags.length">
        <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </div>

    <div class="bottom-actions">
      <button @click="toggleLike" class="icon-btn" :class="{ active: isLiked }">
        <span class="icon">{{ isLiked ? '❤️' : '🤍' }}</span>
        <span>{{ likeCount }}</span>
      </button>
      
      <button @click="showCommentModal = true" class="icon-btn">
        <span class="icon">💬</span>
        <span>{{ post.comments || 0 }}</span>
      </button>

      <button @click="toggleBookmark" class="icon-btn bookmark" :class="{ active: isBookmarked }">
        <span class="icon">{{ isBookmarked ? '🔖' : '🔖' }}</span>
        <span>{{ isBookmarked ? '저장됨' : '저장' }}</span>
      </button>
    </div>

    <Comment 
      v-if="showCommentModal" 
      :visible="showCommentModal" 
      :postId="post.id"
      @close="showCommentModal = false"
      @comment-added="onCommentAdded"
      @comment-deleted="onCommentDeleted"
    />

    <div v-if="showReportModal" class="report-overlay">
      <div class="report-modal">
        <h3>신고하기</h3>
        <p class="report-hint">신고 사유를 입력해주세요.</p>
        <textarea v-model="reportMessage" rows="4" placeholder="예: 스팸/허위 정보 같습니다." />
        <div class="report-actions">
          <button class="btn-secondary" @click="closeReport">취소</button>
          <button class="btn-primary" @click="submitReport">확인</button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast">신고가 접수되었습니다</div>
  </div>
  
  <div v-else class="loading">불러오는 중...</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import Comment from './Comment.vue'
import defaultAvatar from '@/assets/user-profile.png'

const route = useRoute()
const router = useRouter()
const postId = route.params.id

const post = ref(null)
const currentUser = ref(null)
const isLiked = ref(false)
const isBookmarked = ref(false)
const likeCount = ref(0)
const showCommentModal = ref(false)
const showReportModal = ref(false)
const reportMessage = ref('')
const showToast = ref(false)
let toastTimer = null
const sensorStatus = ref(null)

const isOwner = computed(() => currentUser.value && post.value && currentUser.value.id === post.value.user_id)

const onCommentAdded = () => {
  if (post.value) {
    post.value.comments = (post.value.comments || 0) + 1
  }
}

const onCommentDeleted = () => {
  if (post.value && post.value.comments > 0) {
    post.value.comments--
  }
}

const fetchPost = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error) {
    alert('게시글을 찾을 수 없습니다.')
    router.back()
    return
  }
  post.value = data
  likeCount.value = data.likes || 0
await loadSensorStatus(data.user_id, data.title)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    currentUser.value = user
    
    const { data: likeData } = await supabase.from('likes').select('user_id').eq('user_id', user.id).eq('post_id', postId).single()
    isLiked.value = !!likeData

    const { data: markData } = await supabase.from('bookmarks').select('user_id').eq('user_id', user.id).eq('post_id', postId).single()
    isBookmarked.value = !!markData

    if (user.id !== post.value.user_id) {
      await supabase.rpc('increment_view', { row_id: postId }).catch(async () => {
          await supabase.from('posts').update({ views: (post.value.views || 0) + 1 }).eq('id', postId)
      })
      post.value.views = (post.value.views || 0) + 1
    }
  }
}

const toggleLike = async () => {
  if (!currentUser.value) return alert('로그인이 필요합니다.')
  
  const originalState = isLiked.value
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1

  try {
    if (originalState) {
      await supabase.from('likes').delete().eq('user_id', currentUser.value.id).eq('post_id', postId)
    } else {
      await supabase.from('likes').insert({ user_id: currentUser.value.id, post_id: postId })
    }
    // DB 동기화 (선택)
    // await supabase.from('posts').update({ likes: likeCount.value }).eq('id', postId)
  } catch (e) {
    isLiked.value = originalState
    likeCount.value += isLiked.value ? 1 : -1
    console.error('좋아요 오류:', e)
  }
}

const toggleBookmark = async () => {
  if (!currentUser.value) return alert('로그인이 필요합니다.')
  
  const originalState = isBookmarked.value
  isBookmarked.value = !isBookmarked.value

  try {
    if (originalState) {
      await supabase.from('bookmarks').delete().eq('user_id', currentUser.value.id).eq('post_id', postId)
    } else {
      await supabase.from('bookmarks').insert({ user_id: currentUser.value.id, post_id: postId })
      alert('북마크에 저장되었습니다.')
    }
  } catch (e) {
    isBookmarked.value = originalState
    console.error('북마크 오류:', e)
  }
}

const editPost = () => {
  router.push({ name: 'WritePost', query: { id: postId } })
}

const deletePost = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) {
      alert('삭제되었습니다.')
      router.back()
    } else {
      alert('삭제 실패: ' + error.message)
    }
  }
}

const goToProfile = () => {
  const target = post.value?.user_id || post.value?.name
  if (!target) return alert('사용자 정보를 찾을 수 없습니다.')
  router.push(`/profile/${target}`)
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p) + '원'
const formatDate = (d) => new Date(d).toLocaleDateString()
const getStatusText = (s) => ({ available: '판매중', sold: '판매완료', reserved: '예약중' }[s] || s)

const formatSensor = (val) => (val === null || val === undefined || Number.isNaN(val)) ? '-' : val

const loadSensorStatus = async (userId, title) => {
  try {
    if (!post.value?.plant_id) return

    const { data, error } = await supabase
      .from('sensor_data')
      .select('humidity, temp, light')
      .eq('plant_id', post.value.plant_id)
      .maybeSingle()
    if (error) {
      if (error.code !== 'PGRST116') console.error('센서 데이터 오류:', error)
      return
    }
    if (!data) return
    const latestVal = (arr) => {
      if (!arr) return null
      if (Array.isArray(arr) && arr.length > 0) {
        const last = arr[arr.length - 1]
        return typeof last === 'number' ? last : (last?.value ?? null)
      }
      return null
    }
    sensorStatus.value = {
      humidity: latestVal(data.humidity),
      temp: latestVal(data.temp),
      light: latestVal(data.light)
    }
  } catch (err) {
    console.error('센서 데이터 조회 실패:', err)
  }
}

const closeReport = () => {
  showReportModal.value = false
  reportMessage.value = ''
}

const submitReport = () => {
  closeReport()
  showToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 2000)
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

onMounted(fetchPost)
</script>

<style scoped>
.post-detail-container { padding-bottom: 80px; background: white; min-height: 100vh; }
.detail-header { display: flex; justify-content: space-between; padding: 16px; position: sticky; top: 0; background: white; z-index: 10; }
.back-btn { background: none; border: none; cursor: pointer; }
.icon-report-btn { background: none; border: none; font-size: 18px; cursor: pointer; margin-right: 8px; }
.action-text-btn { background: none; border: none; font-size: 14px; color: #666; margin-left: 10px; cursor: pointer; }
.action-text-btn.delete { color: #e74c3c; }

.image-area { background: #f5f5f5; display: flex; align-items: center; justify-content: center; padding: 8px; }
.image-area img { width: 100%; max-height: 500px; object-fit: contain; border-radius: 12px; }

.user-info-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #f0f0f0; }
.profile-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.user-text { display: flex; flex-direction: column; }
.username { font-weight: 600; font-size: 15px; }
.location { font-size: 12px; color: #888; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #eee; }
.status-badge.available { background: #e8f5e9; color: #2e7d32; }

.content-area { padding: 20px; }
.title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.date { font-size: 13px; color: #999; margin-bottom: 16px; }
.price { font-size: 18px; font-weight: 700; color: #2c3e50; margin-bottom: 16px; }
.description { font-size: 15px; line-height: 1.6; color: #333; white-space: pre-wrap; margin-bottom: 20px; }
.sensor-summary { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.sensor-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 12px; background: #f3f8f4; color: #2c3e50; font-size: 13px; }
.chip-label { font-weight: 600; color: #568265; }
.chip-value { font-weight: 600; }

.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f0f8f4; color: #568265; padding: 4px 10px; border-radius: 12px; font-size: 12px; }

.bottom-actions { 
  position: fixed; 
  bottom: 90px; /* 하단 네비게이션 위에 위치 */
  left: 0; 
  right: 0; 
  background: white; 
  border-top: 1px solid #eee; 
  display: flex; 
  justify-content: space-around; 
  padding: 12px; 
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 2000;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.icon-btn { background: none; border: none; display: flex; flex-direction: column; align-items: center; font-size: 12px; color: #666; cursor: pointer; gap: 4px; }
.icon-btn .icon { font-size: 20px; }
.icon-btn.active { color: #e74c3c; }
.icon-btn.bookmark.active { color: #f39c12; }
.loading { text-align: center; padding: 50px; color: #999; }

.report-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 16px; }
.report-modal { background: #fff; width: 100%; max-width: 360px; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.report-modal h3 { margin: 0 0 8px; font-size: 18px; }
.report-hint { margin: 0 0 12px; color: #777; font-size: 13px; }
.report-modal textarea { width: 100%; border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px; font-size: 14px; resize: vertical; min-height: 100px; box-sizing: border-box; }
.report-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-secondary { background: #f1f1f1; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; color: #555; }
.btn-primary { background: #568265; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; }
.toast { position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: #fff; padding: 10px 16px; border-radius: 999px; font-size: 14px; z-index: 3500; }
</style>
