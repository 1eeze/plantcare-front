<template>
    <div class="plant-setup-container">
        <p class="title">식물 이미지와<br />별명을 입력해주세요.</p>
    
      <!-- 식물(화분) 이미지 -->
      <div class="plant-image-wrapper">
        <label for="plantImage">
          <div class="image-preview">
            <img v-if="imageUrl" :src="imageUrl" alt="식물 사진 미리보기" />
            <div v-else class="plant-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#929f92" width="75" height="75">
                <path d="M342-160h276l40-160H302l40 160Zm0 80q-28 0-49-17t-28-44l-45-179h520l-45 179q-7 27-28 44t-49 17H342ZM200-400h560v-80H200v80Zm280-240q0-100 70-170t170-70q0 90-57 156t-143 80v84h320v160q0 33-23.5 56.5T760-320H200q-33 0-56.5-23.5T120-400v-160h320v-84q-86-14-143-80t-57-156q100 0 170 70t70 170Z"/>
              </svg>
            </div>
          </div>
          <input type="file" id="plantImage" accept="image/*" @change="onImageChange" hidden />
        </label>
      </div>
    
      <!-- 별명 입력 -->
      <div class="plant-nickname-input-wrapper">
        <input
          v-model="PlantNickname"
          type="text"
          placeholder="별명을 입력하세요"
          class="plant-nickname-input"
        />
        <button v-if="PlantNickname" class="clear-button" @click="PlantNickname = ''">✕</button>
      </div>
    
    <!-- 여백 -->
    <div class="placeholder-space"></div>
      
    <!-- 하단 버튼 영역 -->
    <div class="bottom-button-row">
        <button class="prev-button" @click="goBack">이전</button>
        <button
        class="next-button"
        :disabled="!PlantNickname || !imageFile"
        @click="goNext"
      >
        완료
      </button>
    </div>

      <!-- 건너뛰기 버튼 -->
      <button class="skip-button" @click="skipStep">건너뛰기</button>
    </div>
  </template>
   
   
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const emit = defineEmits(['next', 'prev'])
  const router = useRouter()
    
  const PlantNickname = ref('')
  const imageFile = ref(null)
  const imageUrl = ref(null)
    
  const onImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        imageFile.value = file
        imageUrl.value = URL.createObjectURL(file)
      }
  }
  
  const goBack = () => {
    router.push('/signup/step2') // 상위 컴포넌트에서 이전 단계로 이동
  }
  const goNext = () => {
    router.push('/signup/complete')  // 추후 formData 형태로 DB 서버에 POST 요청 전송 추가
  }

  const skipStep = () => {
    router.push('/signup/complete')  // 또는 emit('skip') 등 필요에 따라
  }
  </script>
   
  
  <style>
  body {
    background-color: #FEFAF0;
  }
  </style>
  
  <style scoped>
  .plant-setup-container {
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
    padding: 30px 20px;
  }
    
  .title {
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    margin-bottom: 50px;
    color: #4C2B08;
  }
    
  .plant-image-wrapper {
    margin-bottom: 24px;
  }
    
  .image-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background-color: #eee;
    margin: 0 auto;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
    
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
    
  .plant-icon {
    font-size: 48px;
    color: #999;
    margin-top: 6px;
  }
    
  .plant-nickname-input-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
    
  .plant-nickname-input {
    width: 80%;
    padding: 10px 36px 10px 10px;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 16px;
  }
    
  .clear-button {
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
  }
    
  .plant-nickname-info {
      font-size: 12px;
      color: #888;
      margin-bottom: 16px;
  }
    
  .disclaimer {
    font-size: 10px;
    color: #aaa;
    margin-bottom: 30px;
  }
    
  .bottom-button-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 40px;
  }
  
  .prev-button,
  .next-button {
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    width: 45%;
  }
  
  .prev-button {
    background-color: #ccc;
    color: #333;
  }
  
  .next-button {
    background-color: #568265;
    color: white;
  }
  
  .next-button:disabled {
    background-color: #bbb;
    cursor: not-allowed;
  }

  .skip-button {
  margin-top: 16px;
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 24px;
  width: 100%;
  font-size: 14px;
  color: #4C2B08;
  cursor: pointer;
}

.skip-button:hover {
  background-color: #f0eee5;
}

.placeholder-space {
  height: 50px;
}
  </style>