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
  import SignupStep1 from './SignupStep1.vue'
  import SignupEmail from './SignupEmail.vue'
  import SignupStep2 from './SignupStep2.vue'
  import SignupStep3 from './SignupStep3.vue'
  
  const stepIndex = ref(0)
  
  const steps = [
    SignupStep1,   // 0
    SignupEmail,   // 1
    SignupStep2,   // 2
    SignupStep3    // 3
  ]
  
  const nextStep = () => {
    if (stepIndex.value < steps.length - 1) stepIndex.value++
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