<template>
    <div class="signup-background">
      <div class="email-signup-container">
        <h1>Plant Care</h1>
        <p class="subtitle">회원가입을 위해 인증 가능한 이메일을 입력해 주세요.</p>
  
        <input type="email" placeholder="이메일을 입력하세요" v-model="email" />
        <p class="info-text">· 입력하신 이메일로 뉴스레터, 계정, 기타 구독 알림을 보내드립니다.</p>
        <p class="info-text">· 대표 이메일은 회원가입 후 ‘계정정보’에서 변경 가능합니다.</p>
  
        <input type="password" placeholder="비밀번호를 입력하세요" v-model="password" />
  
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="agreeAll" @change="toggleAll" /> 모두 동의합니다.</label>
          <p class="policy-text">※ 이용약관, 개인정보 수집 이용 등 자세한 안내 문구 여기에 추가</p>
  
          <label><input type="checkbox" v-model="ageConfirm" /> 만 14세 이상입니다. (필수)</label>
          <label><input type="checkbox" v-model="termsAgree" /> 이용약관 (필수)</label>
          <label><input type="checkbox" v-model="privacyAgree" /> 개인정보 수집 및 이용 (필수)</label>
          <label><input type="checkbox" v-model="newsletter" /> 뉴스레터 메일 수신 동의 (선택)</label>
        </div>
  
        <button class="submit-button" @click="submitSignup">가입하기</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const email = ref('')
  const password = ref('')
  const agreeAll = ref(false)
  const ageConfirm = ref(false)
  const termsAgree = ref(false)
  const privacyAgree = ref(false)
  const newsletter = ref(false)
  
  const toggleAll = () => {
    const check = agreeAll.value
    ageConfirm.value = check
    termsAgree.value = check
    privacyAgree.value = check
    newsletter.value = check
  }
  
  const submitSignup = () => {
    if (!ageConfirm.value || !termsAgree.value || !privacyAgree.value) {
      alert('필수 항목을 모두 체크해주세요.')
      return
    }
    console.log('회원가입 정보:', { email: email.value, password: password.value })
    alert('가입 완료!')
  }
  </script>
  
  <style scoped>
  .signup-background {
    background-color: #f2f5f5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .email-signup-container {
    background-color: #F2F6EB;
    width: 90%;
    max-width: 400px;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    font-family: sans-serif;
  }
  
  .subtitle {
    color: #555;
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  input[type="email"], input[type="password"] {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
  
  .info-text {
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
  }
  
  .checkbox-group {
    text-align: left;
    margin-top: 20px;
  }
  
  .checkbox-group label {
    display: block;
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .policy-text {
    font-size: 12px;
    color: #666;
    margin: 5px 0 15px;
  }
  
  .submit-button {
    background-color: #02c966;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    width: 100%;
    margin-top: 20px;
  }
  </style>
  