<template>
  <div class="profile-container">
    <div class="user-search-bar">
      <div class="search-input-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" v-model="searchKeyword" @input="searchUsers" placeholder="사용자 닉네임 검색..." />
        <button v-if="searchKeyword" @click="clearSearch" class="clear-btn">✕</button>
      </div>
      <div v-if="searchResults.length > 0" class="search-results">
        <div v-for="user in searchResults" :key="user.id" class="search-item" @click="goToUserProfile(user.id)">
          <img :src="user.avatar_url || defaultProfileImg" alt="프사" class="search-avatar" />
          <span class="search-name">{{ user.name }}</span>
        </div>
      </div>
      <div v-else-if="searchKeyword && !isSearching" class="search-results empty">검색 결과가 없습니다.</div>
    </div>

    <div class="profile-header">
      <div class="profile-image-wrapper">
        <img class="profile-img" :src="profileImage" alt="프로필 이미지" />
        <div v-if="userProfile.verified" class="verified-badge" title="인증된 사용자">✓</div>
      </div>

      <div class="profile-info">
        <h1 class="username">{{ nickname }}</h1> 
        <p class="user-level">{{ userProfile.level }}</p>
        <p class="bio" v-if="userProfile.bio">{{ userProfile.bio }}</p>
        
        <div class="location-info" v-if="userProfile.location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
          {{ userProfile.location }}
        </div>
        <div class="rating-section" v-if="userProfile.rating">
          <div class="stars"><span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(userProfile.rating) }">⭐</span></div>
          <span class="rating-text">{{ userProfile.rating }}/5.0 ({{ userProfile.reviewCount }}개 후기)</span>
        </div>
      </div>

      <div class="action-buttons">
        <template v-if="!isOwnProfile">
          <button @click="startChat" class="chat-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z"/></svg>
            채팅하기
          </button>
          <button @click="toggleFollow" class="follow-btn" :class="{ following: isFollowing }">
            {{ isFollowing ? '팔로잉' : '팔로우' }}
          </button>
        </template>
        
        <button v-if="isOwnProfile" @click="editProfile" class="edit-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4C3.5 4 3 4.2 2.6 4.6C2.2 5 2 5.5 2 6V20C2 20.5 2.2 21 2.6 21.4C3 21.8 3.5 22 4 22H18C18.5 22 19 21.8 19.4 21.4C19.8 21 20 20.5 20 20V13"/><path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"/></svg>
          프로필 수정
        </button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-box">
        <div class="stat-item" @click="showPlants">
          <strong>{{ userStats.plantsCount }}</strong>
          <p>식물</p>
        </div>
        <div class="stat-item" @click="showPosts">
          <strong>{{ userStats.postsCount }}</strong>
          <p>게시글</p>
        </div>
        <div class="stat-item" @click="showSales">
          <strong>{{ userStats.salesCount }}</strong>
          <p>판매</p>
        </div>
        <div class="stat-item" @click="openFollowModal('followers')">
          <strong>{{ userStats.followersCount }}</strong>
          <p>팔로워</p>
        </div>
        <div class="stat-item" @click="openFollowModal('following')">
          <strong>{{ userStats.followingCount }}</strong>
          <p>팔로잉</p>
        </div>
      </div>

      <div class="trust-score">
        <div class="trust-header"><h3>거래 신뢰도</h3><span class="trust-percentage">{{ userProfile.trustScore }}%</span></div>
        <div class="trust-bar"><div class="trust-fill" :style="{ width: userProfile.trustScore + '%' }"></div></div>
        <div class="trust-badges">
          <span v-for="badge in userProfile.badges" :key="badge.type" class="trust-badge" :class="badge.type">{{ badge.icon }} {{ badge.text }}</span>
        </div>
      </div>
    </div>

    <div class="tab-navigation">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path :d="tab.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ tab.label }}
      </button>
    </div>

    <div class="content-area">
      <div v-if="activeTab === 'selling'" class="grid-content">
        <div v-if="sellingPosts.length === 0" class="empty-state">
          <div class="empty-icon">🌱</div><h4>판매 중인 식물이 없어요</h4><p v-if="isOwnProfile">첫 식물을 판매해보세요!</p>
          <button v-if="isOwnProfile" @click="goToSell" class="empty-action-btn">판매글 작성하기</button>
        </div>
        <div v-else class="post-grid">
          <div v-for="post in sellingPosts" :key="post.id" class="post-card selling" @click="goToPost(post.id)">
            <div class="post-image"><img :src="post.image" :alt="post.title" /><div class="post-status" :class="post.status">{{ getStatusText(post.status) }}</div><div class="post-price">{{ formatPrice(post.price) }}</div></div>
            <div class="post-info"><h4 class="post-title">{{ post.title }}</h4><p class="post-meta">{{ formatDate(post.date) }} · 조회 {{ post.views }}</p></div>
          </div>
        </div>
      </div>
      
      <div v-if="activeTab === 'plants'" class="grid-content">
        <div v-if="myPlants.length === 0" class="empty-state">
          <div class="empty-icon">🪴</div><h4>등록된 식물이 없어요</h4>
        </div>
        <div v-else class="plants-grid">
          <div v-for="plant in myPlants" :key="plant.id" class="plant-card" @click="goToPlantDetail(plant.id)">
            <div class="plant-image"><img :src="plant.image" /><div class="plant-health" :class="plant.health">{{ getHealthIcon(plant.health) }}</div></div>
            <div class="plant-info"><h4 class="plant-name">{{ plant.name }}</h4><p class="plant-type">{{ plant.type }}</p><p class="plant-days">함께한지 {{ plant.daysOwned }}일</p></div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reviews'" class="reviews-content">
        <div v-if="reviews.length === 0" class="empty-state">
          <div class="empty-icon">⭐</div><h4>받은 후기가 없어요</h4>
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info"><img :src="review.reviewerAvatar" class="reviewer-avatar" /><div><p class="reviewer-name">{{ review.reviewerName }}</p><div class="review-stars"><span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">⭐</span></div></div></div>
              <span class="review-date">{{ formatDate(review.date) }}</span>
            </div>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'bookmarks'" class="grid-content">
        <div v-if="bookmarkedPosts.length === 0" class="empty-state">
          <div class="empty-icon">🔖</div>
          <h4>저장된 게시글이 없어요</h4>
          <p>마음에 드는 식물을 찾아보세요!</p>
          <button @click="router.push('/community')" class="empty-action-btn">식물 구경가기</button>
        </div>
        <div v-else class="post-grid">
          <div v-for="post in bookmarkedPosts" :key="post.id" class="post-card bookmark-item" @click="goToPost(post.id)">
            <div class="post-image">
              <img :src="post.image" :alt="post.title" />
              <div class="post-status" :class="post.status">{{ getStatusText(post.status) }}</div>
              <div class="post-price">{{ formatPrice(post.price) }}</div>
            </div>
            <div class="post-info">
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-meta">판매자: {{ post.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'photos'" class="grid-content">
        <div v-if="photos.length === 0" class="empty-state">
          <div class="empty-icon">📸</div><h4>업로드된 사진이 없어요</h4>
        </div>
        <div v-else class="photos-grid">
          <div v-for="photo in photos" :key="photo.id" class="photo-item" @click="openPhotoModal(photo)">
            <img :src="photo.url" /><div class="photo-overlay"><div class="photo-stats"><span>❤️ {{ photo.likes }}</span><span>💬 {{ photo.comments }}</span></div></div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showFollowModal" class="modal-overlay" @click="showFollowModal = false">
      <div class="modal-content follow-modal" @click.stop>
        <h3>{{ followModalType === 'followers' ? '팔로워' : '팔로잉' }}</h3>
        <div class="follow-list">
          <div v-for="user in followList" :key="user.id" class="follow-item" @click="goToUserProfile(user.id)">
            <img :src="user.avatar_url || defaultProfileImg" class="follow-avatar" />
            <span class="follow-name">{{ user.name }}</span>
          </div>
          <div v-if="followList.length === 0" class="empty-list">목록이 비어있습니다.</div>
        </div>
        <button @click="showFollowModal = false" class="modal-btn">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase.js'
import profileImageUrl from '../../assets/user-profile.png'
import plantImg1 from '../../assets/plant.png'
import { chatStore } from '@/utils/chatStore' 

const router = useRouter()
const route = useRoute()
const defaultProfileImg = profileImageUrl

// 검색
const searchKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const searchUsers = async () => {
  if (!searchKeyword.value.trim()) { searchResults.value = []; return }
  isSearching.value = true
  try {
    const { data, error } = await supabase.from('Users').select('id, name, avatar_url').ilike('name', `%${searchKeyword.value}%`).limit(5)
    if (error) throw error
    searchResults.value = data || []
  } catch (e) { console.error(e) } finally { isSearching.value = false }
}
const clearSearch = () => { searchKeyword.value = ''; searchResults.value = [] }
const goToUserProfile = (userId) => { showFollowModal.value = false; clearSearch(); router.push(`/profile/${userId}`) }

// 프로필
const profileImage = ref(profileImageUrl)
const nickname = ref('')
const activeTab = ref('selling')
const isFollowing = ref(false)
const currentUserId = ref(null)

// 팔로우 모달
const showFollowModal = ref(false)
const followModalType = ref('followers')
const followList = ref([])

const isOwnProfile = computed(() => {
  if (!route.params.userId) return true
  if (route.params.userId === 'me') return true
  return route.params.userId === currentUserId.value
})

const availableTitles = [{ id: 1, name: '새싹 초보', emoji: '🌱' }, { id: 2, name: '그린 러너', emoji: '🏃' }, { id: 3, name: '식물 애호가', emoji: '💚' }, { id: 4, name: '그린 마스터', emoji: '🌿' }, { id: 5, name: '식물 박사', emoji: '🎓' }, { id: 6, name: '정글 메이커', emoji: '🌴' }, { id: 7, name: '플랜테리어 디자이너', emoji: '🪴' }, { id: 8, name: '식물 수집가', emoji: '🏆' }]
const userProfile = ref({ level: '새싹 초보 🌱', bio: '', location: '', verified: true, rating: 4.8, reviewCount: 124, trustScore: 95, badges: [{ type: 'verified', icon: '✅', text: '본인인증' }, { type: 'seller', icon: '🏆', text: '우수판매자' }, { type: 'expert', icon: '🌿', text: '식물전문가' }] })
const userStats = ref({ plantsCount: 0, postsCount: 0, salesCount: 0, followersCount: 0, followingCount: 0 }) 

const tabs = [
  { key: 'selling', label: '판매중', icon: 'M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17C21 15.9 20.1 15 19 15C17.9 15 17 15.9 17 17ZM9 19C9 20.1 8.1 21 7 21C5.9 21 5 20.1 5 19C5 17.9 5.9 17 7 17C8.1 17 9 17.9 9 19Z' },
  { key: 'plants', label: '내 식물', icon: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 6V18M6 12H18' },
  { key: 'reviews', label: '후기', icon: 'M11.049 2.927C11.3483 2.00636 12.6517 2.00636 12.951 2.927L14.4699 7.60081C14.6035 8.01284 14.9875 8.29885 15.4207 8.29885H20.4717C21.4329 8.29885 21.8375 9.54193 21.0845 10.1009L17.2637 12.7602C16.9126 13.0257 16.7681 13.4778 16.9018 13.8898L18.4207 18.5636C18.72 19.4843 17.6656 20.2476 16.9126 19.6886L13.0918 17.0293C12.7407 16.7638 12.2593 16.7638 11.9082 17.0293L8.08741 19.6886C7.33445 20.2476 6.28 19.4843 6.57933 18.5636L8.0982 13.8898C8.23193 13.4778 8.08741 13.0257 7.73632 12.7602L3.91553 10.1009C3.16257 9.54193 3.56714 8.29885 4.52832 8.29885H9.57933C10.0125 8.29885 10.3965 8.01284 10.5301 7.60081L11.049 2.927Z' },
  { key: 'bookmarks', label: '저장됨', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { key: 'photos', label: '갤러리', icon: 'M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z' }
]

const bookmarkedPosts = ref([]) 
const sellingPosts = ref([]) 
const myPlants = ref([]) 
const reviews = ref([{ id: 1, reviewerName: 'PlantLover', reviewerAvatar: 'https://picsum.photos/40?random=1', rating: 5, text: '친절해요!', date: '2024-08-20', plantInfo: { name: '몬스테라', image: plantImg1 } }])
const photos = ref([{ id: 1, url: plantImg1, caption: '새싹', likes: 23, comments: 5 }])

const loadProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    currentUserId.value = user.id

    let targetId = route.params.userId
    if (!targetId || targetId === 'me') targetId = user.id

    // 1. 유저 기본 정보
    const { data, error } = await supabase.from('Users').select('name, avatar_url, bio, location, titleId').eq('id', targetId).single()
    if (error && error.code !== 'PGRST116') throw error
    
    if (data) {
      nickname.value = data.name || '알 수 없는 사용자'
      profileImage.value = data.avatar_url || profileImageUrl
      userProfile.value.bio = data.bio || ''
      userProfile.value.location = data.location || ''
      if (data.titleId) {
        const t = availableTitles.find(item => item.id === data.titleId)
        if(t) userProfile.value.level = `${t.name} ${t.emoji}`
      }
    }

    // 2. 판매글 로드
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })

    if (postsData) {
      sellingPosts.value = postsData.map(post => ({ ...post, date: post.created_at, views: post.views || 0 }))
      userStats.value.postsCount = postsData.length
      userStats.value.salesCount = postsData.filter(p => p.status === 'sold').length
    }

    // 3. 식물 로드
    const { data: plantsData } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', targetId)
    
    if (plantsData) {
        myPlants.value = plantsData.map(p => ({
            id: p.id,
            name: p.name,
            image: p.photos?.[0]?.url || plantImg1,
            health: 'good', 
            daysOwned: 0    
        }))
        userStats.value.plantsCount = plantsData.length
    }

    // 4. 북마크 로드 (수정된 버전)
    if (targetId === currentUserId.value) {
        const { data: bookmarksData, error } = await supabase
            .from('bookmarks')
            .select(`
                post_id,
                posts:post_id (*) 
            `) 
            // posts:post_id (*) -> post_id를 이용해서 posts 테이블의 모든(*) 정보를 가져오라는 뜻
            .eq('user_id', currentUserId.value)
            
        if (error) {
            console.error('북마크 로드 에러:', error)
        } else if (bookmarksData) {
            // 데이터 구조가 { post_id: 1, posts: { title: '...', ... } } 형태로 옴
            bookmarkedPosts.value = bookmarksData
                .map(b => b.posts) // posts 객체만 추출
                .filter(post => post !== null) // 삭제된 글 제외
        }
    }

    await fetchFollowCounts(targetId)
    if (!isOwnProfile.value) await checkIsFollowing(targetId)

  } catch (e) { console.error(e) }
}

const fetchFollowCounts = async (targetId) => {
  const { count: followers } = await supabase.from('Follows').select('*', { count: 'exact', head: true }).eq('following_id', targetId)
  userStats.value.followersCount = followers || 0
  const { count: following } = await supabase.from('Follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetId)
  userStats.value.followingCount = following || 0
}

const checkIsFollowing = async (targetId) => {
  const { data } = await supabase.from('Follows').select('id').eq('follower_id', currentUserId.value).eq('following_id', targetId).single()
  isFollowing.value = !!data
}

const toggleFollow = async () => {
  const targetId = route.params.userId
  if (!targetId || targetId === 'me') return
  if (isFollowing.value) {
    const { error } = await supabase.from('Follows').delete().eq('follower_id', currentUserId.value).eq('following_id', targetId)
    if (!error) { isFollowing.value = false; userStats.value.followersCount-- }
  } else {
    const { error } = await supabase.from('Follows').insert({ follower_id: currentUserId.value, following_id: targetId })
    if (!error) { isFollowing.value = true; userStats.value.followersCount++ }
  }
}

const openFollowModal = async (type) => {
  followModalType.value = type
  followList.value = []
  showFollowModal.value = true
  
  let targetId = route.params.userId
  if (!targetId || targetId === 'me') targetId = currentUserId.value

  try {
    if (type === 'followers') {
      const { data } = await supabase.from('Follows').select('follower_id, Users!Follows_follower_id_fkey(id, name, avatar_url)').eq('following_id', targetId)
      if (data) followList.value = data.map(f => f.Users)
    } else {
      const { data } = await supabase.from('Follows').select('following_id, Users!Follows_following_id_fkey(id, name, avatar_url)').eq('follower_id', targetId)
      if (data) followList.value = data.map(f => f.Users)
    }
  } catch (e) { console.error(e) }
}

const startChat = () => {
  const targetId = route.params.userId
  const targetName = nickname.value
  if (!targetId || !targetName || targetId === currentUserId.value) return
  chatStore.openChat(targetId, targetName)
}

watch(() => route.params.userId, () => {
  loadProfile()
})

onMounted(() => {
  loadProfile()
})

const editProfile = () => router.push({ name: 'ProfileEdit' })
const goToSell = () => router.push('/write')
const goToAddPlant = () => router.push('/add-plant')
const goToPost = (id) => { router.push(`/community/post/${id}`) } // [수정] 상세 페이지 이동 경로 수정
const goToPlantDetail = (id) => router.push(`/plant-detail/${id}`)
const openPhotoModal = (p) => console.log(p)
const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p) + '원'
const formatDate = (d) => {
    if(!d) return ''
    return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
const getStatusText = (s) => ({ available: '판매중', reserved: '예약중', sold: '판매완료' }[s] || s)
const getHealthIcon = (h) => ({ excellent: '🌟' }[h] || '✅')
const showPlants = () => activeTab.value = 'plants'
const showPosts = () => activeTab.value = 'selling'
const showSales = () => alert('판매 완료 목록 (준비중)')
</script>

<style scoped>
.stats-section { padding: 20px; }
.stats-box { display: flex; justify-content: space-between; background: white; padding: 20px 10px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.profile-container { background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%); min-height: 100vh; padding-bottom: 100px; box-sizing: border-box; position: relative; }
.user-search-bar { position: sticky; top: 0; z-index: 50; background: white; padding: 12px 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.search-input-box { display: flex; align-items: center; background: #f0f2f0; border-radius: 8px; padding: 8px 12px; }
.search-input-box input { flex: 1; border: none; background: transparent; margin-left: 8px; font-size: 14px; outline: none; }
.clear-btn { background: none; border: none; color: #999; cursor: pointer; }
.search-results { position: absolute; top: 100%; left: 0; right: 0; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 100; }
.search-item { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.search-item:hover { background: #f9f9f9; }
.search-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 12px; border: 1px solid #eee; }
.search-name { font-size: 14px; font-weight: 600; color: #333; }
.search-results.empty { padding: 20px; text-align: center; color: #999; font-size: 13px; }

.profile-header { background: white; padding: 24px 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 1px; }
.profile-image-wrapper { position: relative; width: 120px; height: 120px; margin: 0 auto 20px; }
.profile-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid #568265; }
.verified-badge { position: absolute; top: 8px; right: 8px; background: #27ae60; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; }
.username { font-size: 24px; font-weight: 700; color: #2c3e50; margin: 0 0 8px 0; }
.user-level { font-size: 16px; color: #568265; margin: 0 0 12px 0; font-weight: 600; }
.bio { font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 12px 0; }
.location-info { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; color: #666; margin-bottom: 12px; }
.rating-section { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stars { display: flex; gap: 2px; }
.star { font-size: 16px; opacity: 0.3; } .star.filled { opacity: 1; }
.rating-text { font-size: 12px; color: #666; }
.action-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
.chat-btn, .follow-btn, .edit-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.3s; }
.chat-btn { background: white; color: #568265; border: 2px solid #568265; }
.edit-btn { background: #f8f9fa; color: #2c3e50; border: 2px solid #e0e0e0; }
.follow-btn { background: linear-gradient(135deg, #568265, #4a7058); color: white; }
.follow-btn.following { background: white; color: #333; border: 1px solid #ddd; box-shadow: none; }

.stat-item { text-align: center; cursor: pointer; flex: 1; }
.stat-item strong { font-size: 18px; color: #568265; display: block; }
.stat-item p { font-size: 11px; color: #666; margin: 0; }

.trust-score { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.trust-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 16px; font-weight: 600; }
.trust-percentage { color: #27ae60; font-size: 18px; }
.trust-bar { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
.trust-fill { height: 100%; background: linear-gradient(90deg, #27ae60, #2ecc71); }
.trust-badges { display: flex; gap: 8px; }
.trust-badge { background: #f8f9fa; color: #666; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
.trust-badge.verified { background: #e8f5e8; color: #27ae60; }
.trust-badge.seller { background: #fff3e0; color: #f57c00; }
.trust-badge.expert { background: #e3f2fd; color: #1976d2; }

.tab-navigation { background: white; display: flex; border-bottom: 1px solid #f0f0f0; }
.tab-btn { display: flex; align-items: center; gap: 8px; padding: 16px 20px; background: none; border: none; font-size: 14px; font-weight: 500; color: #666; cursor: pointer; border-bottom: 3px solid transparent; flex: 1; justify-content: center; }
.tab-btn.active { color: #568265; border-bottom-color: #568265; font-weight: 600; }
.content-area { background: white; min-height: 400px; }
.grid-content { padding: 20px; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h4 { font-size: 18px; margin: 0 0 8px 0; }
.empty-state p { font-size: 14px; color: #666; margin: 0 0 20px 0; }
.empty-action-btn { padding: 12px 24px; background: #568265; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }
.post-grid, .plants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
.post-card, .plant-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.post-image, .plant-image { width: 100%; aspect-ratio: 1; object-fit: cover; position: relative; }
.post-image img, .plant-image img { width: 100%; height: 100%; object-fit: cover; }
.post-status { position: absolute; top: 12px; left: 12px; padding: 4px 8px; background: #27ae60; color: white; font-size: 11px; border-radius: 12px; }
.post-price { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.8); color: white; padding: 6px 10px; border-radius: 12px; font-size: 12px; }
.post-info, .plant-info { padding: 12px; text-align: center; }
.post-title, .plant-name { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
.post-meta, .plant-days { font-size: 12px; color: #666; margin: 0; }
.plant-health { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.reviews-content { padding: 20px; }
.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-item { background: #f8f9fa; padding: 20px; border-radius: 16px; border-left: 4px solid #568265; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.reviewer-info { display: flex; align-items: center; gap: 12px; }
.reviewer-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.reviewer-name { font-size: 14px; font-weight: 600; color: #2c3e50; margin: 0 0 4px 0; }
.review-stars { display: flex; gap: 2px; }
.review-date { font-size: 12px; color: #666; }
.review-text { font-size: 14px; color: #2c3e50; line-height: 1.5; margin: 0 0 12px 0; }
.review-plant { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; border-radius: 12px; }
.review-plant img { width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }
.review-plant span { font-size: 12px; color: #666; font-weight: 500; }
.photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
.photo-item { position: relative; aspect-ratio: 1; overflow: hidden; cursor: pointer; transition: all 0.3s ease; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; }
.photo-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
.photo-item:hover .photo-overlay { opacity: 1; }
.photo-stats { display: flex; gap: 12px; color: white; font-size: 12px; font-weight: 600; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 24px; border-radius: 16px; width: 80%; max-width: 320px; text-align: center; }
.follow-modal { height: 50vh; display: flex; flex-direction: column; }
.follow-list { flex: 1; overflow-y: auto; margin: 16px 0; }
.follow-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; }
.follow-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 10px; }
.follow-name { font-size: 14px; font-weight: 600; }
.empty-list { color: #999; font-size: 13px; padding: 20px; }
.modal-btn { width: 100%; padding: 12px; background: #568265; color: white; border: none; border-radius: 8px; cursor: pointer; }

@media (max-width: 768px) {
  .action-buttons { flex-direction: column; }
  .post-grid, .plants-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
}
</style>