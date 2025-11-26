<template>
  <div class="community-container">
    <!-- 상단 헤더 -->
    <div class="community-header">
      <div class="header-content">
        <h1>🌱 식물 거래</h1>
        <p class="header-subtitle">건강한 식물들을 나누고 거래해보세요</p>
      </div>
      
      <!-- 검색 바 -->
      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            type="text" 
            placeholder="식물 이름, 품종으로 검색..."
            v-model="searchQuery"
            @input="onSearch"
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">✕</button>
        </div>
      </div>

      <!-- 필터 버튼들 -->
      <div class="filter-section">
        <button 
          v-for="filter in filters" 
          :key="filter.key"
          @click="setActiveFilter(filter.key)"
          :class="{ active: activeFilter === filter.key }"
          class="filter-btn"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 게시글 작성 버튼 -->
      <button @click="goToWritePost" class="write-post-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        식물 판매하기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>게시글을 불러오는 중...</p>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="filteredPosts.length === 0" class="empty-state">
      <div class="empty-icon">🌿</div>
      <h3>{{ searchQuery ? '검색 결과가 없어요' : '아직 게시글이 없어요' }}</h3>
      <p>{{ searchQuery ? '다른 키워드로 검색해보세요' : '첫 번째 식물을 공유해보세요!' }}</p>
      <button @click="goToWritePost" class="empty-action-btn">첫 게시글 작성하기</button>
    </div>

    <!-- 게시글 리스트 -->
    <div v-else class="posts-container">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <!-- 상품 이미지 -->
        <div class="post-image-wrapper">
          <div class="post-body" :style="{ backgroundImage: `url(${post.image})` }">
            <!-- 상태 배지 -->
            <div v-if="post.status" class="status-badge" :class="post.status">
              {{ getStatusText(post.status) }}
            </div>

            <!-- ✨ 등급 배지 추가 (NEW!) -->
            <div v-if="post.analyzingQuality" class="quality-badge analyzing">
              <span class="analyzing-spinner"></span>
              <span class="grade-text">분석중...</span>
            </div>
            <div v-else-if="post.quality_grade" class="quality-badge" :class="'grade-' + post.quality_grade.toLowerCase()">
              <span class="grade-icon">🏆</span>
              <span class="grade-text">{{ post.quality_grade }}등급</span>
            </div>

            <!-- 즐겨찾기 버튼 -->
            <button @click="toggleBookmark(post)" class="bookmark-btn" :class="{ bookmarked: post.bookmarked }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" :stroke="post.bookmarked ? 'none' : 'currentColor'" :fill="post.bookmarked ? 'currentColor' : 'none'" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 상품명 + 가격 -->
        <div class="post-header-bar">
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="price-section">
            <span class="post-price">{{ formatPrice(post.price) }}</span>
          </div>
        </div>

        <!-- 날짜 -->
        <p class="date">{{ formatDate(post.created_at || post.date) }}</p>

        <!-- 본문 -->
        <div class="post-content" role="button" tabindex="0" @click="goToPost(post.id)" @keydown.enter="goToPost(post.id)" @keydown.space.prevent="goToPost(post.id)">
          <p class="post-description">{{ post.text }}</p>
          
          <!-- 품질 신뢰도 -->
          <div class="quality-detail">
            <div class="quality-info-row">
              <span class="quality-label">신뢰도</span>
              <span class="quality-value">{{ formatQualityConfidence(post) }}</span>
            </div>
          </div>

          <div v-if="post.sensorStatus !== null" class="sensor-summary">
            <div class="sensor-chip">
              <span class="chip-label">🌡 온도</span>
              <span class="chip-value">{{ formatSensor(post.sensorStatus.temp) }}°C</span>
            </div>
            <div class="sensor-chip">
              <span class="chip-label">💧 습도</span>
              <span class="chip-value">{{ formatSensor(post.sensorStatus.humidity) }}%</span>
            </div>
            <div class="sensor-chip">
              <span class="chip-label">☀️ 조도</span>
              <span class="chip-value">{{ formatSensor(post.sensorStatus.light) }} lux</span>
            </div>
            <div class="sensor-chip quality" :class="getQualityBadgeClass(post.quality_grade || post.sensorQuality)">
              <span class="chip-label">🌿 품질</span>
              <span class="chip-value">
                {{ getGradeLabel(post.quality_grade || post.sensorQuality || '-') }}
              </span>
            </div>
          </div>
          <div v-if="post.tags && post.tags.length > 0" class="tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>

        <!-- 프로필 + 상호작용 -->
        <div class="post-footer">
          <div class="profile-info" @click="goToProfile(post.userId || post.user_id)">
            <div class="profile-wrapper">
              <div class="profile" :style="{ backgroundImage: `url(${post.profile})` }"></div>
              <div class="verification-badge" v-if="post.verified">✓</div>
            </div>
            <div class="profile-details">
              <span class="profile-name">{{ post.name }}</span>
              <span class="profile-rating">⭐ {{ post.rating || '신규' }}</span>
            </div>
          </div>

          <div class="action-section">
            <!-- 좋아요 -->
            <button @click="toggleLike(post)" class="action-btn like-btn" :class="{ liked: post.liked }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" :fill="post.liked ? 'currentColor' : 'none'" :stroke="post.liked ? 'none' : 'currentColor'" stroke-width="2"/>
              </svg>
              <span>{{ post.likes }}</span>
            </button>

            <!-- 댓글 -->
            <button @click="goToComments(post.id)" class="action-btn comment-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ post.comments }}</span>
            </button>

            <!-- 공유 -->
            <button @click="sharePost(post)" class="action-btn share-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" stroke-width="2"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2V15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 액션 버튼들 -->
        <div class="action-buttons">
          <button @click="openChat(post)" class="chat-btn" :disabled="post.status === 'sold'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.60573 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ post.status === 'sold' ? '판매완료' : '채팅하기' }}
          </button>
          <button @click="buyNow(post)" class="buy-btn" :disabled="post.status === 'sold'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ post.status === 'sold' ? '판매완료' : '바로구매' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 댓글 모달 -->
  <Comment 
      v-if="showComment"
      :visible="showComment"
      :postId="selectedPostId"
      @close="showComment = false"
      @comment-added="onCommentAdded"
      @comment-deleted="onCommentDeleted" />

  <!-- 채팅 팝업 -->
  <ChatPopup
    v-for="chat in openChats"
    :key="chat.id"
    :visible="chat.visible"
    :title="chat.title"
    :startX="chat.pos.x"
    :startY="chat.pos.y"
    :zIndex="chat.z"
    :receiverId="chat.seller_id"
    @close="closeChat(chat.id)"
  />
</template>

<script>
import Comment from './Comment.vue'
import ChatPopup from '../chat/ChatPopup.vue'
import { supabase } from '@/utils/supabase'

let zSeed = 10000

export default {
  name: 'Community',
  
  components: {
    Comment,
    ChatPopup
  },

  data() {
    return {
      loading: false,
      loadingMore: false,
      searchQuery: '',
      activeFilter: 'all',
      selectedPostId: null,
      showComment: false,
      openChats: [],
      currentUser: null,
      
      filters: [
        { key: 'all', label: '전체' },
        { key: 'available', label: '판매중' },
        { key: 'premium', label: '프리미엄 (S등급)' }, // ✨ 등급 필터 추가
        { key: 'popular', label: '인기' },
        { key: 'recent', label: '최신' },
        { key: 'nearby', label: '내 근처' }
      ],
      
      posts: [],
      realtimeChannel: null,
      
      // ✨ 등급 분석 API URL
      QUALITY_API_URL: 'https://detectbug-740384497388.asia-southeast1.run.app/predict/quality'
    }
  },

  computed: {
    filteredPosts() {
      let filtered = this.posts

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(post => 
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.text && post.text.toLowerCase().includes(query)) ||
          (post.tags && post.tags.some(tag => tag && tag.toLowerCase().includes(query)))
        )
      }

      if (this.activeFilter === 'available') {
        filtered = filtered.filter(post => post.status === 'available')
      } else if (this.activeFilter === 'premium') {
        // ✨ S등급 필터링
        filtered = filtered.filter(post => post.quality_grade === 'S')
      } else if (this.activeFilter === 'popular') {
        filtered = [...filtered].sort((a, b) => b.likes - a.likes)
      } else if (this.activeFilter === 'recent') {
        filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      return filtered
    }
  },

  watch: {
    showComment(val) {
      this.$emit('comment-visibility', val)
    }
  },

  async mounted() {
    const { data: { user } } = await supabase.auth.getUser()
    this.currentUser = user
    
    await this.fetchPosts()
    this.setupRealtime()
  },

  beforeUnmount() {
    if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel)
  },

  methods: {
    setupRealtime() {
      if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel)

      this.realtimeChannel = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'posts' },
          (payload) => {
            const updatedPost = payload.new
            const targetIndex = this.posts.findIndex(p => p.id === updatedPost.id)
            
            if (targetIndex !== -1) {
              const currentPost = this.posts[targetIndex]
              
              this.posts[targetIndex] = {
                ...currentPost,
                likes: updatedPost.likes,
                comments: updatedPost.comments,
                views: updatedPost.views
              }
            }
          }
        )
        .subscribe()
    },

    async fetchPosts() {
      this.loading = true
      try {
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        let myLikedIds = new Set()
        let myBookmarkedIds = new Set()

        if (this.currentUser) {
          const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', this.currentUser.id)
          
          const { data: bookmarks } = await supabase
            .from('bookmarks')
            .select('post_id')
            .eq('user_id', this.currentUser.id)

      if (likes) likes.forEach(l => myLikedIds.add(l.post_id))
      if (bookmarks) bookmarks.forEach(b => myBookmarkedIds.add(b.post_id))
      }

      // 기본 데이터 매핑 (센서/품질은 비동기 후처리)
      const enriched = postsData.map(post => ({
        ...post,
        date: this.formatDate(post.created_at),
        liked: myLikedIds.has(post.id),
        bookmarked: myBookmarkedIds.has(post.id),
        likes: post.likes || 0,
        comments: post.comments || 0,
        views: post.views || 0,
        // 품질 API 결과(이미지 기반) 유지용
        quality_grade: post.quality_grade || null,
        quality_confidence: post.quality_confidence ?? null,
        analyzingQuality: post.analyzingQuality || false,
        // 센서/품질 메타
        sensorStatus: { humidity: null, temp: null, light: null },
        sensorQuality: '-'
      }))
      this.posts = enriched
      // 센서/품질은 비동기로 처리해 초기 렌더 지연을 줄임
      this.attachSensorStatus(enriched).catch(e => console.error('센서/품질 연동 실패:', e))

      } catch (e) {
        console.error('게시글 로드 실패:', e)
      } finally {
        this.loading = false
      }
    },

    async toggleLike(post) {
      if (!this.currentUser) return alert('로그인이 필요합니다.')

      const previousLiked = post.liked
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1

      try {
        if (previousLiked) {
            await supabase.from('likes').delete().eq('user_id', this.currentUser.id).eq('post_id', post.id)
        } else {
            await supabase.from('likes').insert({ user_id: this.currentUser.id, post_id: post.id })
        }
      } catch (e) {
        post.liked = previousLiked
        post.likes += post.liked ? 1 : -1
        console.error('좋아요 오류:', e)
      }
    },

    async toggleBookmark(post) {
      if (!this.currentUser) return alert('로그인이 필요합니다.')

      const previousBookmarked = post.bookmarked
      post.bookmarked = !post.bookmarked

      try {
        if (previousBookmarked) {
            await supabase.from('bookmarks').delete().eq('user_id', this.currentUser.id).eq('post_id', post.id)
        } else {
            await supabase.from('bookmarks').insert({ user_id: this.currentUser.id, post_id: post.id })
            alert('북마크에 저장되었습니다.')
        }
      } catch (e) {
        post.bookmarked = previousBookmarked
        console.error('북마크 오류:', e)
      }
    },

    // ✨ 등급 관련 헬퍼 함수들 (NEW!)
    getGradeColor(grade) {
      const colors = {
        'S': '#ffd700',
        'A': '#c0c0c0',
        'B': '#cd7f32'
      }
      return colors[grade] || '#95a5a6'
    },

    getQualityBadgeClass(rawGrade) {
      if (!rawGrade || rawGrade === '-') return ''

      const grade = String(rawGrade).trim().toUpperCase()
      const map = {
        S: 'quality-grade-s',
        A: 'quality-grade-a',
        B: 'quality-grade-b',
        C: 'quality-grade-c'
      }

      return map[grade] || ''
    },

    getGradeLabel(grade) {
      const labels = {
        'S': 'S등급 (특상)',
        'A': 'A등급 (상)',
        'B': 'B등급 (중)'
      }
      return labels[grade] || '등급 미분류'
    },

    extractPhotoUrl(photos) {
      if (!photos) return null
      if (Array.isArray(photos)) {
        const first = photos[0]
        if (!first) return null
        return first.url || first.path || first
      }
      if (typeof photos === 'object' && photos.url) return photos.url
      return null
    },

    saveQualityLocally(postId, plantId, grade, confidence) {
      if (typeof localStorage === 'undefined') return
      try {
        const raw = localStorage.getItem('post-quality-grades')
        const parsed = raw ? JSON.parse(raw) : {}
        parsed[postId] = { grade, plantId, confidence }
        localStorage.setItem('post-quality-grades', JSON.stringify(parsed))
      } catch (e) {
        console.error('로컬 품질 저장 실패:', e)
      }
    },

    async persistQualityGrade(post, grade, confidence) {
      if (!post || !post.id || !grade) return
      try {
        // 게시글 테이블에 반영
        await supabase
          .from('posts')
          .update({
            quality_grade: grade,
            quality_confidence: confidence ?? null
          })
          .eq('id', post.id)

        // User_Plants.message에도 저장 (본인 글인 경우에만)
        if (this.currentUser && post.user_id === this.currentUser.id && post.plant_id) {
          const { data: current } = await supabase
            .from('User_Plants')
            .select('message')
            .eq('id', post.plant_id)
            .maybeSingle()
          const message = current?.message || {}
          const nextMessage = {
            ...message,
            quality: {
              grade,
              confidence: confidence ?? null,
              updated_at: new Date().toISOString()
            }
          }
          await supabase
            .from('User_Plants')
            .update({ message: nextMessage })
            .eq('id', post.plant_id)
            .eq('user_id', this.currentUser.id)
        }
      } catch (err) {
        console.error('품질 등급 영구 저장 실패:', err)
      }
    },

    async analyzeQualityFromPhoto(post, photoUrl) {
      if (!photoUrl || !post || post.analyzingQuality) return
      post.analyzingQuality = true
      try {
        const imgRes = await fetch(photoUrl)
        const blob = await imgRes.blob()
        const formData = new FormData()
        formData.append('file', blob, 'plant.jpg')

        const response = await fetch(this.QUALITY_API_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          console.error('품질 API 오류:', await response.text())
          return
        }

        const data = await response.json()
        if (data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
          const prediction = data.predictions[0]
          const grade = prediction.grade || post.sensorQuality || '-'
          const confidence = prediction.confidence ?? null
          post.quality_grade = grade
          post.sensorQuality = grade
          if (confidence !== null && confidence !== undefined) {
            post.quality_confidence = confidence
          }
          this.saveQualityLocally(post.id, post.plant_id, grade, confidence)
          await this.persistQualityGrade(post, grade, confidence)
        }
      } catch (err) {
        console.error('사진 기반 품질 분석 실패:', err)
      } finally {
        post.analyzingQuality = false
      }
    },

    getQualityConfidenceValue(post) {
      if (!post) return null
      if (post.quality_confidence !== null && post.quality_confidence !== undefined) {
        return post.quality_confidence
      }

      const computed = this.computeQualityConfidence(post.sensorStatus)
      if (computed === null || computed === undefined) return null

      // 캐싱해 재계산 최소화
      post.quality_confidence = computed
      return computed
    },

    onCommentAdded(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (post) post.comments++
    },
    
    onCommentDeleted(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (post && post.comments > 0) post.comments--
    },

    goToWritePost() { this.$router.push('/write') },
    onSearch() {},
    clearSearch() { this.searchQuery = '' },
    setActiveFilter(filter) { this.activeFilter = filter },
    goToComments(postId) { this.selectedPostId = postId; this.showComment = true },
    goToProfile(userId, name) {
      const target = userId || name
      if (!target) return
      this.$router.push(`/profile/${target}`)
    },
    sharePost(post) { if (navigator.share) { navigator.share({ title: post.title, text: post.text, url: window.location.href }) } else { alert('공유 기능이 지원되지 않는 브라우저입니다.') } },
    applyQuerySearch() {
      const q = this.$route.query.q
      if (typeof q === 'string') {
        this.searchQuery = q
      }
    },
    goToPost(id) {
      if (!id) return
      this.$router.push(`/community/post/${id}`)
    },
    truncateText(text, max = 80) {
      if (!text) return ''
      const t = String(text)
      if (t.length <= max) return t
      return t.slice(0, max) + '...'
    },
    formatSensor(val) {
      return (val === null || val === undefined || Number.isNaN(val)) ? '-' : val
    },
    computeQuality(status) {
      if (!status) return '-'
      const { humidity, temp, light } = status
      if (
        humidity === null || humidity === undefined ||
        temp === null || temp === undefined ||
        light === null || light === undefined
      ) return '-'

      let score = 0
      const inRange = (val, min, max) => val >= min && val <= max
      if (inRange(humidity, 40, 70)) score++
      if (inRange(temp, 18, 28)) score++
      if (inRange(light, 40, 80)) score++

      if (score === 3) return 'A'
      if (score === 2) return 'B'
      return 'C'
    },
    computeQualityConfidence(status) {
      if (!status) return null
      const toNum = (v) => {
        const n = Number(v)
        return Number.isFinite(n) ? n : null
      }
      const humidity = toNum(status.humidity)
      const temp = toNum(status.temp)
      const light = toNum(status.light)
      const readings = [humidity, temp, light]

      // 센서값이 모두 없거나 0이면 계산하지 않음 (DB 기본값 0 방어)
      const hasValue = readings.some(v => v !== null && v !== undefined && v !== 0)
      if (!hasValue) return null
      if (readings.some(v => v === null || v === undefined)) return null

      let score = 0
      const inRange = (val, min, max) => val >= min && val <= max
      if (inRange(humidity, 40, 70)) score++
      if (inRange(temp, 18, 28)) score++
      if (inRange(light, 40, 80)) score++

      return +(score / 3).toFixed(2)
    },
    formatQualityConfidence(post) {
      const val = this.getQualityConfidenceValue(post)
      if (val === null || val === undefined || Number.isNaN(Number(val))) return '데이터 없음'
      return `${(Number(val) * 100).toFixed(1)}%`
    },
    async attachSensorStatus(posts) {
      const slice = posts

      // 1) 로컬 품질 캐시 반영
      let localCache = {}
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('post-quality-grades')
          if (raw) localCache = JSON.parse(raw)
        }
      } catch (e) {
        console.error('로컬 품질 로드 실패:', e)
      }
      slice.forEach(post => {
        const cached = localCache[post.id]
        if (cached?.grade) {
          post.sensorQuality = cached.grade
          if (!post.plant_id && cached.plantId) post.plant_id = cached.plantId
          if (cached.confidence !== undefined && cached.confidence !== null) {
            post.quality_confidence = cached.confidence
          }
        }
      })

      // 게시글에 저장된 품질 값이 있으면 우선 반영
      slice.forEach(post => {
        if (post.quality_grade) {
          post.sensorQuality = post.quality_grade
        }
      })

      // 1-1) plant_id가 없는 글 중 일부는 제목/작성자로 User_Plants 매칭해서 plant_id/품질을 채움
      const missingPlantPosts = slice.filter(p => !p.plant_id && p.user_id && p.title).slice(0, 5)
      const plantMetaCache = {}
      for (const post of missingPlantPosts) {
        try {
          const { data: plantRow } = await supabase
            .from('User_Plants')
            .select('id, message, photos')
            .eq('user_id', post.user_id)
            .ilike('name', post.title)
            .maybeSingle()
          if (plantRow) {
            post.plant_id = plantRow.id
            if (plantRow.message?.quality?.grade) {
              post.sensorQuality = post.sensorQuality === '-' ? plantRow.message.quality.grade : post.sensorQuality
              plantMetaCache[plantRow.id] = plantRow
            }
            if (plantRow.message?.quality?.confidence !== undefined && plantRow.message.quality.confidence !== null) {
              post.quality_confidence = plantRow.message.quality.confidence
            }
            const photoUrl = this.extractPhotoUrl(plantRow.photos)
            if (photoUrl) {
              plantMetaCache[plantRow.id] = plantMetaCache[plantRow.id] || plantRow
            }
          }
        } catch (err) {
          console.error('plant_id 보완 실패:', err)
        }
      }

      const plantIds = slice.map(p => p.plant_id).filter(Boolean)
      if (plantIds.length === 0) return

      try {
        // 2) 품질 메타 한번에 조회
        const { data: plantMeta } = await supabase
          .from('User_Plants')
          .select('id, message, photos')
          .in('id', plantIds)
        const qualityMap = {}
        const qualityConfidenceMap = {}
        const photoMap = {}
        const mergedPlantMeta = [...(plantMeta || []), ...Object.values(plantMetaCache)]
        mergedPlantMeta.forEach(pm => {
          qualityMap[pm.id] = pm.message?.quality?.grade || '-'
          if (pm.message?.quality && pm.message.quality.confidence !== undefined) {
            qualityConfidenceMap[pm.id] = pm.message.quality.confidence
          }
          const photoUrl = this.extractPhotoUrl(pm.photos)
          if (photoUrl) photoMap[pm.id] = photoUrl
        })

        // 3) 센서 데이터 한번에 조회
        const { data: sensorRows, error: sensorError } = await supabase
          .from('sensor_data')
          .select('plant_id, humidity, temp, light')
          .in('plant_id', plantIds)
        if (sensorError && sensorError.code !== 'PGRST116') {
          console.error('센서 데이터 오류:', sensorError)
        }
        const sensorMap = {}
        if (sensorRows) {
          sensorRows.forEach(row => {
            const latestVal = (arr) => {
              if (!arr) return null
              if (Array.isArray(arr) && arr.length) {
                const last = arr[arr.length - 1]
                return typeof last === 'number' ? last : (last?.value ?? null)
              }
              return null
            }
            sensorMap[row.plant_id] = {
              humidity: latestVal(row.humidity),
              temp: latestVal(row.temp),
              light: latestVal(row.light)
            }
          })
        }

        const photoPredictQueue = []

        slice.forEach(post => {
          const pid = post.plant_id
          const photoUrl = post.image || (pid ? photoMap[pid] : null)

          if (pid) {
            post.sensorStatus = sensorMap[pid] || { humidity: null, temp: null, light: null }
            if (!post.sensorQuality || post.sensorQuality === '-') {
              post.sensorQuality = qualityMap[pid] || this.computeQuality(post.sensorStatus)
            }
            if (post.quality_confidence === null || post.quality_confidence === undefined) {
              if (qualityConfidenceMap[pid] !== undefined) {
                post.quality_confidence = qualityConfidenceMap[pid]
              } else {
                post.quality_confidence = this.computeQualityConfidence(post.sensorStatus)
              }
            }
          }

          if ((!post.sensorQuality || post.sensorQuality === '-' || post.sensorQuality === null) && photoUrl) {
            photoPredictQueue.push({ post, photoUrl })
          }
        })

        // 사진 기반 자동 품질 계산 (게시글 이미지/식물 사진이 있고 아직 등급이 없는 경우)
        for (const item of photoPredictQueue) {
          await this.analyzeQualityFromPhoto(item.post, item.photoUrl)
        }
      } catch (err) {
        console.error('센서 상태 일괄 연동 실패:', err)
        slice.forEach(post => { post.sensorStatus = { humidity: null, temp: null, light: null } })
      }
    },
    
    openChat(post) {
      const chatId = `chat-${post.id}-${Date.now()}`
      const sellerId = post.user_id
      
      if (this.currentUser && sellerId === this.currentUser.id) {
        return alert('본인이 작성한 게시글입니다.')
      }

      const existingChat = this.openChats.find(c => c.seller_id === sellerId)
      if (existingChat) {
        existingChat.z = zSeed++
        return
      }

      const newChat = {
        id: chatId,
        title: `${post.name}님과의 채팅`,
        seller_id: sellerId,
        visible: true,
        pos: {
          x: 20 + (this.openChats.length * 30),
          y: 20 + (this.openChats.length * 30)
        },
        z: zSeed++
      }
      this.openChats.push(newChat)
    },

    closeChat(chatId) {
      const index = this.openChats.findIndex(chat => chat.id === chatId)
      if (index !== -1) {
        this.openChats.splice(index, 1)
      }
    },

    buyNow(post) { 
      console.log('바로구매:', post.title)
      alert(`${post.title} 구매를 진행합니다.`) 
    },
    
    getStatusText(status) { 
      const statusMap = { 
        'available': '판매중', 
        'reserved': '예약중', 
        'sold': '판매완료' 
      }
      return statusMap[status] || '판매중' 
    },
    
    formatPrice(value) { 
      return new Intl.NumberFormat('ko-KR').format(value) + '원' 
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      try { 
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) 
      } catch { 
        return dateString 
      }
    }
  }
}
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.community-header {
  margin-bottom: 30px;
}

.header-content h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.header-subtitle {
  color: #666;
  font-size: 14px;
}

.search-section {
  margin: 20px 0;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 15px;
}

.search-icon {
  color: #999;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.clear-search {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  overflow-x: auto;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #568265;
  color: white;
  border-color: #568265;
}

.write-post-btn {
  width: 100%;
  padding: 12px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  margin: 20px 0;
}

.loading-container {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-action-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.posts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.post-image-wrapper {
  position: relative;
}

.post-body {
  width: 100%;
  height: 250px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.available {
  background: #4CAF50;
  color: white;
}

.status-badge.reserved {
  background: #FF9800;
  color: white;
}

.status-badge.sold {
  background: #999;
  color: white;
}

/* ✨ 등급 배지 스타일 (NEW!) */
.quality-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.quality-badge.analyzing {
  background: rgba(149, 165, 166, 0.95);
  color: white;
}

.analyzing-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quality-badge.grade-s {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 193, 7, 0.95));
  color: #333;
}

.quality-badge.grade-a {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.95), rgba(169, 169, 169, 0.95));
  color: white;
}

.quality-badge.grade-b {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.95), rgba(184, 115, 51, 0.95));
  color: white;
}

.grade-icon {
  font-size: 14px;
}

.grade-text {
  font-size: 11px;
  letter-spacing: 0.5px;
}

/* ✨ 등급 상세 정보 스타일 (NEW!) */
.quality-detail {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  border-left: 3px solid #ffd700;
}

.quality-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.quality-info-row:last-child {
  margin-bottom: 0;
}

.quality-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.quality-value {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.bookmark-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.bookmark-btn.bookmarked {
  color: #568265;
}

.post-header-bar {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.post-price {
  font-size: 20px;
  font-weight: 700;
  color: #568265;
}

.date {
  padding: 0 15px;
  font-size: 12px;
  color: #999;
  margin: 0 0 10px 0;
}

.post-content {
  padding: 0 15px 15px;
  cursor: pointer;
}

.post-description {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
  line-height: 1.5;
}
.sensor-summary { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.sensor-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 12px; background: linear-gradient(135deg, #eef7f0, #e4f2ff); color: #2f4858; font-size: 12px; border: 1px solid #d3e5dd; }
.chip-label { font-weight: 700; color: #4a8063; letter-spacing: -0.2px; }
.chip-value { font-weight: 700; color: #1e4d6b; }
.sensor-chip.quality { background: linear-gradient(135deg, #fff3e0, #ffe9d6); border-color: #ffd2a8; }
.sensor-chip.quality.quality-grade-s { background: linear-gradient(135deg, #fff9db, #ffe892); border-color: #ffd95b; }
.sensor-chip.quality.quality-grade-a { background: linear-gradient(135deg, #f2f4f7, #e2e7ee); border-color: #cfd8e3; }
.sensor-chip.quality.quality-grade-b { background: linear-gradient(135deg, #fff1e6, #ffd6b0); border-color: #f5c08f; }
.sensor-chip.quality.quality-grade-c { background: linear-gradient(135deg, #f7f7f7, #ededed); border-color: #d9d9d9; }

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #568265;
  background: #f0f8f4;
  padding: 4px 10px;
  border-radius: 12px;
}

.post-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.profile-wrapper {
  position: relative;
}

.profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.verification-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #4CAF50;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid white;
}

.profile-details {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-weight: 600;
  font-size: 14px;
}

.profile-rating {
  font-size: 12px;
  color: #666;
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.action-btn:hover {
  color: #568265;
}

.like-btn.liked {
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #eee;
}

.chat-btn,
.buy-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.chat-btn {
  background: white;
  border: 2px solid #568265;
  color: #568265;
}

.chat-btn:hover {
  background: #f0f8f4;
}

.buy-btn {
  background: #568265;
  color: white;
}

.buy-btn:hover {
  background: #456b4f;
}

.chat-btn:disabled,
.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
