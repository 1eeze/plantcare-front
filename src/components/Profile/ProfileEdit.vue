<template>
  <div class="edit-page">
    <!-- 헤더 -->
    <div class="edit-header">
      <button @click="handleCancel" class="back-btn" aria-label="뒤로가기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1>프로필 수정</h1>
      <button 
        @click="saveProfile" 
        class="save-btn-header"
        :disabled="isSaving || !hasChanges"
        :class="{ active: hasChanges }"
      >
        {{ isSaving ? '저장 중...' : '완료' }}
      </button>
    </div>

    <div class="edit-content">
      <!-- 프로필 사진 섹션 -->
      <section class="avatar-section">
        <div class="avatar-container">
          <div class="avatar-preview" :style="avatarStyle">
            <img v-if="previewImage" :src="previewImage" alt="프로필 사진" />
            <div v-else class="avatar-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>
          
          <div class="avatar-actions">
            <label for="avatar-upload" class="change-avatar-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              사진 변경
            </label>
            <input 
              type="file" 
              id="avatar-upload"
              @change="handleAvatarChange"
              accept="image/*"
              hidden
            />
            <button 
              v-if="previewImage" 
              @click="removeAvatar"
              class="remove-avatar-btn"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              삭제
            </button>
          </div>
          
          <p class="avatar-hint">JPG, PNG 파일 (최대 5MB)</p>
        </div>
      </section>

      <!-- 기본 정보 -->
      <section class="form-section">
        <h2 class="section-title">기본 정보</h2>
        
        <div class="form-group" :class="{ error: errors.nickname }">
          <label for="nickname" class="form-label">
            닉네임 <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <input
              id="nickname"
              v-model="form.nickname"
              @input="validateNickname"
              @blur="validateNickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              maxlength="20"
            />
            <span class="char-count">{{ form.nickname.length }}/20</span>
          </div>
          <span v-if="errors.nickname" class="error-message">{{ errors.nickname }}</span>
          <span v-else class="input-hint">다른 사용자에게 보여질 이름입니다</span>
        </div>

        <div class="form-group">
          <label class="form-label">칭호</label>
          <div class="title-selector">
            <button 
              v-for="title in availableTitles" 
              :key="title.id"
              @click="selectTitle(title)"
              :class="{ selected: form.titleId === title.id }"
              class="title-option"
              type="button"
            >
              <span class="title-emoji">{{ title.emoji }}</span>
              <span class="title-text">{{ title.name }}</span>
              <svg v-if="form.titleId === title.id" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <span class="input-hint">프로필에 표시될 칭호를 선택하세요</span>
        </div>
      </section>

      <!-- 소개 -->
      <section class="form-section">
        <h2 class="section-title">소개</h2>
        
        <div class="form-group">
          <label for="bio" class="form-label">자기소개</label>
          <div class="textarea-wrapper">
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              placeholder="자기소개를 입력해 주세요&#10;식물에 대한 관심사나 거래 시 알아두면 좋은 정보를 적어보세요"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ form.bio.length }}/500</span>
          </div>
          <span class="input-hint">다른 사용자가 나를 알 수 있도록 소개해주세요</span>
        </div>
      </section>

      <!-- 위치 정보 -->
      <section class="form-section">
        <h2 class="section-title">위치 정보</h2>
        
        <div class="form-group">
          <label for="location" class="form-label">
            거주 지역
            <span class="optional">(선택)</span>
          </label>
          <div class="location-search-wrapper">
            <div class="input-wrapper icon-input" @click="openLocationSearch">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="location"
                v-model="form.location"
                type="text"
                placeholder="지역을 검색하세요"
                readonly
              />
              <svg class="search-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <span class="input-hint">거래 시 직거래 가능 지역으로 표시됩니다</span>
        </div>
      </section>

      <!-- 계정 설정 -->
      <section class="form-section">
        <h2 class="section-title">계정 설정</h2>
        
        <div class="settings-list">
          <button @click="changePassword" class="setting-item">
            <div class="setting-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>비밀번호 변경</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button @click="manageNotifications" class="setting-item">
            <div class="setting-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>알림 설정</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button @click="privacySettings" class="setting-item">
            <div class="setting-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>개인정보 설정</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- 위험 영역 -->
      <section class="form-section danger-section">
        <h2 class="section-title danger-title">위험 영역</h2>
        <button @click="confirmLogout" class="danger-btn logout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          로그아웃
        </button>
        <button @click="confirmDeleteAccount" class="danger-btn delete-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          계정 삭제
        </button>
      </section>

      <!-- 저장 버튼 (하단 고정) -->
      <div class="bottom-save-section">
        <button 
          @click="saveProfile" 
          class="bottom-save-btn"
          :disabled="isSaving || !hasChanges"
          :class="{ active: hasChanges, loading: isSaving }"
        >
          <span v-if="!isSaving">변경사항 저장</span>
          <div v-else class="save-spinner">
            <div class="spinner"></div>
            <span>저장 중...</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 지역 검색 모달 -->
    <div v-if="showLocationModal" class="modal-overlay" @click="showLocationModal = false">
      <div class="modal-content location-modal" @click.stop>
        <div class="location-modal-header">
          <h3>지역 선택</h3>
          <button @click="showLocationModal = false" class="close-modal-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="location-search">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="locationSearchQuery"
            @input="filterLocations"
            type="text"
            placeholder="지역명을 검색하세요"
            class="location-search-input"
            autofocus
          />
        </div> 
      </div>

        <div class="location-list">
          <button 
            v-for="location in filteredLocations" 
            :key="location.id"
            @click="selectLocation(location)"
            class="location-item"
            :class="{ selected: form.location === location.full }"
          >
            <div class="location-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <div>
                <div class="location-name">{{ location.district }}</div>
                <div class="location-full">{{ location.full }}</div>
              </div>
            </div>
            <svg v-if="form.location === location.full" class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    <!-- 저장 확인 모달 -->
    <div v-if="showSaveModal" class="modal-overlay" @click="showSaveModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>프로필이 저장되었습니다</h3>
        <p>변경사항이 성공적으로 저장되었습니다.</p>
        <button @click="closeModalAndGoBack" class="modal-btn">확인</button>
      </div>
    </div>

    <!-- 취소 확인 모달 -->
    <div v-if="showCancelModal" class="modal-overlay" @click="showCancelModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-icon warning">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h3>변경사항을 저장하지 않고 나가시겠어요?</h3>
        <p>저장하지 않은 변경사항은 모두 사라집니다.</p>
        <div class="modal-actions">
          <button @click="showCancelModal = false" class="modal-btn secondary">계속 수정</button>
          <button @click="forceGoBack" class="modal-btn danger">나가기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 반응성 데이터
const isSaving = ref(false)
const showSaveModal = ref(false)
const showCancelModal = ref(false)
const showLocationModal = ref(false)
const previewImage = ref(null)
const avatarFile = ref(null)
const locationSearchQuery = ref('')

// 사용 가능한 칭호 목록
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

// 지역 목록 (실제로는 API에서 가져오거나 더 많은 데이터 사용)
const allLocations = [
  { id: 1, city: '서울', district: '강남구', full: '서울특별시 강남구' },
  { id: 2, city: '서울', district: '강동구', full: '서울특별시 강동구' },
  { id: 3, city: '서울', district: '강북구', full: '서울특별시 강북구' },
  { id: 4, city: '서울', district: '강서구', full: '서울특별시 강서구' },
  { id: 5, city: '서울', district: '관악구', full: '서울특별시 관악구' },
  { id: 6, city: '서울', district: '광진구', full: '서울특별시 광진구' },
  { id: 7, city: '서울', district: '구로구', full: '서울특별시 구로구' },
  { id: 8, city: '서울', district: '금천구', full: '서울특별시 금천구' },
  { id: 9, city: '서울', district: '노원구', full: '서울특별시 노원구' },
  { id: 10, city: '서울', district: '도봉구', full: '서울특별시 도봉구' },
  { id: 11, city: '서울', district: '동대문구', full: '서울특별시 동대문구' },
  { id: 12, city: '서울', district: '동작구', full: '서울특별시 동작구' },
  { id: 13, city: '서울', district: '마포구', full: '서울특별시 마포구' },
  { id: 14, city: '서울', district: '서대문구', full: '서울특별시 서대문구' },
  { id: 15, city: '서울', district: '서초구', full: '서울특별시 서초구' },
  { id: 16, city: '서울', district: '성동구', full: '서울특별시 성동구' },
  { id: 17, city: '서울', district: '성북구', full: '서울특별시 성북구' },
  { id: 18, city: '서울', district: '송파구', full: '서울특별시 송파구' },
  { id: 19, city: '서울', district: '양천구', full: '서울특별시 양천구' },
  { id: 20, city: '서울', district: '영등포구', full: '서울특별시 영등포구' },
  { id: 21, city: '서울', district: '용산구', full: '서울특별시 용산구' },
  { id: 22, city: '서울', district: '은평구', full: '서울특별시 은평구' },
  { id: 23, city: '서울', district: '종로구', full: '서울특별시 종로구' },
  { id: 24, city: '서울', district: '중구', full: '서울특별시 중구' },
  { id: 25, city: '서울', district: '중랑구', full: '서울특별시 중랑구' },
  { id: 26, city: '부산', district: '해운대구', full: '부산광역시 해운대구' },
  { id: 27, city: '부산', district: '수영구', full: '부산광역시 수영구' },
  { id: 28, city: '부산', district: '동래구', full: '부산광역시 동래구' },
  { id: 29, city: '인천', district: '남동구', full: '인천광역시 남동구' },
  { id: 30, city: '인천', district: '연수구', full: '인천광역시 연수구' }
]

const filteredLocations = ref([...allLocations])

const form = reactive({
  nickname: '',
  titleId: 1,
  bio: '',
  location: ''
})

const originalForm = reactive({
  nickname: '',
  titleId: 1,
  bio: '',
  location: ''
})

const errors = reactive({
  nickname: ''
})

// 계산된 속성
const hasChanges = computed(() => {
  return form.nickname !== originalForm.nickname ||
         form.titleId !== originalForm.titleId ||
         form.bio !== originalForm.bio ||
         form.location !== originalForm.location ||
         avatarFile.value !== null
})

const avatarStyle = computed(() => {
  if (previewImage.value) {
    return {
      backgroundImage: `url(${previewImage.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {}
})

// 메서드들
const loadProfile = () => {
  // TODO: 실제 API에서 프로필 불러오기
  const profile = {
    nickname: '식물마니아',
    titleId: 4, // 그린 마스터
    bio: '건강한 식물들을 키우고 나누는 것을 좋아합니다. 식물 상담 언제든 환영해요! 🌿',
    location: '서울특별시 강남구',
    avatar: null
  }
  
  Object.assign(form, profile)
  Object.assign(originalForm, profile)
  
  if (profile.avatar) {
    previewImage.value = profile.avatar
  }
}

const selectTitle = (title) => {
  form.titleId = title.id
}

const openLocationSearch = () => {
  showLocationModal.value = true
  locationSearchQuery.value = ''
  filteredLocations.value = [...allLocations]
}

const filterLocations = () => {
  const query = locationSearchQuery.value.toLowerCase()
  if (!query) {
    filteredLocations.value = [...allLocations]
    return
  }
  
  filteredLocations.value = allLocations.filter(location => 
    location.city.toLowerCase().includes(query) ||
    location.district.toLowerCase().includes(query) ||
    location.full.toLowerCase().includes(query)
  )
}

const selectLocation = (location) => {
  form.location = location.full
  showLocationModal.value = false
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

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
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
  
  avatarFile.value = file
  
  // 미리보기 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  previewImage.value = null
  avatarFile.value = null
  document.getElementById('avatar-upload').value = ''
}

const saveProfile = async () => {
  if (!validateNickname()) {
    return
  }
  
  isSaving.value = true
  
  try {
    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // FormData로 파일과 데이터 전송
    // const formData = new FormData()
    // if (avatarFile.value) {
    //   formData.append('avatar', avatarFile.value)
    // }
    // formData.append('nickname', form.nickname)
    // formData.append('titleId', form.titleId)
    // formData.append('bio', form.bio)
    // formData.append('location', form.location)
    
    // 저장 성공 후 프로필 페이지로 이동
    router.push('/profile')
  } catch (error) {
    console.error('저장 실패:', error)
    alert('프로필 저장 중 오류가 발생했습니다.')
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
    showCancelModal.value = true
  } else {
    router.back()
  }
}

const forceGoBack = () => {
  showCancelModal.value = false
  router.back()
}

const changePassword = () => {
  router.push('/settings/password')
}

const manageNotifications = () => {
  router.push('/settings/notifications')
}

const privacySettings = () => {
  router.push('/settings/privacy')
}

const confirmLogout = () => {
  if (confirm('로그아웃 하시겠어요?')) {
    // TODO: 로그아웃 처리
    router.push('/login')
  }
}

const confirmDeleteAccount = () => {
  if (confirm('정말로 계정을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.')) {
    // TODO: 계정 삭제 처리
    console.log('계정 삭제')
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.edit-page {
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

.edit-header {
  background: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
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

.edit-header h1 {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.save-btn-header {
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

.save-btn-header.active {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  cursor: pointer;
}

.save-btn-header.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.save-btn-header:disabled {
  cursor: not-allowed;
  transform: none;
}

.edit-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-section {
  background: white;
  padding: 32px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f8f4, #e8f5ee);
  border: 4px solid #568265;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #568265;
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.change-avatar-btn,
.remove-avatar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-avatar-btn {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  border: none;
}

.change-avatar-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.remove-avatar-btn {
  background: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.remove-avatar-btn:hover {
  background: #fee;
}

.avatar-hint {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.form-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group.error .input-wrapper,
.form-group.error .textarea-wrapper {
  border-color: #e74c3c;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
  margin-left: 2px;
}

.optional {
  color: #999;
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
}

.input-wrapper,
.textarea-wrapper {
  position: relative;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
}

.input-wrapper:focus-within,
.textarea-wrapper:focus-within {
  border-color: #568265;
  box-shadow: 0 0 0 4px rgba(86, 130, 101, 0.1);
}

.input-wrapper input,
.textarea-wrapper textarea {
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: #2c3e50;
  font-family: inherit;
  box-sizing: border-box;
}

.input-wrapper input {
  padding-right: 60px;
}

.textarea-wrapper textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.input-wrapper input::placeholder,
.textarea-wrapper textarea::placeholder {
  color: #999;
}

.icon-input input {
  padding-left: 48px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.char-count {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.textarea-wrapper .char-count {
  top: 16px;
  transform: none;
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #e74c3c;
  font-weight: 500;
}

.input-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.setting-item:hover {
  background: #f8f9fa;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 15px;
  font-weight: 500;
}

.setting-info svg {
  color: #568265;
}

.danger-section {
  border: 2px solid #fee;
}

.danger-title {
  color: #e74c3c;
}

.danger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.danger-btn:last-child {
  margin-bottom: 0;
}

.logout-btn {
  background: white;
  color: #f39c12;
  border: 2px solid #f39c12;
}

.logout-btn:hover {
  background: #fff8e7;
}

.delete-btn {
  background: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.delete-btn:hover {
  background: #fee;
}

/* 칭호 선택 스타일 */
.title-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.title-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.title-option:hover {
  border-color: #568265;
  background: #f0f8f4;
}

.title-option.selected {
  border-color: #568265;
  background: linear-gradient(135deg, rgba(86, 130, 101, 0.1), rgba(76, 175, 80, 0.05));
}

.title-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.title-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
}

.title-option .check-icon {
  color: #568265;
  flex-shrink: 0;
}

/* 지역 검색 관련 스타일 */
.location-search-wrapper {
  position: relative;
}

.location-search-wrapper .input-wrapper {
  cursor: pointer;
}

.location-search-wrapper .input-wrapper input {
  cursor: pointer;
  user-select: none;
}

.search-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.location-modal {
  max-width: 500px;
  padding: 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.location-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.location-modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.close-modal-btn {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.location-search {
  position: relative;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.location-search .search-icon {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.location-search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.location-search-input:focus {
  border-color: #568265;
  box-shadow: 0 0 0 4px rgba(86, 130, 101, 0.1);
}

.location-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  background: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  text-align: left;
}

.location-item:hover {
  background: #f0f8f4;
}

.location-item.selected {
  background: linear-gradient(135deg, rgba(86, 130, 101, 0.1), rgba(76, 175, 80, 0.05));
}

.location-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #568265;
}

.location-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.location-full {
  font-size: 12px;
  color: #666;
}

.location-item .check-icon {
  color: #568265;
  flex-shrink: 0;
}

/* 하단 저장 버튼 */
.bottom-save-section {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(247, 246, 237, 1) 0%, rgba(247, 246, 237, 0.95) 80%, transparent 100%);
  margin: 0 -20px -20px;
}

.bottom-save-btn {
  width: 100%;
  padding: 16px 24px;
  background: #e0e0e0;
  color: #999;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: not-allowed;
  transition: all 0.3s ease;
}

.bottom-save-btn.active {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(86, 130, 101, 0.3);
}

.bottom-save-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(86, 130, 101, 0.4);
}

.bottom-save-btn.active:active {
  transform: translateY(0);
}

.bottom-save-btn.loading {
  cursor: wait;
}

.save-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 32px 28px;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon.success {
  background: linear-gradient(135deg, #e8f5ee, #d4edda);
  color: #27ae60;
}

.modal-icon.warning {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f39c12;
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.modal-content p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-actions .modal-btn {
  flex: 1;
}

.modal-btn:not(.secondary):not(.danger) {
  background: linear-gradient(135deg, #568265, #4a7058);
  color: white;
  width: 100%;
}

.modal-btn:not(.secondary):not(.danger):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 130, 101, 0.3);
}

.modal-btn.secondary {
  background: white;
  color: #666;
  border: 2px solid #e0e0e0;
}

.modal-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #568265;
  color: #568265;
}

.modal-btn.danger {
  background: #e74c3c;
  color: white;
}

.modal-btn.danger:hover {
  background: #c0392b;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .edit-header {
    padding: 12px 16px;
  }
  
  .edit-content {
    padding: 16px;
  }
  
  .avatar-section {
    padding: 24px 20px;
  }
  
  .form-section {
    padding: 20px 16px;
  }
  
  .avatar-preview {
    width: 100px;
    height: 100px;
  }
  
  .avatar-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .change-avatar-btn,
  .remove-avatar-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .edit-header h1 {
    font-size: 16px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .modal-content {
    padding: 24px 20px;
  }
  
  .modal-icon {
    width: 60px;
    height: 60px;
  }
  
  .modal-content h3 {
    font-size: 18px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .save-btn-header,
  .avatar-preview,
  .modal-btn,
  .danger-btn {
    transition: none;
  }
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .edit-page {
    background: linear-gradient(135deg, #2c3e30 0%, #1a1f1c 100%);
  }
  
  .edit-header,
  .avatar-section,
  .form-section {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .section-title,
  .form-label,
  .modal-content h3 {
    color: #e0e0e0;
  }
  
  .input-wrapper,
  .textarea-wrapper {
    background: #2a2a2a;
    border-color: #444;
  }
  
  .input-wrapper input,
  .textarea-wrapper textarea {
    color: #e0e0e0;
  }
  
  .setting-item {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .setting-item:hover {
    background: #2a2a2a;
  }
  
  .settings-list {
    background: #2a2a2a;
  }
  
  .modal-content {
    background: #1a1a1a;
  }
}
</style>