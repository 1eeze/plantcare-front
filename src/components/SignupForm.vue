<template>
  <div class="signup-background">
    <div class="signup-container">
      <h1 class="title">Plant Care</h1>
      <p class="subtitle">회원가입 방식을 선택해 주세요.</p>

      <div class="sns-icons">
        <div class="sns-icon" @click="handleSnsLogin('google')">
          <!-- Google 아이콘 (SVG) -->
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
      </div>

      <div class="divider"><span>또는</span></div>

      <button class="app-signup-button" @click="$router.push('/signup-email')">
        Plant Care으로 회원가입
      </button>

      <p class="login-link">
        이미 계정이 있으신가요?
        <a href="/" class="login-text">로그인</a>
      </p>
    </div>
  </div>
</template>

<script setup>
const handleSnsLogin = (provider) => {
  console.log(`${provider} SNS 로그인 시도`)
  // SNS 연동 로직 추가 예정
}

const handleAppSignup = () => {
  console.log('앱이름으로 회원가입 버튼 클릭')
  // 이메일 회원가입 로직 또는 이동
}
</script>

<style scoped>
.signup-background {
  background-color: #555; /* 어두운 회색 배경 */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.signup-container {
  background-color: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
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
  background-color: #02c966;
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
  background-color: #00b05c;
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

