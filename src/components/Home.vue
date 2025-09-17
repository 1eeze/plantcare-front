<template>
  <div class="home">
    <!-- 상단 헤더 -->
    <div class="header">
      <!-- 토글 메뉴 버튼 -->
      <button class="menu-btn" @click="toggleMenu">☰</button>
      <div class="location">
        <p class="greeting">안녕하세요, 사용자 님!</p>
        <p class="city">Seoul, KOREA</p>
      </div>
      <!-- 카메라 버튼 -->
      <button class="camera-btn" @click="openCamera" aria-label="카메라 열기">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#4a6444">
          <path d="m24,12c0,.552-.448,1-1,1H1c-.552,0-1-.448-1-1s.448-1,1-1h22c.552,0,1,.448,1,1ZM7,22h-2c-1.654,0-3-1.346-3-3v-2c0-.552-.448-1-1-1s-1,.448-1,1v2c0,2.757,2.243,5,5,5h2c.552,0,1-.448,1-1s-.448-1-1-1Zm16-6c-.552,0-1,.448-1,1v2c0,1.654-1.346,3-3,3h-2c-.552,0-1,.448-1,1s.448,1,1,1h2c2.757,0,5-2.243,5-5v-2c0-.552-.448-1-1-1ZM19,0h-2c-.552,0-1,.448-1,1s.448,1,1,1h2c1.654,0,3,1.346,3,3v2c0,.552.448,1,1,1s1-.448,1-1v-2c0-2.757-2.243-5-5-5ZM1,8c.552,0,1-.448,1-1v-2c0-1.654,1.346-3,3-3h2c.552,0,1-.448,1-1s-.448-1-1-1h-2C2.243,0,0,2.243,0,5v2c0,.552.448,1,1,1Z"/>
        </svg>
      </button>
    </div>

    <!-- 내 식물 리스트 -->
    <div class="section-title">
      <h3>나의 식물</h3>
      <button class="view-all">View all</button>
    </div>
    <div class="plant-scroll">
      <div v-for="plant in plants" :key="plant.id" class="plant-card">
        <img :src="plant.image" class="plant-image" />
        <h4>{{ plant.name }}</h4>
        <div class="plant-status">
          <span>{{ plant.water }}</span>
          <span>{{ plant.light }}</span>
          <span>{{ plant.fertilizer }}</span>
        </div>
      </div>
    </div>

    <!-- 요약 카드 -->
    <div class="section-title">
      <h3>식물 상태 요약</h3>
    </div>
    <div class="summary-list">
      <div v-for="plant in plants" :key="plant.id" class="summary-card">
        🌿 <strong>{{ plant.name }}</strong>: {{ plant.summary }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import plant_pic from '../assets/plant.png'

const plants = ref([
  {
    id: 1,
    name: '몬스테라',
    image: plant_pic,
    water: '💧130%',
    light: '☀️ Sunny',
    fertilizer: '🌱 100%',
    summary: '물 많음, 햇빛 충분, 비료 적당'
  },
  {
    id: 2,
    name: '칼라데아',
    image: plant_pic,
    water: '💧90%',
    light: '🌤️ Bright',
    fertilizer: '🌱 80%',
    summary: '물 부족, 밝은 곳, 비료 필요'
  }
])

const toggleMenu = () => {
  alert('메뉴 토글') // 추후 실제 메뉴 오픈
}

const openCamera = () => {
  // 웹에서는 input[type=file]을 트리거
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment' // 모바일에서 후면 카메라
  input.click()
}
</script>

<style scoped>
.home {
  padding: 20px;
  background-color: #f7f6ed;
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-btn, .camera-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.camera-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}
.camera-btn svg:hover {
  fill: #6b856b;
  transition: fill 0.2s ease;
}

.location {
  flex-grow: 1;
  text-align: left;
}

.greeting {
  margin: 0;
  font-size: 12px;
}

.city {
  margin: 0;
  font-size: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  align-items: center;
}

.plant-scroll {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  margin-top: 12px;
  padding-bottom: 10px;
}

.plant-card {
  flex: 0 0 auto;
  width: 160px;
  background-color: #fff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.plant-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.plant-status {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.summary-list {
  margin-top: 20px;
}

.summary-card {
  background-color: #eaf2e5;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
}
</style>
