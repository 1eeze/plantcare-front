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
            <div class="status-badge" :class="post.status">
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

        <!-- 위치 + 날짜 -->
        <div class="post-meta">
          <span class="location">📍 {{ post.location || '위치 미공개' }}</span>
          <span class="date">{{ formatDate(post.date) }}</span>
        </div>

        <!-- 본문 -->
        <div class="post-content">
          <p class="post-description">{{ post.text }}</p>
          <div v-if="post.tags && post.tags.length > 0" class="tags">
            <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>

        <!-- 프로필 + 상호작용 -->
        <div class="post-footer">
          <div class="profile-info" @click="goToProfile(post.userId)">
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

    <!-- 무한 스크롤 로딩 -->
    <div v-if="loadingMore" class="loading-more">
      <div class="loading-spinner small"></div>
      <span>더 많은 게시글 불러오는 중...</span>
    </div>
  </div>

  <!-- 댓글 모달 -->
  <Comment
    :visible="showComment"
    :postId="selectedPostId"
    @close="showComment = false"
  />
</template>

<script>
import Comment from './Comment.vue'

export default {
  name: 'Community',
  
  components: {
    Comment
  },

  data() {
    return {
      loading: false,
      loadingMore: false,
      searchQuery: '',
      activeFilter: 'all',
      selectedPostId: null,
      showComment: false,
      
      filters: [
        { key: 'all', label: '전체' },
        { key: 'available', label: '판매중' },
        { key: 'popular', label: '인기' },
        { key: 'recent', label: '최신' },
        { key: 'nearby', label: '내 근처' }
      ],
      
      posts: [
        {
          id: 1,
          profile: 'https://picsum.photos/100?random=10',
          name: 'PlantLover',
          userId: 'plantlover123',
          verified: true,
          rating: 4.8,
          image: 'https://picsum.photos/600?random=10',
          title: '몬스테라 알보 (무늬종)',
          text: '집에서 키운 건강한 몬스테라입니다. 무늬가 선명하고 뿌리도 튼튼해요. 분갈이한 지 3개월 되었습니다.',
          date: '2024-09-01',
          location: '강남구 역삼동',
          price: 45000,
          likes: 43,
          liked: false,
          comments: 8,
          bookmarked: false,
          status: 'available', // available, reserved, sold
          tags: ['몬스테라', '무늬종', '알보', '실내식물'],
          views: 156
        },
        {
          id: 2,
          profile: 'https://picsum.photos/100?random=11',
          name: 'SunshineGreen',
          userId: 'sunshine_green',
          verified: false,
          rating: 4.2,
          image: 'https://picsum.photos/600?random=11',
          title: '알로카시아 아마조니카',
          text: '잎맥이 선명해서 인테리어용으로 정말 좋습니다. 키우기도 어렵지 않아요.',
          date: '2024-09-02',
          location: '마포구 홍대입구',
          price: 35000,
          likes: 77,
          liked: true,
          comments: 5,
          bookmarked: true,
          status: 'reserved',
          tags: ['알로카시아', '아마조니카', '인테리어'],
          views: 203
        },
        {
          id: 3,
          profile: 'https://picsum.photos/100?random=12',
          name: '초록식물마니아',
          userId: 'green_mania',
          verified: true,
          rating: 4.9,
          image: 'https://picsum.photos/600?random=12',
          title: '필로덴드론 핑크 프린세스',
          text: '핑크색이 정말 예뻐요! 새잎도 계속 나오고 있습니다.',
          date: '2024-09-03',
          location: '서초구 서초동',
          price: 120000,
          likes: 124,
          liked: false,
          comments: 15,
          bookmarked: false,
          status: 'sold',
          tags: ['필로덴드론', '핑크프린세스', '희귀식물'],
          views: 445
        }
      ]
    }
  },

  computed: {
    filteredPosts() {
      let filtered = [...this.posts]
      
      // 검색 필터링
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.text.toLowerCase().includes(query) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }
      
      // 상태 필터링
      switch (this.activeFilter) {
        case 'available':
          filtered = filtered.filter(post => post.status === 'available')
          break
        case 'popular':
          filtered = filtered.sort((a, b) => b.likes - a.likes)
          break
        case 'recent':
          filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        // 다른 필터들도 구현 가능
      }
      
      return filtered
    }
  },

  watch: {
    showComment(val) {
      this.$emit('comment-visibility', val)
    }
  },

  methods: {
    goToWritePost() {
      this.$router.push('/write')
    },
    
    onSearch() {
      // 디바운싱 구현 가능
      console.log('검색:', this.searchQuery)
    },
    
    clearSearch() {
      this.searchQuery = ''
    },
    
    setActiveFilter(filter) {
      this.activeFilter = filter
    },
    
    toggleLike(post) {
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1
    },
    
    toggleBookmark(post) {
      post.bookmarked = !post.bookmarked
    },
    
    goToComments(postId) {
      this.selectedPostId = postId
      this.showComment = true
    },
    
    goToProfile(userId) {
      console.log('프로필 이동:', userId)
      // this.$router.push(`/profile/${userId}`)
    },
    
    sharePost(post) {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.text,
          url: window.location.href
        })
      } else {
        // 클립보드 복사 등 대안 구현
        console.log('게시글 공유:', post.id)
      }
    },
    
    openChat(post) {
      if (post.status === 'sold') return
      console.log('채팅 시작:', post.id)
      // 채팅 기능 구현
    },
    
    buyNow(post) {
      if (post.status === 'sold') return
      console.log('바로구매:', post.id)
      // 구매 기능 구현
    },
    
    formatPrice(value) {
      return new Intl.NumberFormat('ko-KR').format(value) + '원'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '오늘'
      if (diffDays === 2) return '어제'
      if (diffDays <= 7) return `${diffDays}일 전`
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    },
    
    getStatusText(status) {
      const statusMap = {
        'available': '판매중',
        'reserved': '예약중',
        'sold': '판매완료'
      }
      return statusMap[status] || '판매중'
    }
  }
}
</script>

<style scoped>
.community-container {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

.community-header {
  background: white;
  padding: 20px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.header-subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #7f8c8d;
}

.search-section {
  margin-bottom: 16px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: #568265;
  background: white;
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.15);
}

.search-icon {
  color: #999;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: #2c3e50;
}

.search-input::placeholder {
  color: #999;
}

.clear-search {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: #f0f0f0;
  color: #666;
}

.filter-section {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
}

.filter-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active,
.filter-btn:hover {
  border-color: #568265;
  background: #568265;
  color: white;
}

.write-post-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.write-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 130, 101, 0.4);
}

.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
  margin: 0 8px 0 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.empty-action-btn {
  padding: 12px 24px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.posts-container {
  padding: 20px 0;
}

.post-card {
  background: white;
  border-radius: 16px;
  margin: 0 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.post-image-wrapper {
  position: relative;
}

.post-body {
  height: 280px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-badge.available {
  background: #27ae60;
}

.status-badge.reserved {
  background: #f39c12;
}

.status-badge.sold {
  background: #95a5a6;
}

.bookmark-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.bookmark-btn:hover,
.bookmark-btn.bookmarked {
  background: #568265;
  color: white;
  transform: scale(1.1);
}

.post-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 0;
  gap: 12px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  text-align: left;
}

.price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.post-price {
  font-size: 18px;
  font-weight: 700;
  color: #568265;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 0;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.post-content {
  padding: 12px 16px;
}

.post-description {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.5;
  margin: 0 0 12px 0;
  text-align: left;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f8f9fa;
  color: #568265;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-info:hover {
  opacity: 0.8;
}

.profile-wrapper {
  position: relative;
}

.profile {
  background-size: cover;
  background-position: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #f0f0f0;
}

.verification-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-rating {
  font-size: 12px;
  color: #666;
}

.action-section {
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
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #666;
}

.action-btn:hover {
  background: #f8f9fa;
  color: #568265;
}

.like-btn.liked {
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  color: #568265;
  border: 2px solid #568265;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-btn:hover:not(:disabled) {
  background: #f0f8f4;
}

.chat-btn:disabled {
  background: #f8f9fa;
  color: #999;
  border-color: #e0e0e0;
  cursor: not-allowed;
}

.buy-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.buy-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

@media (max-width: 480px) {
  .community-header {
    padding: 16px 12px;
  }
  
  .posts-container {
    padding: 16px 0;
  }
  
  .post-card {
    margin: 0 12px 20px;
  }
  
  .post-body {
    height: 240px;
  }
  
  .filter-section {
    margin-bottom: 12px;
  }
  
  .action-section {
    gap: 12px;
  }
  
  .action-buttons {
    gap: 6px;
    padding: 0 12px 12px;
  }
}
</style>