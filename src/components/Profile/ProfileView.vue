<template>
  <div class="profile-container">
    <div class="profile-image-wrapper">
      <img class="profile-img" :src="profileImage" alt="Profile" />
      <label for="profile-upload" class="upload-icon">+</label>
      <input type="file" id="profile-upload" @change="changeProfileImage" hidden />
    </div>

    <p class="description">여기는 칭호</p>
    <h2 class="nickname">사용자 이름</h2>

    <div class="stats-box">
      <div class="stat-item">
        <strong>20</strong>
        <p>Plants</p>
      </div>
      <div class="stat-item">
        <strong>50</strong>
        <p>Posts</p>
      </div>
      <div class="stat-item">
        <strong>200</strong>
        <p>Photos</p>
      </div>
    </div>

    <div class="post-grid">
      <img v-for="(post, index) in posts" :key="index" :src="post" class="post-img" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import profileImageUrl from '../../assets/user-profile.png'
import plantImg1 from '../../assets/plant.png'
import plantImg2 from '../../assets/plant.png'
import plantImg3 from '../../assets/plant.png'

const profileImage = ref(profileImageUrl)
const posts = ref([plantImg1, plantImg2, plantImg3])

const changeProfileImage = (e) => {
  const file = e.target.files[0]
  if (file) {
    profileImage.value = URL.createObjectURL(file)
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  text-align: center;
  background-color: #f7f6ed;
  min-height: 100vh;
}

.profile-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #cdd7c4;
}

.upload-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #568265;
  color: white;
  font-weight: bold;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
}

.nickname {
  margin-top: 12px;
  font-size: 20px;
  color: #4a6444;
}

.description {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.stats-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #edf0e9;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: center;
  height: 45px;
}

.stat-item strong {
  font-size: 18px;
  color: #4a6444;
}

.stat-item p {
  font-size: 13px;
  color: #888;
  margin: 4px 0 0;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.post-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}
</style>
