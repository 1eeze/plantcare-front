<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <div class="content">
      <router-view />
    </div>
    
    <!-- 조건부로 네비게이션 바 표시 -->
    <BottomNav v-if="shouldShowBottomNav" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '../components/common/BottomNav.vue'

export default {
  name: 'MainLayout',
  components: {
    BottomNav
  },
  setup() {
    const route = useRoute()
    
    const shouldShowBottomNav = computed(() => {
      return route.meta.showBottomNav !== false
    })
    
    return {
      shouldShowBottomNav
    }
  }
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
