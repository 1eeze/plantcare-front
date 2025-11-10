<template>
  <div class="add-plant">
    <!-- 상단 헤더 -->
    <div class="header">
      <button class="back-btn" @click="$router.back()" aria-label="뒤로가기">
        <svg class="back-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2 class="header-title">내 식물 등록</h2>
    </div>

    <!-- 식물 사진 업로드 -->
    <div class="image-upload-section">
      <h3>식물 사진</h3>
      <label for="plant-image" class="upload-label">
        <div class="upload-box" :class="{ 'has-image': plant.image }">
          <div v-if="!plant.image" class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#999"/>
            </svg>
            <span>사진을 추가해주세요</span>
            <small>클릭하여 촬영<br>
              혹은 갤러리에서 선택</small>
          </div>
          <img v-else :src="plant.image" alt="식물 미리보기" class="preview" />
        </div>
      </label>
      <input type="file" id="plant-image" accept="image/*" @change="onFileChange" hidden />
    </div>

    <!-- 팝업 모달 -->
    <div v-if="showPopup" class="popup-overlay" @click.self="showPopup = false">
      <div class="popup">
        <h3>사진 선택</h3>
        <button @click="openCamera">📸 카메라 촬영</button>
        <button @click="openGallery">🖼 갤러리에서 선택</button>
        <button class="close" @click="showPopup = false">닫기</button>
      </div>
    </div>

    <!-- 숨겨진 input -->
    <input type="file" ref="galleryInput" accept="image/*" @change="onFileChange" hidden />
    <input type="file" ref="cameraInput" accept="image/*" capture="environment" @change="onFileChange" hidden />

    <!-- 식물 정보 입력 -->
    <div class="plant-info-section">
      <h3>기본 정보</h3>
      <div class="form-group">
        <label for="plant-name">식물 이름</label>
        <input 
          id="plant-name"
          v-model="plant.name" 
          type="text" 
          placeholder="예: 우리집 몬스테라"
          class="text-input"
        />
        <small class="input-hint">식물에게 애칭을 지어주세요</small>
      </div>

      <div class="form-group">
        <label for="plant-location">위치</label>
        <input 
          id="plant-location"
          v-model="plant.location" 
          type="text" 
          placeholder="예: 거실 창가, 침실"
          class="text-input"
        />
        <small class="input-hint">어디에 두실 예정인가요?</small>
      </div>
    </div>

    <!-- 센서 연결 상태 -->
    <div class="sensor-section">
      <h3>센서 연결</h3>
      
      <div class="sensor-connection" :class="{ connected: sensorConnected, connecting: connecting }">
        <div class="connection-status">
          <div class="status-indicator"></div>
          <span v-if="connecting">센서 연결 중...</span>
          <span v-else-if="sensorConnected">센서 연결됨</span>
          <span v-else>센서 연결 안됨</span>
        </div>
        
        <button 
          v-if="!sensorConnected" 
          @click="connectSensor" 
          :disabled="connecting"
          class="connect-btn"
        >
          {{ connecting ? '연결 중...' : '센서 연결' }}
        </button>
      </div>

      <!-- 센서 데이터 표시 -->
      <div v-if="sensorConnected" class="sensor-data">
        <h4>현재 환경 정보</h4>
        <div class="sensor-grid">
          <div class="sensor-card">
            <div class="sensor-icon">💧</div>
            <div class="sensor-info">
              <span class="sensor-label">토양 습도</span>
              <span class="sensor-value">{{ sensorData.soilMoisture }}%</span>
              <span class="sensor-status" :class="getSensorStatus('moisture')">
                {{ getSensorStatusText('moisture') }}
              </span>
            </div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon">☀️</div>
            <div class="sensor-info">
              <span class="sensor-label">조도</span>
              <span class="sensor-value">{{ sensorData.lightLevel }}%</span>
              <span class="sensor-status" :class="getSensorStatus('light')">
                {{ getSensorStatusText('light') }}
              </span>
            </div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon">💨</div>
            <div class="sensor-info">
              <span class="sensor-label">공기 습도</span>
              <span class="sensor-value">{{ sensorData.humidity }}%</span>
              <span class="sensor-status" :class="getSensorStatus('humidity')">
                {{ getSensorStatusText('humidity') }}
              </span>
            </div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon">🌡️</div>
            <div class="sensor-info">
              <span class="sensor-label">온도</span>
              <span class="sensor-value">{{ sensorData.temperature }}°C</span>
              <span class="sensor-status" :class="getSensorStatus('temperature')">
                {{ getSensorStatusText('temperature') }}
              </span>
            </div>
          </div>
        </div>

        <div class="sensor-note">
          <small>💡 센서 데이터는 실시간으로 업데이트됩니다</small>
        </div>
      </div>
    </div>

    <!-- 저장 버튼 -->
    <div class="action-buttons">
      <button 
        class="save-btn" 
        @click="savePlant" 
        :disabled="!canSave"
        :class="{ disabled: !canSave }"
      >
        <span v-if="saving">저장 중...</span>
        <span v-else>식물 등록하기</span>
      </button>
      
      <p v-if="!canSave" class="save-hint">
        {{ saveHintText }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/utils/supabase.js'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const router = useRouter()

// 개발모드 자동 세션 확보 (최초 1회)
async function ensureDevSession() {
  if (!import.meta.env.DEV) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    try {
      await supabase.auth.signInWithPassword({
        email: 'dev@example.com',
        password: 'dev123456'
      })
    } catch (e) {
      console.error('개발용 자동 로그인 실패:', e)
    }
  }
}

const plant = ref({
  image: null,
  name: '',
  location: ''
})
const imageFile = ref(null)

const showPopup = ref(false)
const galleryInput = ref(null)
const cameraInput = ref(null)

const openGallery = () => {
  galleryInput.value.click()
  showPopup.value = false
}
const openCamera = () => {
  cameraInput.value.click()
  showPopup.value = false
}

const sensorConnected = ref(false)
const connecting = ref(false)
const saving = ref(false)

const sensorData = ref({
  soilMoisture: 0,
  lightLevel: 0,
  humidity: 0,
  temperature: 0
})

let sensorInterval = null

// 센서 연결
const connectSensor = async () => {
  connecting.value = true
  
  try {
    // 실제로는 여기서 센서 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    sensorConnected.value = true
    startSensorDataUpdate()
  } catch (error) {
    console.error('센서 연결 실패:', error)
    alert('센서 연결에 실패했습니다. 다시 시도해주세요.')
  } finally {
    connecting.value = false
  }
}

// 센서 데이터 실시간 업데이트 시뮬레이션
const startSensorDataUpdate = () => {
  sensorInterval = setInterval(() => {
    sensorData.value = {
      soilMoisture: Math.floor(Math.random() * 40) + 40, // 40-80%
      lightLevel: Math.floor(Math.random() * 30) + 60,   // 60-90%
      humidity: Math.floor(Math.random() * 20) + 50,     // 50-70%
      temperature: Math.floor(Math.random() * 6) + 20    // 20-26°C
    }
  }, 3000)
}

// 센서 상태 판단
const getSensorStatus = (type) => {
  const value = sensorData.value
  switch (type) {
    case 'moisture':
      return value.soilMoisture < 30 ? 'low' : value.soilMoisture > 70 ? 'high' : 'good'
    case 'light':
      return value.lightLevel < 40 ? 'low' : value.lightLevel > 80 ? 'high' : 'good'
    case 'humidity':
      return value.humidity < 40 ? 'low' : value.humidity > 70 ? 'high' : 'good'
    case 'temperature':
      return value.temperature < 18 ? 'low' : value.temperature > 28 ? 'high' : 'good'
    default:
      return 'good'
  }
}

const getSensorStatusText = (type) => {
  const status = getSensorStatus(type)
  return status === 'good' ? '적정' : status === 'high' ? '높음' : '낮음'
}

// 저장 가능 여부
const canSave = computed(() => {
  return plant.value.name.trim() && plant.value.image && sensorConnected.value
})

const saveHintText = computed(() => {
  if (!plant.value.name.trim()) return '식물 이름을 입력해주세요'
  if (!plant.value.image) return '식물 사진을 선택해주세요'
  if (!sensorConnected.value) return '센서를 연결해주세요'
  return ''
})

// 파일 선택
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하로 선택해주세요.')
      return
    }
    
    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택 가능합니다.')
      return
    }
    
    if (plant.value.image && plant.value.image.startsWith('blob:')) {
    URL.revokeObjectURL(plant.value.image)
    }

    imageFile.value = file
    plant.value.image = URL.createObjectURL(file)
  }
}

// ✅ 식물 저장
const savePlant = async () => {
  if (!canSave.value) return
  if (!imageFile.value) { alert('이미지 파일이 선택되지 않았습니다.'); return }

  saving.value = true
  try {
    // (A) 세션 보장(만료 대비)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { error: autoLoginError } = await supabase.auth.signInWithPassword({
        email: 'dev@example.com',
        password: 'dev123456'
      })
      if (autoLoginError) throw new Error('세션 없음: 자동 로그인 실패')
    }

    // (B) 업로드 경로/확장자
    const file = imageFile.value
    const fileExt = file.name.split('.').pop()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? 'anonymous'
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    // (C) Storage 업로드 (contentType 지정)
    const { error: uploadError } = await supabase
      .storage
      .from('Photos')
      .upload(filePath, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    // (D) public URL
    const { data: urlData } = supabase.storage.from('Photos').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    // (E) DB insert (RLS 대비 user_id 등 컬럼 포함: 스키마에 맞춰 조정)
    const { error: insertError } = await supabase
      .from('plants')
      .insert({
        user_id: user?.id ?? null,             // ← RLS가 auth.uid() 요구시 중요
        name: plant.value.name,
        locate: plant.value.location,
        photos: [{ url: publicUrl, is_main: true }],
        sensor_moisture: sensorData.value.soilMoisture,
        sensor_light:    sensorData.value.lightLevel,
        sensor_humidity: sensorData.value.humidity,
        temperature:     sensorData.value.temperature
      })
    if (insertError) throw insertError

    alert('식물이 성공적으로 등록되었습니다! 🌱')
    router.push({ name: 'Home', query: { refresh: Date.now() } })
  } catch (error) {
    console.error('저장 실패:', error)
    alert(`저장 중 오류가 발생했습니다.\n${error?.message ?? ''}`)
  } finally {
    saving.value = false
  }
}

// ✅ 최초 진입 시: 세션 보장 + 센서 연결
onMounted(async () => {
  await ensureDevSession()
  setTimeout(() => { connectSensor() }, 1000)
})
</script>

<style scoped>
.add-plant {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.back-icon {
  width: 22px;
  height: 22px;  
  object-fit: contain;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.image-upload-section,
.plant-info-section,
.sensor-section {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-upload-section h3,
.plant-info-section h3,
.sensor-section h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-box {
  width: 200px;
  height: 200px;
  border: 3px dashed #ddd;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-box:hover {
  border-color: #568265;
  background-color: #f8faf9;
}

.upload-box.has-image {
  border: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  text-align: center;
}

.upload-placeholder span {
  font-weight: 500;
}

.upload-placeholder small {
  color: #999;
  font-size: 12px;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2c3e50;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.text-input:focus {
  outline: none;
  border-color: #568265;
}

.input-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.sensor-connection {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.sensor-connection.connecting {
  border-color: #f39c12;
  background-color: #fef9e7;
}

.sensor-connection.connected {
  border-color: #27ae60;
  background-color: #eafaf1;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e74c3c;
}

.connecting .status-indicator {
  background-color: #f39c12;
  animation: pulse 1.5s infinite;
}

.connected .status-indicator {
  background-color: #27ae60;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.connect-btn {
  padding: 8px 16px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.connect-btn:hover:not(:disabled) {
  background: #4a7058;
}

.connect-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.sensor-data h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.sensor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.sensor-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sensor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sensor-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.sensor-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.sensor-status {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 10px;
  align-self: flex-start;
}

.sensor-status.good {
  background: #d4edda;
  color: #155724;
}

.sensor-status.low {
  background: #f8d7da;
  color: #721c24;
}

.sensor-status.high {
  background: #fff3cd;
  color: #856404;
}

.sensor-note {
  text-align: center;
  color: #666;
}

.action-buttons {
  text-align: center;
  padding: 20px 0;
}

.save-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.save-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 130, 101, 0.4);
}

.save-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-hint {
  margin: 12px 0 0 0;
  color: #e74c3c;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 480px) {
  .add-plant {
    padding: 15px;
  }
  
  .upload-box {
    width: 150px;
    height: 150px;
  }
  
  .sensor-grid {
    grid-template-columns: 1fr;
  }
}

.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.popup {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  width: 250px;
}
.popup h3 {
  margin-bottom: 15px;
}
.popup button {
  display: block;
  margin: 10px auto;
  padding: 10px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: #4a6444;
  color: white;
  cursor: pointer;
}
.popup .close {
  background: #ccc;
  color: black;
}
</style>