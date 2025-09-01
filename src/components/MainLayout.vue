<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <router-view /> <!-- 각 페이지가 여기에 렌더링 됨 -->
    <BottomNav />    <!-- 공통 하단 네비게이션 바 -->
  </div>
</template>

<script>
import BottomNav from '../components/common/BottomNav.vue'

export default {
  components: { BottomNav }
}
</script>

<style scoped>
.main-layout {
  padding-bottom: 60px; /* 하단 네비 높이만큼 확보 */
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

</style>
