<template>
  <div class="writepost">
    <!-- 헤더 -->
    <header class="writepost-header">
      <button @click="goBack" class="back-btn" aria-label="뒤로가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">식물 판매하기</h1>
      <button 
        @click="publishPost" 
        :disabled="!canPublish"
        :class="{ active: canPublish }"
        class="publish-btn"
      >
        {{ isPublishing ? '게시 중...' : '완료' }}
      </button>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="writepost-main">
      <!-- 사진 업로드 섹션 -->
      <section class="photo-section">
        <h2 class="section-title">사진 <span class="required">*</span></h2>
        <div class="photo-upload-area">
          <div class="photo-grid">
            <!-- 업로드된 이미지들 -->
            <div 
              v-for="(image, index) in uploadedImages" 
              :key="index"
              class="photo-item uploaded"
            >
              <img :src="image.url" :alt="`사진 ${index + 1}`" />
              <button @click="removeImage(index)" class="remove-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div v-if="index === 0" class="main-photo-badge">대표</div>
            </div>
            
            <!-- 업로드 버튼 -->
            <label 
              v-if="uploadedImages.length < 10" 
              for="photo-input" 
              class="photo-item upload-btn"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>사진 추가</span>
              <small>{{ uploadedImages.length }}/10</small>
            </label>
          </div>
          
          <input 
            type="file" 
            id="photo-input"
            accept="image/*"
            multiple
            @change="handleImageUpload"
            class="hidden-input"
          />
          
          <p class="photo-help">
            💡 첫 번째 사진이 대표 사진이 됩니다. 최대 10장까지 업로드 가능해요.
          </p>
        </div>
      </section>

      <!-- 기본 정보 섹션 -->
      <section class="basic-info-section">
        <h2 class="section-title">기본 정보</h2>
        
        <div class="form-group">
          <label for="title" class="form-label">
            제목 <span class="required">*</span>
          </label>
          <input 
            id="title"
            v-model="postData.title"
            type="text" 
            placeholder="어떤 식물을 판매하시나요?"
            class="form-input"
            maxlength="40"
          />
          <small class="char-count">{{ postData.title.length }}/40</small>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="category" class="form-label">카테고리</label>
            <select id="category" v-model="postData.category" class="form-select">
              <option value="">선택해주세요</option>
              <option value="monstera">몬스테라</option>
              <option value="philodendron">필로덴드론</option>
              <option value="pothos">포토스</option>
              <option value="ficus">고무나무</option>
              <option value="succulent">다육식물</option>
              <option value="cactus">선인장</option>
              <option value="other">기타</option>
            </select>
          </div>
          
          <div class="form-group half">
            <label for="condition" class="form-label">상태</label>
            <select id="condition" v-model="postData.condition" class="form-select">
              <option value="">선택해주세요</option>
              <option value="excellent">매우 좋음</option>
              <option value="good">좋음</option>
              <option value="fair">보통</option>
              <option value="needs-care">관리 필요</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="price" class="form-label">
            가격 <span class="required">*</span>
          </label>
          <div class="price-input-wrapper">
            <input 
              id="price"
              v-model="postData.price"
              type="number"
              placeholder="0"
              class="form-input price-input"
              min="0"
            />
            <span class="currency">원</span>
          </div>
          <div class="price-suggestions">
            <button 
              v-for="price in priceSuggestions" 
              :key="price"
              @click="postData.price = price"
              class="price-suggestion-btn"
              type="button"
            >
              {{ formatPrice(price) }}
            </button>
          </div>
        </div>
      </section>

      <!-- 상세 설명 섹션 -->
      <section class="description-section">
        <h2 class="section-title">상세 설명</h2>
        
        <div class="form-group">
          <label for="description" class="form-label">
            설명 <span class="required">*</span>
          </label>
          <textarea 
            id="description"
            v-model="postData.description"
            placeholder="식물의 상태, 크기, 키운 기간 등을 자세히 적어주세요.&#10;구매자가 알아야 할 중요한 정보가 있다면 함께 적어주세요."
            class="form-textarea"
            rows="6"
            maxlength="1000"
          ></textarea>
          <small class="char-count">{{ postData.description.length }}/1000</small>
        </div>

        <div class="form-group">
          <label class="form-label">태그 (선택)</label>
          <div class="tag-input-wrapper">
            <div class="selected-tags">
              <span 
                v-for="(tag, index) in postData.tags" 
                :key="index"
                class="tag-chip"
              >
                #{{ tag }}
                <button @click="removeTag(index)" type="button">✕</button>
              </span>
            </div>
            <input 
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              @keydown.space.prevent="addTag"
              type="text"
              placeholder="태그를 입력하고 엔터나 스페이스를 눌러주세요"
              class="tag-input"
            />
          </div>
          <div class="popular-tags">
            <small>추천 태그:</small>
            <button 
              v-for="tag in popularTags" 
              :key="tag"
              @click="addPopularTag(tag)"
              class="popular-tag-btn"
              type="button"
            >
              #{{ tag }}
            </button>
          </div>
        </div>
      </section>

      <!-- 거래 정보 섹션 -->
      <section class="trade-info-section">
        <h2 class="section-title">거래 정보</h2>
        
        <div class="form-group">
          <label class="form-label">거래 방법</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="postData.tradeMethods" 
                value="direct"
              />
              <span class="checkbox-custom"></span>
              직거래
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="postData.tradeMethods" 
                value="delivery"
              />
              <span class="checkbox-custom"></span>
              택배거래
            </label>
            <label class="checkbox-item">
              <input 
                type="checkbox" 
                v-model="postData.tradeMethods" 
                value="pickup"
              />
              <span class="checkbox-custom"></span>
              픽업
            </label>
          </div>
        </div>

        <div class="form-group" v-if="postData.tradeMethods.includes('direct')">
          <label for="location" class="form-label">거래 희망 지역</label>
          <input 
            id="location"
            v-model="postData.location"
            type="text"
            placeholder="예: 강남구 역삼동"
            class="form-input"
          />
        </div>
      </section>

      <!-- 추가 옵션 섹션 -->
      <section class="additional-options-section">
        <h2 class="section-title">추가 옵션</h2>
        
        <div class="toggle-group">
          <label class="toggle-item">
            <input 
              type="checkbox" 
              v-model="postData.negotiable"
            />
            <span class="toggle-switch"></span>
            가격 협상 가능
          </label>
          
          <label class="toggle-item">
            <input 
              type="checkbox" 
              v-model="postData.urgent"
            />
            <span class="toggle-switch"></span>
            급하게 판매
          </label>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응성 데이터
const postData = ref({
  title: '',
  category: '',
  condition: '',
  price: '',
  description: '',
  tags: [],
  tradeMethods: [],
  location: '',
  negotiable: false,
  urgent: false
})

const uploadedImages = ref([])
const newTag = ref('')
const isPublishing = ref(false)

// 상수들
const priceSuggestions = [10000, 20000, 30000, 50000, 100000]
const popularTags = ['실내식물', '초보추천', '키우기쉬움', '공기정화', '인테리어', '희귀품종']

// 계산된 속성
const canPublish = computed(() => {
  return postData.value.title.trim() && 
         postData.value.price && 
         postData.value.description.trim() && 
         uploadedImages.value.length > 0
})

// 메서드들
const goBack = () => {
  if (hasUnsavedChanges()) {
    if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠어요?')) {
      router.back()
    }
  } else {
    router.back()
  }
}

const hasUnsavedChanges = () => {
  return postData.value.title || 
         postData.value.description || 
         uploadedImages.value.length > 0
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (uploadedImages.value.length >= 10) return
    
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
    
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImages.value.push({
        file,
        url: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
  
  // 파일 입력 초기화
  event.target.value = ''
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !postData.value.tags.includes(tag) && postData.value.tags.length < 5) {
    postData.value.tags.push(tag)
    newTag.value = ''
  }
}

const addPopularTag = (tag) => {
  if (!postData.value.tags.includes(tag) && postData.value.tags.length < 5) {
    postData.value.tags.push(tag)
  }
}

const removeTag = (index) => {
  postData.value.tags.splice(index, 1)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

const publishPost = async () => {
  if (!canPublish.value) return
  
  isPublishing.value = true
  
  try {
    // 실제 API 호출 시뮬레이션
    const formData = new FormData()
    
    // 이미지들 추가
    uploadedImages.value.forEach((image, index) => {
      formData.append(`images`, image.file)
    })
    
    // 다른 데이터들 추가
    Object.keys(postData.value).forEach(key => {
      if (key === 'tags' || key === 'tradeMethods') {
        formData.append(key, JSON.stringify(postData.value[key]))
      } else {
        formData.append(key, postData.value[key])
      }
    })
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('게시글 데이터:', Object.fromEntries(formData))
    
    alert('게시글이 성공적으로 등록되었습니다! 🌱')
    router.push('/community')
    
  } catch (error) {
    console.error('게시글 등록 실패:', error)
    alert('게시글 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isPublishing.value = false
  }
}

// 컴포넌트 정리
onBeforeUnmount(() => {
  // 메모리 누수 방지를 위해 blob URL 정리
  uploadedImages.value.forEach(image => {
    if (image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
  })
})
</script>

<style scoped>
.writepost {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  font-family: 'Noto Sans KR', sans-serif;
}

.writepost-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f8f9fa;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.publish-btn {
  padding: 8px 16px;
  background: #e0e0e0;
  color: #999;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: not-allowed;
  transition: all 0.3s ease;
}

.publish-btn.active {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  cursor: pointer;
}

.publish-btn.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.writepost-main {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.required {
  color: #e74c3c;
}

.photo-upload-area {
  text-align: center;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.photo-item.uploaded {
  background: #f8f9fa;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-photo-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: #568265;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.photo-item.upload-btn {
  border: 2px dashed #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.photo-item.upload-btn:hover {
  border-color: #568265;
  background: #f0f8f4;
  color: #568265;
}

.photo-item.upload-btn span {
  font-size: 12px;
  font-weight: 500;
}

.photo-item.upload-btn small {
  font-size: 10px;
  color: #999;
}

.photo-help {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #568265;
}

.price-input-wrapper {
  position: relative;
}

.price-input {
  padding-right: 50px;
}

.currency {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-weight: 500;
}

.price-suggestions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.price-suggestion-btn {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.price-suggestion-btn:hover {
  background: #568265;
  color: white;
  border-color: #568265;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.tag-input-wrapper {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 12px;
  min-height: 50px;
  transition: border-color 0.3s ease;
}

.tag-input-wrapper:focus-within {
  border-color: #568265;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag-chip {
  background: #568265;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-chip button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.tag-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
}

.popular-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.popular-tags small {
  color: #666;
  margin-right: 8px;
}

.popular-tag-btn {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-tag-btn:hover {
  background: #568265;
  color: white;
  border-color: #568265;
}

.checkbox-group,
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item,
.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-custom {
  background: #568265;
  border-color: #568265;
}

.checkbox-item input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.toggle-item input[type="checkbox"] {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-switch::after {
  content: '';
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-item input[type="checkbox"]:checked + .toggle-switch {
  background: #568265;
}

.toggle-item input[type="checkbox"]:checked + .toggle-switch::after {
  left: 22px;
}

.hidden-input {
  display: none;
}

@media (max-width: 480px) {
  .writepost-header {
    padding: 12px 16px;
  }
  
  .writepost-main {
    padding: 16px 12px;
  }
  
  section {
    padding: 20px 16px;
    margin-bottom: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>