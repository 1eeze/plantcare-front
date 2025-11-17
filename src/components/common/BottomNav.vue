<template>
  <nav class="bottom-nav">
    <div 
      v-for="navItem in navItems"
      :key="navItem.path"
      class="nav-item"
      :class="{ active: isActive(navItem.path) }"
      @click="goTo(navItem.path)"
      :aria-label="navItem.alt"
      role="button"
      tabindex="0"
      @keydown.enter="goTo(navItem.path)"
      @keydown.space.prevent="goTo(navItem.path)"
    >
      <img :src="navItem.icon" :alt="navItem.alt" />
      <span class="nav-label" v-if="showLabels">{{ navItem.label }}</span>
    </div>
  </nav>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'BottomNav',
  props: {
    showLabels: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const navItems = [
      {
        path: '/',
        icon: '/src/assets/icons/home.png',
        alt: '홈',
        label: '홈'
      },
      /* {
        path: '/unkown',
        icon: '/src/assets/icons/plant.png',
        alt: '식물',
        label: '식물'
      }, */
      {
        path: '/marketprice',
        icon: '/src/assets/icons/uptrend.png',
        alt: '시세',
        label: '시세'
      },
      {
        path: '/community',
        icon: '/src/assets/icons/community.png',
        alt: '커뮤니티',
        label: '커뮤니티'
      },
      {
        path: '/profile',
        icon: '/src/assets/icons/profile.png',
        alt: '프로필',
        label: '프로필'
      }
    ]

    const goTo = (path) => {
      if (route.path !== path) {
        router.push(path)
      }
    }

    const isActive = (path) => {
      if (path === '/') {
        return route.path === '/'
      }
      return route.path.startsWith(path)
    }

    return { 
      goTo, 
      isActive,
      navItems 
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: min(85%, 380px); /* 최대 너비 제한, 좌우 여백 확보 */
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom);
  border: 1px solid #e0e0e0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  cursor: pointer;
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  user-select: none;
}

.nav-item:hover {
  background-color: rgba(86, 130, 101, 0.1);
  transform: translateY(-2px);
}

.nav-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(86, 130, 101, 0.3);
}

.nav-item:active {
  transform: translateY(0) scale(0.95);
}

.nav-item img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.nav-label {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
  transition: color 0.3s ease;
}

.nav-item.active {
  background-color: #568265;
  width: 80px;
  height: 40px;
  border-radius: 20px;
}

.nav-item.active img {
  filter: brightness(0) invert(1);
}

.nav-item.active .nav-label {
  color: white;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background-color: rgba(28, 28, 30, 0.8);
    border-color: #48484a;
  }
  
  .nav-label {
    color: #a0a0a0;
  }
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .bottom-nav {
    width: 90%; /* 모바일에서도 좌우 여백 확보 */
    height: 70px;
    bottom: 10px;
  }
  
  .nav-item {
    width: 56px;
    height: 56px;
  }
  
  .nav-item.active {
    width: 90px;
    height: 45px;
  }
}

/* 접근성 향상 */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .nav-item img,
  .nav-label {
    transition: none;
  }
}
</style>