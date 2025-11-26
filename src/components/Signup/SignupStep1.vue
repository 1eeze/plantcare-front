<template>
  <div class="signup-background">
    <div class="signup-container">
      <h2 class="logo">
        <span class="green">P</span>lant<br />
        <span class="green">C</span>are
      </h2>
      <p class="subtitle">회원가입 방식을 선택해 주세요.</p>
      
      <div class="sns-circle-group">

        <div class="sns-circle-button" @click="handleKakaoLogin">
          <button class="gsi-material-button">
            <div class="gsi-material-button-state"></div>
            <div class="gsi-material-button-content-wrapper">
              <div class="gsi-material-button-icon">
                <img class="kakao-img" src="../../assets/kakao-talk.png" alt="카카오" />
              </div>
            </div>
          </button>
          <span>카카오</span>
        </div>

        <div class="sns-circle-button" @click="handleGoogleLogin">
          <button class="gsi-material-button">
            <div class="gsi-material-button-state"></div>
            <div class="gsi-material-button-content-wrapper">
              <div class="gsi-material-button-icon" id="google-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
            </div>
          </button>
          <span>구글</span>
        </div>
      </div>

      <div class="divider"><span>또는</span></div>

      <button class="app-signup-button" @click="emit('next')">
        Plant Care으로 회원가입
      </button>

      <p class="login-link">
        이미 계정이 있으신가요?
        <a href="/login" @click.prevent="router.push('/login')" class="login-text">로그인</a>
      </p>
    </div>
  </div>
</template>

<script setup>
// (우리 코드) defineEmits는 자동으로 import되므로 제거
import { } from 'vue' 
import { supabase } from '@/utils/supabase.js'
import { useRouter } from 'vue-router'

const emit = defineEmits(['next'])
const router = useRouter()

// (우리 코드) supabase.auth.signInWithOAuth를 사용하는 로직을 최종본으로 선택
const handleKakaoLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: window.location.origin
    }
  })
}

const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
}

// (참고: handleAppSignup은 현재 사용되지 않음)
const handleAppSignup = () => {
  console.log('앱이름으로 회원가입 버튼 클릭')
}
</script>

<style scoped>
.signup-background {
  background-color: #555;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signup-container {
  background-color: #fefaf0;
  padding: 40px 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 70%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.2;
  color: #4C2B08;
  text-align: center;
}

.logo .green {
  color: #568265;
}

.sns-circle-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.sns-circle-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 60px;
}

.gsi-material-button {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
}

.gsi-material-button .gsi-material-button-icon {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gsi-material-button svg {
  width: 100%;
  height: 100%;
}

.kakao-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

#google-icon-wrapper {
  width: 100%;
  height: 100%;
  padding: 11px;
  box-sizing: border-box;
}

#google-icon-wrapper svg {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.subtitle {
  color: #555;
  font-size: 14px;
  margin-bottom: 30px;
}

.sns-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.sns-icon {
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.sns-icon:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  color: #aaa;
  font-size: 13px;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
  margin: 0 10px;
}

.app-signup-button {
  background-color: #568265;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  width: 100%;
}

.app-signup-button:hover {
  background-color: #568265;
}

.login-link {
  font-size: 13px;
  color: #666;
}

.login-text {
  color: #333;
  margin-left: 5px;
  text-decoration: underline;
  cursor: pointer;
}
</style>