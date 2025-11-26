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
          <p class="post-description">{{ truncateText(post.text, 80) }}</p>
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
              <div class="sensor-chip quality">
                <span class="chip-label">🌿 품질</span>
                <span class="chip-value">{{ post.sensorQuality || computeQuality(post.sensorStatus) || '-' }}</span>
              </div>
            </div>
          <div v-if="post.tags && post.tags.length > 0" class="tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>

        <!-- 프로필 + 상호작용 -->
        <div class="post-footer">
          <div class="profile-info" @click="goToProfile(post.userId || post.user_id, post.name)">
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
      @comment-added="onCommentAdded"      @comment-deleted="onCommentDeleted"  />

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
        { key: 'popular', label: '인기' },
        { key: 'recent', label: '최신' },
        { key: 'nearby', label: '내 근처' }
      ],
      
      posts: [],
      realtimeChannel: null // 실시간 채널 변수 추가
    }
  },

  computed: {
    filteredPosts() {
      let filtered = this.posts

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(query) ||
          (post.text && post.text.toLowerCase().includes(query)) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }

      if (this.activeFilter === 'available') {
        filtered = filtered.filter(post => post.status === 'available')
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
    },
    '$route.query.q'(newQuery, oldQuery) {
      if (newQuery === oldQuery) return
      this.applyQuerySearch()
    }
  },

  async mounted() {
    // 1. 유저 정보 먼저 확인
    const { data: { user } } = await supabase.auth.getUser()
    this.currentUser = user
    
    // 2. 게시글 로드
    await this.fetchPosts()
    this.applyQuerySearch()
    
    // 3. 실시간 구독 시작
    this.setupRealtime()
  },

  beforeUnmount() {
    // 컴포넌트 해제 시 구독 취소
    if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel)
  },

  methods: {
    setupRealtime() {
      // 기존 채널이 있다면 제거
      if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel)

      this.realtimeChannel = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'posts' },
          (payload) => {
            console.log('📢 실시간 업데이트 수신:', payload) // [디버깅용] 콘솔 확인

            const updatedPost = payload.new
            // 화면에 있는 게시글 중 업데이트된 글 찾기
            const targetIndex = this.posts.findIndex(p => p.id === updatedPost.id)
            
            if (targetIndex !== -1) {
              const currentPost = this.posts[targetIndex]
              
              this.posts[targetIndex] = {
                ...currentPost, // 기존 데이터(작성자, 내 좋아요 여부 등) 유지
                likes: updatedPost.likes,       // 좋아요 수 업데이트
                comments: updatedPost.comments, // 댓글 수 업데이트
                views: updatedPost.views        // 조회수 업데이트
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime 상태:', status)
        })
    },

    async fetchPosts() {
      this.loading = true
      try {
        // 1. 게시글 전체 가져오기
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // 2. 내가 누른 좋아요/북마크 목록 별도로 가져오기
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

        // 3. 데이터 병합
      const enriched = postsData.map(post => ({
          ...post,
          date: this.formatDate(post.created_at),
          liked: myLikedIds.has(post.id),
          bookmarked: myBookmarkedIds.has(post.id),
          // DB 값 그대로 사용 (없으면 0)
          likes: post.likes || 0,
          comments: post.comments || 0,
          views: post.views || 0,
          sensorStatus: { humidity: null, temp: null, light: null },
          sensorQuality: '-'
        }))
        this.posts = enriched
        await this.attachSensorStatus(enriched)

      } catch (e) {
        console.error('게시글 로드 실패:', e)
      } finally {
        this.loading = false
      }
    },

    async toggleLike(post) {
      if (!this.currentUser) return alert('로그인이 필요합니다.')

      // 화면 먼저 갱신 (Optimistic Update)
      const previousLiked = post.liked
      post.liked = !post.liked
      // 숫자는 Realtime이 처리해주지만, 반응성을 위해 임시로 변경
      post.likes += post.liked ? 1 : -1

      try {
        if (previousLiked) {
            // 취소
            await supabase.from('likes').delete().eq('user_id', this.currentUser.id).eq('post_id', post.id)
        } else {
            // 추가
            await supabase.from('likes').insert({ user_id: this.currentUser.id, post_id: post.id })
        }
      } catch (e) {
        // 실패 시 롤백
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

    // 이벤트 핸들러: 내 화면에서 직접 댓글 달았을 때 즉각 반응용
    onCommentAdded(postId) {
      // Realtime이 오기 전에 UI 반응성 향상을 위해
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
    async attachSensorStatus(posts) {
      const limit = 10
      const slice = posts.slice(0, limit)
      await Promise.all(slice.map(async (post) => {
        try {
          // 로컬 저장된 품질/식물 우선 적용
          try {
            const raw = localStorage.getItem('post-quality-grades')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed[post.id]?.grade) {
                post.sensorQuality = parsed[post.id].grade
                if (!post.plant_id && parsed[post.id]?.plantId) {
                  post.plant_id = parsed[post.id].plantId
                }
              }
            }
          } catch (e) {
            console.error('로컬 품질 로드 실패:', e)
          }

          let plantId = post.plant_id || null

          if (!plantId) {
            // 제목과 식물이름 매칭
            const { data: plantRow, error: plantError } = await supabase
              .from('User_Plants')
              .select('id, message')
              .eq('user_id', post.user_id)
              .ilike('name', post.title)
              .maybeSingle()
            if (!plantError && plantRow) {
              plantId = plantRow.id
              post.sensorQuality = plantRow.message?.quality?.grade || '-'
            } else if (plantError && plantError.code !== 'PGRST116') {
              console.error('센서 식물 매칭 오류:', plantError)
            }
          } else {
            const { data: plantMeta } = await supabase
              .from('User_Plants')
              .select('message')
              .eq('id', plantId)
              .maybeSingle()
            if (plantMeta?.message?.quality?.grade) {
              post.sensorQuality = plantMeta.message.quality.grade
            }
          }

          // 로컬에 저장된 품질 값이 있으면 우선 반영
          try {
            const raw = localStorage.getItem('post-quality-grades')
            if (raw) {
              const parsed = JSON.parse(raw)
              if (parsed[post.id]?.grade) {
                post.sensorQuality = parsed[post.id].grade
                if (!plantId && parsed[post.id]?.plantId) {
                  plantId = parsed[post.id].plantId
                }
              }
            }
          } catch (e) {
            console.error('로컬 품질 로드 실패:', e)
          }

          if (!plantId) {
            post.sensorStatus = { humidity: null, temp: null, light: null }
            return
          }

          const { data, error } = await supabase
            .from('sensor_data')
            .select('humidity, temp, light')
            .eq('plant_id', plantId)
            .maybeSingle()
          if (error) {
            if (error.code !== 'PGRST116') console.error('센서 데이터 오류:', error)
            post.sensorStatus = { humidity: null, temp: null, light: null }
            return
          }
          if (!data) {
            post.sensorStatus = { humidity: null, temp: null, light: null }
            return
          }
          const latestVal = (arr) => {
            if (!arr) return null
            if (Array.isArray(arr) && arr.length) {
              const last = arr[arr.length - 1]
              return typeof last === 'number' ? last : (last?.value ?? null)
            }
            return null
          }
          post.sensorStatus = {
            humidity: latestVal(data.humidity),
            temp: latestVal(data.temp),
            light: latestVal(data.light)
          }

          if (!post.sensorQuality || post.sensorQuality === '-') {
            post.sensorQuality = this.computeQuality(post.sensorStatus)
          }
        } catch (err) {
          console.error('센서 상태 연동 실패:', err)
          post.sensorStatus = { humidity: null, temp: null, light: null }
        }
      }))
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

    async buyNow(post) {
      if (!this.currentUser) {
        alert('로그인이 필요합니다.')
        return
      }

      // 자기 자신의 게시글인지 확인
      if (post.user_id === this.currentUser.id) {
        alert('본인의 게시글입니다.')
        return
      }

      console.log('바로구매:', post.title)

      try {
        // 구매자 정보 조회
        const { data: buyerData } = await supabase
          .from('Users')
          .select('name')
          .eq('id', this.currentUser.id)
          .single()

        const buyerName = buyerData?.name || '사용자'

        // 판매자에게 알림 전송
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'trade',
            title: '구매 요청',
            message: `${buyerName}님이 "${post.title}" 구매를 요청했습니다`,
            read: false,
            metadata: {
              price: post.price,
              plantName: post.title
            },
            related_post_id: post.id,
            related_user_id: this.currentUser.id
          })

        if (notifError) {
          console.warn('알림 전송 실패:', notifError)
        }

        alert(`${post.title} 구매를 진행합니다.\n판매자에게 알림이 전송되었습니다.`)
      } catch (e) {
        console.error('바로구매 처리 중 오류:', e)
        alert(`${post.title} 구매를 진행합니다.`)
      }
    },
    getStatusText(status) { const statusMap = { 'available': '판매중', 'reserved': '예약중', 'sold': '판매완료' }; return statusMap[status] || '판매중' },
    formatPrice(value) { return new Intl.NumberFormat('ko-KR').format(value) + '원' },
    formatDate(dateString) {
      if (!dateString) return ''
      try { const date = new Date(dateString); if (isNaN(date.getTime())) return dateString; return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) } catch { return dateString }
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
