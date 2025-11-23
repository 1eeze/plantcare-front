<template>
  <div class="plant-detail-page">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>식물 정보를 불러오는 중...</p>
    </div>

    <!-- 식물 정보 있을 때 -->
    <div v-else-if="plant" class="plant-detail">
      <!-- 상단 헤더 -->
      <div class="header">
        <button @click="goBack" class="back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="header-title">식물 상세</h1>
        <button @click="confirmDelete" class="delete-btn" title="식물 삭제">
          🗑️
        </button>
      </div>

      <!-- 식물 이미지 -->
      <div class="plant-image-section">
        <img :src="plant.image" :alt="plant.name" class="plant-image" />
        <div class="image-overlay">
          <span class="updated-badge">
            마지막 업데이트: {{ formatDate(plant.updated_at) }}
          </span>
        </div>
      </div>

      <!-- 식물 기본 정보 -->
      <div class="plant-info-card">
        <div class="info-header">
          <div>
            <h2 class="plant-name">{{ plant.name }}</h2>
            <p class="plant-location">📍 {{ plant.location }}</p>
          </div>
          <div class="status-badge" :class="getStatusClass(plant.status)">
            {{ plant.status }}
          </div>
        </div>

        <!-- 현재 센서 값 요약 -->
        <div class="sensor-grid">
          <div class="sensor-item" :class="getSensorStatusClass('humidity', currentSensorValues.humidity)">
            <div class="sensor-icon">💧</div>
            <div class="sensor-info">
              <span class="sensor-label">대기 습도</span>
              <span class="sensor-value">{{ currentSensorValues.humidity?.toFixed(1) ?? '-' }}%</span>
              <span class="sensor-status">{{ getSensorStatusText('humidity', currentSensorValues.humidity) }}</span>
            </div>
          </div>

          <div class="sensor-item" :class="getSensorStatusClass('light', currentSensorValues.light)">
            <div class="sensor-icon">☀️</div>
            <div class="sensor-info">
              <span class="sensor-label">조도</span>
              <span class="sensor-value">{{ currentSensorValues.light?.toFixed(1) ?? '-' }} lux</span>
              <span class="sensor-status">{{ getSensorStatusText('light', currentSensorValues.light) }}</span>
            </div>
          </div>

          <div class="sensor-item" :class="getSensorStatusClass('temp', currentSensorValues.temp)">
            <div class="sensor-icon">🌡️</div>
            <div class="sensor-info">
              <span class="sensor-label">온도</span>
              <span class="sensor-value">{{ currentSensorValues.temp?.toFixed(1) ?? '-' }}°C</span>
              <span class="sensor-status">{{ getSensorStatusText('temp', currentSensorValues.temp) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 식물 종 정보 -->
      <div v-if="plant.speciesData" class="species-info-card">
        <h3 class="section-title">🌿 식물 종 정보</h3>
        <div class="species-content">
          <div class="species-name-section">
            <span class="species-label">식물명</span>
            <span class="species-name">{{ plant.speciesData.name || '정보 없음' }}</span>
          </div>

          <div v-if="plant.speciesData.data" class="species-description">
            <span class="species-label">설명</span>
            <p class="species-text">{{ plant.speciesData.data }}</p>
          </div>

          <!-- 적정 환경 범위 -->
          <div v-if="plant.speciesData.sensor_data_range" class="optimal-range-section">
            <h4 class="subsection-title">적정 환경 범위</h4>

            <!-- 온도 -->
            <div v-if="plant.speciesData.sensor_data_range.temp && plant.speciesData.sensor_data_range.temp.length > 0" class="range-card">
              <div class="range-header">
                <span class="range-icon">🌡️</span>
                <span class="range-label">온도</span>
              </div>
              <div class="range-values">
                <div class="range-item">
                  <span class="range-key">최소</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.temp[0].min }}°C</span>
                </div>
                <div class="range-item best">
                  <span class="range-key">최적</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.temp[0].best }}°C</span>
                </div>
                <div class="range-item">
                  <span class="range-key">최대</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.temp[0].max }}°C</span>
                </div>
              </div>
            </div>

            <!-- 대기 습도 -->
            <div v-if="plant.speciesData.sensor_data_range.humidity && plant.speciesData.sensor_data_range.humidity.length > 0" class="range-card">
              <div class="range-header">
                <span class="range-icon">💧</span>
                <span class="range-label">대기 습도</span>
              </div>
              <div class="range-values">
                <div class="range-item">
                  <span class="range-key">최소</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.humidity[0].min }}%</span>
                </div>
                <div class="range-item best">
                  <span class="range-key">최적</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.humidity[0].best }}%</span>
                </div>
                <div class="range-item">
                  <span class="range-key">최대</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.humidity[0].max }}%</span>
                </div>
              </div>
            </div>

            <!-- 토양 습도 -->
            <div v-if="plant.speciesData.sensor_data_range.earth_humidity && plant.speciesData.sensor_data_range.earth_humidity.length > 0" class="range-card">
              <div class="range-header">
                <span class="range-icon">🌱</span>
                <span class="range-label">토양 습도</span>
              </div>
              <div class="range-values">
                <div class="range-item">
                  <span class="range-key">최소</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.earth_humidity[0].min }}%</span>
                </div>
                <div class="range-item best">
                  <span class="range-key">최적</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.earth_humidity[0].best }}%</span>
                </div>
                <div class="range-item">
                  <span class="range-key">최대</span>
                  <span class="range-value">{{ plant.speciesData.sensor_data_range.earth_humidity[0].max }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 식물 종 정보 없음 -->
      <div v-else class="no-species-info">
        <p>🌿 이 식물의 종 정보가 등록되지 않았습니다</p>
      </div>

      <!-- 센서 데이터 그래프 -->
      <div class="chart-section">
        <h3 class="section-title">센서 데이터 추이</h3>

        <!-- 습도 차트 -->
        <div class="chart-card">
          <h4>💧 대기 습도</h4>
          <apexchart
            v-if="humidityChartData.length > 0"
            type="line"
            height="200"
            :options="getChartOptions('습도 (%)', '#3498db')"
            :series="[{ name: '대기 습도', data: humidityChartData }]"
          ></apexchart>
          <p v-else class="no-data">데이터가 없습니다</p>
        </div>

        <!-- 조도 차트 -->
        <div class="chart-card">
          <h4>☀️ 조도</h4>
          <apexchart
            v-if="lightChartData.length > 0"
            type="line"
            height="200"
            :options="getChartOptions('조도 (lux)', '#f39c12')"
            :series="[{ name: '조도', data: lightChartData }]"
          ></apexchart>
          <p v-else class="no-data">데이터가 없습니다</p>
        </div>

        <!-- 온도 차트 -->
        <div class="chart-card">
          <h4>🌡️ 온도</h4>
          <apexchart
            v-if="tempChartData.length > 0"
            type="line"
            height="200"
            :options="getChartOptions('온도 (°C)', '#e74c3c')"
            :series="[{ name: '온도', data: tempChartData }]"
          ></apexchart>
          <p v-else class="no-data">데이터가 없습니다</p>
        </div>
      </div>

      <!-- 관리 액션 -->
      <div class="care-section">
        <h3 class="section-title">식물 관리</h3>
        <div class="care-actions">
          <button class="care-action-btn" @click="waterPlant">
            <span class="action-icon">💧</span>
            <span class="action-text">물주기</span>
          </button>
          <button class="care-action-btn" @click="analyzePlant">
            <span class="action-icon">🔬</span>
            <span class="action-text">AI 분석</span>
          </button>
          <button class="care-action-btn" @click="editPlant">
            <span class="action-icon">✏️</span>
            <span class="action-text">정보 수정</span>
          </button>
        </div>
      </div>

      <!-- 센서 데이터 테이블 -->
      <div class="table-section">
        <h3 class="section-title">최근 센서 데이터 (최대 10개)</h3>
        <div class="table-container">
          <table class="sensor-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>대기 습도</th>
                <th>조도</th>
                <th>온도</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in recentSensorData" :key="index">
                <td>{{ formatDateTime(row.timestamp) }}</td>
                <td>{{ row.humidity?.toFixed(1) ?? '-' }}%</td>
                <td>{{ row.light?.toFixed(1) ?? '-' }} lux</td>
                <td>{{ row.temp?.toFixed(1) ?? '-' }}°C</td>
              </tr>
            </tbody>
          </table>
          <p v-if="recentSensorData.length === 0" class="no-data">센서 데이터가 없습니다</p>
        </div>
      </div>

      <!-- 관리 히스토리 -->
      <div class="history-section">
        <div class="history-header">
          <h3 class="section-title">관리 기록</h3>
          <button class="view-all-btn" @click="viewAllHistory">
            전체보기 →
          </button>
        </div>
        <div class="history-list">
          <div class="history-item" v-for="record in recentHistory" :key="record.id">
            <div class="history-icon">{{ record.icon }}</div>
            <div class="history-info">
              <p class="history-action">{{ record.action }}</p>
              <p class="history-date">{{ formatDate(record.date) }}</p>
            </div>
          </div>
          <div v-if="recentHistory.length === 0" class="no-history">
            <p>아직 관리 기록이 없습니다</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 식물을 찾을 수 없을 때 -->
    <div v-else class="not-found">
      <div class="not-found-content">
        <span class="not-found-icon">🌱</span>
        <h3>식물을 찾을 수 없습니다</h3>
        <p>삭제되었거나 존재하지 않는 식물입니다.</p>
        <button @click="goBack" class="go-back-btn">
          돌아가기
        </button>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">⚠️</div>
        <h3 class="modal-title">정말 삭제하시겠습니까?</h3>
        <p class="modal-message">
          <strong>{{ plant?.name }}</strong>의 모든 정보와<br/>
          관리 기록이 영구적으로 삭제됩니다.
        </p>
        <div class="modal-actions">
          <button 
            @click="showDeleteConfirm = false" 
            class="modal-btn cancel-btn"
            :disabled="deleting"
          >
            취소
          </button>
          <button 
            @click="deletePlant" 
            class="modal-btn delete-btn"
            :disabled="deleting"
          >
            {{ deleting ? '삭제 중...' : '삭제하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'
import plantPic from '../../assets/plant.png'

const route = useRoute()
const router = useRouter()

const plantId = route.params.id
const plant = ref(null)
const sensorData = ref(null)
const loading = ref(true)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

// 최근 관리 기록
const recentHistory = ref([
  { id: 1, action: '물주기 완료', icon: '💧', date: new Date().toISOString() },
  { id: 2, action: 'AI 분석 완료', icon: '🔬', date: new Date(Date.now() - 86400000).toISOString() },
])

// 센서 데이터 로드 (첫 번째 코드 로직)
const loadPlantData = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 1단계: User_Plants에서 식물 정보 가져오기 (plant_data_id 포함)
    const { data: plantData, error: plantError } = await supabase
      .from('User_Plants')
      .select('id, name, locate, photos, created_at, updated_at, plant_data_id')
      .eq('id', plantId)
      .eq('user_id', user.id)
      .single()

    console.log('=== PlantDetail 데이터 로드 ===')
    console.log('1. plantId:', plantId)
    console.log('2. user.id:', user.id)
    console.log('3. User_Plants 데이터:', plantData)
    console.log('4. User_Plants 에러:', plantError)

    if (plantError) {
      console.error('식물 데이터 로드 실패:', plantError)
      plant.value = null
      return
    }

    if (!plantData) {
      console.log('plantData가 null입니다')
      plant.value = null
      return
    }

    // 2단계: plant_data_id가 있으면 plants_data에서 식물 정보 가져오기
    let plantSpeciesData = null
    if (plantData.plant_data_id) {
      console.log('5. plants_data 조회 시작 - plant_data_id:', plantData.plant_data_id)
      const { data: speciesData, error: speciesError } = await supabase
        .from('plants_data')
        .select('plant_data_id, name, sensor_data_range, data')
        .eq('plant_data_id', plantData.plant_data_id)
        .maybeSingle()

      console.log('6. plants_data 응답:', speciesData)
      console.log('7. plants_data 에러:', speciesError)

      if (!speciesError && speciesData) {
        plantSpeciesData = speciesData
      } else if (speciesError && speciesError.code !== 'PGRST116') {
        console.error('plants_data 조회 중 예상치 못한 오류:', speciesError)
      } else if (!speciesData) {
        console.log('plants_data에 해당 plant_data_id의 데이터가 없습니다')
      }
    }

    // 3단계: sensor_data 테이블에서 센서 데이터 가져오기
    console.log('8. sensor_data 테이블 조회 시작 - plant_id:', plantId)
    const { data: sensorDataRaw, error: sensorError } = await supabase
      .from('sensor_data')
      .select('humidity, temp, light, plant_id')
      .eq('plant_id', plantId)
      .single()

    console.log('9. sensor_data 응답:', sensorDataRaw)
    console.log('10. sensor_data 에러:', sensorError)

    if (sensorError) {
      console.error('센서 데이터 로드 실패:', sensorError)
    }

    if (sensorDataRaw) {
      console.log('11. humidity 데이터:', sensorDataRaw.humidity)
      console.log('12. temp 데이터:', sensorDataRaw.temp)
      console.log('13. light 데이터:', sensorDataRaw.light)
    }

    // 센서 데이터에서 최신 값 추출
    const latestHumidity = sensorDataRaw?.humidity?.[0]?.value
    const latestLight = sensorDataRaw?.light?.[0]?.value
    const latestTemp = sensorDataRaw?.temp?.[0]?.value

    console.log('14. 최신 습도:', latestHumidity)
    console.log('15. 최신 조도:', latestLight)
    console.log('16. 최신 온도:', latestTemp)

    // 식물 상태 계산
    let status = '상태 양호'
    if (latestHumidity !== undefined && latestHumidity < 30) {
      status = '물 부족'
    } else if (latestLight !== undefined && latestLight < 40) {
      status = '빛 부족'
    } else if (latestTemp !== undefined && latestTemp < 15) {
      status = '온도 낮음'
    } else if (latestTemp !== undefined && latestTemp > 30) {
      status = '온도 높음'
    }

    plant.value = {
      id: plantData.id,
      name: plantData.name || '이름 없음',
      location: plantData.locate || '위치 미설정',
      image: (plantData.photos && plantData.photos[0]?.url) || plantPic,
      created_at: plantData.created_at,
      updated_at: plantData.updated_at,
      status: status,
      speciesData: plantSpeciesData // plants_data 정보 추가
    }

    sensorData.value = sensorDataRaw

    console.log('17. 로드된 식물 데이터:', plant.value)
    console.log('18. 로드된 센서 데이터:', sensorData.value)
    console.log('19. 식물 종 데이터:', plantSpeciesData)

  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
  } finally {
    loading.value = false
  }
}

// 현재 센서 값 (최신 데이터)
const currentSensorValues = computed(() => {
  if (!sensorData.value) {
    return { humidity: null, light: null, temp: null }
  }

  const getLatest = (arr) => arr && Array.isArray(arr) && arr.length > 0 ? arr[0]?.value : null

  return {
    humidity: getLatest(sensorData.value.humidity),
    light: getLatest(sensorData.value.light),
    temp: getLatest(sensorData.value.temp)
  }
})

// 차트 데이터 (최대 20개 데이터 포인트)
const humidityChartData = computed(() => {
  if (!sensorData.value?.humidity || !Array.isArray(sensorData.value.humidity)) return []
  return sensorData.value.humidity
    .slice(0, 20)
    .reverse()
    .map(item => ({
      x: new Date(item.timestamp).getTime(),
      y: item.value
    }))
})

const lightChartData = computed(() => {
  if (!sensorData.value?.light || !Array.isArray(sensorData.value.light)) return []
  return sensorData.value.light
    .slice(0, 20)
    .reverse()
    .map(item => ({
      x: new Date(item.timestamp).getTime(),
      y: item.value
    }))
})

const tempChartData = computed(() => {
  if (!sensorData.value?.temp || !Array.isArray(sensorData.value.temp)) return []
  return sensorData.value.temp
    .slice(0, 20)
    .reverse()
    .map(item => ({
      x: new Date(item.timestamp).getTime(),
      y: item.value
    }))
})

// 최근 센서 데이터 테이블용 (최대 10개)
const recentSensorData = computed(() => {
  if (!sensorData.value) return []

  const humidity = sensorData.value.humidity || []
  const light = sensorData.value.light || []
  const temp = sensorData.value.temp || []

  const maxLength = Math.max(humidity.length, light.length, temp.length)
  const rows = []

  for (let i = 0; i < Math.min(maxLength, 10); i++) {
    rows.push({
      timestamp: humidity[i]?.timestamp || light[i]?.timestamp || temp[i]?.timestamp,
      humidity: humidity[i]?.value,
      light: light[i]?.value,
      temp: temp[i]?.value
    })
  }

  return rows
})

// 차트 옵션 생성
const getChartOptions = (yAxisTitle, color) => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: [color],
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeFormatter: {
        hour: 'HH:mm',
        day: 'MM/dd'
      }
    }
  },
  yaxis: {
    title: { text: yAxisTitle }
  },
  tooltip: {
    x: {
      format: 'MM/dd HH:mm'
    }
  },
  grid: {
    borderColor: '#f1f1f1'
  }
})

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '정보 없음'
  
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
  
  return date.toLocaleDateString('ko-KR')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// 센서 상태 클래스
const getSensorStatusClass = (type, value) => {
  if (value === null) return 'status-unknown'

  if (type === 'humidity') {
    if (value < 30) return 'status-danger'
    if (value < 50) return 'status-warning'
    return 'status-good'
  } else if (type === 'light') {
    if (value < 40) return 'status-danger'
    if (value < 60) return 'status-warning'
    return 'status-good'
  } else if (type === 'temp') {
    if (value < 15 || value > 30) return 'status-danger'
    if (value < 18 || value > 28) return 'status-warning'
    return 'status-good'
  }

  return 'status-unknown'
}

const getSensorStatusText = (type, value) => {
  if (value === null) return '데이터 없음'

  if (type === 'humidity') {
    if (value < 30) return '매우 건조'
    if (value < 50) return '건조'
    if (value > 80) return '과습'
    return '적정'
  } else if (type === 'light') {
    if (value < 40) return '어두움'
    if (value < 60) return '보통'
    return '밝음'
  } else if (type === 'temp') {
    if (value < 15) return '추움'
    if (value > 30) return '더움'
    if (value < 18 || value > 28) return '주의'
    return '적정'
  }

  return '-'
}

// 상태 클래스
const getStatusClass = (status) => {
  if (status?.includes('부족') || status?.includes('낮음') || status?.includes('높음')) {
    return 'status-warning'
  }
  return 'status-good'
}

// 삭제 확인
const confirmDelete = () => {
  showDeleteConfirm.value = true
}

// 실제 삭제
const deletePlant = async () => {
  if (deleting.value) return

  deleting.value = true

  try {
    const { error } = await supabase
      .from('User_Plants')
      .delete()
      .eq('id', plantId)

    if (error) throw error

    alert('✅ 식물이 삭제되었습니다.')
    router.push('/')

  } catch (err) {
    console.error('삭제 실패:', err)
    alert('❌ 삭제 중 오류가 발생했습니다.')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

// 액션 함수들
const goBack = () => {
  router.back()
}

const waterPlant = () => {
  alert('💧 물주기 기능은 개발 중입니다!')
}

const analyzePlant = () => {
  alert('🔬 AI 분석 기능은 개발 중입니다!')
}

const editPlant = () => {
  router.push(`/edit-plant/${plantId}`)
}

const viewAllHistory = () => {
  alert('📜 전체 기록 보기 기능은 개발 중입니다!')
}

// 컴포넌트 마운트
onMounted(() => {
  loadPlantData()
})
</script>

<style scoped>
.plant-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  font-family: 'Noto Sans KR', sans-serif;
  padding-bottom: 80px;
}

/* 로딩 */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #cbd5c0;
  border-top-color: #4a6444;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #2c3e50;
  transition: transform 0.2s;
}

.back-btn:active {
  transform: scale(0.95);
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s;
}

.delete-btn:active {
  transform: scale(0.95);
}

/* 이미지 섹션 */
.plant-image-section {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

.updated-badge {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

/* 식물 정보 카드 */
.plant-info-card {
  background: white;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.plant-name {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.plant-location {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-good {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

/* 센서 그리드 */
.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.sensor-item.status-good {
  border-color: #27ae60;
  background: #eafaf1;
}

.sensor-item.status-warning {
  border-color: #f39c12;
  background: #fef9e7;
}

.sensor-item.status-danger {
  border-color: #e74c3c;
  background: #fdecea;
}

.sensor-item.status-unknown {
  border-color: #95a5a6;
  background: #f8f9fa;
}

.sensor-icon {
  font-size: 24px;
}

.sensor-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sensor-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.sensor-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.sensor-status {
  font-size: 10px;
  font-weight: 600;
  color: #666;
}

/* 차트 섹션 */
.chart-section {
  margin: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.chart-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 관리 섹션 */
.care-section {
  margin: 0 20px 20px;
}

.care-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.care-action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.care-action-btn:active {
  transform: translateY(1px);
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 13px;
  font-weight: 500;
  color: #2c3e50;
}

/* 테이블 섹션 */
.table-section {
  margin: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

.sensor-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sensor-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.sensor-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.sensor-table tr:hover {
  background: #f8f9fa;
}

/* 히스토리 */
.history-section {
  background: white;
  margin: 0 20px 20px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.view-all-btn {
  background: none;
  border: none;
  color: #4a6444;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
}

.history-icon {
  font-size: 24px;
}

.history-info {
  flex: 1;
}

.history-action {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.history-date {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

.no-history {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

/* Not Found */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.not-found-content {
  text-align: center;
}

.not-found-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.not-found-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2c3e50;
}

.not-found-content p {
  margin: 0 0 24px 0;
  color: #7f8c8d;
}

.go-back-btn {
  padding: 12px 24px;
  background: #4a6444;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* 삭제 확인 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 24px;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-message {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f8f9fa;
  color: #2c3e50;
}

.delete-btn {
  background: #ff4757;
  color: white;
}

.delete-btn:not(:disabled):hover {
  background: #ff3838;
}

/* 식물 종 정보 카드 */
.species-info-card {
  background: white;
  margin: 16px 20px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.species-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.species-name-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.species-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.species-name {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.species-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.species-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

.optimal-range-section {
  margin-top: 8px;
}

.subsection-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.range-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.range-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.range-icon {
  font-size: 20px;
}

.range-label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.range-values {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.range-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.range-item.best {
  border-color: #4caf50;
  background: #e8f5e9;
}

.range-key {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.range-value {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
}

.range-item.best .range-value {
  color: #2e7d32;
}

/* 식물 종 정보 없음 */
.no-species-info {
  background: #f8f9fa;
  margin: 16px 20px;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
}

.no-species-info p {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
}

@media (max-width: 480px) {
  .sensor-grid {
    grid-template-columns: 1fr 1fr;
  }

  .care-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>