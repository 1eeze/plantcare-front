<template>
    <div class="signup-wrapper">
      <component
        :is="steps[stepIndex]"
        @next="nextStep"
        @prev="prevStep"
      />
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SignupStep1 from './SignupStep1.vue'
import SignupEmail from './SignupEmail.vue'
import SignupStep2 from './SignupStep2.vue'
import SignupStep3 from './SignupStep3.vue'
import SignupComplete from './SignupComplete.vue'

const router = useRouter()
const route = useRoute()

const steps = [
  SignupStep1,   // 0
  SignupEmail,   // 1
  SignupStep2,   // 2
  SignupStep3,    // 3
  SignupComplete  // 4
]

// 3. stepIndex를 URL 기반으로 초기화하는 함수 추가
const getInitialStep = () => {
  const path = route.path
  if (path.endsWith('/step2')) return 2
  if (path.endsWith('/step3')) return 3
  if (path.endsWith('/complete')) return 4
  // /signup 또는 /signup/step1 등
  return 0 
}

const stepIndex = ref(getInitialStep()) // 4. ref(0) 대신 함수 호출로 변경

const nextStep = () => {
  // 3. 아래 if/else 로직으로 수정합니다.
  if (stepIndex.value < steps.length - 1) {
    stepIndex.value++
  }
}

const prevStep = () => {
  if (stepIndex.value > 0) stepIndex.value--
}
</script>
  
  <style scoped>
  .signup-wrapper {
    background-color: #FEFAF0;
    min-height: 100vh;
  }
  </style>  