<template>
    <div class="complete-container">
      <h2 class="title">환영합니다!</h2>
      <p class="message">회원가입을 축하합니다.</p>
  
      <img class="character-img" src="../../assets/character.png" alt="축하 이미지지" />
  
      <p class="highlight">
        당신의 소중한 식물,<br />
        <strong>Plant Care</strong>가 늘 함께 지켜볼게요!
      </p>
  
      <button class="home-button" @click="goHome">홈으로</button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()
  
  const goHome = () => {
    router.push('/')
  }
  </script>

<style>
body {
  background-color: #FEFAF0;
}
</style>
  
  <style scoped>
  .complete-container {
    background-color: #FEFAF0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }
  
  .message {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  }
  
  .character-img {
    width: 160px;
    height: auto;
    margin: 20px 0;
    border-radius: 50%;
  }
  
  .highlight {
    font-size: 14px;
    color: #4C2B08;
    margin-bottom: 40px;
    line-height: 1.5;
  }
  
  .home-button {
    background-color: #568265;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  