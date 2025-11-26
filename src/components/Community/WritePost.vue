
<template>
  <div class="writepost">
    <header class="writepost__header">
      <button class="writepost__header-left" @click="goBack">
        <img src="../../assets/icons/back-arrow.png" alt="cancle" />
      </button>
      <button class="writepost__header-right" @click="submitPost" :disabled="!isValid">
        <li>{{ uploading ? '업로드 중...' : '완료' }}</li>
      </button>
      <img src="../../assets/logo.png" alt="Logo" class="writepost__logo" @click="goHome" />
    </header>

    <div class="writepost__content">
      <!-- 입력 폼 -->
      <div class="writepost__form">
        <div class="form-group">
          <label class="form-label">내 식물 선택 *</label>
          <div class="plant-select-trigger" @click="openPlantModal">
            <div class="plant-thumb" :style="{ backgroundImage: selectedPlant?.photo ? `url(${selectedPlant.photo})` : '' }">
              <span v-if="!selectedPlant?.photo" class="thumb-placeholder">🌿</span>
            </div>
            <div class="plant-meta">
              <div class="plant-name">{{ selectedPlant?.name || '등록된 식물을 선택하세요' }}</div>
              <div class="plant-id" v-if="selectedPlant">#{{ selectedPlant.id.slice(0, 8) }}</div>
            </div>
            <div class="plant-chevron">▼</div>
          </div>
          <small class="input-hint" v-if="!userPlants.length">등록된 식물이 없습니다. 먼저 식물을 등록해주세요.</small>
        </div>

        <div class="form-group">
          <label class="form-label">가격 *</label>
          <div class="price-input-wrapper">
            <input
              v-model.number="formData.price"
              type="number"
              placeholder="0"
              class="form-input price-input"
              min="0"
            />
            <span class="price-unit">원</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">본문 *</label>
          <textarea
            v-model="formData.text"
            placeholder="식물에 대한 설명을 작성해주세요"
            class="form-textarea"
            rows="5"
            maxlength="500"
          ></textarea>
          <span class="char-count">{{ formData.text.length }}/500</span>
        </div>

        <div class="form-group">
          <label class="form-label">해시태그</label>
          <div class="tag-input-wrapper">
            <input
              v-model="tagInput"
              @keydown.enter="addTag"
              @keydown.space="addTag"
              type="text"
              placeholder="#해시태그 (Enter 또는 Space로 추가)"
              class="form-input"
            />
          </div>
          <div class="tags-display" v-if="formData.tags.length > 0">
            <span v-for="(tag, index) in formData.tags" :key="index" class="tag-item">
              #{{ tag }}
              <button @click="removeTag(index)" class="remove-tag-btn">✕</button>
            </span>
          </div>
        </div>

        <!-- 작성자 정보 미리보기 -->
        <div class="author-preview" v-if="authorInfo">
          <div class="author-label">작성자 정보</div>
          <div class="author-info">
            <div class="author-profile" :style="{ backgroundImage: `url(${authorInfo.avatar || defaultAvatar})` }"></div>
            <div class="author-details">
              <span class="author-name">{{ authorInfo.name || '익명' }}</span>
              <span class="author-date">{{ formattedDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPlantModal" class="plant-select-modal" @click.self="showPlantModal = false">
      <div class="plant-select-panel">
        <div class="plant-select-header">
          <h4 class="plant-select-title">내 식물 선택</h4>
          <button class="plant-select-close" @click="showPlantModal = false">✕</button>
        </div>
        <div class="plant-select-list" v-if="userPlants.length">
          <div
            v-for="plant in userPlants"
            :key="plant.id"
            class="plant-option"
            :class="{ active: selectedPlantId === plant.id }"
            @click="selectPlant(plant.id)"
          >
            <div class="plant-thumb" :style="{ backgroundImage: plant.photo ? `url(${plant.photo})` : '' }">
              <span v-if="!plant.photo" class="thumb-placeholder">🌿</span>
            </div>
            <div class="plant-meta">
              <div class="plant-name">{{ plant.name }}</div>
              <div class="plant-id">#{{ plant.id.slice(0, 8) }}</div>
            </div>
            <div class="plant-check" v-if="selectedPlantId === plant.id">✔</div>
          </div>
        </div>
        <div v-else class="plant-empty">등록된 식물이 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../utils/supabase'

export default {
  name: 'WritePost',

  setup() {
    const router = useRouter()
    const route = useRoute()
    const editPostId = route.query.id

    const uploading = ref(false)
    const userPlants = ref([])
    const selectedPlantId = ref('')
    const showPlantModal = ref(false)

  const formData = ref({
      price: null,
      text: '',
      tags: [],
      image: null
    })

    const imagePreview = ref(null)
    const tagInput = ref('')
    const authorInfo = ref(null)
    const defaultAvatar = 'https://picsum.photos/100?random=1'

    // 유효성 검사
    const selectedPlant = computed(() => userPlants.value.find(p => p.id === selectedPlantId.value))

    const isValid = computed(() => {
      const hasPlant = selectedPlantId.value || editPostId
      return (
        hasPlant &&
        formData.value.price > 0 &&
        formData.value.text.trim() !== ''
      )
    })

    // 현재 날짜 포맷
    const formattedDate = computed(() => {
      return new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) throw error

        if (user) {
          // profiles 대신 Users 테이블 사용
          const { data: profile, error: profileError } = await supabase
            .from('Users')
            .select('name, avatar_url, email')
            .eq('id', user.id)
            .single()

          if (!profileError && profile) {
            authorInfo.value = {
              id: user.id,
              name: profile.name || user.email.split('@')[0], 
              avatar: profile.avatar_url,
              email: profile.email || user.email
            }
          } else {
            authorInfo.value = {
              id: user.id,
              name: user.email,
              email: user.email
            }
          }
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
        authorInfo.value = {
          name: '익명',
          avatar: defaultAvatar
        }
      }
    }

    const handleImageSelect = () => {}
    const removeImage = () => {}
    const applySelectedPlantTitle = () => {
      const plant = userPlants.value.find(p => p.id === selectedPlantId.value)
      if (plant) {
        formData.value.title = plant.name || ''
      }
    }

    const selectPlant = (id) => { selectedPlantId.value = id; showPlantModal.value = false; applySelectedPlantTitle() }
    const openPlantModal = () => { if (userPlants.value.length) showPlantModal.value = true }

    // 해시태그 추가
    const addTag = (event) => {
      event.preventDefault()
      const tag = tagInput.value.trim().replace(/^#/, '')

      if (tag && !formData.value.tags.includes(tag)) {
        if (formData.value.tags.length < 10) {
          formData.value.tags.push(tag)
          tagInput.value = ''
        } else {
          alert('해시태그는 최대 10개까지 추가할 수 있습니다.')
        }
      }
    }

    // 해시태그 제거
    const removeTag = (index) => {
      formData.value.tags.splice(index, 1)
    }

    // 게시물 제출 (등록/수정)
    const submitPost = async () => {
      uploading.value = true

      try {
        const selectedPlant = userPlants.value.find(p => p.id === selectedPlantId.value)
        let imageUrl = selectedPlant?.photo || selectedPlant?.photos?.[0]?.url || imagePreview.value || null

        const postData = {
          title: selectedPlant?.name || formData.value.title,
          price: formData.value.price,
          text: formData.value.text,
          tags: formData.value.tags,
          image: imageUrl,
          user_id: authorInfo.value?.id || null,
          name: authorInfo.value?.name || '익명',
          profile: authorInfo.value?.avatar || defaultAvatar,
          status: 'available',
          updated_at: new Date().toISOString()
        }

        if (editPostId) {
          // ID가 있으면 업데이트
          const { error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', editPostId)
          
          if (error) throw error
          alert('수정되었습니다.')
        } else {
          // ID가 없으면 새로 등록
          const { error } = await supabase
            .from('posts')
            .insert([postData])
          
          if (error) throw error
          alert('등록되었습니다.')
        }
        
        router.replace('/community')

      } catch (error) {
        console.error('저장 실패:', error)
        alert('오류가 발생했습니다: ' + error.message)
      } finally {
        uploading.value = false
      }
    }

    const goBack = () => {
      if (confirm('작성 중인 내용이 사라집니다. 뒤로 가시겠습니까?')) {
        router.back()
      }
    }

    const goHome = () => {
      if (confirm('작성 중인 내용이 사라집니다. 홈으로 가시겠습니까?')) {
        router.push('/')
      }
    }

    const applyPrefillFromQuery = () => {
      if (editPostId) return

      const { price, title } = route.query

      if (typeof title === 'string' && title.trim()) {
        formData.value.title = title
      }

      const parsedPrice = Number(price)
      if (!Number.isNaN(parsedPrice)) {
        formData.value.price = parsedPrice
      }
    }

    const loadUserPlants = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('User_Plants')
          .select('id, name, photos, plant_data_id')
          .eq('user_id', user.id)
        if (data) {
          const plants = data.map(p => ({
            id: p.id,
            name: p.name,
            plant_data_id: p.plant_data_id,
            photo: p.photos?.[0]?.url || null
          }))

          const ids = plants.map(p => p.plant_data_id).filter(Boolean)
          let speciesMap = {}
          if (ids.length) {
            const { data: species } = await supabase
              .from('plants_data')
              .select('plant_data_id, name')
              .in('plant_data_id', ids)
            if (species) {
              speciesMap = species.reduce((acc, cur) => {
                acc[cur.plant_data_id] = cur.name
                return acc
              }, {})
            }
          }

          userPlants.value = plants.map(p => ({
            ...p,
            speciesName: speciesMap[p.plant_data_id] || null
          }))

          if (selectedPlantId.value) {
            applySelectedPlantTitle()
          }
        }
      } catch (err) {
        console.error('내 식물 조회 실패:', err)
      }
    }

    onMounted(async () => {
      await fetchUserInfo()
      await loadUserPlants()
      
      // 수정 모드라면 기존 데이터 불러오기
      if (editPostId) {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', editPostId)
          .single()
          
        if (!error && data) {
          formData.value.title = data.title
          formData.value.price = data.price
          formData.value.text = data.text
          formData.value.tags = data.tags || []
          imagePreview.value = data.image 
          formData.value.image = data.image 
        }
      } else {
        applyPrefillFromQuery()
      }
    })

    return {
      formData,
      imagePreview,
      tagInput,
      authorInfo,
      defaultAvatar,
      isValid,
      formattedDate,
      uploading,
      handleImageSelect,
      removeImage,
      addTag,
      removeTag,
      submitPost,
      goBack,
      goHome,
      userPlants,
      selectedPlantId,
      selectedPlant,
      showPlantModal,
      openPlantModal,
      selectPlant
    }
  }
}
</script>

<style scoped>
.writepost {
  margin: 0 auto;
  max-width: 460px;
  width: 100%;
  min-height: 100vh;
  font-family: "consolas";
  box-sizing: border-box;
  position: relative;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  background-color: #fafafa;
  padding-top: 60px;
}

.writepost__header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 460px;
  height: 48px;
  background-color: white;
  border-bottom: 1px solid #eee;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.writepost__header-left,
.writepost__header-right {
  background: none;
  border: none;
  list-style: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: opacity 0.2s;
}

.writepost__header-left:hover,
.writepost__header-right:hover:not(:disabled) {
  opacity: 0.7;
}

.writepost__header-right:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.writepost__header-left img {
  width: 20px;
  height: auto;
  display: block;
}

.writepost__header-right li {
  list-style: none;
  font-weight: 600;
  color: #568265;
}

.writepost__logo {
  width: 28px;
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin: auto;
  display: block;
  cursor: pointer;
  transition: opacity 0.2s;
}

.writepost__logo:hover {
  opacity: 0.7;
}

.writepost__content {
  padding: 20px;
}

/* 이미지 업로드 */
/* (이미지 업로드/미리보기 섹션 제거) */

.plant-select-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.plant-select-trigger:hover {
  border-color: #568265;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.plant-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f0f0;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.thumb-placeholder { opacity: 0.6; }

.plant-meta { flex: 1; min-width: 0; }
.plant-name { font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plant-id { font-size: 12px; color: #999; }
.plant-chevron { color: #777; font-size: 12px; }

.plant-select-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
.plant-select-panel { width: 100%; max-width: 420px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.2); max-height: 80vh; display: flex; flex-direction: column; }
.plant-select-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.plant-select-title { margin: 0; font-size: 16px; font-weight: 700; }
.plant-select-close { background: none; border: none; font-size: 18px; cursor: pointer; }
.plant-select-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px; }
.plant-option { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fff; cursor: pointer; transition: all 0.2s; }
.plant-option:hover { border-color: #568265; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.plant-option.active { border-color: #568265; background: #f3f8f4; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.plant-check { color: #568265; font-weight: 700; }
.plant-empty { text-align: center; padding: 20px; color: #777; font-size: 14px; }

/* 폼 */
.writepost__form {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.plant-select {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.plant-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.plant-option:hover { border-color: #568265; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.plant-option.active { border-color: #568265; background: #f3f8f4; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }

.plant-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f0f0;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.thumb-placeholder { opacity: 0.6; }

.plant-meta { flex: 1; min-width: 0; }
.plant-name { font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plant-id { font-size: 12px; color: #999; }

.plant-check { color: #568265; font-weight: 700; }

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #568265;
  box-shadow: 0 0 0 3px rgba(86, 130, 101, 0.1);
}

.price-input-wrapper {
  position: relative;
}

.price-input {
  padding-right: 40px;
}

.price-unit {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #568265;
  box-shadow: 0 0 0 3px rgba(86, 130, 101, 0.1);
}

.char-count {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 12px;
  color: #999;
}

/* 태그 */
.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0f8f4;
  color: #568265;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #568265;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-tag-btn:hover {
  opacity: 1;
}

/* 작성자 정보 */
.author-preview {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.author-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
  font-weight: 600;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-profile {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: #eee;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.author-date {
  font-size: 12px;
  color: #999;
}
</style>
