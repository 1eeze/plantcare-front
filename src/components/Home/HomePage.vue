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

    <!-- 🆕 분석 결과 모달 추가 -->
    <div v-if="showPestResult" class="result-overlay" @click="closePestResult">
      <div class="result-modal" @click.stop>
        <div class="result-header">
          <h3>🔬 종합 분석 결과</h3>
          <button class="close-result-btn" @click="closePestResult">×</button>
        </div>
        
        <div class="result-content">
          <!-- 병충해 카드 -->
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
            
            <!-- 상세 정보 (토글) -->
            <div v-if="showPestDetail" class="card-detail">
              <p class="detail-label">원본 클래스명</p>
              <p class="detail-value">{{ pestResult?.className }}</p>
              
              <p class="detail-label">대응 방법</p>
              <p class="detail-value">{{ getPestSolution(pestResult?.className) }}</p>
            </div>
          </div>

          <!-- 생육 부위 카드 -->
          <div class="result-card organ-card" @click="toggleOrganDetail">
            <div class="card-header">
              <span class="card-icon">🌿</span>
              <h4>생육 부위</h4>
              <span class="expand-icon">{{ showOrganDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="organ-name">
                {{ growthResult?.organ || '감지되지 않음' }}
              </p>
              <p v-if="growthResult?.organConfidence" class="confidence">
                신뢰도: {{ (growthResult.organConfidence * 100).toFixed(1) }}%
              </p>
            </div>
            
            <div v-if="showOrganDetail && growthResult" class="card-detail">
              <p class="detail-label">분석 내용</p>
              <p class="detail-value">
                해당 부위에 맞는 관리법을 적용하세요.
              </p>
            </div>
          </div>

          <!-- 성장 단계 카드 -->
          <div class="result-card stage-card" @click="toggleStageDetail">
            <div class="card-header">
              <span class="card-icon">🌱</span>
              <h4>성장 단계</h4>
              <span class="expand-icon">{{ showStageDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="stage-name">
                {{ growthResult?.stage || '감지되지 않음' }}
              </p>
              <p v-if="growthResult?.stageConfidence" class="confidence">
                신뢰도: {{ (growthResult.stageConfidence * 100).toFixed(1) }}%
              </p>
            </div>
            
            <div v-if="showStageDetail && growthResult" class="card-detail">
              <p class="detail-label">관리 팁</p>
              <p class="detail-value">
                {{ getStageTip(growthResult?.stage) }}
              </p>
            </div>
          </div>
        </div>

        <button class="save-result-btn" @click="saveAnalysisResult">
            📋 분석 결과 저장
        </button>
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

const PEST_API_URL = 'https://detectbug-740384497388.asia-southeast1.run.app/predict/pest'
const GROWTH_API_URL = 'https://detectbug-740384497388.asia-southeast1.run.app/predict/growth' // TODO: 생육 분석 시 사용

const analyzingPest = ref(false)
const pestResult = ref(null)
const pestError = ref('') 
const growthResult = ref(null)
const showPestResult = ref(false)
const showPestDetail = ref(false)
const showOrganDetail = ref(false)
const showStageDetail = ref(false)

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

// 1. 병충해 번역 사전 
const PEST_DICT = { 

  // 1. 거세미나방 (Black Cutworm) 
  "agrotis_ipsilon_egg": "거세미나방 알", 
  "agrotis_ipsilon_larva": "거세미나방 유충 (애벌레)", 
  "agrotis_ipsilon_adult": "거세미나방 성충", 

  // 2. 꽃노랑총채벌레 (Western Flower Thrips) 
  "Frankliniella_occidentalis_egg": "꽃노랑총채벌레 알", 
  "Frankliniella_occidentalis_larva": "꽃노랑총채벌레 유충", 
  "Frankliniella_occidentalis_adult": "꽃노랑총채벌레 성충", 
  
  // 3. 담배가루이 (Sweetpotato Whitefly) 
  "Bemisia_tabaci_egg": "담배가루이 알", 
  "Bemisia_tabaci_larva": "담배가루이 유충", 
  "Bemisia_tabaci_adult": "담배가루이 성충", 
  
  // 4. 담배거세나방 (Tobacco Cutworm) 
  "Spodoptera_litura_egg": "담배거세나방 알", 
  "Spodoptera_litura_larva": "담배거세나방 유충", 
  "Spodoptera_litura_adult": "담배거세나방 성충", 
  
  // 5. 왕담배나방 (Cotton Bollworm) 
  "Helicoverpa_armigera_egg": "왕담배나방 알", 
  "Helicoverpa_armigera_larva": "왕담배나방 유충", 
  "Helicoverpa_armigera_adult": "왕담배나방 성충", 
  
  // 6. 도둑나방 (Cabbage Moth) 
  "Mamestra_brassicae_egg": "도둑나방 알", 
  "Mamestra_brassicae_larva": "도둑나방 유충", 
  "Mamestra_brassicae_adult": "도둑나방 성충", 
  
  // 7. 먹노린재 (Black Rice Bug) 
  "Scotinophara_lurida_egg": "먹노린재 알", 
  "Scotinophara_lurida_larva": "먹노린재 유충", 
  "Scotinophara_lurida_adult": "먹노린재 성충", 
  
  // 8. 목화바둑명나방 (Cotton Caterpillar) 
  "Palpita_indica_egg": "목화바둑명나방 알", 
  "Palpita_indica_larva": "목화바둑명나방 유충", 
  "Palpita_indica_adult": "목화바둑명나방 성충", 
  
  // 9. 무잎벌 (Turnip Sawfly) 
  "Athalia_rosae_egg": "무잎벌 알", 
  "Athalia_rosae_larva": "무잎벌 유충", 
  "Athalia_rosae_adult": "무잎벌 성충", 
  
  // 10. 배추좀나방 (Diamondback Moth) 
  "Plutella_xylostella_egg": "배추좀나방 알", 
  "Plutella_xylostella_larva": "배추좀나방 유충", 
  "Plutella_xylostella_adult": "배추좀나방 성충", 
  
  // 11. 배추흰나비 (Small White Butterfly) 
  "Pieris_rapae_egg": "배추흰나비 알", 
  "Pieris_rapae_larva": "배추흰나비 유충 (청벌레)", 
  "Pieris_rapae_adult": "배추흰나비 성충", 
  
  // 12. 벼룩잎벌레 (Striped Flea Beetle) 
  "Phyllotreta_striolata_egg": "벼룩잎벌레 알", 
  "Phyllotreta_striolata_larva": "벼룩잎벌레 유충", 
  "Phyllotreta_striolata_adult": "벼룩잎벌레 성충", 
  
  // 13. 복숭아혹진딧물 (Green Peach Aphid) 
  "Myzus_persicae_egg": "복숭아혹진딧물 알", 
  "Myzus_persicae_larva": "복숭아혹진딧물 유충", 
  "Myzus_persicae_adult": "복숭아혹진딧물 성충", 
  
  // 14. 비단노린재 (Large Shield Bug - typo in dataset 'geblen' -> 'gebleri') 
  "Eurydema_geblen_egg": "비단노린재 알", 
  "Eurydema_geblen_larva": "비단노린재 유충", 
  "Eurydema_geblen_adult": "비단노린재 성충", 
  
  // 15. 썩덩나무노린재 (Brown Marmorated Stink Bug) 
  "Halyomorpha_halys_egg": "썩덩나무노린재 알", 
  "Halyomorpha_halys_larva": "썩덩나무노린재 유충", 
  "Halyomorpha_halys_adult": "썩덩나무노린재 성충", 
  
  // 16. 알락수염노린재 (Sloe Bug) 
  "Dolycoris_baccarum_egg": "알락수염노린재 알", 
  "Dolycoris_baccarum_larva": "알락수염노린재 유충", 
  "Dolycoris_baccarum_adult": "알락수염노린재 성충", 
  
  // 17. 열대거세미나방 (Fall Armyworm) 
  "Spodoptera_frugiperda_egg": "열대거세미나방 알", 
  "Spodoptera_frugiperda_larva": "열대거세미나방 유충", 
  "Spodoptera_frugiperda_adult": "열대거세미나방 성충", 
  
  // 18. 이십팔점박이무당벌레 (28-spotted Ladybird) 
  "Henosepilachna_vigintioctopunctata_egg": "이십팔점박이무당벌레 알", 
  "Henosepilachna_vigintioctopunctata_larva": "이십팔점박이무당벌레 유충", 
  "Henosepilachna_vigintioctopunctata_adult": "이십팔점박이무당벌레 성충", 
  
  // 19. 톱다리개미허리노린재 (Bean Bug) 
  "Riptortus_pedestris_egg": "톱다리개미허리노린재 알", 
  "Riptortus_pedestris_larva": "톱다리개미허리노린재 유충", 
  "Riptortus_pedestris_adult": "톱다리개미허리노린재 성충", 
  
  // 20. 파밤나방 (Beet Armyworm) 
  "Spodoptera_exigua_egg": "파밤나방 알", 
  "Spodoptera_exigua_larva": "파밤나방 유충", 
  "Spodoptera_exigua_adult": "파밤나방 성충", 
  
  "default": "알 수 없는 병충해" 
}; 

// 2. 생육 부위(Organ) 번역 사전 
const ORGAN_DICT = { 
  "fruit": "열매", 
  "flower": "꽃", 
  "leaf": "잎", 
  "stem": "줄기" 
}; 

// 3. 성장 단계(Stage) 번역 사전 
const STAGE_DICT = { 
  "seedling": "파종기 (새싹)", 
  "growing": "성장기 (영양생장)", 
  "flowering/fruiting": "개화/결실기" 
};

// 병충해 방제 솔루션 매핑
const PEST_SOLUTION = {

  // 1. 거세미나방 (Black Cutworm)
  "agrotis_ipsilon_egg": "알 발견 시 즉시 제거하고 주변 토양을 건조하게 유지하세요.",
  "agrotis_ipsilon_larva": "유충은 즉시 제거하고, BT제나 친환경 살충제를 주기적으로 사용하세요.",
  "agrotis_ipsilon_adult": "빛 유인을 줄이고, 성페로몬 트랩을 설치하면 효과적입니다.",

  // 2. 꽃노랑총채벌레 (Western Flower Thrips)
  "Frankliniella_occidentalis_egg": "알이 붙은 잎은 제거하고 폐기하세요.",
  "Frankliniella_occidentalis_larva": "끈끈이 트랩을 설치하고, 저독성 살충제를 3일 간격으로 살포하세요.",
  "Frankliniella_occidentalis_adult": "실내 환기 유지, 노란색 끈끈이 트랩 활용이 효과적입니다.",

  // 3. 담배가루이 (Sweetpotato Whitefly)
  "Bemisia_tabaci_egg": "잎 뒷면을 체크해 알을 물로 씻어내거나 제거하세요.",
  "Bemisia_tabaci_larva": "식물 비누(난충비누)나 유황계 친환경 약제를 뿌리면 도움됩니다.",
  "Bemisia_tabaci_adult": "은박지 반사판, 황색 끈끈이, 환기 개선이 효과적입니다.",

  // 4. 담배거세나방 (Tobacco Cutworm)
  "Spodoptera_litura_egg": "알 덩어리를 발견하면 즉시 제거하세요.",
  "Spodoptera_litura_larva": "BT제 살포, 손 제거, 야간 점검이 효과적입니다.",
  "Spodoptera_litura_adult": "성페로몬 트랩을 설치하여 산란을 억제하세요.",

  // 5. 왕담배나방 (Cotton Bollworm)
  "Helicoverpa_armigera_egg": "잎 뒷면의 알은 바로 제거하세요.",
  "Helicoverpa_armigera_larva": "어릴 때 BT제 살포가 가장 효과 높습니다.",
  "Helicoverpa_armigera_adult": "유인등 줄이고, 페로몬 트랩으로 성충을 포획하세요.",

  // 6. 도둑나방 (Cabbage Moth)
  "Mamestra_brassicae_egg": "알 무더기는 제거 후 폐기하세요.",
  "Mamestra_brassicae_larva": "유충은 핀셋으로 제거하거나 BT제를 살포하세요.",
  "Mamestra_brassicae_adult": "성충 출몰 감소를 위해 주변 잡초 제거 필요.",

  // 7. 먹노린재 (Black Rice Bug)
  "Scotinophara_lurida_egg": "알은 긁어서 제거하세요.",
  "Scotinophara_lurida_larva": "유충은 물로 씻어내거나 손 제거가 효과적입니다.",
  "Scotinophara_lurida_adult": "나무젓가락으로 쉽게 잡기 가능하며, 발생이 많으면 피레스로이드계 약제를 고려하세요.",

  // 8. 목화바둑명나방 (Cotton Caterpillar)
  "Palpita_indica_egg": "알 무더기는 즉시 제거하세요.",
  "Palpita_indica_larva": "유충 발견 즉시 제거 또는 BT제 살포.",
  "Palpita_indica_adult": "페로몬 트랩으로 산란 억제 가능.",

  // 9. 무잎벌 (Turnip Sawfly)
  "Athalia_rosae_egg": "잎 표면에 알이 붙으면 바로 제거하세요.",
  "Athalia_rosae_larva": "유충은 손 제거가 효과적이며, 심한 경우 저독성 살충제 사용.",
  "Athalia_rosae_adult": "잡초 제거로 성충 서식지 줄이는 것이 가장 좋습니다.",

  // 10. 배추좀나방 (Diamondback Moth)
  "Plutella_xylostella_egg": "알이 붙은 잎은 잘라 제거하세요.",
  "Plutella_xylostella_larva": "BT제가 매우 효과적이며, 5~7일 간격으로 살포하세요.",
  "Plutella_xylostella_adult": "성충은 페로몬 트랩으로 유인 포획 가능합니다.",

  // 11. 배추흰나비 (Small White Butterfly)
  "Pieris_rapae_egg": "노란 알은 즉시 제거하세요.",
  "Pieris_rapae_larva": "어린 애벌레는 손 제거, 심하면 BT제 사용.",
  "Pieris_rapae_adult": "망사(차광망)로 날아드는 것을 물리적으로 차단하세요.",

  // 12. 벼룩잎벌레 (Striped Flea Beetle)
  "Phyllotreta_striolata_egg": "알 부착 잎 제거.",
  "Phyllotreta_striolata_larva": "유충은 잎을 갉아먹기 전 제거가 최선입니다.",
  "Phyllotreta_striolata_adult": "점프형 성충 → 황색 끈끈이 트랩이 매우 잘 잡힘.",

  // 13. 복숭아혹진딧물 (Green Peach Aphid)
  "Myzus_persicae_egg": "알은 휴지로 닦아 제거하세요.",
  "Myzus_persicae_larva": "비눗물(난충비누), 식물용 오일제, 물 세척이 효과적.",
  "Myzus_persicae_adult": "군집 발견 즉시 가지치기 + 난충비누 살포 추천.",

  // 14. 비단노린재 (Large Shield Bug)
  "Eurydema_geblen_egg": "색깔이 선명한 알은 손으로 제거하세요.",
  "Eurydema_geblen_larva": "유충은 수채로 씻어내거나 손 제거.",
  "Eurydema_geblen_adult": "성충은 피레스로이드계 약제나 손제거가 효과적입니다.",

  // 15. 썩덩나무노린재 (Brown Marmorated Stink Bug)
  "Halyomorpha_halys_egg": "알을 스크레이퍼로 긁어 제거.",
  "Halyomorpha_halys_larva": "유충은 비눗물로 간단히 제거 가능.",
  "Halyomorpha_halys_adult": "성충은 강한 냄새 → 진공청소기로 제거하는 방법도 흔함.",

  // 16. 알락수염노린재 (Sloe Bug)
  "Dolycoris_baccarum_egg": "알은 손톱으로 긁어 제거하세요.",
  "Dolycoris_baccarum_larva": "유충은 손 제거가 가장 안전합니다.",
  "Dolycoris_baccarum_adult": "성충은 냄새가 나므로 집게나 비닐 장갑 착용 추천.",

  // 17. 열대거세미나방 (Fall Armyworm)
  "Spodoptera_frugiperda_egg": "알 덩어리 제거.",
  "Spodoptera_frugiperda_larva": "BT제 효과 매우 좋음. 조기 발견이 핵심입니다.",
  "Spodoptera_frugiperda_adult": "성충 트랩으로 산란 억제 가능.",

  // 18. 이십팔점박이무당벌레
  "Henosepilachna_vigintioctopunctata_egg": "알은 바로 제거하세요.",
  "Henosepilachna_vigintioctopunctata_larva": "유충은 손으로 쉽게 제거 가능.",
  "Henosepilachna_vigintioctopunctata_adult": "성충은 잎을 많이 갉으므로 바로 제거해야 합니다.",

  // 19. 톱다리개미허리노린재 (Bean Bug)
  "Riptortus_pedestris_egg": "알은 제거.",
  "Riptortus_pedestris_larva": "유충은 물 세척으로 비교적 쉽게 제거됨.",
  "Riptortus_pedestris_adult": "성충은 잡기 쉽고, 방치 시 번식 빠르므로 즉시 제거 필요.",

  // 20. 파밤나방 (Beet Armyworm)
  "Spodoptera_exigua_egg": "알 덩어리 제거.",
  "Spodoptera_exigua_larva": "유충은 BT제 매우 효과적.",
  "Spodoptera_exigua_adult": "성충 트랩으로 관리.",

  "default": "전문가와 상담 후 적절한 방제법을 선택하세요."
};

// 병충해 분석 함수
async function analyzePest(imageFile) {
  const formData = new FormData()
  formData.append("file", imageFile)

  try {
    const response = await fetch(PEST_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`병충해 API 서버 오류: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("🐛 병충해 AI 원본 응답:", data)

    if (data.predictions && data.predictions.length > 0) {
      const firstPrediction = data.predictions[0]
      const className = firstPrediction.class_name

      const krName = PEST_DICT[className] || PEST_DICT.default

      return {
        className,
        krName,
        confidence: firstPrediction.confidence,
        bbox: firstPrediction.bbox
      }
    } else {
      return {
        className: 'none',
        krName: "탐지된 병충해 없음",
        confidence: 0,
        bbox: null
      }
    }
  } catch (err) {
    console.error("❌ 병충해 AI 판별 실패:", err)
    return {
      className: 'error',
      krName: "판별 오류 (네트워크 확인 필요)",
      confidence: 0,
      bbox: null
    }
  }
}

// 생육 분석 함수
async function analyzeGrowth(imageFile) {
  const formData = new FormData()
  formData.append("file", imageFile)

  try {
    const response = await fetch(GROWTH_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`생육 API 서버 오류: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("🌿 생육 분석 원본 응답:", data)

    // 케이스 1: predictions 배열 구조
    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0]
      
      return {
        organ: ORGAN_DICT[prediction.organ] || prediction.organ,
        stage: STAGE_DICT[prediction.stage] || prediction.stage,
        organConfidence: prediction.organ_confidence,
        stageConfidence: prediction.stage_confidence
      }
    }
    
    // 케이스 2: 직접 구조
    if (data.organ && data.stage) {
      return {
        organ: ORGAN_DICT[data.organ] || data.organ,
        stage: STAGE_DICT[data.stage] || data.stage,
        organConfidence: data.organ_confidence,
        stageConfidence: data.stage_confidence
      }
    }
    
    // 탐지 안 됨
    console.warn("⚠️ 생육 분석 결과 없음")
    return null

  } catch (err) {
    console.error("❌ 생육 분석 실패:", err)
    return null
  }
}

const togglePestDetail = () => {
  showPestDetail.value = !showPestDetail.value
}

const toggleOrganDetail = () => {
  showOrganDetail.value = !showOrganDetail.value
}

const toggleStageDetail = () => {
  showStageDetail.value = !showStageDetail.value
}

const getStageTip = (stage) => {
  const tips = {
    '파종기 (새싹)': '충분한 수분과 온화한 온도를 유지해주세요.',
    '성장기 (영양생장)': '비료를 적절히 공급하고 병충해를 예방하세요.',
    '개화/결실기': '물 관리에 신경쓰고 과습을 피해주세요.'
  }
  return tips[stage] || '현재 단계에 맞는 관리를 계속하세요.'
}

// 병충해별 대응 방법
const getPestSolution = (className) => {
  return PEST_SOLUTION[className] || PEST_SOLUTION.default
}

const openCamera = () => {
  showCameraChoice.value = true
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

const handleImageFile = async (file) => {
  if (!file) return

  console.log('📸 이미지 선택됨:', file.name, `크기: ${(file.size / 1024).toFixed(1)}KB`)

  showCameraChoice.value = false
  analyzingPest.value = true
  pestError.value = ''
  pestResult.value = null
  growthResult.value = null

  try {
    console.log('🚀 API 호출 시작...')
    
    // 병렬로 두 API 동시 호출
    const [pestRes, growthRes] = await Promise.all([
      analyzePest(file),
      analyzeGrowth(file)
    ])

    console.log('✅ API 호출 완료')
    console.log('🐛 병충해 결과:', pestRes)
    console.log('🌿 생육 결과:', growthRes)

    pestResult.value = pestRes
    growthResult.value = growthRes

    // 둘 다 실패했을 때만 에러 표시
    if (pestRes.className === 'error' && !growthRes) {
      alert('❌ 분석에 실패했습니다.\n네트워크 연결을 확인하고 다시 시도해주세요.')
      analyzingPest.value = false
      return
    }

    // 성공 시 모달 표시
    showPestResult.value = true

  } catch (err) {
    console.error('💥 분석 중 예외 발생:', err)
    alert('분석 중 오류가 발생했습니다.\n' + err.message)
  } finally {
    analyzingPest.value = false
  }
}

const closePestResult = () => {
  showPestResult.value = false
  showPestDetail.value = false
  showOrganDetail.value = false
  showStageDetail.value = false
  pestResult.value = null
  growthResult.value = null
}

// 분석 결과 저장 (나중에 Supabase에 저장 가능)
const saveAnalysisResult = () => {
  console.log('분석 결과 저장:', pestResult.value)
  alert('분석 결과가 저장되었습니다!')
  closePestResult()
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
  align-items: center;
  justify-content: center;
}

.camera-choice-sheet {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.camera-choice-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  text-align: center;
}

.camera-choice-btn {
  width: 100%;
  padding: 14px;
  margin-bottom: 8px;
  border-radius: 10px;
  border: none;
  background: #eef2e6;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.camera-choice-btn:hover {
  background: #dfe7d6;
}

.camera-choice-btn:active {
  background: #cbd5c0;
}

.camera-choice-cancel {
  width: 100%;
  padding: 12px;
  margin-top: 4px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #7f8c8d;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.camera-choice-cancel:hover {
  color: #2c3e50;
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

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.result-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.result-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-result-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
}

.result-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 분석 카드 공통 스타일 */
.result-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  background: #eef2e6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-icon {
  font-size: 20px;
}

.card-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

.expand-icon {
  font-size: 12px;
  color: #7f8c8d;
}

.card-summary {
  padding-left: 28px;
}

.pest-name, .organ-name, .stage-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.confidence {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

/* 상세 정보 */
.card-detail {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #4a6444;
}

.detail-label {
  font-size: 12px;
  color: #7f8c8d;
  margin: 8px 0 4px 0;
  font-weight: 600;
}

.detail-label:first-child {
  margin-top: 0;
}

.detail-value {
  font-size: 13px;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

/* 카드별 색상 구분 */
.pest-card {
  border-left: 4px solid #ff6b6b;
}

.organ-card {
  border-left: 4px solid #4ecdc4;
}

.stage-card {
  border-left: 4px solid #95e1d3;
}

/* 저장 버튼 */
.save-result-btn {
  margin: 16px;
  padding: 14px;
  background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.save-result-btn:hover {
  transform: translateY(-1px);
}

.save-result-btn:active {
  transform: translateY(0);
}
</style>