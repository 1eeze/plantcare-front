<template>
  <div class="plant-detail" v-if="plant">
    <!-- 상단 이미지 -->
    <div class="plant-image">
      <img :src="plant.image" :alt="plant.name" />
      <div class="image-overlay">
        <span class="updated-at">Updated on {{ plant.updatedAt }}</span>
      </div>
    </div>

    <!-- 식물 기본 정보 -->
    <div class="plant-info">
      <h2>{{ plant.name }}</h2>
      <p class="plant-scientific">{{ plant.scientificName }}</p>
      <div class="tags">
        <span class="tag location">{{ plant.location }}</span>
        <span class="tag health" :class="plant.healthStatus.toLowerCase()">
          {{ plant.healthStatus }}
        </span>
      </div>
    </div>

    <!-- 관리 섹션 -->
    <div class="care-section">
      <div class="care-header">
        <h3>Care</h3>
        <button class="history-btn" @click="viewHistory">See history ➝</button>
      </div>

      <div class="care-list">
        <div
          class="care-item"
          v-for="action in plant.careActions"
          :key="action.type"
        >
          <div class="care-circle">
            <div class="care-icon">{{ action.icon }}</div>
          </div>
          <p class="care-label">{{ action.type }}</p>
          <small>Last: {{ action.last }}</small>
          <small :class="{ overdue: action.overdue }">
            {{ action.next }}
          </small>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>식물을 찾을 수 없습니다 🌱</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const plantId = route.params.id // URL에서 받은 id

// 더미 데이터 (실제는 API 요청으로 대체)
const plantsData = [
  {
    id: "1",
    image: "https://picsum.photos/600/400?random=1",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    updatedAt: "1 June 2025",
    location: "Living room",
    healthStatus: "Healthy",
    careActions: [
      { type: "Water", icon: "💧", last: "today", next: "in 3d", overdue: false },
      { type: "Repot", icon: "🪴", last: "5mo ago", next: "Overdue 2d", overdue: true },
      { type: "Spray", icon: "🌿", last: "1d ago", next: "in 2d", overdue: false }
    ]
  },
  {
    id: "2",
    image: "https://picsum.photos/600/400?random=2",
    name: "Calathea",
    scientificName: "Calathea orbifolia",
    updatedAt: "10 May 2025",
    location: "Bedroom",
    healthStatus: "Moderate",
    careActions: [
      { type: "Water", icon: "💧", last: "2d ago", next: "tomorrow", overdue: false },
      { type: "Fertilize", icon: "🌱", last: "1mo ago", next: "in 1mo", overdue: false }
    ]
  }
]

const plant = ref(plantsData.find(p => p.id === plantId))

const viewHistory = () => {
  console.log("히스토리 보기")
  // router.push(`/plant-detail/${plantId}/history`) 가능
}
</script>

<style scoped>
.plant-detail {
  font-family: 'Noto Sans KR', sans-serif;
  background: #f7f6ed;
  min-height: 100vh;
}

/* 이미지 */
.plant-image {
  position: relative;
}
.plant-image img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 0 0 16px 16px;
}
.image-overlay {
  position: absolute;
  bottom: 8px;
  right: 12px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

/* 식물 정보 */
.plant-info {
  padding: 20px;
}
.plant-info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}
.plant-scientific {
  font-size: 14px;
  color: #777;
  margin: 4px 0 12px;
}
.tags {
  display: flex;
  gap: 8px;
}
.tag {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}
.tag.location {
  background: #f0f0f0;
  color: #444;
}
.tag.health.healthy {
  background: #d4edda;
  color: #155724;
}

/* 관리 */
.care-section {
  padding: 20px;
  background: white;
  border-radius: 16px 16px 0 0;
  margin-top: 12px;
}
.care-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.history-btn {
  background: none;
  border: none;
  color: #568265;
  font-size: 14px;
  cursor: pointer;
}
.care-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
}
.care-item {
  flex: 0 0 100px;
  text-align: center;
}
.care-circle {
  width: 80px;
  height: 80px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
}
.care-icon {
  font-size: 28px;
}
.care-label {
  font-weight: 600;
  margin: 4px 0;
}
small {
  display: block;
  font-size: 12px;
  color: #666;
}
small.overdue {
  color: #e74c3c;
  font-weight: bold;
}
</style>
