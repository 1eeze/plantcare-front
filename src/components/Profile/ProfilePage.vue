<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-image-wrapper">
        <img class="profile-img" :src="profileImage" alt="프로필 이미지" />
        <label for="profile-upload" class="upload-icon" v-if="isOwnProfile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14.828 14.828L21 21M16.5 10.5C16.5 13.8137 13.8137 16.5 10.5 16.5C7.18629 16.5 4.5 13.8137 4.5 10.5C4.5 7.18629 7.18629 4.5 10.5 4.5C13.8137 4.5 16.5 7.18629 16.5 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </label>
        <input 
          type="file" 
          id="profile-upload" 
          @change="changeProfileImage" 
          accept="image/*"
          hidden 
        />
        <div v-if="userProfile.verified" class="verified-badge" title="인증된 사용자">
          ✓
        </div>
      </div>

      <div class="profile-info">
        <h1 class="username">{{ nickname }}</h1> 
        <p class="user-level">{{ userProfile.level }} 🌱</p>
        <p class="bio" v-if="userProfile.bio">{{ userProfile.bio }}</p>
        
        <div class="location-info" v-if="userProfile.location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ userProfile.location }}
        </div>

        <div class="rating-section" v-if="userProfile.rating">
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.floor(userProfile.rating) }">
              ⭐
            </span>
          </div>
          <span class="rating-text">{{ userProfile.rating }}/5.0 ({{ userProfile.reviewCount }}개 후기)</span>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="!isOwnProfile" @click="startChat" class="chat-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          채팅하기
        </button>
        
        <button v-if="!isOwnProfile" @click="toggleFollow" class="follow-btn" :class="{ following: isFollowing }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path v-if="!isFollowing" d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-if="!isFollowing" d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="1.S" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-if="!isFollowing" d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-else d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.S"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M20 8L22 10L17 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isFollowing ? '팔로잉' : '팔로우' }}
        </button>

        <button v-if="isOwnProfile" @click="editProfile" class="edit-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="1.S" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="1.S" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          프로필 수정
        </button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-box">
        <div class="stat-item" @click="showPlants">
          <strong>{{ userStats.plantsCount }}</strong>
          <p>보유 식물</p>
        </div>
        <div class="stat-item" @click="showPosts">
          <strong>{{ userStats.postsCount }}</strong>
          <p>게시글</p>
        </div>
        <div class="stat-item" @click="showSales">
          <strong>{{ userStats.salesCount }}</strong>
          <p>판매 완료</p>
        </div>
      </div>

      <div class="trust-score">
        <div class="trust-header">
          <h3>거래 신뢰도</h3>
          <span class="trust-percentage">{{ userProfile.trustScore }}%</span>
        </div>
        <div class="trust-bar">
          <div class="trust-fill" :style="{ width: userProfile.trustScore + '%' }"></div>
        </div>
        <div class="trust-badges">
          <span v-for="badge in userProfile.badges" :key="badge.type" class="trust-badge" :class="badge.type">
            {{ badge.icon }} {{ badge.text }}
          </span>
        </div>
      </div>
    </div>

    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        @click="activeTab = tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path :d="tab.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ tab.label }}
      </button>
    </div>

    <div class="content-area">
      <div v-if="activeTab === 'selling'" class="grid-content">
        <div v-if="sellingPosts.length === 0" class="empty-state">
          <div class="empty-icon">🌱</div>
          <h4>판매 중인 식물이 없어요</h4>
          <p v-if="isOwnProfile">첫 식물을 판매해보세요!</p>
          <button v-if="isOwnProfile" @click="goToSell" class="empty-action-btn">
            판매글 작성하기
          </button>
        </div>
        
        <div v-else class="post-grid">
          <div 
            v-for="post in sellingPosts" 
            :key="post.id"
            class="post-card selling"
            @click="goToPost(post.id)"
          >
            <div class="post-image">
              <img :src="post.image" :alt="post.title" />
              <div class="post-status" :class="post.status">
                {{ getStatusText(post.status) }}
              </div>
              <div class="post-price">{{ formatPrice(post.price) }}</div>
            </div>
            <div class="post-info">
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-meta">{{ formatDate(post.date) }} · 조회 {{ post.views }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'plants'" class="grid-content">
        <div v-if="myPlants.length === 0" class="empty-state">
          <div class="empty-icon">🪴</div>
          <h4>등록된 식물이 없어요</h4>
          <p v-if="isOwnProfile">식물을 등록하고 성장을 기록해보세요!</p>
          <button v-if="isOwnProfile" @click="goToAddPlant" class="empty-action-btn">
            식물 등록하기
          </button>
        </div>
        
        <div v-else class="plants-grid">
          <div 
            v-for="plant in myPlants" 
            :key="plant.id"
            class="plant-card"
            @click="goToPlantDetail(plant.id)"
          >
            <div class="plant-image">
              <img :src="plant.image" :alt="plant.name" />
              <div class="plant-health" :class="plant.health">
                {{ getHealthIcon(plant.health) }}
              </div>
            </div>
            <div class="plant-info">
              <h4 class="plant-name">{{ plant.name }}</h4>
              <p class="plant-type">{{ plant.type }}</p>
              <p class="plant-days">키운지 {{ plant.daysOwned }}일</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reviews'" class="reviews-content">
        <div v-if="reviews.length === 0" class="empty-state">
          <div class="empty-icon">⭐</div>
          <h4>받은 후기가 없어요</h4>
          <p>거래를 완료하면 후기를 받을 수 있어요!</p>
        </div>
        
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <img :src="review.reviewerAvatar" :alt="review.reviewerName" class="reviewer-avatar" />
                <div>
                  <p class="reviewer-name">{{ review.reviewerName }}</p>
                  <div class="review-stars">
                    <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">
                      ⭐
                    </span>
                  </div>
                </div>
              </div>
              <span class="review-date">{{ formatDate(review.date) }}</span>
            </div>
            <p class="review-text">{{ review.text }}</p>
            <div v-if="review.plantInfo" class="review-plant">
              <img :src="review.plantInfo.image" :alt="review.plantInfo.name" />
              <span>{{ review.plantInfo.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'photos'" class="grid-content">
        <div v-if="photos.length === 0" class="empty-state">
          <div class="empty-icon">📸</div>
          <h4>업로드된 사진이 없어요</h4>
          <p v-if="isOwnProfile">식물 사진을 공유해보세요!</p>
        </div>
        
        <div v-else class="photos-grid">
          <div 
            v-for="photo in photos" 
            :key="photo.id"
            class="photo-item"
            @click="openPhotoModal(photo)"
          >
            <img :src="photo.url" :alt="photo.caption" />
            <div class="photo-overlay">
              <div class="photo-stats">
                <span>❤️ {{ photo.likes }}</span>
                <span>💬 {{ photo.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button @click="handleLogout" class="logout-button">로그아웃</button>
    <button @click="handleWithdraw" class="withdraw-button">회원 탈퇴</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// (우리의 로직 적용) supabase import 추가
import { supabase } from '@/utils/supabase.js'
import profileImageUrl from '../../assets/user-profile.png'
import plantImg1 from '../../assets/plant.png'

const router = useRouter()
const route = useRoute()

// 반응성 데이터 (팀원 + 우리)
const profileImage = ref(profileImageUrl)
const nickname = ref('사용자 이름') // (우리의 로직 적용) 닉네임 ref
const activeTab = ref('selling')
const isFollowing = ref(false)

// 현재 프로필이 본인 것인지 확인 (팀원)
const isOwnProfile = computed(() => {
  return !route.params.userId || route.params.userId === 'me'
})

// 사용자 프로필 데이터 (팀원)
const userProfile = ref({
  username: '식물마니아', // (우리의 onMounted가 이 값을 덮어쓸 예정)
  level: '그린 마스터',
  bio: '건강한 식물들을 키우고 나누는 것을 좋아합니다. 식물 상담 언제든 환영해요! 🌿',
  location: '서울시 강남구',
  verified: true,
  rating: 4.8,
  reviewCount: 124,
  trustScore: 95,
  badges: [
    { type: 'verified', icon: '✅', text: '본인인증' },
    { type: 'seller', icon: '🏆', text: '우수판매자' },
    { type: 'expert', icon: '🌿', text: '식물전문가' }
  ]
})

// 사용자 통계 (팀원)
const userStats = ref({
  plantsCount: 23,
  postsCount: 45,
  salesCount: 32,
  followersCount: 156
})

// 탭 설정 (팀원)
const tabs = [
  { 
    key: 'selling', 
    label: '판매중', 
    icon: 'M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17C21 15.9 20.1 15 19 15C17.9 15 17 15.9 17 17ZM9 19C9 20.1 8.1 21 7 21C5.9 21 5 20.1 5 19C5 17.9 5.9 17 7 17C8.1 17 9 17.9 9 19Z' 
  },
  { 
    key: 'plants', 
    label: '내 식물', 
    icon: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 6V18M6 12H18' 
  },
  { 
    key: 'reviews', 
    label: '후기', 
    icon: 'M11.049 2.927C11.3483 2.00636 12.6517 2.00636 12.951 2.927L14.4699 7.60081C14.6035 8.01284 14.9875 8.29885 15.4207 8.29885H20.4717C21.4329 8.29885 21.8375 9.54193 21.0845 10.1009L17.2637 12.7602C16.9126 13.0257 16.7681 13.4778 16.9018 13.8898L18.4207 18.5636C18.72 19.4843 17.6656 20.2476 16.9126 19.6886L13.0918 17.0293C12.7407 16.7638 12.2593 16.7638 11.9082 17.0293L8.08741 19.6886C7.33445 20.2476 6.28 19.4843 6.57933 18.5636L8.0982 13.8898C8.23193 13.4778 8.08741 13.0257 7.73632 12.7602L3.91553 10.1009C3.16257 9.54193 3.56714 8.29885 4.52832 8.29885H9.57933C10.0125 8.29885 10.3965 8.01284 10.5301 7.60081L11.049 2.927Z' 
  },
  { 
    key: 'photos', 
    label: '갤러리', 
    icon: 'M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z' 
  }
]

// 더미 데이터들 (팀원)
const sellingPosts = ref([
  {
    id: 1,
    title: '몬스테라 알보 (무늬종)',
    image: plantImg1,
    price: 45000,
    status: 'available',
    date: '2024-09-01',
    views: 156
  },
  {
    id: 2,
    title: '필로덴드론 핑크 프린세스',
    image: plantImg1,
    price: 120000,
    status: 'reserved',
    date: '2024-08-28',
    views: 203
  }
])
const myPlants = ref([])
const reviews = ref([
  {
    id: 1,
    reviewerName: 'PlantLover',
    reviewerAvatar: 'https://picsum.photos/40?random=1',
    rating: 5,
    text: '정말 건강한 식물을 보내주셨어요! 포장도 꼼꼼히 해주시고 친절하게 상담도 해주셔서 감사합니다.',
    date: '2024-08-20',
    plantInfo: {
      name: '몬스테라 델리시오사',
      image: plantImg1
    }
  }
])
const photos = ref([
  {
    id: 1,
    url: plantImg1,
    caption: '새싹이 나왔어요!',
    likes: 23,
    comments: 5
  }
])

// JSONB 배열에서 최신 값 추출 헬퍼 함수
const getLatestSensorValue = (jsonbArray) => {
  if (!jsonbArray || !Array.isArray(jsonbArray) || jsonbArray.length === 0) {
    return null
  }
  return jsonbArray[0]?.value ?? null
}

// (우리의 로직 적용) onMounted 수정
onMounted(async () => {
  console.log('프로필 로드됨 (팀원 로그)')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 사용자 프로필 정보 로드
    const { data, error } = await supabase
      .from('Users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()

    // '행 없음' (PGRST116) 이외의 에러만 throw
    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      if (data.name) {
        nickname.value = data.name
        userProfile.value.username = data.name
      }
      if (data.avatar_url) {
        profileImage.value = data.avatar_url
      }
    }

    // 내 식물 목록 로드
    const { data: plantsData, error: plantsError } = await supabase
      .from('User_Plants')
      .select(`
        id, name, photos, created_at, updated_at,
        sensor_data:sensor_data!User_Plants_sensor_data_fkey (
          humidity, temp, light
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (plantsError) {
      console.error('식물 목록 로드 실패:', plantsError)
    } else {
      myPlants.value = (plantsData || []).map(p => {
        const sensorData = p.sensor_data
        const humidity = getLatestSensorValue(sensorData?.humidity) ?? 50
        const temp = getLatestSensorValue(sensorData?.temp) ?? 22
        const light = getLatestSensorValue(sensorData?.light) ?? 70

        // 건강 상태 판단
        let health = 'excellent'
        if (humidity < 30 || temp < 15 || temp > 30 || light < 40) {
          health = 'poor'
        } else if (humidity < 40 || light < 50) {
          health = 'fair'
        } else if (humidity < 50 || light < 60) {
          health = 'good'
        }

        // 키운 일수 계산
        const createdDate = new Date(p.created_at)
        const today = new Date()
        const daysOwned = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24))

        return {
          id: p.id,
          name: p.name || '이름 없음',
          type: '식물', // TODO: 식물 종류 정보 추가 필요
          image: (p.photos && p.photos[0]?.url) || plantImg1,
          health: health,
          daysOwned: daysOwned
        }
      })

      // 통계 업데이트
      userStats.value.plantsCount = myPlants.value.length
    }

  } catch (error) {
    console.error('프로필 정보 로드 에러:', error.message)
  }
})

// 메서드들 (팀원)
const changeProfileImage = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하로 선택해주세요.')
      return
    }
    profileImage.value = URL.createObjectURL(file)
    // (보충) TODO: 여기서 Supabase Storage에 업로드하는 로직 추가 필요
  }
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  console.log('팔로우 토글')
}

const startChat = () => {
  console.log('채팅 시작')
}

const editProfile = () => {
  // (팀원 코드 수정) 'ProfileEdit' 이름의 라우트가 아직 없으므로 주석 처리
  // router.push({ name: 'ProfileEdit' }) 
  alert('프로필 수정 기능 준비중입니다.')
}

const goToSell = () => {
  router.push('/write')
}

const goToAddPlant = () => {
  router.push('/add-plant')
}

const goToPost = (postId) => {
  router.push(`/community/post/${postId}`)
}

const goToPlantDetail = (plantId) => {
  router.push(`/plant/${plantId}`)
}

const openPhotoModal = (photo) => {
  console.log('사진 모달 열기:', photo)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric' 
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'available': '판매중',
    'reserved': '예약중',
    'sold': '판매완료'
  }
  return statusMap[status] || '판매중'
}

const getHealthIcon = (health) => {
  const healthMap = {
    'excellent': '🌟',
    'good': '✅',
    'fair': '⚠️',
    'poor': '🆘'
  }
  return healthMap[health] || '✅'
}

const showPlants = () => activeTab.value = 'plants'
const showPosts = () => activeTab.value = 'selling' 
const showSales = () => {
  console.log('판매 완료 목록')
}

/* (팀원 코드 수정) 충돌나는 부분 주석 처리
const showFollowers = () => {
  console.log('팔로워 목록')
} 
*/

// (우리의 로직 적용) 로그아웃 / 탈퇴 함수 추가
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/login')
  } catch (error) {
    alert('로그아웃 중 오류가 발생했습니다: ' + error.message)
  }
}

const handleWithdraw = async () => {
  const confirm = window.prompt("정말로 탈퇴하시려면 '회원탈퇴'라고 입력해주세요.")
  if (confirm !== '회원탈퇴') {
    alert('입력이 일치하지 않아 취소되었습니다.')
    return
  }

  try {
    const { data, error } = await supabase.functions.invoke('withdraw-user')
    if (error) throw error
    
    alert('회원 탈퇴가 완료되었습니다.')
    await supabase.auth.signOut()
    router.push('/login')

  } catch (error) {
    alert('회원 탈퇴 중 오류가 발생했습니다: ' + error.message)
  }
}
</script>

<style scoped>
/* (팀원의 스타일) */
.profile-container {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  padding-bottom: 100px;
  /* (우리의 수정) box-sizing 추가 */
  box-sizing: border-box; 
}

.profile-header {
  background: white;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.profile-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #568265;
  transition: all 0.3s ease;
}

.upload-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.upload-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.4);
}

.verified-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #27ae60;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
}

.profile-info {
  margin-bottom: 24px;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.user-level {
  font-size: 16px;
  color: #568265;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.bio {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.rating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-text {
  font-size: 12px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.chat-btn,
.follow-btn,
.edit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.chat-btn {
  background: white;
  color: #568265;
  border: 2px solid #568265;
}

.chat-btn:hover {
  background: #f0f8f4;
}

.follow-btn {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
}

.follow-btn.following {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.edit-btn {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.edit-btn:hover {
  background: #e9ecef;
  border-color: #568265;
  color: #568265;
}

.stats-section {
  padding: 20px;
}

.stats-box {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  min-width: 60px;
}

.stat-item:hover {
  background: rgba(86, 130, 101, 0.1);
  transform: translateY(-2px);
}

.stat-item strong {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #568265;
  margin-bottom: 4px;
}

.stat-item p {
  font-size: 12px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.trust-score {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.trust-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trust-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.trust-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #27ae60;
}

.trust-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.trust-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  transition: width 0.3s ease;
}

.trust-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.trust-badge {
  background: #f8f9fa;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.trust-badge.verified {
  background: #e8f5e8;
  color: #27ae60;
}

.trust-badge.seller {
  background: #fff3e0;
  color: #f57c00;
}

.trust-badge.expert {
  background: #e3f2fd;
  color: #1976d2;
}

.tab-navigation {
  background: white;
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #f0f0f0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  flex-shrink: 0;
}

.tab-btn:hover {
  color: #568265;
  background: rgba(86, 130, 101, 0.05);
}

.tab-btn.active {
  color: #568265;
  border-bottom-color: #568265;
  font-weight: 600;
}

.content-area {
  background: white;
  min-height: 400px;
}

.grid-content {
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h4 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.empty-action-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.post-card {
  background: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.post-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.post-status.available {
  background: #27ae60;
}

.post-status.reserved {
  background: #f39c12;
}

.post-status.sold {
  background: #95a5a6;
}

.post-price {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.post-info {
  padding: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.post-meta {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.plant-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.plant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.plant-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.plant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plant-health {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.plant-info {
  padding: 12px;
  text-align: center;
}

.plant-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.plant-type {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
}

.plant-days {
  font-size: 11px;
  color: #568265;
  margin: 0;
  font-weight: 500;
}

.reviews-content {
  padding: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
  border-left: 4px solid #568265;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-date {
  font-size: 12px;
  color: #666;
}

.review-text {
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.review-plant {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 12px;
}

.review-plant img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
}

.review-plant span {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-item:hover {
  transform: scale(1.02);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-stats {
  display: flex;
  gap: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .profile-header {
    padding: 20px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-section {
    padding: 16px;
  }
  
  .stats-box {
    padding: 16px 12px;
  }
  
  .stat-item {
    min-width: auto;
  }
  
  .post-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .plants-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .tab-navigation {
    padding: 0 16px;
  }
  
  .tab-btn {
    padding: 14px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .username {
    font-size: 20px;
  }
  
  .bio {
    font-size: 13px;
  }
  
  .profile-image-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .post-grid {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    gap: 8px;
  }
  
  .chat-btn,
  .follow-btn,
  .edit-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* (우리의 로직 적용) 로그아웃/탈퇴 버튼 스타일 */
.logout-button {
  margin: 30px auto 10px;
  padding: 10px 20px;
  font-size: 14px;
  color: #fff;
  background-color: #e74c3c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: block; 
  width: 200px;
}

.withdraw-button {
  margin: 10px auto;
  padding: 10px 20px;
  font-size: 14px;
  color: #999;
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  width: 200px;
}

.withdraw-button:hover {
  background-color: #f5f5f5;
  color: #e74c3c;
  border-color: #e74c3c;
}
</style>