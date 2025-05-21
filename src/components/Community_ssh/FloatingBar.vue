<template>
  <div class="floating-bar">
    <!-- 피드(홈)으로 이동 -->
    <button class="left-btn" @click="goFeed">
      <span class="icon">🏠</span>
      <!-- <span class="icon"><img src="@/assets/home.png" alt="피드" style="width:24px;"/></span>
 -->
    </button>
    <!-- 업로드 버튼 -->
    <button class="center-btn" @click="$emit('show-upload')">+</button>
    <!-- 프로필로 이동 -->
    <button class="right-btn" @click="goProfile">
      <img :src="profileImg" alt="프로필" class="profile-icon" />
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import profileImg from '../../assets/profile_pic.png'

const router = useRouter()
function goFeed() {
  router.push('/feed')
}
function goProfile() {
  router.push('/profile')
}
</script>

<style scoped>
.floating-bar {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  height: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(25, 205, 214, 0.35); /* 밝은 반투명 배경 */
  border: 1.5px solid #d4e6d7;       /* 전체에 border */
  border-radius: 14px 14px 0 0;       /* 윗부분만 둥글게(선택) */
  z-index: 1000;
  pointer-events: none;
  backdrop-filter: blur(4px);         /* 선택: 유리 느낌 */
  box-sizing: border-box;             /* border 포함 크기 계산 */
}

.left-btn, .center-btn, .right-btn {
  pointer-events: all;
  border: none;
  background: rgb(123, 195, 103, 0.85);
  color: #fff;
  border-radius: 50%;
  margin: 0 18px;
  box-shadow: 0 2px 10px #0003;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.left-btn {
  position: absolute;
  left: 20px; bottom: 10px;
  width: 44px; height: 44px;
  font-size: 21px;
  background: #444b;
}
.center-btn {
  position: absolute;
  left: 50%; transform: translateX(-50%);
  bottom: 10px;
  width: 54px; height: 54px;
  font-size: 34px;
}
.right-btn {
  position: absolute;
  right: 20px; bottom: 10px;
  background: #444b;
  width: 44px; height: 44px;
  font-size: 19px;
  padding: 0;
}
.profile-icon { width: 28px; height: 28px; border-radius: 50%; }
.icon { font-size: 25px; }
</style>