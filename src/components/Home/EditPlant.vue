<template>
  <div class="edit-plant">
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>식물 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="plant">
      <div class="header">
        <button class="back-btn" @click="$router.back()">
          <svg class="back-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="header-title">식물 정보 수정</h2>
      </div>

      <div class="image-upload-section">
        <h3>식물 사진</h3>
        <label for="plant-image" class="upload-label">
          <div class="upload-box has-image">
            <img :src="plant.image" alt="식물 미리보기" class="preview" />
            <div class="image-overlay">
              <span class="change-photo-btn">📷 사진 변경</span>
            </div>
          </div>
        </label>
        <input type="file" id="plant-image" accept="image/*" @change="onFileChange" hidden />
        <p class="image-hint">사진을 클릭하여 변경할 수 있습니다</p>
      </div>

      <div class="plant-info-section">
        <h3>기본 정보</h3>
        <div class="form-group">
          <label for="plant-name">내 식물 이름</label>
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
          <label for="plant-species">식물 종류</label>
          <div class="search-input-group">
            <input
              id="plant-species"
              v-model="plantSpecies"
              type="text"
              placeholder="예: 몬스테라, 스킨답서스"
              class="text-input"
              :disabled="searchingPlant"
              readonly
              @click="showSearchDialog = true"
            />
            <button
              @click="showSearchDialog = true"
              class="search-icon-btn"
              :disabled="searchingPlant"
            >
              <span v-if="searchingPlant" class="spinner-small"></span>
              <span v-else>🔍</span>
            </button>
          </div>
          <small class="input-hint">검색 버튼을 눌러 식물 종류를 변경할 수 있습니다</small>
          <div v-if="plantDataId" class="species-info">
            ✅ 식물 정보가 연결되었습니다
          </div>
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
          <small class="input-hint">어디에 두고 계신가요?</small>
        </div>
      </div>

      <div v-if="showSearchDialog" class="dialog-overlay" @click.self="closeSearchDialog">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>식물 종류 검색</h3>
            <button @click="closeSearchDialog" class="dialog-close">✕</button>
          </div>

          <div class="dialog-body">
            <div class="dialog-input-group">
              <input
                v-model="searchInput"
                type="text"
                placeholder="식물 종류를 입력하세요"
                class="dialog-input"
                @keyup.enter="performSearch"
                :disabled="searchingPlant"
              />
            </div>

            <div v-if="searchingPlant" class="dialog-loading">
              <div class="spinner-large"></div>
              <p>식물 정보를 검색하는 중...</p>
              <small>최대 30초 정도 소요될 수 있습니다</small>
            </div>

            <div v-else-if="searchResult" class="dialog-result">
              <h4>{{ searchResult.name_ko }}</h4>
              <div class="result-info">
                <p>{{ searchResult.information ? searchResult.information.substring(0, 200) + '...' : '정보가 없습니다' }}</p>
              </div>
              <div class="result-actions">
                <button @click="selectPlantSpecies" class="btn-primary">
                  이 식물로 선택
                </button>
                <button @click="clearSearchResult" class="btn-secondary">
                  다시 검색
                </button>
              </div>
            </div>

            <div v-else-if="searchError" class="dialog-error">
              <p>⚠️ {{ searchError }}</p>
              <button @click="clearSearchResult" class="btn-secondary">
                다시 시도
              </button>
            </div>
          </div>

          <div class="dialog-footer">
            <button @click="performSearch" class="btn-search" :disabled="!searchInput.trim() || searchingPlant">
              🔍 검색하기
            </button>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          class="save-btn" 
          @click="updatePlant" 
          :disabled="!canSave || saving"
          :class="{ disabled: !canSave || saving }"
        >
          <span v-if="saving">저장 중...</span>
          <span v-else>수정 완료</span>
        </button>
        
        <p v-if="!canSave" class="save-hint">
          {{ saveHintText }}
        </p>
      </div>
    </div>

    <div v-else class="not-found">
      <div class="not-found-content">
        <span class="not-found-icon">🌱</span>
        <h3>식물을 찾을 수 없습니다</h3>
        <p>삭제되었거나 존재하지 않는 식물입니다.</p>
        <button @click="$router.push('/')" class="go-back-btn">
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/utils/supabase.js'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import plantPic from '../../assets/plant.png'

const router = useRouter()
const route = useRoute()
const plantId = route.params.id

const loading = ref(true)
const saving = ref(false)
const searchingPlant = ref(false)
const showSearchDialog = ref(false)
const searchInput = ref('')
const searchResult = ref(null)
const searchError = ref(null)

const plant = ref(null)
const originalImage = ref(null)
const imageFile = ref(null)
const plantDataId = ref(null)
const plantSpecies = ref('')

const loadPlantData = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: plantData, error: plantError } = await supabase
      .from('User_Plants')
      .select('id, name, locate, photos, plant_data_id')
      .eq('id', plantId)
      .eq('user_id', user.id)
      .single()

    if (plantError || !plantData) {
      console.error('식물 데이터 로드 실패:', plantError)
      plant.value = null
      return
    }

    let speciesName = ''
    if (plantData.plant_data_id) {
      const { data: speciesData } = await supabase
        .from('plants_data')
        .select('name')
        .eq('plant_data_id', plantData.plant_data_id)
        .maybeSingle()

      if (speciesData) {
        speciesName = speciesData.name
        plantDataId.value = plantData.plant_data_id
      }
    }

    const imageUrl = (plantData.photos && plantData.photos[0]?.url) || plantPic

    plant.value = {
      id: plantData.id,
      name: plantData.name || '',
      location: plantData.locate || '',
      image: imageUrl
    }

    originalImage.value = imageUrl
    plantSpecies.value = speciesName

  } catch (error) {
    console.error('데이터 로드 중 오류:', error)
    plant.value = null
  } finally {
    loading.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하로 선택해주세요.')
      return
    }
    
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

const closeSearchDialog = () => {
  if (!searchingPlant.value) {
    showSearchDialog.value = false
    searchInput.value = ''
    searchResult.value = null
    searchError.value = null
  }
}

const clearSearchResult = () => {
  searchResult.value = null
  searchError.value = null
}

const performSearch = async () => {
  if (!searchInput.value.trim()) return

  searchingPlant.value = true
  searchError.value = null
  searchResult.value = null

  try {
    const plantName = searchInput.value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(
      'https://knupbxftazopklvjionb.supabase.co/functions/v1/trefle-api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ plant: plantName }),
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const data = await response.json()

    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      searchResult.value = data.results[0]
    } else if (data.plant_data_id) {
      searchResult.value = data
    } else {
      searchError.value = '검색 결과가 없습니다. 다른 이름으로 시도해보세요.'
    }

  } catch (err) {
    console.error('식물 검색 실패:', err)

    if (err.name === 'AbortError') {
      searchError.value = '검색 시간이 초과되었습니다. 다시 시도해주세요.'
    } else {
      searchError.value = `검색 중 오류가 발생했습니다: ${err.message}`
    }
  } finally {
    searchingPlant.value = false
  }
}

const selectPlantSpecies = () => {
  if (searchResult.value) {
    plantSpecies.value = searchResult.value.name_ko
    plantDataId.value = searchResult.value.plant_data_id
    showSearchDialog.value = false
    searchInput.value = ''
    searchResult.value = null
    searchError.value = null
  }
}

const canSave = computed(() => {
  return plant.value?.name.trim()
})

const saveHintText = computed(() => {
  if (!plant.value?.name.trim()) return '식물 이름을 입력해주세요'
  return ''
})

const updatePlant = async () => {
  if (!canSave.value || saving.value) return

  saving.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    let imageUrl = originalImage.value

    if (imageFile.value) {
      const file = imageFile.value
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('Photos')
        .upload(filePath, file, { contentType: file.type, upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('Photos').getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
    }

    const updatePayload = {
      name: plant.value.name,
      locate: plant.value.location,
      photos: [{ url: imageUrl, is_main: true }],
      updated_at: new Date().toISOString()
    }

    if (plantDataId.value) {
      updatePayload.plant_data_id = plantDataId.value
    }

    const { error: updateError } = await supabase
      .from('User_Plants')
      .update(updatePayload)
      .eq('id', plantId)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    alert('식물 정보가 성공적으로 수정되었습니다! 🌱')
    router.push(`/plant-detail/${plantId}`)

  } catch (error) {
    console.error('수정 실패:', error)
    alert(`수정 중 오류가 발생했습니다.\n${error?.message ?? ''}`)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadPlantData()
})
</script>

<style scoped>
.edit-plant {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  font-family: 'Noto Sans KR', sans-serif;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #cbd5c0;
  border-top-color: #4a6444;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.header-title {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.image-upload-section,
.plant-info-section {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-upload-section h3,
.plant-info-section h3 {
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
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.upload-box.has-image {
  border: 2px solid #e0e0e0;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-box:hover .image-overlay {
  opacity: 1;
}

.change-photo-btn {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.image-hint {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.search-input-group {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input-group .text-input {
  flex: 1;
}

.search-icon-btn {
  padding: 12px 16px;
  background: #568265;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon-btn:hover:not(:disabled) {
  background: #4a7058;
  transform: scale(1.05);
}

.search-icon-btn:disabled {
  background: #cbd5c0;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.species-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e8f5e9;
  border: 1px solid #4caf50;
  border-radius: 10px;
  margin-top: 8px;
  font-size: 14px;
  color: #2e7d32;
  font-weight: 500;
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

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.dialog-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.dialog-close:hover {
  background-color: #f0f0f0;
}

.dialog-body {
  padding: 20px;
}

.dialog-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: border-color 0.3s;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.dialog-input:focus {
  outline: none;
  border-color: #568265;
}

.dialog-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.dialog-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid #cbd5c0;
  border-top-color: #568265;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dialog-result {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.dialog-result h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.dialog-result p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.dialog-error {
  padding: 20px;
  text-align: center;
  color: #d32f2f;
}

.dialog-error p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 18px 20px;
  border-top: 1px solid #eee;
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary,
.btn-search {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn-primary {
  background: #568265;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4a7058;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-search {
  background: #568265;
  color: white;
  width: 100%;
}

.btn-search:hover:not(:disabled) {
  background: #4a7058;
  transform: translateY(-1px);
}

.btn-search:disabled {
  background: #cbd5c0;
  cursor: not-allowed;
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

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.not-found-content {
  text-align: center;
}

.not-found-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.not-found-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2c3e50;
}

.not-found-content p {
  margin: 0 0 24px 0;
  color: #7f8c8d;
}

.go-back-btn {
  padding: 12px 24px;
  background: #4a6444;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.go-back-btn:hover {
  background: #3a5234;
}

@media (max-width: 480px) {
  .edit-plant {
    padding: 15px;
  }
  
  .upload-box {
    width: 150px;
    height: 150px;
  }

  .dialog-content {
    width: 95%;
    max-width: 380px;
  }
}
</style>