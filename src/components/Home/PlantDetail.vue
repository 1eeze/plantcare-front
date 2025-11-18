<template>
  <div class="plant-detail-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>식물 정보를 불러오는 중...</p>
    </div>

    <!-- 식물 정보 -->
    <div v-else-if="plant" class="plant-detail">
      <!-- 상단 헤더 -->
      <div class="header">
        <button class="back-btn" @click="$router.back()" aria-label="뒤로가기">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="header-title">식물 상세 정보</h2>
      </div>

      <!-- 식물 이미지 -->
      <div class="plant-image-section">
        <img :src="plant.image" :alt="plant.name" class="plant-main-image" />
        <div class="image-overlay">
          <span class="plant-name">{{ plant.name }}</span>
          <span class="plant-location" v-if="plant.location">📍 {{ plant.location }}</span>
        </div>
      </div>

      <!-- 식물 기본 정보 카드 -->
      <div class="info-card">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">등록일</span>
            <span class="info-value">{{ formatDate(plant.created_at) }}</span>
          </div>
          <div class="info-item">
            <div class="info-item">
            <span class="info-label">키운 기간</span>
            <span class="info-value">{{ calculateDaysOwned(plant.created_at) }}일</span>
          </div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">상태</span>
            <span class="info-value" :class="getStatusClass(plant.status)">{{ plant.status }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">최근 업데이트</span>
            <span class="info-value">{{ formatDateTime(plant.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 현재 센서 값 요약 -->
      <div class="sensor-summary">
        <h3 class="section-title">현재 환경 상태</h3>
        <div class="sensor-grid">
          <div class="sensor-card" :class="getSensorStatusClass('humidity', currentSensorValues.humidity)">
            <div class="sensor-icon">💧</div>
            <div class="sensor-info">
              <span class="sensor-label">토양 습도</span>
              <span class="sensor-value">{{ currentSensorValues.humidity?.toFixed(1) ?? '-' }}%</span>
              <span class="sensor-status">{{ getSensorStatusText('humidity', currentSensorValues.humidity) }}</span>
            </div>
          </div>

          <div class="sensor-card" :class="getSensorStatusClass('light', currentSensorValues.light)">
            <div class="sensor-icon">☀️</div>
            <div class="sensor-info">
              <span class="sensor-label">조도</span>
              <span class="sensor-value">{{ currentSensorValues.light?.toFixed(1) ?? '-' }}%</span>
              <span class="sensor-status">{{ getSensorStatusText('light', currentSensorValues.light) }}</span>
            </div>
          </div>

          <div class="sensor-card" :class="getSensorStatusClass('temp', currentSensorValues.temp)">
            <div class="sensor-icon">🌡️</div>
            <div class="sensor-info">
              <span class="sensor-label">온도</span>
              <span class="sensor-value">{{ currentSensorValues.temp?.toFixed(1) ?? '-' }}°C</span>
              <span class="sensor-status">{{ getSensorStatusText('temp', currentSensorValues.temp) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 센서 데이터 그래프 -->
      <div class="chart-section">
        <h3 class="section-title">센서 데이터 추이</h3>

        <!-- 습도 차트 -->
        <div class="chart-card">
          <h4>💧 토양 습도</h4>
          <apexchart
            v-if="humidityChartData.length > 0"
            type="line"
            height="200"
            :options="getChartOptions('습도 (%)', '#3498db')"
            :series="[{ name: '습도', data: humidityChartData }]"
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
            :options="getChartOptions('조도 (%)', '#f39c12')"
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

      <!-- 센서 데이터 테이블 -->
      <div class="table-section">
        <h3 class="section-title">최근 센서 데이터 (최대 10개)</h3>
        <div class="table-container">
          <table class="sensor-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>토양 습도</th>
                <th>조도</th>
                <th>온도</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in recentSensorData" :key="index">
                <td>{{ formatDateTime(row.timestamp) }}</td>
                <td>{{ row.humidity?.toFixed(1) ?? '-' }}%</td>
                <td>{{ row.light?.toFixed(1) ?? '-' }}%</td>
                <td>{{ row.temp?.toFixed(1) ?? '-' }}°C</td>
              </tr>
            </tbody>
          </table>
          <p v-if="recentSensorData.length === 0" class="no-data">센서 데이터가 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else class="error-state">
      <div class="error-icon">🌱</div>
      <h3>식물을 찾을 수 없습니다</h3>
      <p>식물 정보를 불러올 수 없거나 존재하지 않는 식물입니다.</p>
      <button class="back-home-btn" @click="$router.push({ name: 'HomePage' })">
        홈으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'
import plantPic from '../../assets/plant.png'

const route = useRoute()
const plantId = route.params.id

const loading = ref(true)
const plant = ref(null)
const sensorData = ref(null)

// 센서 데이터 로드
const loadPlantData = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('사용자 인증 필요')
      return
    }

    // 식물 정보와 센서 데이터 JOIN하여 가져오기
    const { data, error } = await supabase
      .from('User_Plants')
      .select(`
        id, name, locate, photos, created_at, updated_at,
        sensor_data:sensor_data!User_Plants_sensor_data_fkey (
          humidity, temp, light
        )
      `)
      .eq('id', plantId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('식물 데이터 로드 실패:', error)
      plant.value = null
      return
    }

    if (!data) {
      plant.value = null
      return
    }

    // 센서 데이터에서 최신 값 추출
    const sensorDataRaw = data.sensor_data
    const latestHumidity = sensorDataRaw?.humidity?.[0]?.value
    const latestLight = sensorDataRaw?.light?.[0]?.value
    const latestTemp = sensorDataRaw?.temp?.[0]?.value

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
      id: data.id,
      name: data.name || '이름 없음',
      location: data.locate,
      image: (data.photos && data.photos[0]?.url) || plantPic,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: status
    }

    sensorData.value = sensorDataRaw

    console.log('로드된 식물 데이터:', plant.value)
    console.log('로드된 센서 데이터:', sensorData.value)

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

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// 키운 기간 계산
const calculateDaysOwned = (createdAt) => {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  const now = new Date()
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
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

const getStatusClass = (status) => {
  if (status.includes('부족') || status.includes('낮음') || status.includes('높음')) {
    return 'status-warning'
  }
  return 'status-good'
}

onMounted(() => {
  loadPlantData()
})
</script>

<style scoped>
.plant-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  padding-bottom: 80px;
}

/* 로딩 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #568265;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* 식물 이미지 */
.plant-image-section {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.plant-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 20px;
  color: white;
}

.plant-name {
  display: block;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.plant-location {
  font-size: 14px;
  opacity: 0.9;
}

/* 정보 카드 */
.info-card {
  margin: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.info-value.status-good {
  color: #27ae60;
}

.info-value.status-warning {
  color: #f39c12;
}

/* 섹션 제목 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

/* 센서 요약 */
.sensor-summary {
  margin: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.sensor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.sensor-card.status-good {
  border-color: #27ae60;
  background: #eafaf1;
}

.sensor-card.status-warning {
  border-color: #f39c12;
  background: #fef9e7;
}

.sensor-card.status-danger {
  border-color: #e74c3c;
  background: #fdecea;
}

.sensor-card.status-unknown {
  border-color: #95a5a6;
  background: #f8f9fa;
}

.sensor-icon {
  font-size: 28px;
}

.sensor-info {
  flex: 1;
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
  font-size: 18px;
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

.no-data {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 에러 상태 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.error-state p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.back-home-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

@media (max-width: 480px) {
  .sensor-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
