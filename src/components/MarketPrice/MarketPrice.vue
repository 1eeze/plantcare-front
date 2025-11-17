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
      <p>식물 정보를 가져오는 중...</p>
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
        :key="plant.id"
        @click="goToPlantDetail(plant.id)"
        role="button"
        tabindex="0"
        @keydown.enter="goToPlantDetail(plant.id)"
        @keydown.space.prevent="goToPlantDetail(plant.id)"
      >
        <!-- 왼쪽: 이미지 + 이름 -->
        <div class="plant-left">
          <div class="plant-image-wrapper">
            <img 
              :src="getPlantImage(plant)" 
              :alt="plant.common_name || '식물'"
              class="plant-logo"
              @error="handleImageError"
            />
          </div>
          <div class="plant-info">
            <p class="plant-name">{{ plant.common_name || plant.scientific_name || '이름 없음' }}</p>
            <p class="plant-scientific" v-if="plant.scientific_name && plant.common_name">
              {{ plant.scientific_name }}
            </p>
          </div>
        </div>

        <!-- 오른쪽: 변동률 + 가격 -->
        <div class="plant-right">
          <p 
            class="plant-change" 
            :class="getPriceChangeClass(plant.fakeChange)"
          >
            {{ formatChange(plant.fakeChange) }}
          </p>
          <p class="plant-price">{{ formatPrice(plant.fakePrice) }}</p>
        </div>
      </div>
    </div>

    <!-- 더보기 버튼 -->
    <div v-if="plants.length > 0 && !loading" class="load-more-container">
      <button @click="loadMore" :disabled="loadingMore" class="load-more-btn">
        {{ loadingMore ? '로딩중...' : '더보기' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "MarketPrice",
  data() {
    return {
      plants: [],
      searchQuery: "",
      loading: false,
      loadingMore: false,
      error: null,
      currentPage: 1,
      searchTimeout: null
    }
  },
  mounted() {
    this.fetchPlants();
  },
  methods: {
    async fetchPlants(isLoadMore = false) {
      if (!isLoadMore) {
        this.loading = true;
        this.currentPage = 1;
      } else {
        this.loadingMore = true;
      }
      
      this.error = null;

      try {
        const response = await axios.get("https://perenual.com/api/species-list", {
          params: {
            key: "sk-hKOs68c7f61cbdc8412380",
            page: this.currentPage,
            q: this.searchQuery || undefined,
            per_page: 20
          },
          timeout: 10000 // 10초 타임아웃
        });

        const newPlants = response.data.data.map(plant => ({
          ...plant,
          fakePrice: Math.floor(Math.random() * 200000) + 10000,
          fakeChange: (Math.random() * 6 - 3).toFixed(1)
        }));

        if (isLoadMore) {
          this.plants = [...this.plants, ...newPlants];
        } else {
          this.plants = newPlants;
        }

      } catch (err) {
        console.error('API 요청 실패:', err);
        this.error = this.getErrorMessage(err);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.fetchPlants();
    },

    onSearchInput() {
      // 디바운싱: 500ms 후에 자동 검색
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.fetchPlants();
      }, 500);
    },

    clearSearch() {
      this.searchQuery = '';
      this.fetchPlants();
    },

    loadMore() {
      this.currentPage += 1;
      this.fetchPlants(true);
    },

    goToPlantDetail(plantId) {
      this.$router.push(`/plant/${plantId}`);
    },

    getPlantImage(plant) {
      return plant.default_image?.thumbnail || 
             plant.default_image?.original_url || 
             '/assets/default-plant.png';
    },

    handleImageError(event) {
      event.target.src = '/assets/default-plant.png';
    },

    formatPrice(price) {
      if (typeof price !== 'number') return '가격 정보 없음';
      return price.toLocaleString('ko-KR') + '원';
    },

    formatChange(change) {
      const num = parseFloat(change);
      if (isNaN(num)) return '0.0%';
      return (num > 0 ? '+' : '') + num + '%';
    },

    getPriceChangeClass(change) {
      const num = parseFloat(change);
      if (num > 0) return 'up';
      if (num < 0) return 'down';
      return 'neutral';
    },

    getErrorMessage(error) {
      if (error.code === 'ECONNABORTED') {
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      }
      if (error.response?.status === 429) {
        return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      }
      if (error.response?.status >= 500) {
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      return '데이터를 불러오는데 실패했습니다.';
    }
  },

  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
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
}

.plant-image-wrapper {
  position: relative;
  flex-shrink: 0;
}

.plant-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.plant-item:hover .plant-logo {
  border-color: #568265;
  transform: scale(1.05);
}

.plant-info {
  flex: 1;
  min-width: 0;
}

.plant-name {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 4px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plant-scientific {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
  font-style: italic;
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