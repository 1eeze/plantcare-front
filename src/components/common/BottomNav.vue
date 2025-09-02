<template>
  <nav class="bottom-nav">
    <!-- 예시 아이콘들 -->
    <div 
      class="nav-item"
      :class="{ active: $route.path === '/'}"
      @click="goTo('/')"
    >
      <img src="../../assets/icons/home.png" alt="홈" />
    </div>
    <div 
      class="nav-item"
      :class="{ active: $route.path === '/plant'}"
      @click="goTo('/plant')"
    >
      <img src="../../assets/icons/plant.png" alt="식물" />
    </div>
    <div 
      class="nav-item"
      :class="{ active: $route.path === '/challenge'}"
      @click="goTo('/challenge')"
    >
      <img src="../../assets/icons/checklist.png" alt="도전과제" />
    </div>
    <div 
      class="nav-item"
      :class="{ active: $route.path === '/community'}"
      @click="goTo('/community')"
    >
      <img src="../../assets/icons/community.png" alt="커뮤니티" />
    </div>
    <div 
      class="nav-item"
      :class="{ active: $route.path === '/profile'}"
      @click="goTo('/profile')"
    >
      <img src="../../assets/icons/profile.png" alt="프로필" />
    </div>
  </nav>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'BottomNav',
  setup() {
    const router = useRouter()
    const goTo = (path) => {
      router.push(path)
    }
    return { goTo }
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.nav-item.active {
  background-color: #568265;
  border-radius: 30px;
  width: 80px;
  height: 40px;
}

.nav-item.active img {
  filter: brightness(0) invert(1); /* 아이콘 색 반전 (흰색처럼 보이게) */
}
</style>

