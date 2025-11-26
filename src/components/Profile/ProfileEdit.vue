<template>
  <div class="edit-page">
    <div class="edit-header">
      <button @click="handleCancel" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18L9 12L15 6"/></svg>
      </button>
      <h1>프로필 수정</h1>
      <button 
        @click="saveProfile" 
        class="save-btn-header"
        :disabled="isSaving || !hasChanges"
        :class="{ active: hasChanges }"
      >
        {{ isSaving ? '저장...' : '완료' }}
      </button>
    </div>

    <div class="edit-content">
      <section class="avatar-section">
        <div class="avatar-container">
          <div class="avatar-preview" :style="avatarStyle">
            <img v-if="previewImage" :src="previewImage" alt="프로필" />
            <div v-else class="avatar-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21V19C20 17.9 19.6 16.9 18.8 16.2C18 15.4 17 15 16 15H8C6.9 15 5.9 15.4 5.2 16.2C4.4 16.9 4 17.9 4 19V21"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="avatar-actions">
            <label for="avatar-upload" class="change-avatar-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19C23 19.5 22.8 20 22.4 20.4C22 20.8 21.5 21 21 21H3C2.5 21 2 20.8 1.6 20.4C1.2 20 1 19.5 1 19V8C1 7.5 1.2 7 1.6 6.6C2 6.2 2.5 6 3 6H7L9 3H15L17 6H21C21.5 6 22 6.2 22.4 6.6C22.8 7 23 7.5 23 8V19Z"/><circle cx="12" cy="13" r="4"/></svg>
              사진 변경
            </label>
            <input type="file" id="avatar-upload" @change="handleAvatarChange" accept="image/*" hidden />
            <button v-if="previewImage" @click="removeAvatar" class="remove-avatar-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6H21M8 6V4C8 3.5 8.2 3 8.6 2.6C9 2.2 9.5 2 10 2H14C14.5 2 15 2.2 15.4 2.6C15.8 3 16 3.5 16 4V6M19 6V20C19 20.5 18.8 21 18.4 21.4C18 21.8 17.5 22 17 22H7C6.5 22 6 21.8 5.6 21.4C5.2 21 5 20.5 5 20V6"/></svg>
              삭제
            </button>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">기본 정보</h2>
        <div class="form-group" :class="{ error: errors.nickname }">
          <label for="nickname" class="form-label">닉네임 <span class="required">*</span></label>
          <div class="input-wrapper">
            <input id="nickname" v-model="form.nickname" type="text" maxlength="20" placeholder="닉네임 입력" />
            <span class="char-count">{{ form.nickname.length }}/20</span>
          </div>
          <p v-if="errors.nickname" class="error-msg">{{ errors.nickname }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">칭호</label>
          <div class="title-selector">
            <button 
              v-for="title in availableTitles" :key="title.id"
              @click="form.titleId = title.id"
              :class="{ selected: form.titleId === title.id }"
              class="title-option"
            >
              <span class="title-emoji">{{ title.emoji }}</span>
              <span class="title-text">{{ title.name }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">소개</h2>
        <div class="form-group">
          <label for="bio" class="form-label">자기소개</label>
          <div class="textarea-wrapper">
            <textarea id="bio" v-model="form.bio" rows="4" maxlength="500" placeholder="나를 소개해주세요"></textarea>
            <span class="char-count">{{ form.bio.length }}/500</span>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">위치 정보</h2>
        <div class="form-group">
          <label class="form-label">거주 지역 <span class="optional">(선택)</span></label>
          <div class="input-wrapper icon-input" @click="openLocationSearch">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10C21 17 12 23 12 23S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input v-model="form.location" type="text" placeholder="지역 검색" readonly />
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">앱 설정</h2>
        <div class="setting-item" @click="manageNotifications">
          <span class="setting-label">알림 설정</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        <div class="setting-item" @click="privacySettings">
          <span class="setting-label">개인정보 설정</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </section>

      <section class="form-section">
        <h2 class="section-title">공개 범위 설정</h2>
        <p class="section-description">다른 사용자가 내 프로필에서 볼 수 있는 정보를 설정합니다</p>

        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">내 식물</span>
            <span class="privacy-description">내가 키우는 식물 목록</span>
          </div>
          <div class="toggle-switch" @click="togglePrivacy('plants')">
            <div class="toggle-track" :class="{ active: form.privacy_plants === 'public' }">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-text">{{ form.privacy_plants === 'public' ? '전체' : '나만' }}</span>
          </div>
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">저장됨</span>
            <span class="privacy-description">북마크한 게시글 목록</span>
          </div>
          <div class="toggle-switch" @click="togglePrivacy('bookmarks')">
            <div class="toggle-track" :class="{ active: form.privacy_bookmarks === 'public' }">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-text">{{ form.privacy_bookmarks === 'public' ? '전체' : '나만' }}</span>
          </div>
        </div>

        <div class="privacy-item">
          <div class="privacy-info">
            <span class="privacy-label">리포트</span>
            <span class="privacy-description">AI 식물 분석 리포트</span>
          </div>
          <div class="toggle-switch" @click="togglePrivacy('reports')">
            <div class="toggle-track" :class="{ active: form.privacy_reports === 'public' }">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-text">{{ form.privacy_reports === 'public' ? '전체' : '나만' }}</span>
          </div>
        </div>
      </section>

      <section class="form-section danger-section">
        <h2 class="section-title danger-title">계정 관리</h2>
        <button @click="confirmLogout" class="danger-btn logout-btn">로그아웃</button>
        <button @click="confirmDeleteAccount" class="danger-btn delete-btn">계정 삭제</button>
      </section>
    </div>

    <div v-if="showSaveModal" class="modal-overlay">
      <div class="modal-content">
        <h3>저장 완료</h3>
        <p>프로필이 성공적으로 업데이트되었습니다.</p>
        <button @click="closeModalAndGoBack" class="modal-btn">확인</button>
      </div>
    </div>

    <div v-if="showLocationModal" class="modal-overlay" @click="showLocationModal = false">
      <div class="modal-content location-modal" @click.stop>
        <h3>지역 선택</h3>
        <input v-model="locationSearchQuery" @input="filterLocations" class="location-search-input" placeholder="지역명 검색 (예: 강남구)" />
        <div class="location-list">
          <button v-for="loc in filteredLocations" :key="loc.id" @click="selectLocation(loc)" class="location-item">
            {{ loc.full }}
          </button>
        </div>
        <button @click="showLocationModal = false" class="modal-btn secondary">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const isSaving = ref(false)
const showSaveModal = ref(false)
const showLocationModal = ref(false)
const previewImage = ref(null)
const avatarFile = ref(null)
const locationSearchQuery = ref('')

const availableTitles = [
  { id: 1, name: '새싹 초보', emoji: '🌱' },
  { id: 2, name: '그린 러너', emoji: '🏃' },
  { id: 3, name: '식물 애호가', emoji: '💚' },
  { id: 4, name: '그린 마스터', emoji: '🌿' },
  { id: 5, name: '식물 박사', emoji: '🎓' },
  { id: 6, name: '정글 메이커', emoji: '🌴' },
  { id: 7, name: '플랜테리어 디자이너', emoji: '🪴' },
  { id: 8, name: '식물 수집가', emoji: '🏆' }
]

const allLocations = [
  { id: 1, full: '서울특별시 강남구' }, { id: 2, full: '서울특별시 서초구' },
  { id: 3, full: '서울특별시 송파구' }, { id: 4, full: '경기도 성남시' },
  { id: 5, full: '경기도 수원시' }, { id: 6, full: '인천광역시 연수구' },
  { id: 7, full: '부산광역시 해운대구' }
]
const filteredLocations = ref([...allLocations])

const form = reactive({
  nickname: '',
  titleId: 1,
  bio: '',
  location: '',
  privacy_plants: 'public',
  privacy_bookmarks: 'private',
  privacy_reports: 'public'
})
const originalForm = reactive({
  nickname: '',
  titleId: 1,
  bio: '',
  location: '',
  avatar_url: null,
  privacy_plants: 'public',
  privacy_bookmarks: 'private',
  privacy_reports: 'public'
})
const errors = reactive({ nickname: '' })

const hasChanges = computed(() => {
  const avatarChanged = avatarFile.value !== null || (previewImage.value === null && originalForm.avatar_url !== null)
  return form.nickname !== originalForm.nickname || form.titleId !== originalForm.titleId ||
         form.bio !== originalForm.bio || form.location !== originalForm.location || avatarChanged ||
         form.privacy_plants !== originalForm.privacy_plants ||
         form.privacy_bookmarks !== originalForm.privacy_bookmarks ||
         form.privacy_reports !== originalForm.privacy_reports
})

const avatarStyle = computed(() => previewImage.value ? { backgroundImage: `url(${previewImage.value})`, backgroundSize: 'cover' } : {})

const loadProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return router.push('/login')

  const { data } = await supabase
    .from('Users')
    .select('name, avatar_url, bio, location, titleId, privacy_plants, privacy_bookmarks, privacy_reports')
    .eq('id', user.id)
    .single()

  if (data) {
    Object.assign(form, {
      nickname: data.name || '',
      bio: data.bio || '',
      location: data.location || '',
      titleId: data.titleId || 1,
      privacy_plants: data.privacy_plants || 'public',
      privacy_bookmarks: data.privacy_bookmarks || 'private',
      privacy_reports: data.privacy_reports || 'public'
    })
    Object.assign(originalForm, { ...form, avatar_url: data.avatar_url })
    if (data.avatar_url) previewImage.value = data.avatar_url
  }
}

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    avatarFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const removeAvatar = () => {
  previewImage.value = null
  avatarFile.value = null
}

const validateNickname = () => {
  if (!form.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요'
    return false
  }
  if (form.nickname.length < 2) {
    errors.nickname = '닉네임은 2자 이상이어야 합니다'
    return false
  }
  errors.nickname = ''
  return true
}

const saveProfile = async () => {
  if (!validateNickname()) return 
  isSaving.value = true
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const updates = {
      id: user.id,
      email: user.email,
      name: form.nickname,
      bio: form.bio,
      location: form.location,
      titleId: form.titleId,
      privacy_plants: form.privacy_plants,
      privacy_bookmarks: form.privacy_bookmarks,
      privacy_reports: form.privacy_reports,
      updated_at: new Date()
    }

    if (avatarFile.value) {
      const fileExt = avatarFile.value.name.split('.').pop()
      const filePath = `${user.id}/profile_${Date.now()}.${fileExt}`
      await supabase.storage.from('avatars').upload(filePath, avatarFile.value)
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      updates.avatar_url = urlData.publicUrl
    } else if (originalForm.avatar_url && !previewImage.value) {
      updates.avatar_url = null
    }

    const { error } = await supabase.from('Users').upsert(updates)
    if (error) throw error

    Object.assign(originalForm, { ...form, avatar_url: updates.avatar_url || originalForm.avatar_url })
    avatarFile.value = null
    showSaveModal.value = true
  } catch (e) {
    alert('저장 실패: ' + e.message)
  } finally {
    isSaving.value = false
  }
}

const closeModalAndGoBack = () => { 
  showSaveModal.value = false
  router.push('/profile') 
}

const handleCancel = () => {
  if (hasChanges.value) {
    if(confirm('저장하지 않고 나가시겠습니까?')) router.back()
  } else {
    router.back()
  }
}

const filterLocations = () => { filteredLocations.value = allLocations.filter(l => l.full.includes(locationSearchQuery.value)) }
const selectLocation = (loc) => { form.location = loc.full; showLocationModal.value = false }
const openLocationSearch = () => { showLocationModal.value = true; locationSearchQuery.value = ''; filteredLocations.value = [...allLocations] }

// [추가] 앱 설정 관련 (기능은 추후 구현이더라도 버튼은 살아있음)
const manageNotifications = () => {
  alert('알림 설정 기능은 준비 중입니다.')
}
const privacySettings = () => {
  alert('개인정보 설정 기능은 준비 중입니다.')
}

const togglePrivacy = (type) => {
  if (type === 'plants') {
    form.privacy_plants = form.privacy_plants === 'public' ? 'private' : 'public'
  } else if (type === 'bookmarks') {
    form.privacy_bookmarks = form.privacy_bookmarks === 'public' ? 'private' : 'public'
  } else if (type === 'reports') {
    form.privacy_reports = form.privacy_reports === 'public' ? 'private' : 'public'
  }
}

const confirmLogout = async () => { if(confirm('로그아웃 하시겠어요?')) { await supabase.auth.signOut(); router.push('/login') } }
const confirmDeleteAccount = async () => {
  if(prompt("탈퇴하려면 '회원탈퇴' 입력") === '회원탈퇴') {
    try {
      const { error } = await supabase.functions.invoke('withdraw-user')
      if(error) throw error
      await supabase.auth.signOut(); alert('탈퇴 완료'); router.push('/login')
    } catch(e) { alert(e.message) }
  }
}

onMounted(loadProfile)
</script>

<style scoped>
/* 스타일은 기존과 동일 + 설정 항목 스타일 추가 */
.edit-page { background: #f7f6ed; min-height: 100vh; padding-bottom: 40px; font-family: sans-serif; }
.edit-header { background: white; padding: 16px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.back-btn, .save-btn-header { background: none; border: none; cursor: pointer; }
.save-btn-header { color: #999; font-weight: 600; }
.save-btn-header.active { color: #568265; }
.edit-content { max-width: 600px; margin: 0 auto; padding: 20px; }

.avatar-section { background: white; padding: 30px; border-radius: 16px; margin-bottom: 20px; text-align: center; }
.avatar-container { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.avatar-preview { width: 100px; height: 100px; border-radius: 50%; background: #f0f8f4; border: 3px solid #568265; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { color: #568265; }
.avatar-actions { display: flex; gap: 10px; justify-content: center; }
.change-avatar-btn, .remove-avatar-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; height: 36px; box-sizing: border-box; }
.change-avatar-btn { background: #568265; color: white; border: none; }
.remove-avatar-btn { background: white; color: #e74c3c; border: 1px solid #e74c3c; }

.form-section { background: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #333; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #555; }
.input-wrapper { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 0 12px; display: flex; align-items: center; }
.input-wrapper input { width: 100%; padding: 12px 0; border: none; outline: none; font-size: 15px; }
.icon-input { cursor: pointer; gap: 8px; } .input-icon { color: #999; }
.textarea-wrapper { border: 1px solid #ddd; border-radius: 8px; padding: 12px; position: relative; }
.textarea-wrapper textarea { width: 100%; border: none; outline: none; resize: none; font-size: 15px; font-family: inherit; }
.char-count { font-size: 11px; color: #999; position: absolute; right: 12px; bottom: 12px; }

.title-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.title-option { display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid #eee; border-radius: 8px; background: white; cursor: pointer; }
.title-option.selected { border-color: #568265; background: #f0f8f4; }

/* 설정 항목 스타일 */
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; color: #999; }
.setting-item:last-child { border-bottom: none; }
.setting-label { font-size: 15px; color: #333; font-weight: 500; }

.danger-section { border: 1px solid #fee; }
.danger-title { color: #e74c3c; }
.danger-btn { width: 100%; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
.logout-btn { background: white; border: 1px solid #ddd; color: #333; }
.delete-btn { background: #fff5f5; border: 1px solid #fc8181; color: #c53030; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 24px; border-radius: 16px; width: 80%; max-width: 320px; text-align: center; }
.modal-btn { width: 100%; padding: 12px; background: #568265; color: white; border: none; border-radius: 8px; margin-top: 16px; cursor: pointer; }
.location-modal { height: 60vh; display: flex; flex-direction: column; }
.location-search-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin: 12px 0; box-sizing: border-box; }
.location-list { flex: 1; overflow-y: auto; }
.location-item { width: 100%; padding: 12px; text-align: left; background: none; border: none; border-bottom: 1px solid #eee; cursor: pointer; }

.error-msg { color: #e74c3c; font-size: 12px; margin-top: 6px; font-weight: 500; }
.form-group.error .input-wrapper { border-color: #e74c3c; }

/* 공개 범위 설정 스타일 */
.section-description { font-size: 13px; color: #666; margin-bottom: 16px; line-height: 1.5; }
.privacy-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.privacy-item:last-child { border-bottom: none; }
.privacy-info { flex: 1; }
.privacy-label { display: block; font-size: 15px; color: #333; font-weight: 600; margin-bottom: 4px; }
.privacy-description { display: block; font-size: 12px; color: #999; }
.toggle-switch { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.toggle-track { width: 44px; height: 24px; background: #ddd; border-radius: 12px; position: relative; transition: background 0.3s; }
.toggle-track.active { background: #568265; }
.toggle-thumb { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.toggle-track.active .toggle-thumb { left: 22px; }
.toggle-text { font-size: 13px; color: #666; font-weight: 600; min-width: 32px; }
</style>