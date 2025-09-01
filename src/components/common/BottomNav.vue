<template>
  <nav class="bottom-nav">
    <!-- 예시 아이콘들 -->
    <div class="nav-item">
      <img src="../../assets/icons/home.png" alt="홈" />
    </div>
    <div class="nav-item">
      <img src="../../assets/icons/plant.png" alt="식물" />
    </div>
    <div class="nav-item">
      <img src="../../assets/icons/checklist.png" alt="도전과제" />
    </div>
    <div class="nav-item">
      <img src="../../assets/icons/community.png" alt="커뮤니티" />
    </div>
    <div class="nav-item">
      <img src="../../assets/icons/settings.png" alt="설정" />
    </div>
  </nav>
</template>

<script>
export default {
  name: 'BottomNav'
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 20px; /* ← 화면 아래에서 살짝 띄우는 효과 */
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-radius: 30px; /* ← 모서리 둥글게! */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* ← 그림자 효과로 떠보이게 */
  z-index: 9999;
  padding-bottom: env(safe-area-inset-bottom);
  border: 1px solid #ddd;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.nav-item img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>

