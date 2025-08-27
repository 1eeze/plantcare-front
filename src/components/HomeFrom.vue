<template>
  <div class="plant-wrapper">
    <div class="plant-card">
      <!-- 상단 녹색 영역 -->
      <div class="plant-header">
        <div class="header-top">
          <span class="header-title">Plant Care</span>
          <span class="settings-button">⚙️</span>
        </div>
        <div class="plant-info">
          <h2 class="plant-name">식물 이름</h2>
          <p class="plant-age">일자</p>

          <div class="plant-status">
            <div class="status-item">
              <p class="status-value">19%</p>
              <p class="status-label">습도</p>
            </div>
            <div class="status-item">
              <p class="status-value">86%</p>
              <p class="status-label">토양</p>
            </div>
          </div>

          <div class="watering">
            <p class="watering-label">Next watering</p>
            <p class="watering-time">36 min</p>
          </div>
        </div>
      </div>

      <!-- 식물 이미지 -->
      <div class="plant-image-container">
        <img src="../assets/plant.png" alt="식물" class="plant-image" />
      </div>

      <!-- 센서 정보 -->
      <div class="plant-sensors">
        <p class="warning">식물 상태</p>
        <div class="sensor-grid">
          <div class="sensor-item">
            <p class="sensor-value">10%</p>
            <p class="sensor-label">Water tank</p>
          </div>
          <div class="sensor-item">
            <p class="sensor-value">78%</p>
            <p class="sensor-label">Light</p>
          </div>
          <div class="sensor-item">
            <p class="sensor-value">24℃</p>
            <p class="sensor-label">Temper.</p>
          </div>
        </div>
      </div>

      <!-- 하단 탭 -->
      <div class="plant-tabs">
        <button class="tab active">Statistics</button>
        <button class="tab">Information</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plant-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0ece4;
}

.plant-card {
  width: 95%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.plant-header {
  background-color: #568265;
  color: white;
  padding: 20px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  position: relative;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 120%;
}

.settings-button {
  background-color: white;
  color: #568265;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.plant-name {
  margin-top: 12px;
  font-size: 20px;
  font-weight: bold;
}

.plant-age {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 16px;
}

.plant-status {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.status-item {
  text-align: left;
}

.status-value {
  font-weight: bold;
}

.watering {
  margin-top: 14px;
  font-size: 13px;
}

.watering-label {
  opacity: 0.8;
}

.watering-time {
  font-weight: bold;
  font-size: 16px;
}

.plant-image-container {
  display: flex;
  justify-content: center;
  margin-top: -20px;
}

.plant-image {
  width: 120px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.plant-sensors {
  padding: 20px;
  text-align: center;
}

.warning {
  color: #d32f2f;
  font-weight: 500;
  margin-bottom: 14px;
  font-size: 14px;
}

.sensor-grid {
  display: flex;
  justify-content: space-around;
  font-size: 13px;
}

.sensor-value {
  font-weight: bold;
  font-size: 16px;
}

.sensor-label {
  margin-top: 4px;
  opacity: 0.7;
}

.plant-tabs {
  display: flex;
  border-top: 1px solid #eee;
}

.tab {
  flex: 1;
  padding: 12px;
  font-size: 13px;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.tab.active {
  font-weight: bold;
  color: #568265;
  border-right: 1px solid #eee;
}
</style>