<template>
  <div class="profile-view">
    <!-- 상단 프로필 섹션 -->
    <div class="profile-header">
      <img class="profile-img" src="../../assets/profile_pic.jpg" alt="Profile" />
      <h2 class="username">Hello Richer Jessica</h2>
      <p class="job">Product designer</p>
    </div>

    <!-- 통계 요약 -->
    <div class="stats">
      <div><strong>20</strong><p>Plants</p></div>
      <div><strong>50</strong><p>Sites</p></div>
      <div><strong>200</strong><p>Photos</p></div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="tabs">
      <button class="tab active">Plants</button>
      <button class="tab">Sites</button>
      <button class="tab">Photos</button>
    </div>

    <!-- 식물 카드 -->
    <div class="plant-card">
      <div class="plant-info">
        <h3>Living room</h3>
        <p>Living room plants enhance beauty, air relaxing ambiance.</p>
        <button class="add-btn">Add plants</button>
      </div>
      <img class="plant-img" src="../../assets/plant.png" alt="Plant" />
    </div>

    <!-- 프리미엄 배너 -->
    <div class="premium-banner">
      <p class="title">Planta premium</p>
      <p class="desc">Access to in-depth tools for taking of your cost plants</p>
      <button class="learn-btn">Learn more</button>
    </div>

    <!-- 하단 네비게이션 -->
    <div class="bottom-nav">
      <i class="icon home"></i>
      <i class="icon search"></i>
      <i class="icon leaf"></i>
      <i class="icon bell"></i>
      <i class="icon profile active"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView'
}
</script>

<style scoped>
.profile-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f9f7f1;
}

.profile-header {
  text-align: center;
  margin-top: 20px;
}
.profile-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #cbdac2;
}
.username {
  font-size: 18px;
  margin-top: 8px;
  color: #4a6444;
}
.job {
  font-size: 13px;
  color: #8a9a86;
}

.stats {
  display: flex;
  justify-content: space-around;
  background: #eef1ea;
  padding: 12px;
  border-radius: 10px;
  margin-top: 16px;
}
.stats div {
  text-align: center;
  font-size: 14px;
  color: #6c7b6b;
}
.stats strong {
  font-size: 16px;
  display: block;
  color: #3d533d;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin: 16px 0;
}
.tab {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  color: #6d8068;
  cursor: pointer;
}
.tab.active {
  background-color: #cdd7c4;
  color: #3d533d;
}

.plant-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e7efe3;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.plant-info h3 {
  margin: 0;
  color: #4a6444;
}
.plant-info p {
  font-size: 13px;
  color: #7d917e;
  margin: 4px 0;
}
.add-btn {
  background-color: #7faa6f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.plant-img {
  width: 60px;
  height: auto;
}

.premium-banner {
  background-color: #bfdc9f;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 24px;
}
.premium-banner .title {
  font-weight: bold;
  color: #405c3d;
}
.premium-banner .desc {
  font-size: 13px;
  margin: 8px 0;
  color: #586f56;
}
.learn-btn {
  background: white;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #405c3d;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #ccc;
  background: white;
  position: sticky;
  bottom: 0;
}
.icon {
  width: 24px;
  height: 24px;
  background-color: #ccc; /* 임시 */
  border-radius: 50%;
}
.icon.active {
  background-color: #4a6444;
}
</style>
