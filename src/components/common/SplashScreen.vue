<template>
  <div class="splash">
    <div class="splash-content">
      <!-- 앱 로고 -->
      <img :src="logo" alt="PlantCare 로고" class="logo" />

      <!-- 텍스트 -->
      <p class="title">PlantCare</p>
      <p class="subtitle">내 식물의 하루를 준비하는 중...</p>

      <!-- 로딩 애니메이션 -->
      <div class="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import logo from '@/assets/logo.png'
</script>

<style scoped>
.splash {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: env(safe-area-inset-top, 16px) env(safe-area-inset-right, 16px)
           env(safe-area-inset-bottom, 16px) env(safe-area-inset-left, 16px);
  background: linear-gradient(135deg, #e8f9ef, #f7fff9);
  box-sizing: border-box;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* ✅ clamp로 모바일~태블릿~PC 전부 적당한 로고 크기 유지 */
.logo {
  width: clamp(140px, 35vw, 260px);
  height: auto;
  margin-bottom: 16px;
}

/* 텍스트 */
.title {
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 700;
  margin-bottom: 4px;
  color: #164524;
}

.subtitle {
  font-size: clamp(13px, 3.2vw, 16px);
  color: #4f6f52;
  margin-bottom: 20px;
}

/* 로딩 애니메이션 (점 3개 튀는 느낌) */
.loader {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: flex-end;
  height: 16px;
}

.loader span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5bbf7a;
  animation: bounce 0.8s infinite ease-in-out;
}

.loader span:nth-child(2) {
  animation-delay: 0.15s;
}
.loader span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* 넓은 화면(예: 태블릿 이상)에서 살짝 여유 있게 */
@media (min-width: 768px) {
  .splash {
    padding: 32px;
  }
  .subtitle {
    margin-bottom: 24px;
  }
}
</style>