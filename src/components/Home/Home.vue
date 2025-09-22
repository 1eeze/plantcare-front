<template>
  <div class="home">
    <!-- 사이드 메뉴 오버레이 -->
    <div v-if="showMenu" class="menu-overlay" @click="toggleMenu"></div>
    
    <!-- 사이드 메뉴 -->
    <div :class="['side-menu', { 'menu-open': showMenu }]">
      <div class="menu-header">
        <h3>메뉴</h3>
        <button class="close-btn" @click="toggleMenu">×</button>
      </div>
      <nav class="menu-items">
        <a href="#" class="menu-item">🏠 홈</a>
        <a href="#" class="menu-item">🌱 내 식물</a>
        <a href="#" class="menu-item">📊 통계</a>
        <a href="#" class="menu-item">⚙️ 설정</a>
        <a href="#" class="menu-item">📞 고객센터</a>
      </nav>
    </div>

    <!-- 상단 헤더 -->
    <div class="header">
      <!-- 토글 메뉴 버튼 -->
      <button class="menu-btn" @click="toggleMenu">☰</button>
      <div class="location">
        <p class="greeting">안녕하세요, {{ userName }}님!</p>
        <p class="city">{{ location }}</p>
      </div>
      <!-- 알림 및 카메라 버튼 -->
      <div class="header-actions">
        <button class="notification-btn" @click="openNotifications" :class="{ 'has-notification': hasNotifications }">
          🔔
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
        <button class="camera-btn" @click="openCamera" aria-label="카메라 열기">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4a6444">
            <path d="m24,12c0,.552-.448,1-1,1H1c-.552,0-1-.448-1-1s.448-1,1-1h22c.552,0,1,.448,1,1ZM7,22h-2c-1.654,0-3-1.346-3-3v-2c0-.552-.448-1-1-1s-1,.448-1,1v2c0,2.757,2.243,5,5,5h2c.552,0,1-.448,1-1s-.448-1-1-1Zm16-6c-.552,0-1,.448-1,1v2c0,1.654-1.346,3-3,3h-2c-.552,0-1,.448-1,1s.448,1,1,1h2c2.757,0,5-2.243,5-5v-2c0-.552-.448-1-1-1ZM19,0h-2c-.552,0-1,.448-1,1s.448,1,1,1h2c1.654,0,3,1.346,3,3v2c0,.552.448,1,1,1s1-.448,1-1v-2c0-2.757-2.243-5-5-5ZM1,8c.552,0,1-.448,1-1v-2c0-1.654,1.346-3,3-3h2c.552,0,1-.448,1-1s-.448-1-1-1h-2C2.243,0,0,2.243,0,5v2c0,.552.448,1,1,1Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 날씨 정보 카드 -->
    <div class="weather-card">
      <div class="weather-info">
        <div class="weather-main">
          <span class="weather-icon">☀️</span>
          <div class="weather-temp">
            <span class="temp">{{ weather.temp }}°</span>
            <span class="desc">{{ weather.description }}</span>
          </div>
        </div>
        <div class="weather-detail">
          <span>습도 {{ weather.humidity }}%</span>
          <span>UV {{ weather.uv }}</span>
        </div>
      </div>
      <div class="plant-care-tip">
        <p class="tip-title">오늘의 식물 관리 팁</p>
        <p class="tip-content">{{ todayTip }}</p>
      </div>
    </div>

    <!-- 내 식물 리스트 -->
    <div class="section-title">
      <h3>나의 식물 ({{ plants.length }}개)</h3>
      <button class="view-all" @click="viewAllPlants">전체보기</button>
    </div>
    <div class="plant-scroll">
      <div v-for="plant in plants" :key="plant.id" class="plant-card" @click="goToPlantDetail(plant.id)">
        <div class="plant-image-container">
          <img :src="plant.image" class="plant-image" :alt="plant.name" />
          <div v-if="plant.needsAttention" class="attention-badge">!</div>
        </div>
        
        <h4>{{ plant.name }}</h4>
        
        <!-- 센서 값 표시 (아이콘 + 값) -->
        <div class="plant-sensors-display">
          <span>💧 {{ plant.soilMoisture }}%</span>
          <span>
            ☀️ 
            <template v-if="plant.lightLevel >= 70">Sunny</template>
            <template v-else-if="plant.lightLevel >= 40">Bright</template>
            <template v-else>Dark</template>
            ({{ plant.lightLevel }}%)
          </span>
          <span>🌱 {{ plant.humidity }}%</span>
        </div>

         <!-- 상태 표시 -->
        <div class="plant-status-simple">
          <span class="status-indicator" :class="getOverallStatusClass(plant)"></span>
          <span class="status-text">{{ plant.status }}</span>
        </div>
      </div>
      
      <!-- 식물 추가 카드 -->
      <div class="add-plant-card" @click="addPlant">
        <div class="add-plant-content">
          <span class="add-icon">+</span>
          <span class="add-text">식물 추가</span>
        </div>
      </div>
    </div>

    <!-- 빠른 액션 -->
    <div class="section-title">
      <h3>빠른 관리</h3>
    </div>
    <div class="quick-actions">
      <button class="quick-action" @click="waterAllPlants">
        <span class="action-icon">💧</span>
        <span class="action-text">전체 물주기</span>
      </button>
      <button class="quick-action" @click="checkPlantHealth">
        <span class="action-icon">🔍</span>
        <span class="action-text">건강 체크</span>
      </button>
      <button class="quick-action" @click="setReminder">
        <span class="action-icon">⏰</span>
        <span class="action-text">알림 설정</span>
      </button>
    </div>

    <!-- 식물 상태 요약 -->
    <div class="section-title">
      <h3>오늘 할 일</h3>
    </div>
    <div class="task-list">
      <div v-for="task in todayTasks" :key="task.id" class="task-card" :class="{ completed: task.completed }">
        <div class="task-info">
          <span class="task-icon">{{ task.icon }}</span>
          <div class="task-details">
            <strong>{{ task.plantName }}</strong>
            <span class="task-description">{{ task.description }}</span>
          </div>
        </div>
        <button class="task-complete" @click="completeTask(task.id)" :disabled="task.completed">
          {{ task.completed ? '✓' : '○' }}
        </button>
      </div>
      <div v-if="todayTasks.length === 0" class="no-tasks">
        <span class="no-tasks-icon">🎉</span>
        <p>오늘은 할 일이 없습니다!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import plant_pic from '../../assets/plant.png'
import { useRouter } from 'vue-router'

const router = useRouter()

const showMenu = ref(false)
const userName = ref('식물집사')
const location = ref('Seoul, KOREA')
const hasNotifications = ref(true)
const notificationCount = ref(3)

const weather = ref({
  temp: 23,
  description: '맑음',
  humidity: 65,
  uv: '보통'
})

const todayTip = ref('오늘처럼 맑은 날에는 식물을 창가 근처로 옮겨주세요!')

const plants = ref([
  {
    id: 1,
    name: '몬스테라',
    image: plant_pic,
    soilMoisture: 25,      // 토양 습도 (%)
    lightLevel: 85,        // 조도 (%)
    humidity: 45,          // 공기 습도 (%)
    temperature: 22,       // 온도 (°C)
    lastUpdated: '2024-06-24 14:30',
    needsAttention: true,
    status: '물 부족',
    display: {
      moisture: '💧 25%',
      light: '☀️ Sunny (85%)',
      humidity: '🌱 45%'
    }
  },
  {
    id: 2,
    name: '칼라데아',
    image: plant_pic,
    soilMoisture: 75,
    lightLevel: 60,
    humidity: 65,
    temperature: 24,
    lastUpdated: '2024-06-24 14:25',
    needsAttention: false,
    status: '상태 양호',
    display: {
      moisture: '💧 75%',
      light: '🌤️ Bright (60%)',
      humidity: '🌱 65%'
    }
  },
  {
    id: 3,
    name: '고무나무',
    image: plant_pic,
    soilMoisture: 55,
    lightLevel: 40,
    humidity: 50,
    temperature: 23,
    lastUpdated: '2024-06-24 14:20',
    needsAttention: false,
    status: '조도 부족',
    display: {
      moisture: '💧 55%',
      light: '🌑 Dark (40%)',
      humidity: '🌱 50%'
    }
  }
])


const todayTasks = ref([
  {
    id: 1,
    plantName: '몬스테라',
    icon: '💧',
    description: '토양습도 25% - 물주기 필요',
    completed: false,
    priority: 'high'
  },
  {
    id: 2,
    plantName: '고무나무',
    icon: '☀️',
    description: '조도 40% - 밝은 곳으로 이동',
    completed: false,
    priority: 'medium'
  }
])

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const openCamera = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('이미지 선택됨:', file.name)
      // 이미지 처리 로직
    }
  }
  input.click()
}

const openNotifications = () => {
  console.log('알림 열기')
}

const viewAllPlants = () => {
  console.log('전체 식물 보기')
}

const goToPlantDetail = (plantId) => {
  console.log('식물 상세 페이지로:', plantId)
}

const addPlant = () => {
  router.push('/add-plant')
}

const waterAllPlants = () => {
  console.log('전체 물주기')
}

const checkPlantHealth = () => {
  console.log('건강 체크')
}

const setReminder = () => {
  console.log('알림 설정')
}

const completeTask = (taskId) => {
  const task = todayTasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = true
  }
}

const getSensorClass = (type, value) => {
  if (type === 'moisture') {
    if (value < 30) return 'sensor-low'      // 토양습도 30% 미만 - 물부족
    if (value < 60) return 'sensor-medium'   // 30-60% - 보통
    return 'sensor-good'                     // 60% 이상 - 충분
  }
  if (type === 'light') {
    if (value < 40) return 'sensor-low'      // 조도 40% 미만 - 어두움
    if (value < 70) return 'sensor-medium'   // 40-70% - 보통
    return 'sensor-good'                     // 70% 이상 - 밝음
  }
  if (type === 'humidity') {
    if (value < 40) return 'sensor-low'      // 습도 40% 미만 - 건조
    if (value < 70) return 'sensor-medium'   // 40-70% - 보통
    return 'sensor-good'                     // 70% 이상 - 습함
  }
  return 'sensor-medium'
}

const getOverallStatusClass = (plant) => {
  if (plant.needsAttention) return 'status-warning'
  return 'status-normal'
}

const formatLastUpdated = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`
  return `${Math.floor(diffMinutes / 1440)}일 전`
}
</script>

<style scoped>
.home {
  padding: 0;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
  position: relative;
}

/* 사이드 메뉴 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.side-menu {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background: #fff;
  z-index: 999;
  transition: left 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.side-menu.menu-open {
  left: 0;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.menu-items {
  padding: 20px 0;
}

.menu-item {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f8f9fa;
}

/* 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #eef2e6 0%, #dfe7d6 100%);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  padding: 8px;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.camera-btn:hover {
  background: rgba(74, 100, 68, 0.1);
}

.location {
  flex-grow: 1;
  text-align: left;
  margin-left: 16px;
}

.greeting {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.city {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

/* 날씨 카드 */
.weather-card {
  margin: 20px;
  background: linear-gradient(135deg, #3e6047 0%, #a8c3a0 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.weather-icon {
  font-size: 32px;
}

.temp {
  font-size: 28px;
  font-weight: bold;
  margin-right: 8px;
}

.desc {
  font-size: 14px;
  opacity: 0.9;
}

.weather-detail {
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 16px;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  opacity: 0.9;
}

.tip-content {
  font-size: 12px;
  margin: 0;
  opacity: 0.8;
}

/* 섹션 제목 */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 20px 12px;
}

.section-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.view-all {
  background: none;
  border: none;
  color: #4a6444;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

/* 식물 카드 스크롤 */
.plant-scroll {
  display: flex;
  align-items: center;
  overflow-x: auto;
  gap: 16px;
  padding: 0 20px 20px;
  scroll-behavior: smooth;
}

.plant-card {
  flex: 0 0 auto;
  width: 160px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.plant-sensors-display {
  display: flex;
  justify-content: space-around;
  font-size: 13px;
  margin: 8px 0;
  color: #333;
}

.plant-sensors-display span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.plant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.plant-image-container {
  position: relative;
  margin-bottom: 12px;
}

.plant-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.attention-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.plant-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.plant-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 12px;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
}

.status-low .status-text {
  color: #ff4757;
}

.status-medium .status-text {
  color: #ffa502;
}

.status-good .status-text {
  color: #2ed573;
}

.next-care {
  font-size: 11px;
  color: #7f8c8d;
  text-align: center;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.add-plant-card {
  flex: 0 0 auto;
  width: 160px;
  height: 200px;
  background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-plant-card:hover {
  transform: translateY(-2px);
}

.add-plant-content {
  text-align: center;
  color: white;
}

.add-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.add-text {
  font-size: 14px;
  font-weight: 500;
}

/* 빠른 액션 */
.quick-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 24px;
}

.quick-action {
  flex: 1;
  background: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.quick-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
}

/* 할 일 목록 */
.task-list {
  padding: 0 20px 32px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: opacity 0.3s;
}

.task-card.completed {
  opacity: 0.6;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-icon {
  font-size: 20px;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-details strong {
  font-size: 14px;
  color: #2c3e50;
}

.task-description {
  font-size: 12px;
  color: #7f8c8d;
}

.task-complete {
  background: none;
  border: 2px solid #ddd;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.task-complete:not(:disabled):hover {
  background: #2ed573;
  border-color: #2ed573;
  color: white;
}

.task-complete:disabled {
  background: #2ed573;
  border-color: #2ed573;
  color: white;
  cursor: default;
}

.no-tasks {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.no-tasks-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}
</style>