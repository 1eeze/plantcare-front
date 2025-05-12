<template>
  <div class="profile-setup-container">
      <p class="title">프로필 이미지와<br />닉네임을 입력해주세요.</p>
  
    <!-- 프로필 이미지 -->
    <div class="profile-image-wrapper">
      <label for="profileImage">
        <div class="image-preview">
          <img v-if="imageUrl" :src="imageUrl" alt="프로필 미리보기" />
          <div v-else class="default-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#929f92" width="80" height="80">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Z"/>
              </svg>
          </div>
        </div>
        <input type="file" id="profileImage" accept="image/*" @change="onImageChange" hidden />
      </label>
    </div>
  
    <!-- 닉네임 입력 -->
    <div class="nickname-input-wrapper">
      <input
        v-model="nickname"
        type="text"
        placeholder="닉네임을 입력하세요"
        class="nickname-input"
      />
      <button v-if="nickname" class="clear-button" @click="nickname = ''">✕</button>
    </div>
    <p class="nickname-info">사용할 수 있는 이름이에요.</p>
    <p class="disclaimer">
      프로필 정보(사진, 이름)는 회원 식별, 친구간 커뮤니케이션 등의 목적으로 활용되며, 서비스 이용기간 동안만 보관됩니다.
    </p>
  
    <!-- 하단 버튼 영역 -->
    <div class="bottom-button-row">
      <button class="prev-button" @click="goBack">이전</button>
      <button class="next-button" :disabled="!nickname" @click="goNext">다음</button>
    </div>
  </div>
</template>
 
 
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['next', 'prev'])
const router = useRouter()
  
const nickname = ref('')
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
  router.push('/signup/email')  // 상위 컴포넌트에서 이전 단계로 이동
}
const goNext = () => {
  router.push('/signup/step3')  // 추후 formData 형태로 DB 서버에 POST 요청 전송 추가
}
</script>
 

<style>
body {
    background-color: #FEFAF0;
}
</style>

<style scoped>
.profile-setup-container {
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
  
.profile-image-wrapper {
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
  
.default-icon {
  font-size: 48px;
  color: #999;
}
  
.nickname-input-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
  
.nickname-input {
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
  
.nickname-info {
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
  margin-top: auto; /* 아래로 붙이기 */
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
</style>