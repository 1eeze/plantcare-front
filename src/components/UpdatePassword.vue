<template>
  <div class="update-password-container">
    <img src="@/assets/logo.png" alt="PlantCare 로고" class="logo-img" />
    <h3>새 비밀번호 설정</h3>
    <p v-if="!tokenLoaded">인증 정보를 확인 중입니다...</p>
    
    <div v-if="tokenLoaded && !expired" class="form-wrapper">
      <div class="input-group">
        <input 
          type="password" 
          placeholder="새 비밀번호" 
          v-model="password"
          @keyup.enter="handlePasswordUpdate"
        />
      </div>
      <div class="input-group">
        <input 
          type="password" 
          placeholder="새 비밀번호 확인" 
          v-model="confirmPassword"
          @keyup.enter="handlePasswordUpdate"
        />
      </div>
      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      
      <button @click="handlePasswordUpdate" :disabled="isSaving" class="save-button">
        {{ isSaving ? '저장 중...' : '새 비밀번호로 변경' }}
      </button>
    </div>
    
    <div v-if="expired" class="error-wrapper">
      <p class="error-text">링크가 만료되었거나 잘못되었습니다.</p>
      <button @click="$router.push('/login')" class="save-button">로그인 페이지로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const isSaving = ref(false)
const errorMsg = ref('')
const tokenLoaded = ref(false)
const expired = ref(false)

onMounted(async () => {
  const hash = route.hash
  if (!hash || !hash.includes('type=recovery')) {
    tokenLoaded.value = true
    expired.value = true
    errorMsg.value = '잘못된 링크입니다. 이메일을 통해 다시 시도해주세요.'
    return
  }

  await new Promise(resolve => setTimeout(resolve, 50));

  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    tokenLoaded.value = true
    expired.value = false
  } else {
    tokenLoaded.value = true
    expired.value = true
    errorMsg.value = '링크가 만료되었거나 이미 사용되었습니다.'
  }
})

const handlePasswordUpdate = async () => {
  if (isSaving.value) return
  errorMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = '비밀번호는 6자리 이상이어야 합니다.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  isSaving.value = true
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) throw error

    alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.')
    await supabase.auth.signOut()
    router.replace('/login')

  } catch (error) {
    console.error('비밀번호 업데이트 에러:', error.message)
    errorMsg.value = '비밀번호 변경에 실패했습니다: ' + error.message
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.update-password-container {
  max-width: 400px;
  width: 90%;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
  font-family: sans-serif;
  text-align: center;
}
.logo-img {
  width: 45vw;
  max-width: 180px;
  min-width: 120px;
  height: auto;
  display: block;
  margin: 0 auto 20px;
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
.save-button {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  background-color: #568265;
  color: white;
}
.save-button:disabled {
  background-color: #ccc;
}
.error-text {
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 15px;
}
</style>