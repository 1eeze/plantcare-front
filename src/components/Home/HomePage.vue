<template>
  <div class="home">
    <!-- 🔍 AI 분석 전체 로딩 오버레이 -->
    <div v-if="analyzingPest" class="analyzing-overlay">
      <div class="analyzing-box">
        <div class="spinner"></div>
        <p class="analyzing-title">AI가 병충해를 분석 중이에요…</p>
        <p class="analyzing-desc">
          처음 호출은 서버를 깨우느라 20~30초 정도 걸릴 수 있어요 🌱
        </p>
      </div>
    </div>

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

        <!-- 촬영 / 사진 선택 모달 -->
    <div v-if="showCameraChoice" class="camera-choice-overlay">
      <div class="camera-choice-sheet">
        <p class="camera-choice-title">사진을 어떻게 가져올까요?</p>
        <button class="camera-choice-btn" @click="takePhoto">📷 사진 촬영</button>
        <button class="camera-choice-btn" @click="pickFromGallery">🖼 갤러리에서 선택</button>
        <button class="camera-choice-cancel" @click="showCameraChoice = false">취소</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated } from 'vue'
import { supabase } from '@/utils/supabase'
import plant_pic from '../../assets/plant.png'
import { useRouter } from 'vue-router'

const router = useRouter()
const analyzingPest = ref(false)
const pestResult = ref(null)
const pestError = ref('') 

// --- [핵심 수정] 닉네임 기본값 설정 ---
const userName = ref('식물집사') // 기본값
const location = ref('Seoul, KOREA')
// -----------------------------------

const showMenu = ref(false)
const hasNotifications = ref(true)
const notificationCount = ref(3)
const showCameraChoice = ref(false)

const weather = ref({
  temp: 0,
  description: '로딩 중…',
  humidity: 0,
  uv: '-'
})
const loadingWeather = ref(false)
const todayTip = ref('오늘의 날씨에 맞춰 식물 관리 팁을 불러오는 중이에요.')
const plants = ref([])
let channel = null

const todayTasks = ref([
  { id: 1, plantName: '몬스테라', icon: '💧', description: '토양습도 25% - 물주기 필요', completed: false, priority: 'high' },
  { id: 2, plantName: '고무나무', icon: '☀️', description: '조도 40% - 밝은 곳으로 이동', completed: false, priority: 'medium' }
])

// --- [추가됨] 닉네임 불러오기 함수 ---
const loadUserNickname = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('Users')
      .select('name') // 닉네임 컬럼 가져오기
      .eq('id', user.id)
      .single()

    if (data && data.name) {
      userName.value = data.name // 닉네임 반영
    }
  } catch (e) {
    console.error('닉네임 로드 실패:', e)
  }
}

const PEST_DICTIONARY = {
  "Spodoptera_litura_egg": {
    kr_name: "담배거세나방 알",
    description: "잎 뒷면에 무더기로 산란하며, 부화한 유충이 잎을 갉아먹습니다."
  },
  "Helicoverpa_armigera_larva": {
    kr_name: "담배나방 애벌레 (면화다래나방)",
    description: "담배, 목화, 토마토 등 다양한 작물의 잎과 열매를 갉아먹는 심각한 해충입니다."
  },
  "default": {
    kr_name: "알 수 없는 병충해",
    description: "데이터베이스에 등록되지 않은 정보입니다."
  }
}

async function analyzePest(imageFile) {
  const API_URL = "https://detectbug-740384497388.asia-southeast1.run.app/predict"

  const formData = new FormData()
  formData.append("file", imageFile)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`API 서버 오류: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("AI 원본 응답:", data)

    if (data.predictions && data.predictions.length > 0) {
      const firstPrediction = data.predictions[0]
      const englishName = firstPrediction.class_name

      let pestInfo = PEST_DICTIONARY[englishName]
      if (!pestInfo) {
        pestInfo = PEST_DICTIONARY["default"]
      }

      return {
        kr_name: pestInfo.kr_name,
        description: pestInfo.description,
        confidence: firstPrediction.confidence,
        bbox: firstPrediction.bbox
      }
    } else {
      return {
        kr_name: "탐지된 병충해 없음",
        description: "이미지에서 병충해가 발견되지 않았습니다.",
      }
    }
  } catch (err) {
    console.error("AI 판별 실패:", err)
    return {
      kr_name: "판별 오류",
      description: "AI 서버에 연결 중 오류가 발생했습니다."
    }
  }
}

// Supabase Realtime — insert/update/delete 시 자동 새로고침
async function setupRealtime() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }

  channel = supabase
    .channel('public:plants')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'plants', filter: `user_id=eq.${user.id}` },
      ({ new: p }) => {
        plants.value.unshift({
          id: p.id,
          name: p.name,
          image: (p.photos && p.photos[0]?.url) || plant_pic,
          soilMoisture: p.sensor_moisture ?? 0,
          lightLevel:   p.sensor_light ?? 0,
          humidity:     p.sensor_humidity ?? 0,
          temperature:  p.temperature ?? 0,
          lastUpdated:  p.updated_at || '',
          needsAttention: !!p.needs_attention,
          status: p.status || '상태 양호',
          display: {
            moisture: `💧 ${p.sensor_moisture ?? 0}%`,
            light:    `☀️ ${p.sensor_light ?? 0}%`,
            humidity: `🌱 ${p.sensor_humidity ?? 0}%`
          }
        })
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'plants', filter: `user_id=eq.${user.id}` },
      ({ new: p }) => {
        const i = plants.value.findIndex(x => x.id === p.id)
        if (i !== -1) {
          plants.value[i] = {
            ...plants.value[i],
            soilMoisture: p.sensor_moisture ?? 0,
            lightLevel:   p.sensor_light ?? 0,
            humidity:     p.sensor_humidity ?? 0,
            temperature:  p.temperature ?? 0,
            lastUpdated:  p.updated_at || '',
            status:       p.status || plants.value[i].status,
            needsAttention: !!p.needs_attention,
          }
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'plants', filter: `user_id=eq.${user.id}` },
      ({ old }) => {
        plants.value = plants.value.filter(x => x.id !== old.id)
      }
    )
    .subscribe()
}

async function ensureDevSession() {
  if (import.meta.env.DEV) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await supabase.auth.signInWithPassword({
        email: 'dev@example.com',
        password: 'dev123456'
      })
    }
  }
}

function isDaytime(cur) {
  if (!cur?.dt || !cur?.sunrise || !cur?.sunset) return true
  return cur.dt >= cur.sunrise && cur.dt <= cur.sunset
}

function tipFromWeather({ temp, humidity, uvi, weatherId, day }) {
  if (temp <= 0) return '기온이 매우 낮아요. 찬바람을 피하고 물주는 간격을 늘려주세요.'
  if (temp >= 30) return '더운 날씨예요. 통풍을 잘 시켜주고 갑작스러운 직사광선은 피해주세요.'

  if (humidity <= 35) return '실내가 많이 건조해요. 가습기나 물트레이로 습도를 조금 올려주세요.'
  if (humidity >= 75) return '습도가 높아요. 과습으로 인한 뿌리 문제를 주의해주세요.'

  const g = Math.floor((weatherId || 800) / 100)
  if (uvi >= 6 && day) return '자외선이 강한 날이에요. 햇빛에 약한 식물은 창가에서 조금 떨어뜨려 두세요.'
  if ([2, 3, 5].includes(g)) return '비가 오는 날이에요. 흙이 마르기 전까지는 물주기를 잠시 쉬어주세요.'
  if (g === 6) return '눈 또는 진눈깨비가 오는 날이에요. 찬 공기를 직접 맞지 않게 해주세요.'
  if (weatherId === 800 && day) return '맑고 화창한 날이에요. 광을 좋아하는 식물은 창가 근처로 옮겨보세요.'

  if (day) return '오늘은 흙 상태를 먼저 확인하고 필요한 식물에만 물을 줘보세요.'
  return '밤에는 물주기보단 통풍과 온도 관리를 신경 써주세요.'
}

async function loadWeather() {
  loadingWeather.value = true
  try {
    const coords = await new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve({ lat: 37.5665, lon: 126.9780 })
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({ lat: 37.5665, lon: 126.9780 }),
        { enableHighAccuracy: true, timeout: 5000 }
      )
    })

    const key = import.meta.env.VITE_OWM_KEY
    if (!key) {
      console.warn('OpenWeather API 키가 설정되지 않았습니다.')
      weather.value = {
        temp: 20,
        description: 'API 키 없음',
        humidity: 60,
        uv: '-'
      }
      todayTip.value = '날씨 정보를 불러올 수 없어요. 환경 변수를 확인해주세요.'
      return
    }

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=metric&lang=kr&exclude=minutely,hourly,daily,alerts&appid=${key}`

    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`API 응답 오류: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    // ✅ 3) 데이터 검증
    if (!data.current) {
      console.warn('날씨 데이터 형식이 올바르지 않습니다:', data)
      weather.value = {
        temp: 20,
        description: '데이터 없음',
        humidity: 60,
        uv: '-'
      }
      todayTip.value = '날씨 정보를 불러올 수 없어요.'
      return
    }

    // ✅ 4) 데이터 반영
    const cur = data.current
    weather.value = {
      temp: Math.round(cur.temp ?? 20),
      description: cur.weather?.[0]?.description ?? '정보 없음',
      humidity: cur.humidity ?? 0,
      uv: cur.uvi ?? '-'
    }

    todayTip.value = tipFromWeather({
      temp: cur.temp ?? 20,
      humidity: cur.humidity ?? 60,
      uvi: cur.uvi ?? 0,
      weatherId: cur.weather?.[0]?.id ?? 800,
      day: isDaytime(cur)
    })
  } catch (err) {
    console.error('날씨 불러오기 실패:', err)
    // 에러 발생 시 기본값 설정
    weather.value = {
      temp: 20,
      description: '로딩 실패',
      humidity: 60,
      uv: '-'
    }
    todayTip.value = '날씨 정보를 불러올 수 없어요.'
  } finally {
    loadingWeather.value = false
  }
}

// DB → UI 데이터 매핑
const loadPlants = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data, error } = await supabase
  .from('plants')
  .select(`
    id, user_id, name, locate, photos,
    sensor_moisture, sensor_light, sensor_humidity, temperature,
    created_at, updated_at, needs_attention, status
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

  if (error) {
    console.error('식물 목록 로드 실패:', error)
    return
  }

  plants.value = (data || []).map(p => ({
    id: p.id,
    name: p.name,
    image: (p.photos && p.photos[0]?.url) || plant_pic,
    soilMoisture: p.sensor_moisture ?? 0,
    lightLevel: p.sensor_light ?? 0,
    humidity: p.sensor_humidity ?? 0,
    temperature: p.temperature ?? 0,
    lastUpdated: p.updated_at || '',
    needsAttention: !!p.needs_attention,
    status: p.status || '상태 양호',
    display: {
      moisture: `💧 ${p.sensor_moisture ?? 0}%`,
      light: `☀️ ${p.sensor_light ?? 0}%`,
      humidity: `🌱 ${p.sensor_humidity ?? 0}%`
    }
  }))
}

// 라이프사이클 훅
onMounted(async () => {
  await ensureDevSession()
  await loadUserNickname() // [추가] 닉네임 로드
  await loadPlants()
  await setupRealtime()
  await loadWeather()
})

onActivated(async () => {
  await loadUserNickname() // [추가] 화면 다시 돌아올 때 갱신
  await loadPlants()
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const openCamera = () => {
  showCameraChoice.value = true
}

const handleImageFile = async (file) => {
  if (!file) return

  console.log('이미지 선택됨:', file.name)

  showCameraChoice.value = false
  analyzingPest.value = true
  pestError.value = ''
  pestResult.value = null

  const result = await analyzePest(file)

  pestResult.value = result
  analyzingPest.value = false

  const confidenceText = result.confidence != null
    ? `신뢰도: ${(result.confidence * 100).toFixed(1)}%`
    : ''

  alert(`${result.kr_name}\n${confidenceText}\n\n${result.description}`)
  console.log('최종 화면 표시용 결과:', result)
}

const takePhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    await handleImageFile(file)
  }

  input.click()
}

const pickFromGallery = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    await handleImageFile(file)
  }

  input.click()
}

const openNotifications = () => {
  router.push('/notification')
}

const viewAllPlants = () => {
  console.log('전체 식물 보기')
}

const goToPlantDetail = (plantId) => {
  router.push(`/plant-detail/${plantId}`)
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

const getOverallStatusClass = (plant) => {
  if (plant.needsAttention) return 'status-warning'
  return 'status-normal'
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

.camera-choice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 999;
  display: flex;
  align-items: flex-end; /* 바텀 시트 느낌 */
  justify-content: center;
}

.camera-choice-sheet {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  padding: 16px 20px 24px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
}

.camera-choice-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  text-align: center;
}

.camera-choice-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  border: none;
  background: #eef2e6;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.camera-choice-btn:active {
  background: #dfe7d6;
}

.camera-choice-cancel {
  width: 100%;
  padding: 10px;
  margin-top: 4px;
  border-radius: 10px;
  border: none;
  background: #ffffff;
  color: #7f8c8d;
  font-size: 13px;
  cursor: pointer;
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

.analyzing-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000; /* 헤더, 메뉴보다 위 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.analyzing-box {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px;
  width: 80%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.spinner {
  width: 36px;
  height: 36px;
  margin: 0 auto 12px;
  border-radius: 50%;
  border: 3px solid #cbd5c0;
  border-top-color: #4a6444;
  animation: spin 0.8s linear infinite;
}

.analyzing-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.analyzing-desc {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>