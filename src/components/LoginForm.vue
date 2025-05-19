<template>
    <div class="login-container">
      <h2 class="logo">
        <span class="green">P</span>lant<br />
        <span class="green">C</span>are
      </h2>
  
      <div class="input-group">
        <input type="text" placeholder="아이디를 입력해주세요" v-model="userId" />
      </div>
  
      <div class="input-group">
        <input type="password" placeholder="비밀번호를 입력해주세요" v-model="userPassword" />
      </div>
  
      <div class="options">
        <label>
          <input type="checkbox" v-model="secureLogin" />
          로그인유지
        </label>
        <div class="find-links">
          <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a>
        </div>
      </div>
  
      <button class="login-button" @click="handleLogin">로그인</button>
      <button class="signup-button" @click="goToSignup">회원가입</button>
      
      <div class="sns-login-section">
        <div class="sns-divider">
          <span>SNS 계정으로 로그인</span>
        </div>
      <div class="sns-circle-group">

        <!-- 네이버 로그인 버튼 -->
        <div class="sns-circle-button" @click="handleNaverLogin('naver')">
          <button class="gsi-material-button">
            <div class="gsi-material-button-state"></div>
            <div class="gsi-material-button-content-wrapper">
              <div class="gsi-material-button-icon">
                <img class="naver-img" src="../assets/btnW_아이콘원형.png" alt="네이버" />
              </div>
            </div>
          </button>
          <span>네이버</span>
        </div>

        <!-- 카카오 로그인 버튼 -->
        <div class="sns-circle-button" @click="handleKakaoLogin('naver')">
          <button class="gsi-material-button">
            <div class="gsi-material-button-state"></div>
            <div class="gsi-material-button-content-wrapper">
              <div class="gsi-material-button-icon">
                <img class="kakao-img" src="../assets/kakao-talk.png" alt="카카오오" />
              </div>
            </div>
          </button>
          <span>카카오</span>
        </div>

        <!-- 구글 로그인 -->
        <div class="sns-circle-button" @click="handleGoogleLogin('google')">
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
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  
  const userId = ref('')
  const userPassword = ref('')
  const secureLogin = ref(false)
  const router = useRouter()

  const handleNaverLogin = () => {
    window.location.href = 'https://pkplantcare.shop/auth/login/naver'
  }

  const handleKakaoLogin = () => {
    window.location.href = 'https://pkplantcare.shop/auth/login/kakao'
  }

  const handleGoogleLogin = () => {
  window.location.href = 'https://pkplantcare.shop/login'
  }
  
  const handleLogin = () => {
    console.log('로그인', userId.value, userPassword.value, '로그인 유지:', secureLogin.value)
    // TODO: 로그인 API 연동 또는 인증 로직 추가
    // 테스트용 간단한 로그인 조건
    if (userId.value === 'test' && userPassword.value === '1234') {
      router.push('/community') // 테스트 페이지로 이동
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  }
  
  const goToSignup = () => {
  router.push('/signup')
  }
  </script>
  
<style scoped>

  .login-container {
  max-width: 400px;
  width: 90%;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 3rem;
  line-height: 1.2;
  color: #4C2B08;
  text-align: center;
}

.logo .green {
  color: #568265;
}

.input-group {
  margin-bottom: 15px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.options label {
  display: flex;
  align-items: center;
}

.options input[type="checkbox"] {
  margin-right: 5px;
}

.find-links a {
  text-decoration: none;
  color: #333;
  font-size: 0.85rem;
}

button {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.login-button {
  background-color: #568265;
  color: white;
}

.signup-button {
  background-color: white;
  border: 1px solid #568265;
  color: #568265;
}

.sns-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  margin: 30px 0 10px;
}

.sns-divider::before,
.sns-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
  margin: 0 10px;
}

.sns-login-section {
  margin-top: 30px;
  text-align: center;
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
  width: 60px; /* 버튼 정렬 균형 맞추기 위해 고정 너비 */
}

.sns-circle-button span {
  font-size: 13px;
  color: #333;
  margin-top: 6px;
  line-height: 1; /* 높이 정렬용 */
  text-align: center;
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

.gsi-material-button:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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

.naver-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
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

</style>