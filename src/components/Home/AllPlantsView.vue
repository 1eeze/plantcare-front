<template>
  <div class="all-plants-view">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h2>나의 식물 ({{ filteredPlants.length }}개)</h2>
      <button class="filter-btn" @click="toggleFilterMenu">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
        </svg>
      </button>
    </div>

    <!-- 필터 메뉴 -->
    <div v-if="showFilterMenu" class="filter-overlay" @click="toggleFilterMenu"></div>
    <div v-if="showFilterMenu" class="filter-dropdown">
      <div class="filter-section">
        <h4>정렬</h4>
        <div class="filter-options">
          <button 
            :class="['filter-option', { active: sortBy === 'recent' }]" 
            @click="setSortBy('recent')"
          >
            최근 추가순
          </button>
          <button 
            :class="['filter-option', { active: sortBy === 'name' }]" 
            @click="setSortBy('name')"
          >
            이름순
          </button>
          <button 
            :class="['filter-option', { active: sortBy === 'attention' }]" 
            @click="setSortBy('attention')"
          >
            관리 필요순
          </button>
        </div>
      </div>

      <div class="filter-section">
        <h4>상태</h4>
        <div class="filter-options">
          <button 
            :class="['filter-option', { active: filterStatus === 'all' }]" 
            @click="setFilterStatus('all')"
          >
            전체
          </button>
          <button 
            :class="['filter-option', { active: filterStatus === 'normal' }]" 
            @click="setFilterStatus('normal')"
          >
            정상
          </button>
          <button 
            :class="['filter-option', { active: filterStatus === 'attention' }]" 
            @click="setFilterStatus('attention')"
          >
            관리 필요
          </button>
        </div>
      </div>
    </div>

    <!-- 검색 바 -->
    <div class="search-bar">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#7f8c8d">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="식물 이름으로 검색..."
      />
      <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
    </div>

    <!-- 식물 리스트 -->
    <div v-if="filteredPlants.length > 0" class="plants-list">
      <div 
        v-for="plant in filteredPlants" 
        :key="plant.id" 
        class="plant-card"
        @click="goToPlantDetail(plant.id)"
      >
        <div class="plant-image-wrapper">
          <img :src="plant.image" :alt="plant.name" class="plant-image" />
          <div v-if="plant.needsAttention" class="attention-badge">!</div>
        </div>

        <div class="plant-info">
          <h3>{{ plant.name }}</h3>
          
          <div class="sensor-readings">
            <div class="sensor-item">
              <span class="sensor-icon">💧</span>
              <span class="sensor-value">{{ plant.soilMoisture }}%</span>
            </div>
            <div class="sensor-item">
              <span class="sensor-icon">☀️</span>
              <span class="sensor-value">{{ plant.lightLevel }}%</span>
            </div>
            <div class="sensor-item">
              <span class="sensor-icon">🌡️</span>
              <span class="sensor-value">{{ plant.temperature }}°C</span>
            </div>
          </div>

          <div class="plant-status">
            <span class="status-dot" :class="getStatusClass(plant)"></span>
            <span class="status-text">{{ plant.status }}</span>
          </div>

          <div v-if="plant.lastUpdated" class="last-updated">
            마지막 업데이트: {{ formatDate(plant.lastUpdated) }}
          </div>
        </div>
      </div>

      <!-- 식물 추가 카드 -->
      <div class="add-plant-card" @click="addPlant">
        <span class="add-icon">+</span>
        <span class="add-text">새 식물 추가</span>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <span class="empty-icon">🌱</span>
      <p class="empty-title">{{ emptyStateMessage }}</p>
      <button v-if="plants.length === 0" class="add-first-plant-btn" @click="addPlant">
        첫 식물 추가하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import plant_pic from '../../assets/plant.png'

const router = useRouter()

// 상태
const plants = ref([])
const searchQuery = ref('')
const sortBy = ref('recent') // 'recent', 'name', 'attention'
const filterStatus = ref('all') // 'all', 'normal', 'attention'
const showFilterMenu = ref(false)

// JSONB 배열에서 최신 값 추출
const getLatestSensorValue = (jsonbArray) => {
  if (!jsonbArray || !Array.isArray(jsonbArray) || jsonbArray.length === 0) {
    return null
  }
  return jsonbArray[0]?.value ?? null
}

// 필터링 및 정렬된 식물 목록
const filteredPlants = computed(() => {
  let result = [...plants.value]

  // 검색 필터
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }

  // 상태 필터
  if (filterStatus.value === 'normal') {
    result = result.filter(p => !p.needsAttention)
  } else if (filterStatus.value === 'attention') {
    result = result.filter(p => p.needsAttention)
  }

  // 정렬
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  } else if (sortBy.value === 'attention') {
    result.sort((a, b) => {
      if (a.needsAttention && !b.needsAttention) return -1
      if (!a.needsAttention && b.needsAttention) return 1
      return 0
    })
  } else {
    // 'recent' - created_at 기준 내림차순
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return result
})

// 빈 상태 메시지
const emptyStateMessage = computed(() => {
  if (plants.value.length === 0) {
    return '아직 등록된 식물이 없어요'
  }
  if (searchQuery.value.trim()) {
    return '검색 결과가 없습니다'
  }
  if (filterStatus.value === 'attention') {
    return '관리가 필요한 식물이 없어요!'
  }
  return '식물이 없습니다'
})

// 식물 목록 로드
const loadPlants = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    router.push('/login')
    return
  }

  const { data, error } = await supabase
    .from('User_Plants')
    .select(`
      id, user_id, name, locate, photos,
      created_at, updated_at,
      sensor_data:sensor_data!User_Plants_sensor_data_fkey (
        humidity, temp, light
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('식물 목록 로드 실패:', error)
    return
  }

  plants.value = (data || []).map(p => {
    const sensorData = p.sensor_data
    const humidity = getLatestSensorValue(sensorData?.humidity)
    const temp = getLatestSensorValue(sensorData?.temp)
    const light = getLatestSensorValue(sensorData?.light)

    const humidityValue = humidity ?? 50
    const tempValue = temp ?? 22
    const lightValue = light ?? 70

    const needsAttention = humidityValue < 30 || tempValue < 15 || tempValue > 30 || lightValue < 40

    let status = '상태 양호'
    if (humidityValue < 30) status = '물 부족'
    else if (lightValue < 40) status = '빛 부족'
    else if (tempValue < 15) status = '온도 낮음'
    else if (tempValue > 30) status = '온도 높음'

    return {
      id: p.id,
      name: p.name,
      image: (p.photos && p.photos[0]?.url) || plant_pic,
      soilMoisture: Math.round(humidityValue),
      lightLevel: Math.round(lightValue),
      humidity: Math.round(humidityValue),
      temperature: tempValue,
      lastUpdated: p.updated_at || p.created_at,
      created_at: p.created_at,
      needsAttention: needsAttention,
      status: status
    }
  })
}

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// 상태 클래스
const getStatusClass = (plant) => {
  return plant.needsAttention ? 'status-warning' : 'status-normal'
}

// 액션
const goBack = () => router.back()
const goToPlantDetail = (id) => router.push(`/plant-detail/${id}`)
const addPlant = () => router.push('/add-plant')

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}

const setSortBy = (value) => {
  sortBy.value = value
  showFilterMenu.value = false
}

const setFilterStatus = (value) => {
  filterStatus.value = value
  showFilterMenu.value = false
}

// 라이프사이클
onMounted(async () => {
  await loadPlants()
})
</script>

<style scoped>
.all-plants-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  padding-bottom: 32px;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #eef2e6 0%, #dfe7d6 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #2c3e50;
}

.header h2 {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.filter-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #4a6444;
  display: flex;
  align-items: center;
}

/* 필터 메뉴 */
.filter-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 998;
}

.filter-dropdown {
  position: absolute;
  top: 70px;
  right: 20px;
  width: 280px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #7f8c8d;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-option {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #2c3e50;
}

.filter-option.active {
  background: #4a6444;
  color: white;
  border-color: #4a6444;
}

.filter-option:hover:not(.active) {
  border-color: #4a6444;
  color: #4a6444;
}

/* 검색 바 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #2c3e50;
}

.search-bar input::placeholder {
  color: #bdc3c7;
}

.clear-search {
  background: none;
  border: none;
  font-size: 20px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

/* 식물 리스트 */
.plants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
}

.plant-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  height: 120px;
}

.plant-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.plant-image-wrapper {
  position: relative;
  width: 120px;
  flex-shrink: 0;
  overflow: hidden;
}

.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attention-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
}

.plant-info {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.plant-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sensor-readings {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.sensor-icon {
  font-size: 14px;
}

.sensor-value {
  font-weight: 500;
}

.plant-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-normal {
  background-color: #2ed573;
}

.status-warning {
  background-color: #ff4757;
}

.status-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.last-updated {
  font-size: 10px;
  color: #95a5a6;
}

/* 식물 추가 카드 */
.add-plant-card {
  background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 80px;
  cursor: pointer;
  transition: transform 0.2s;
  color: white;
}

.add-plant-card:hover {
  transform: translateX(4px);
}

.add-icon {
  font-size: 32px;
}

.add-text {
  font-size: 15px;
  font-weight: 500;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0 0 24px 0;
}

.add-first-plant-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-first-plant-btn:hover {
  transform: translateY(-2px);
}

/* 반응형 */
@media (min-width: 768px) {
  .plants-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 40px;
  }
}
</style>