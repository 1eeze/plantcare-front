
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
      <!-- 이미지 미리보기 -->
      <div class="writepost__image-preview" v-if="imagePreview">
        <img :src="imagePreview" alt="Preview" />
        <button class="remove-image-btn" @click="removeImage">✕</button>
      </div>

      <!-- 이미지 업로드 -->
      <div class="writepost__image-upload" v-else>
        <input
          type="file"
          id="file"
          class="writepost__inputfile"
          accept="image/*"
          @change="handleImageSelect"
          ref="fileInput"
        />
        <label for="file" class="writepost__plus-button">
          <span class="plus-icon">+</span>
          <span class="upload-text">사진 추가</span>
        </label>
      </div>

      <!-- 입력 폼 -->
      <div class="writepost__form">
        <div class="form-group">
          <label class="form-label">식물 이름 *</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="예: 몬스테라 알보"
            class="form-input"
            maxlength="50"
          />
          <span class="char-count">{{ formData.title.length }}/50</span>
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

    const fileInput = ref(null)
    const uploading = ref(false)

    const formData = ref({
      title: '',
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
    const isValid = computed(() => {
      return (
        formData.value.title.trim() !== '' &&
        formData.value.price > 0 &&
        formData.value.text.trim() !== '' &&
        imagePreview.value !== null
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

    // 이미지 선택
    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('이미지 크기는 5MB 이하여야 합니다.')
          return
        }

        formData.value.image = file

        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    // 이미지 제거
    const removeImage = () => {
      formData.value.image = null
      imagePreview.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

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

    // 이미지 업로드
    const uploadImage = async (file) => {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { error } = await supabase.storage
          .from('plant-images')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('plant-images')
          .getPublicUrl(filePath)

        return publicUrl
      } catch (error) {
        console.error('이미지 업로드 실패:', error)
        throw error
      }
    }

    // 게시물 제출 (등록/수정)
    const submitPost = async () => {
      uploading.value = true

      try {
        let imageUrl = formData.value.image 
        // 새 이미지가 업로드된 경우 (File 객체인 경우)
        if (formData.value.image && typeof formData.value.image !== 'string') {
          imageUrl = await uploadImage(formData.value.image)
        } else if (imagePreview.value && typeof formData.value.image !== 'object') {
          // 이미지가 변경되지 않은 경우 기존 URL 유지
          imageUrl = imagePreview.value
        }

        const postData = {
          title: formData.value.title,
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

    onMounted(async () => {
      await fetchUserInfo()
      
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
          // 수정 시에는 기존 이미지 URL을 formData에 넣어둠 (변경 감지용)
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
      fileInput,
      handleImageSelect,
      removeImage,
      addTag,
      removeTag,
      submitPost,
      goBack,
      goHome
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
}

.writepost__header {
  position: sticky;
  top: 0;
  width: 100%;
  height: 48px;
  background-color: white;
  border-bottom: 1px solid #eee;
  z-index: 100;
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
.writepost__image-upload {
  margin-bottom: 20px;
  background: white;
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
}

.writepost__image-upload:hover {
  border-color: #568265;
  background-color: #f8faf9;
}

.writepost__inputfile {
  display: none;
}

.writepost__plus-button {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #666;
}

.plus-icon {
  font-size: 48px;
  font-weight: 300;
  color: #568265;
}

.upload-text {
  font-size: 14px;
  color: #666;
}

/* 이미지 미리보기 */
.writepost__image-preview {
  position: relative;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.writepost__image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

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
