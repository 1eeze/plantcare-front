<template>
  <div class="home">
    <div v-if="analyzingPest" class="analyzing-overlay">
      <div class="analyzing-box">
        <div class="spinner"></div>
        <p class="analyzing-title">AI가 병충해를 분석 중이에요…</p>
        <p class="analyzing-desc">
          처음 호출은 서버를 깨우느라 20~30초 정도 걸릴 수 있어요 🌱
        </p>
      </div>
    </div>

    <div v-if="showPestResult" class="result-overlay" @click="closePestResult">
      <div class="result-modal" @click.stop>
        <div class="result-header">
          <h3>🔬 종합 분석 결과</h3>
          <button class="close-result-btn" @click="closePestResult">×</button>
        </div>
        
        <div class="result-content">
          <div class="result-card pest-card" @click="togglePestDetail">
            <div class="card-header">
              <span class="card-icon">🐛</span>
              <h4>병충해 감지</h4>
              <span class="expand-icon">{{ showPestDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="pest-name">{{ pestResult?.krName || '감지되지 않음' }}</p>
              <p v-if="pestResult?.confidence" class="confidence">
                신뢰도: {{ (pestResult.confidence * 100).toFixed(1) }}%
              </p>
            </div>
            
            <div v-if="showPestDetail" class="card-detail">
              <p class="detail-label">원본 클래스명</p>
              <p class="detail-value">{{ pestResult?.className }}</p>
              
              <p class="detail-label">대응 방법</p>
              <p class="detail-value">{{ getPestSolution(pestResult?.className) }}</p>
            </div>
          </div>

          <div class="result-card organ-card" @click="toggleOrganDetail">
            <div class="card-header">
              <span class="card-icon">🌿</span>
              <h4>생육 부위</h4>
              <span class="expand-icon">{{ showOrganDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="organ-name">{{ growthResult?.organ || '감지되지 않음' }}</p>
              <p v-if="growthResult?.organConfidence" class="confidence">
                신뢰도: {{ (growthResult.organConfidence * 100).toFixed(1) }}%
              </p>
            </div>
            
            <div v-if="showOrganDetail && growthResult" class="card-detail">
              <p class="detail-label">분석 내용</p>
              <p class="detail-value">해당 부위에 맞는 관리법을 적용하세요.</p>
            </div>
          </div>

          <div class="result-card stage-card" @click="toggleStageDetail">
            <div class="card-header">
              <span class="card-icon">🌱</span>
              <h4>성장 단계</h4>
              <span class="expand-icon">{{ showStageDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="stage-name">{{ growthResult?.stage || '감지되지 않음' }}</p>
              <p v-if="growthResult?.stageConfidence" class="confidence">
                신뢰도: {{ (growthResult.stageConfidence * 100).toFixed(1) }}%
              </p>
            </div>
            
            <div v-if="showStageDetail && growthResult" class="card-detail">
              <p class="detail-label">관리 팁</p>
              <p class="detail-value">{{ getStageTip(growthResult?.stage) }}</p>
            </div>
          </div>
        </div>

        <button class="save-result-btn" @click="saveAnalysisResult">
            📋 분석 결과 저장
        </button>
      </div>
    </div>

    <div v-if="showMenu" class="menu-overlay" @click="toggleMenu"></div>
    
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

    <div class="header">
      <button class="menu-btn" @click="toggleMenu">☰</button>
      <div class="location">
        <p class="greeting">안녕하세요, {{ userName }}님!</p>
        <p class="city">{{ location }}</p>
      </div>
      <div class="header-actions">
        <button class="notification-btn" @click="openNotifications" :class="{ 'has-notification': notificationCount > 0 }">
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

        <div class="plant-status-simple">
          <span class="status-indicator" :class="getOverallStatusClass(plant)"></span>
          <span class="status-text">{{ plant.status }}</span>
        </div>
      </div>
      
      <div class="add-plant-card" @click="addPlant">
        <div class="add-plant-content">
          <span class="add-icon">+</span>
          <span class="add-text">식물 추가</span>
        </div>
      </div>
    </div>

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
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import plant_pic from '../../assets/plant.png'

const router = useRouter()

// API URLs
const PEST_API_URL = 'https://detectbug-740384497388.asia-southeast1.run.app/predict/pest'
const GROWTH_API_URL = 'https://detectbug-740384497388.asia-southeast1.run.app/predict/growth'

// 병충해 분석 관련 상태
const analyzingPest = ref(false)
const pestResult = ref(null)
const pestError = ref('') 
const growthResult = ref(null)
const showPestResult = ref(false)
const showPestDetail = ref(false)
const showOrganDetail = ref(false)
const showStageDetail = ref(false)
const showCameraChoice = ref(false)

// 기본 상태
const userName = ref('식물집사') 
const location = ref('Seoul, KOREA')
const showMenu = ref(false)

// 알림 관련 상태
const notificationCount = ref(0) 

// 날씨 관련 상태
const weather = ref({ temp: 0, description: '로딩 중…', humidity: 0, uv: '-' })
const loadingWeather = ref(false)
const todayTip = ref('오늘의 날씨에 맞춰 식물 관리 팁을 불러오는 중이에요.')

// 데이터
const plants = ref([])
const todayTasks = ref([
  { id: 1, plantName: '몬스테라', icon: '💧', description: '토양습도 25% - 물주기 필요', completed: false, priority: 'high' },
  { id: 2, plantName: '고무나무', icon: '☀️', description: '조도 40% - 밝은 곳으로 이동', completed: false, priority: 'medium' }
])

// 구독 채널 변수
let channel = null
let badgeSubscription = null

// 병충해/생육 사전 데이터
const PEST_DICT = { 
  "agrotis_ipsilon_egg": "거세미나방 알", "agrotis_ipsilon_larva": "거세미나방 유충", "agrotis_ipsilon_adult": "거세미나방 성충", 
  "Frankliniella_occidentalis_egg": "꽃노랑총채벌레 알", "Frankliniella_occidentalis_larva": "꽃노랑총채벌레 유충", "Frankliniella_occidentalis_adult": "꽃노랑총채벌레 성충", 
  "Bemisia_tabaci_egg": "담배가루이 알", "Bemisia_tabaci_larva": "담배가루이 유충", "Bemisia_tabaci_adult": "담배가루이 성충", 
  "Spodoptera_litura_egg": "담배거세나방 알", "Spodoptera_litura_larva": "담배거세나방 유충", "Spodoptera_litura_adult": "담배거세나방 성충", 
  "Helicoverpa_armigera_egg": "왕담배나방 알", "Helicoverpa_armigera_larva": "왕담배나방 유충", "Helicoverpa_armigera_adult": "왕담배나방 성충", 
  "Mamestra_brassicae_egg": "도둑나방 알", "Mamestra_brassicae_larva": "도둑나방 유충", "Mamestra_brassicae_adult": "도둑나방 성충", 
  "Scotinophara_lurida_egg": "먹노린재 알", "Scotinophara_lurida_larva": "먹노린재 유충", "Scotinophara_lurida_adult": "먹노린재 성충", 
  "Palpita_indica_egg": "목화바둑명나방 알", "Palpita_indica_larva": "목화바둑명나방 유충", "Palpita_indica_adult": "목화바둑명나방 성충", 
  "Athalia_rosae_egg": "무잎벌 알", "Athalia_rosae_larva": "무잎벌 유충", "Athalia_rosae_adult": "무잎벌 성충", 
  "Plutella_xylostella_egg": "배추좀나방 알", "Plutella_xylostella_larva": "배추좀나방 유충", "Plutella_xylostella_adult": "배추좀나방 성충", 
  "Pieris_rapae_egg": "배추흰나비 알", "Pieris_rapae_larva": "배추흰나비 유충", "Pieris_rapae_adult": "배추흰나비 성충", 
  "Phyllotreta_striolata_egg": "벼룩잎벌레 알", "Phyllotreta_striolata_larva": "벼룩잎벌레 유충", "Phyllotreta_striolata_adult": "벼룩잎벌레 성충", 
  "Myzus_persicae_egg": "복숭아혹진딧물 알", "Myzus_persicae_larva": "복숭아혹진딧물 유충", "Myzus_persicae_adult": "복숭아혹진딧물 성충", 
  "Eurydema_geblen_egg": "비단노린재 알", "Eurydema_geblen_larva": "비단노린재 유충", "Eurydema_geblen_adult": "비단노린재 성충", 
  "Halyomorpha_halys_egg": "썩덩나무노린재 알", "Halyomorpha_halys_larva": "썩덩나무노린재 유충", "Halyomorpha_halys_adult": "썩덩나무노린재 성충", 
  "Dolycoris_baccarum_egg": "알락수염노린재 알", "Dolycoris_baccarum_larva": "알락수염노린재 유충", "Dolycoris_baccarum_adult": "알락수염노린재 성충", 
  "Spodoptera_frugiperda_egg": "열대거세미나방 알", "Spodoptera_frugiperda_larva": "열대거세미나방 유충", "Spodoptera_frugiperda_adult": "열대거세미나방 성충", 
  "Henosepilachna_vigintioctopunctata_egg": "이십팔점박이무당벌레 알", "Henosepilachna_vigintioctopunctata_larva": "이십팔점박이무당벌레 유충", "Henosepilachna_vigintioctopunctata_adult": "이십팔점박이무당벌레 성충", 
  "Riptortus_pedestris_egg": "톱다리개미허리노린재 알", "Riptortus_pedestris_larva": "톱다리개미허리노린재 유충", "Riptortus_pedestris_adult": "톱다리개미허리노린재 성충", 
  "Spodoptera_exigua_egg": "파밤나방 알", "Spodoptera_exigua_larva": "파밤나방 유충", "Spodoptera_exigua_adult": "파밤나방 성충", 
  "default": "알 수 없는 병충해" 
}
const ORGAN_DICT = { "fruit": "열매", "flower": "꽃", "leaf": "잎", "stem": "줄기" }
const STAGE_DICT = { "seedling": "파종기 (새싹)", "growing": "성장기 (영양생장)", "flowering/fruiting": "개화/결실기" }

const PEST_SOLUTION = {
  "default": "전문가와 상담 후 적절한 방제법을 선택하세요."
}

// JSONB 배열에서 최신 값 추출
const getLatestSensorValue = (jsonbArray) => {
  if (!jsonbArray || !Array.isArray(jsonbArray) || jsonbArray.length === 0) {
    return null
  }
  return jsonbArray[0]?.value ?? null
}

// 알림 카운트 조회
const fetchUnreadCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: unreadMessages, error } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .neq('content', '::SYSTEM_LEAVE::')

    if (error) throw error
    if (!unreadMessages || unreadMessages.length === 0) {
      notificationCount.value = 0
      return
    }

    const { data: mutedSettings } = await supabase
      .from('chat_settings')
      .select('partner_id')
      .eq('user_id', user.id)
      .eq('is_muted', true)

    const mutedSenderIds = new Set(mutedSettings?.map(s => s.partner_id) || [])
    const validUnreadCount = unreadMessages.filter(msg => !mutedSenderIds.has(msg.sender_id)).length
    notificationCount.value = validUnreadCount
  } catch (e) { console.error(e) }
}

// 알림 배지 실시간 업데이트
const subscribeToBadgeUpdates = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (badgeSubscription) supabase.removeChannel(badgeSubscription)

  badgeSubscription = supabase
    .channel('home-badge-updates')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'messages', 
      filter: `receiver_id=eq.${user.id}` 
    }, () => {
      fetchUnreadCount()
    })
    .subscribe()
}

// 유저 닉네임 로드
const loadUserNickname = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('Users').select('name').eq('id', user.id).single()
    if (data && data.name) userName.value = data.name 
  } catch (e) { console.error(e) }
}

// 병충해 분석
async function analyzePest(imageFile) {
  const formData = new FormData()
  formData.append("file", imageFile)
  try {
    const response = await fetch(PEST_API_URL, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`병충해 API 오류: ${response.statusText}`)
    const data = await response.json()

    if (data.predictions && data.predictions.length > 0) {
      const firstPrediction = data.predictions[0]
      return { 
        className: firstPrediction.class_name, 
        krName: PEST_DICT[firstPrediction.class_name] || PEST_DICT.default, 
        confidence: firstPrediction.confidence 
      }
    } else {
      return { className: 'none', krName: "탐지된 병충해 없음", confidence: 0 }
    }
  } catch (err) {
    return { className: 'error', krName: "판별 오류", confidence: 0 }
  }
}

// 생육 분석
async function analyzeGrowth(imageFile) {
  const formData = new FormData()
  formData.append("file", imageFile)
  try {
    const response = await fetch(GROWTH_API_URL, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`생육 API 오류: ${response.statusText}`)
    const data = await response.json()

    if (data.predictions && data.predictions.length > 0) {
      const p = data.predictions[0]
      return { 
        organ: ORGAN_DICT[p.organ] || p.organ, 
        stage: STAGE_DICT[p.stage] || p.stage, 
        organConfidence: p.organ_confidence, 
        stageConfidence: p.stage_confidence 
      }
    }
    if (data.organ && data.stage) {
      return { 
        organ: ORGAN_DICT[data.organ] || data.organ, 
        stage: STAGE_DICT[data.stage] || data.stage, 
        organConfidence: data.organ_confidence, 
        stageConfidence: data.stage_confidence 
      }
    }
    return null
  } catch (err) { return null }
}

const handleImageFile = async (file) => {
  if (!file) return
  showCameraChoice.value = false
  analyzingPest.value = true
  pestResult.value = null
  growthResult.value = null

  try {
    const [pestRes, growthRes] = await Promise.all([analyzePest(file), analyzeGrowth(file)])
    pestResult.value = pestRes
    growthResult.value = growthRes
    
    if (pestRes.className === 'error' && !growthRes) {
      alert('분석에 실패했습니다. 네트워크를 확인해주세요.')
    } else {
      showPestResult.value = true
    }
  } catch (err) { alert('오류 발생: ' + err.message) }
  finally { analyzingPest.value = false }
}

// 기타 헬퍼 함수
const toggleMenu = () => showMenu.value = !showMenu.value
const openCamera = () => showCameraChoice.value = true
const takePhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'
  input.onchange = (e) => handleImageFile(e.target.files[0])
  input.click()
}
const pickFromGallery = () => {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = 'image/*'
  input.onchange = (e) => handleImageFile(e.target.files[0])
  input.click()
}
const closePestResult = () => {
  showPestResult.value = false
  showPestDetail.value = false
  showOrganDetail.value = false
  showStageDetail.value = false
}
const saveAnalysisResult = () => { 
  alert('분석 결과가 저장되었습니다!'); 
  closePestResult() 
}
const togglePestDetail = () => showPestDetail.value = !showPestDetail.value
const toggleOrganDetail = () => showOrganDetail.value = !showOrganDetail.value
const toggleStageDetail = () => showStageDetail.value = !showStageDetail.value
const getPestSolution = (cls) => PEST_SOLUTION[cls] || PEST_SOLUTION.default
const getStageTip = (s) => s ? '관리에 신경써주세요.' : ''

// 실시간 업데이트 설정
async function setupRealtime() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }

  channel = supabase
    .channel('public:User_Plants')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'User_Plants', filter: `user_id=eq.${user.id}` },
      async () => {
        await loadPlants()
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'User_Plants', filter: `user_id=eq.${user.id}` },
      async () => {
        await loadPlants()
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'User_Plants', filter: `user_id=eq.${user.id}` },
      ({ old }) => {
        plants.value = plants.value.filter(x => x.id !== old.id)
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sensor_data' },
      async () => {
        await loadPlants()
      }
    )
    .subscribe()
}

// 식물 목록 로드 (센서 데이터 포함)
const loadPlants = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

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
      lastUpdated: p.updated_at || '',
      needsAttention: needsAttention,
      status: status
    }
  })
}

async function ensureDevSession() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('세션 없음, 개발용 로그인 시도')
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'test1234'
      })
      if (error) console.error('개발용 로그인 실패:', error)
    }
  } catch (e) {
    console.error('세션 확인 오류:', e)
  }
}

async function loadWeather() {
  loadingWeather.value = true
  try {
    weather.value = {
      temp: 22,
      description: '맑음',
      humidity: 65,
      uv: '보통'
    }
    todayTip.value = '오늘은 날씨가 좋아요! 실내 식물은 창가에 두면 좋습니다.'
  } catch (e) {
    console.error('날씨 로드 오류:', e)
  } finally {
    loadingWeather.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  await ensureDevSession()
  await loadUserNickname()
  await loadPlants()
  await setupRealtime()
  await fetchUnreadCount()
  await subscribeToBadgeUpdates()
  loadWeather()
})

onActivated(async () => {
  await loadUserNickname()
  await loadPlants()
  await fetchUnreadCount()
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }
  if (badgeSubscription) {
    supabase.removeChannel(badgeSubscription)
    badgeSubscription = null
  }
})

const openNotifications = () => router.push('/notification')
const viewAllPlants = () => {}
const goToPlantDetail = (id) => router.push(`/plant-detail/${id}`)
const addPlant = () => router.push('/add-plant')
const waterAllPlants = () => {}
const checkPlantHealth = () => {}
const setReminder = () => {}
const completeTask = (id) => { 
  const t = todayTasks.value.find(x => x.id === id)
  if(t) t.completed = true 
}
const getOverallStatusClass = (p) => p.needsAttention ? 'status-warning' : 'status-normal'
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
.menu-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 998; }
.side-menu { position: fixed; top: 0; left: -280px; width: 280px; height: 100vh; background: #fff; z-index: 999; transition: left 0.3s ease; box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1); }
.side-menu.menu-open { left: 0; }
.menu-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.menu-items { padding: 20px 0; }
.menu-item { display: block; padding: 15px 20px; text-decoration: none; color: #333; border-bottom: 1px solid #f5f5f5; transition: background 0.2s; }
.menu-item:hover { background: #f8f9fa; }

/* 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #eef2e6 0%, #dfe7d6 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.menu-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.camera-btn { background: none; border: none; padding: 8px; cursor: pointer; border-radius: 8px; transition: background 0.2s; }
.camera-btn:hover { background: rgba(74, 100, 68, 0.1); }
.location { flex-grow: 1; text-align: left; margin-left: 16px; }
.greeting { margin: 0; font-size: 16px; font-weight: 600; color: #2c3e50; }
.city { margin: 0; font-size: 12px; color: #7f8c8d; }

/* 알림 버튼 */
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
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 날씨 카드 */
.weather-card { margin: 20px; background: linear-gradient(135deg, #3e6047 0%, #a8c3a0 100%); border-radius: 16px; padding: 20px; color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
.weather-main { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.weather-icon { font-size: 32px; }
.weather-temp { display: flex; flex-direction: column; }
.temp { font-size: 28px; font-weight: bold; margin-right: 8px; }
.desc { font-size: 14px; opacity: 0.9; }
.weather-detail { display: flex; gap: 16px; font-size: 12px; opacity: 0.8; margin-bottom: 16px; }
.plant-care-tip { margin-top: 12px; }
.tip-title { font-size: 14px; font-weight: 600; margin: 0 0 4px 0; opacity: 0.9; }
.tip-content { font-size: 12px; margin: 0; opacity: 0.8; }

/* 섹션 공통 */
.section-title { display: flex; justify-content: space-between; align-items: center; margin: 24px 20px 12px; }
.section-title h3 { margin: 0; font-size: 18px; font-weight: 600; color: #2c3e50; }
.view-all { background: none; border: none; color: #4a6444; font-size: 14px; cursor: pointer; font-weight: 500; }

/* 카메라 선택 모달 */
.camera-choice-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.camera-choice-sheet { width: 100%; max-width: 480px; background: #ffffff; border-radius: 16px 16px 0 0; padding: 16px 20px 24px; box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15); }
.camera-choice-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 12px; text-align: center; }
.camera-choice-btn { width: 100%; padding: 12px; margin-bottom: 8px; border-radius: 10px; border: none; background: #eef2e6; color: #2c3e50; font-size: 14px; font-weight: 500; cursor: pointer; }
.camera-choice-btn:active { background: #dfe7d6; }
.camera-choice-cancel { width: 100%; padding: 10px; margin-top: 4px; border-radius: 10px; border: none; background: #ffffff; color: #7f8c8d; font-size: 13px; cursor: pointer; }

/* 식물 카드 스크롤 */
.plant-scroll { display: flex; align-items: center; overflow-x: auto; gap: 16px; padding: 0 20px 20px; scroll-behavior: smooth; }
.plant-card { flex: 0 0 auto; width: 160px; background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.plant-sensors-display { display: flex; flex-direction: column; gap: 4px; font-size: 11px; margin: 8px 0; color: #666; }
.plant-sensors-display span { display: flex; align-items: center; gap: 4px; }
.plant-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12); }
.plant-image-container { position: relative; margin-bottom: 12px; }
.plant-image { width: 100%; height: 100px; object-fit: cover; border-radius: 12px; }
.attention-badge { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; background: #ff4757; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
.plant-card h4 { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #2c3e50; }
.plant-status-simple { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 8px; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
.status-normal { background-color: #2ed573; }
.status-warning { background-color: #ff4757; }
.status-text { font-size: 11px; color: #666; }

/* 식물 추가 카드 */
.add-plant-card { flex: 0 0 auto; width: 160px; height: 200px; background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
.add-plant-card:hover { transform: translateY(-2px); }
.add-plant-content { text-align: center; color: white; }
.add-icon { font-size: 32px; display: block; margin-bottom: 8px; }
.add-text { font-size: 14px; font-weight: 500; }

/* 빠른 액션 */
.quick-actions { display: flex; gap: 12px; padding: 0 20px; margin-bottom: 24px; }
.quick-action { flex: 1; background: white; border: none; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); transition: transform 0.2s, box-shadow 0.2s; }
.quick-action:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.action-icon { font-size: 24px; }
.action-text { font-size: 12px; font-weight: 500; color: #2c3e50; }

/* 할 일 목록 */
.task-list { padding: 0 20px 32px; }
.task-card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); transition: opacity 0.3s; }
.task-card.completed { opacity: 0.6; }
.task-info { display: flex; align-items: center; gap: 12px; }
.task-icon { font-size: 20px; }
.task-details { display: flex; flex-direction: column; gap: 2px; }
.task-details strong { font-size: 14px; color: #2c3e50; }
.task-description { font-size: 12px; color: #7f8c8d; }
.task-complete { background: none; border: 2px solid #ddd; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; transition: all 0.2s; }
.task-complete:not(:disabled):hover { background: #2ed573; border-color: #2ed573; color: white; }
.task-complete:disabled { background: #2ed573; border-color: #2ed573; color: white; cursor: default; }
.no-tasks { text-align: center; padding: 40px 20px; color: #7f8c8d; }
.no-tasks-icon { font-size: 48px; display: block; margin-bottom: 12px; }

/* 병충해 분석 로딩 오버레이 */
.analyzing-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.analyzing-box { background: #ffffff; border-radius: 16px; padding: 24px 20px; width: 80%; max-width: 320px; text-align: center; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18); }
.spinner { width: 36px; height: 36px; margin: 0 auto 12px; border-radius: 50%; border: 3px solid #cbd5c0; border-top-color: #4a6444; animation: spin 0.8s linear infinite; }
.analyzing-title { font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 6px; }
.analyzing-desc { font-size: 12px; color: #7f8c8d; line-height: 1.4; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 병충해 분석 결과 모달 */
.result-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1001; display: flex; align-items: center; justify-content: center; padding: 20px; }
.result-modal { background: white; border-radius: 20px; width: 100%; max-width: 400px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
.result-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: white; z-index: 10; }
.result-header h3 { margin: 0; font-size: 18px; color: #2c3e50; }
.close-result-btn { background: none; border: none; font-size: 28px; color: #7f8c8d; cursor: pointer; line-height: 1; }
.result-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

/* 분석 카드 */
.result-card { background: #f8f9fa; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; }
.result-card:hover { background: #eef2e6; }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.card-icon { font-size: 20px; }
.card-header h4 { margin: 0; font-size: 15px; font-weight: 600; flex: 1; }
.expand-icon { font-size: 12px; color: #7f8c8d; }
.card-summary { padding-left: 28px; }
.pest-name, .organ-name, .stage-name { font-size: 16px; font-weight: 600; color: #2c3e50; margin: 0 0 4px 0; }
.confidence { font-size: 12px; color: #7f8c8d; margin: 0; }

/* 상세 정보 */
.card-detail { margin-top: 12px; padding: 12px; background: white; border-radius: 8px; border-left: 3px solid #4a6444; }
.detail-label { font-size: 12px; color: #7f8c8d; margin: 8px 0 4px 0; font-weight: 600; }
.detail-label:first-child { margin-top: 0; }
.detail-value { font-size: 13px; color: #2c3e50; margin: 0 0 8px 0; line-height: 1.5; }

/* 카드별 색상 구분 */
.pest-card { border-left: 4px solid #ff6b6b; }
.organ-card { border-left: 4px solid #4ecdc4; }
.stage-card { border-left: 4px solid #95e1d3; }

/* 저장 버튼 */
.save-result-btn { margin: 16px; padding: 14px; background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
.save-result-btn:hover { transform: translateY(-1px); }
.save-result-btn:active { transform: translateY(0); }
</style>