<template>
  <div class="market-container">
    <!-- 🔍 검색창 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="식물 이름을 검색하세요"
          @keyup.enter="handleSearch"
          @input="onSearchInput"
          :disabled="loading"
          class="search-input"
        />
        <button
          @click="clearSearch"
          v-if="searchQuery"
          class="clear-btn"
          type="button"
          aria-label="검색어 지우기"
        >
          ✕
        </button>
      </div>
      <button
        @click="handleSearch"
        :disabled="loading"
        class="search-btn"
      >
        {{ loading ? '검색중...' : '검색' }}
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>식물 시세 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPlants" class="retry-btn">다시 시도</button>
    </div>

    <!-- 검색 결과 없음 -->
    <div v-else-if="plants.length === 0 && !loading" class="empty-container">
      <p>검색 결과가 없습니다.</p>
      <p class="empty-subtitle">다른 식물 이름으로 검색해보세요.</p>
    </div>

    <!-- 식물 리스트 -->
    <div v-else class="plant-list">
      <div
        class="plant-item"
        v-for="plant in plants"
        :key="plant.plant_data_id"
        @click="goToPlantDetail(plant.plant_data_id)"
      >
        <!-- 왼쪽: 이름 -->
        <div class="plant-left">
          <div class="plant-info">
            <p class="plant-name">{{ plant.name || '이름 없음' }}</p>
            <p class="plant-subtitle" v-if="plant.data">
              {{ truncateText(plant.data, 40) }}
            </p>
          </div>
        </div>

        <!-- 오른쪽: 변동률 + 가격 -->
        <div class="plant-right">
          <p
            v-if="plant.priceChange !== null"
            class="plant-change"
            :class="getPriceChangeClass(plant.priceChange)"
          >
            {{ formatChange(plant.priceChange) }}
          </p>
          <p class="plant-price">{{ formatPrice(plant.avg_price) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

// State
const plants = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)
const searchTimeout = ref(null)

// Methods
const fetchPlants = async () => {
  loading.value = true
  error.value = null

  try {
    let query = supabase
      .from('plants_data')
      .select('plant_data_id, name, data, price_list, "avg.price"')
      .order('name', { ascending: true })

    // 검색어가 있으면 필터링
    if (searchQuery.value.trim()) {
      query = query.ilike('name', `%${searchQuery.value.trim()}%`)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      console.error('plants_data 조회 실패:', fetchError)
      error.value = '식물 시세 정보를 불러오는데 실패했습니다.'
      return
    }

    // 가격 변동률 계산
    plants.value = (data || []).map(plant => {
      const priceList = plant.price_list || []
      let priceChange = null

      // price_list에 2개 이상의 데이터가 있으면 변동률 계산
      if (priceList.length >= 2) {
        // 객체 배열에서 price 추출
        const latest = parseFloat(priceList[priceList.length - 1]?.price)
        const previous = parseFloat(priceList[priceList.length - 2]?.price)
        if (!isNaN(latest) && !isNaN(previous) && previous !== 0) {
          priceChange = (((latest - previous) / previous) * 100).toFixed(1)
        }
      }

      return {
        ...plant,
        avg_price: plant['avg.price'],
        priceChange
      }
    })

    console.log('불러온 식물 시세 데이터:', plants.value)

  } catch (err) {
    console.error('데이터 로드 중 오류:', err)
    error.value = '데이터를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  fetchPlants()
}

const onSearchInput = () => {
  // 디바운싱: 500ms 후에 자동 검색
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    fetchPlants()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchPlants()
}

const goToPlantDetail = (plantId) => {
  router.push(`/marketprice/plant/${plantId}`)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return '시세 정보 없음'
  const num = parseFloat(price)
  if (isNaN(num)) return '시세 정보 없음'
  return num.toLocaleString('ko-KR') + '원'
}

const formatChange = (change) => {
  const num = parseFloat(change)
  if (isNaN(num)) return '0.0%'
  return (num > 0 ? '+' : '') + num + '%'
}

const getPriceChangeClass = (change) => {
  const num = parseFloat(change)
  if (num > 0) return 'up'
  if (num < 0) return 'down'
  return 'neutral'
}

// Lifecycle
onMounted(() => {
  fetchPlants()
})

onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
.market-container {
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.search-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #568265;
  box-shadow: 0 0 0 3px rgba(86, 130, 101, 0.1);
}

.search-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #f0f0f0;
  color: #666;
}

.search-btn {
  padding: 12px 20px;
  border: none;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 80px;
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a7058, #3f5f4c);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(86, 130, 101, 0.3);
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  margin-bottom: 16px;
  font-weight: 500;
}

.retry-btn {
  padding: 10px 20px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.empty-subtitle {
  color: #666;
  font-size: 14px;
}

.plant-list {
  display: flex;
  flex-direction: column;
  background: white;
}

.plant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.plant-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.plant-item:focus {
  outline: none;
  background-color: #f0f8f4;
  box-shadow: inset 3px 0 0 #568265;
}

.plant-item:last-child {
  border-bottom: none;
}

.plant-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.plant-info {
  flex: 1;
  min-width: 0;
}

.plant-name {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 6px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plant-subtitle {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plant-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.plant-change {
  font-weight: 700;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  margin: 0;
}

.plant-change.up { 
  color: #e74c3c; 
  background-color: rgba(231, 76, 60, 0.1);
}

.plant-change.down { 
  color: #3498db; 
  background-color: rgba(52, 152, 219, 0.1);
}

.plant-change.neutral { 
  color: #95a5a6; 
  background-color: rgba(149, 165, 166, 0.1);
}

.plant-price {
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.load-more-container {
  padding: 20px;
  text-align: center;
  background: white;
}

.load-more-btn {
  padding: 12px 32px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #4a7058;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.load-more-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .search-bar {
    padding: 12px;
    gap: 8px;
  }
  
  .plant-item {
    padding: 12px;
  }
  
  .plant-logo {
    width: 48px;
    height: 48px;
  }
  
  .plant-name {
    font-size: 15px;
  }
  
  .plant-scientific {
    font-size: 11px;
  }
}
</style>