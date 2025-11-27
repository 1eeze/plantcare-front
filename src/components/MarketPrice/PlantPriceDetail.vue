<template>
  <div class="price-detail-container">
    <!-- 헤더 -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <img src="@/assets/icons/back-arrow.png" alt="뒤로가기" class="back-icon" />
      </button>
      <h2>시세 상세</h2>
      <div class="placeholder"></div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>시세 정보를 불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadPlantData" class="retry-btn">다시 시도</button>
    </div>

    <!-- 콘텐츠 -->
    <div v-else-if="plantData" class="content">
      <!-- 식물 정보 카드 -->
      <div class="info-card">
        <h3 class="plant-name">{{ plantData.name }}</h3>
        <p v-if="plantData.data" class="plant-description">{{ plantData.data }}</p>

        <!-- 평균 시세 -->
        <div class="price-section">
          <div class="price-label">현재 평균 시세</div>
          <div class="price-value">{{ formatPrice(plantData.avg_price) }}</div>
          <div v-if="priceChange !== null" class="price-change-badge" :class="getPriceChangeClass(priceChange)">
            {{ formatChange(priceChange) }}
          </div>
        </div>

        <!-- 시세 통계 -->
        <div v-if="priceStats" class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">최저</span>
            <span class="stat-value">{{ formatPrice(priceStats.min) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">최고</span>
            <span class="stat-value">{{ formatPrice(priceStats.max) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">데이터 수</span>
            <span class="stat-value">{{ priceStats.count }}개</span>
          </div>
        </div>
      </div>

      <!-- 시세 추적 그래프 -->
      <div v-if="priceListData.length > 0" class="chart-card">
        <h3 class="chart-title">📈 시세 추적</h3>
        <apexchart
          type="area"
          height="300"
          :options="chartOptions"
          :series="chartSeries"
        ></apexchart>
      </div>

      <!-- 시세 데이터 없음 -->
      <div v-else class="no-data-card">
        <p>시세 추적 데이터가 없습니다</p>
      </div>

      <!-- 시세 히스토리 테이블 -->
      <div v-if="priceListData.length > 0" class="history-card">
        <h3 class="history-title">시세 히스토리</h3>
        <div class="history-table">
          <div class="history-header">
            <span class="col-index">#</span>
            <span class="col-price">가격</span>
            <span class="col-change">변동</span>
          </div>
          <div
            v-for="(item, index) in reversedPriceList"
            :key="index"
            class="history-row"
          >
            <span class="col-index">{{ priceListData.length - index }}</span>
            <span class="col-price">{{ formatPrice(item.price) }}</span>
            <span
              v-if="item.change !== null"
              class="col-change"
              :class="getPriceChangeClass(item.change)"
            >
              {{ formatChange(item.change) }}
            </span>
            <span v-else class="col-change neutral">-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'
import VueApexCharts from 'vue3-apexcharts'

const router = useRouter()
const route = useRoute()

// State
const plantData = ref(null)
const loading = ref(false)
const error = ref(null)

// Computed
const priceListData = computed(() => {
  if (!plantData.value || !plantData.value.price_list) return []

  // price_list가 객체 배열이므로 price 속성 추출
  const prices = plantData.value.price_list
    .map(item => parseFloat(item?.price))
    .filter(p => !isNaN(p))

  return prices.map((price, index) => {
    let change = null
    if (index > 0) {
      const prev = prices[index - 1]
      if (prev !== 0) {
        change = (((price - prev) / prev) * 100).toFixed(1)
      }
    }
    return { price, change }
  })
})

const reversedPriceList = computed(() => {
  return [...priceListData.value].reverse()
})

const priceChange = computed(() => {
  if (priceListData.value.length < 2) return null
  const latest = priceListData.value[priceListData.value.length - 1]
  return latest.change
})

const priceStats = computed(() => {
  if (priceListData.value.length === 0) return null

  const prices = priceListData.value.map(item => item.price)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: prices.length
  }
})

const chartSeries = computed(() => {
  return [{
    name: '시세',
    data: priceListData.value.map(item => item.price)
  }]
})

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#568265']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      },
      colors: ['#568265']
    },
    xaxis: {
      categories: priceListData.value.map((_, idx) => `#${idx + 1}`),
      labels: {
        style: {
          colors: '#7f8c8d',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#7f8c8d',
          fontSize: '12px'
        },
        formatter: (value) => {
          return value.toLocaleString('ko-KR') + '원'
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => {
          return value.toLocaleString('ko-KR') + '원'
        }
      }
    },
    grid: {
      borderColor: '#f0f0f0'
    }
  }
})

// Methods
const loadPlantData = async () => {
  loading.value = true
  error.value = null

  try {
    const plantId = route.params.id

    const { data, error: fetchError } = await supabase
      .from('plants_data')
      .select('plant_data_id, name, data, price_list, "avg.price"')
      .eq('plant_data_id', plantId)
      .maybeSingle()

    if (fetchError) {
      console.error('plants_data 조회 실패:', fetchError)
      error.value = '시세 정보를 불러오는데 실패했습니다.'
      return
    }

    if (!data) {
      error.value = '해당 식물 정보를 찾을 수 없습니다.'
      return
    }

    plantData.value = {
      ...data,
      avg_price: data['avg.price']
    }

    console.log('불러온 시세 상세 데이터:', plantData.value)

  } catch (err) {
    console.error('데이터 로드 중 오류:', err)
    error.value = '데이터를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatPrice = (price) => {
  if (price === null || price === undefined) return '정보 없음'
  const num = parseFloat(price)
  if (isNaN(num)) return '정보 없음'
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
  loadPlantData()
})
</script>

<style scoped>
.price-detail-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.placeholder {
  width: 38px;
}

.loading-container,
.error-container {
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

.content {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.chart-card,
.history-card,
.no-data-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.plant-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.plant-description {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.price-section {
  background: linear-gradient(135deg, #568265, #4a7058);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.price-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.price-change-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.price-change-badge.up {
  background: rgba(231, 76, 60, 0.2);
  color: #fff;
}

.price-change-badge.down {
  background: rgba(52, 152, 219, 0.2);
  color: #fff;
}

.price-change-badge.neutral {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
}

.chart-title,
.history-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.no-data-card {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.history-table {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.history-header,
.history-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  align-items: center;
}

.history-header {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 13px;
  color: #7f8c8d;
}

.history-row {
  font-size: 14px;
}

.col-index {
  color: #7f8c8d;
  text-align: left;
}

.col-price {
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
}

.col-change {
  font-weight: 700;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
}

.col-change.up {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.col-change.down {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.1);
}

.col-change.neutral {
  color: #95a5a6;
  background-color: rgba(149, 165, 166, 0.1);
}

@media (max-width: 480px) {
  .price-value {
    font-size: 28px;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-item {
    padding: 10px;
  }

  .history-header,
  .history-row {
    grid-template-columns: 50px 1fr 90px;
    gap: 8px;
    padding: 10px 12px;
  }
}
</style>
