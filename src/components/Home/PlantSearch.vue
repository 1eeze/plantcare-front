<template>
  <div class="plant-search-page">
    <!-- 헤더 -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <h1 class="header-title">식물 검색</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- 검색 입력 -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="식물 이름을 입력하세요 (예: 몬스테라, 스킨답서스)"
          class="search-input"
          @keyup.enter="searchPlant"
          :disabled="loading"
        />
        <button
          @click="searchPlant"
          class="search-btn"
          :disabled="loading || !searchQuery.trim()"
        >
          <span v-if="loading">🔄</span>
          <span v-else>🔍</span>
        </button>
      </div>
      <p class="search-hint">💡 한글 또는 영문 이름으로 검색할 수 있습니다</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-large"></div>
      <p class="loading-text">식물 정보를 검색하는 중...</p>
      <p class="loading-subtext">최대 30초 정도 소요될 수 있습니다</p>
    </div>

    <!-- 검색 결과 -->
    <div v-else-if="searchResult" class="result-container">
      <div class="result-card">
        <div class="result-header">
          <h2 class="result-title">{{ searchResult.name_ko }}</h2>
          <span class="result-badge">{{ searchResult.from === 'external' ? '외부 API' : 'DB' }}</span>
        </div>

        <!-- 식물 정보 -->
        <div class="info-section">
          <h3 class="section-title">📝 식물 정보</h3>
          <p class="info-text">{{ searchResult.information || '정보가 없습니다' }}</p>
        </div>

        <!-- 센서 데이터 범위 -->
        <div v-if="searchResult.sensor_data_range" class="sensor-range-section">
          <h3 class="section-title">🌡️ 적정 환경</h3>

          <!-- 온도 -->
          <div v-if="searchResult.sensor_data_range.temp && searchResult.sensor_data_range.temp.length > 0" class="range-card">
            <div class="range-header">
              <span class="range-icon">🌡️</span>
              <span class="range-label">온도</span>
            </div>
            <div class="range-values">
              <div class="range-item">
                <span class="range-key">최소</span>
                <span class="range-value">{{ searchResult.sensor_data_range.temp[0].min }}°C</span>
              </div>
              <div class="range-item best">
                <span class="range-key">최적</span>
                <span class="range-value">{{ searchResult.sensor_data_range.temp[0].best }}°C</span>
              </div>
              <div class="range-item">
                <span class="range-key">최대</span>
                <span class="range-value">{{ searchResult.sensor_data_range.temp[0].max }}°C</span>
              </div>
            </div>
          </div>

          <!-- 대기 습도 -->
          <div v-if="searchResult.sensor_data_range.humidity && searchResult.sensor_data_range.humidity.length > 0" class="range-card">
            <div class="range-header">
              <span class="range-icon">💧</span>
              <span class="range-label">대기 습도</span>
            </div>
            <div class="range-values">
              <div class="range-item">
                <span class="range-key">최소</span>
                <span class="range-value">{{ searchResult.sensor_data_range.humidity[0].min }}%</span>
              </div>
              <div class="range-item best">
                <span class="range-key">최적</span>
                <span class="range-value">{{ searchResult.sensor_data_range.humidity[0].best }}%</span>
              </div>
              <div class="range-item">
                <span class="range-key">최대</span>
                <span class="range-value">{{ searchResult.sensor_data_range.humidity[0].max }}%</span>
              </div>
            </div>
          </div>

          <!-- 토양 습도 -->
          <div v-if="searchResult.sensor_data_range.earth_humidity && searchResult.sensor_data_range.earth_humidity.length > 0" class="range-card">
            <div class="range-header">
              <span class="range-icon">🌱</span>
              <span class="range-label">토양 습도</span>
            </div>
            <div class="range-values">
              <div class="range-item">
                <span class="range-key">최소</span>
                <span class="range-value">{{ searchResult.sensor_data_range.earth_humidity[0].min }}%</span>
              </div>
              <div class="range-item best">
                <span class="range-key">최적</span>
                <span class="range-value">{{ searchResult.sensor_data_range.earth_humidity[0].best }}%</span>
              </div>
              <div class="range-item">
                <span class="range-key">최대</span>
                <span class="range-value">{{ searchResult.sensor_data_range.earth_humidity[0].max }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DB ID 정보 -->
        <div v-if="searchResult.plant_data_id" class="db-info">
          <small>🔖 Plant Data ID: {{ searchResult.plant_data_id }}</small>
        </div>
      </div>
    </div>

    <!-- 초기 상태 (검색 전) -->
    <div v-else-if="!hasSearched" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>식물 이름을 검색해보세요</h3>
      <p>검색한 식물의 상세 정보와 적정 환경을 확인할 수 있습니다</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>검색 중 오류가 발생했습니다</h3>
      <p>{{ error }}</p>
      <button @click="searchPlant" class="retry-btn">다시 시도</button>
    </div>

    <!-- 검색 결과 없음 -->
    <div v-else class="no-result-state">
      <div class="no-result-icon">🌿</div>
      <h3>검색 결과가 없습니다</h3>
      <p>"{{ lastSearchQuery }}"에 대한 정보를 찾을 수 없습니다</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const searchQuery = ref('')
const loading = ref(false)
const searchResult = ref(null)
const error = ref(null)
const hasSearched = ref(false)
const lastSearchQuery = ref('')

const goBack = () => {
  router.back()
}

const searchPlant = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  error.value = null
  searchResult.value = null
  hasSearched.value = true
  lastSearchQuery.value = searchQuery.value

  try {
    // 공백과 특수문자 제거
    const plantName = searchQuery.value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '')

    console.log('식물 검색 시작:', plantName)

    // Trefle API 호출
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30초 타임아웃

    const response = await fetch(
      'https://knupbxftazopklvjionb.supabase.co/functions/v1/trefle-api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          plant: plantName
        }),
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('검색 결과:', data)

    // 응답이 results 배열로 오는 경우 처리
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      searchResult.value = data.results[0]
    } else if (data.plant_data_id) {
      // 직접 객체로 오는 경우
      searchResult.value = data
    } else {
      // 결과 없음
      searchResult.value = null
    }

  } catch (err) {
    console.error('식물 검색 실패:', err)

    if (err.name === 'AbortError') {
      error.value = '검색 시간이 초과되었습니다. 다시 시도해주세요.'
    } else {
      error.value = err.message || '알 수 없는 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.plant-search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  padding-bottom: 80px;
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
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.header-spacer {
  width: 40px;
}

/* 검색 섹션 */
.search-section {
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.search-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #568265;
}

.search-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.search-btn {
  padding: 14px 20px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover:not(:disabled) {
  background: #4a7058;
  transform: scale(1.05);
}

.search-btn:disabled {
  background: #cbd5c0;
  cursor: not-allowed;
}

.search-hint {
  margin: 0;
  font-size: 13px;
  color: #666;
}

/* 로딩 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid #cbd5c0;
  border-top-color: #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.loading-subtext {
  margin: 0;
  font-size: 13px;
  color: #666;
}

/* 결과 카드 */
.result-container {
  padding: 0 20px 20px;
}

.result-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.result-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.result-badge {
  padding: 4px 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 섹션 */
.info-section,
.sensor-range-section {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.info-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

/* 센서 범위 카드 */
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

/* DB 정보 */
.db-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
}

/* Empty/Error/No Result States */
.empty-state,
.error-state,
.no-result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon,
.error-icon,
.no-result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3,
.error-state h3,
.no-result-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.empty-state p,
.error-state p,
.no-result-state p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.retry-btn:hover {
  background: #4a7058;
}
</style>
