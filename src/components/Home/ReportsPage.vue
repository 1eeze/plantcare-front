<template>
  <div class="reports-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h2>AI 분석 리포트</h2>
      <div class="spacer"></div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>리포트를 불러오는 중...</p>
    </div>

    <div v-else-if="reports.length === 0" class="empty-state">
      <span class="empty-icon">📋</span>
      <h3>아직 분석 리포트가 없습니다</h3>
      <p>카메라로 식물을 촬영하고 AI 분석을 받아보세요!</p>
      <button class="action-btn" @click="goHome">홈으로 가기</button>
    </div>

    <div v-else class="reports-list">
      <div v-for="report in reports" :key="report.id" class="report-card" @click="openReportDetail(report)">
        <div class="report-header">
          <div class="report-icon">🔬</div>
          <div class="report-main">
            <h3>{{ report.pest_kr_name || '건강함' }}</h3>
            <p class="report-date">{{ formatDate(report.created_at) }}</p>
          </div>
          <div class="report-arrow">›</div>
        </div>

        <div class="report-summary">
          <div v-if="report.pest_confidence" class="summary-item">
            <span class="label">병충해 신뢰도</span>
            <span class="value">{{ (report.pest_confidence * 100).toFixed(0) }}%</span>
          </div>
          <div v-if="report.organ" class="summary-item">
            <span class="label">생육 부위</span>
            <span class="value">{{ report.organ }}</span>
          </div>
          <div v-if="report.stage" class="summary-item">
            <span class="label">성장 단계</span>
            <span class="value">{{ report.stage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 리포트 상세 모달 -->
    <div v-if="showDetail" class="result-overlay" @click="closeDetail">
      <div class="result-modal" @click.stop>
        <div class="result-header">
          <h3>🔬 종합 분석 결과</h3>
          <button class="close-result-btn" @click="closeDetail">×</button>
        </div>

        <div class="result-content">
          <div class="result-card pest-card" @click="togglePestDetail">
            <div class="card-header">
              <span class="card-icon">🐛</span>
              <h4>병충해 감지</h4>
              <span class="expand-icon">{{ showPestDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="pest-name">{{ selectedReport?.pest_kr_name || '감지되지 않음' }}</p>
              <p v-if="selectedReport?.pest_confidence > 0" class="confidence">
                신뢰도: {{ (selectedReport.pest_confidence * 100).toFixed(1) }}%
              </p>
              <p v-else-if="selectedReport?.pest_class_name === 'none'" class="no-detection-msg">
                사진에서 병충해가 감지되지 않았습니다. 건강한 식물입니다! 🌿
              </p>
            </div>

            <div v-if="showPestDetail" class="card-detail">
              <p class="detail-label">원본 클래스명</p>
              <p class="detail-value">{{ selectedReport?.pest_class_name }}</p>

              <p class="detail-label">대응 방법</p>
              <p class="detail-value">전문가와 상담 후 적절한 방제법을 선택하세요.</p>
            </div>
          </div>

          <div class="result-card organ-card" @click="toggleOrganDetail">
            <div class="card-header">
              <span class="card-icon">🌿</span>
              <h4>생육 부위</h4>
              <span class="expand-icon">{{ showOrganDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="organ-name">{{ selectedReport?.organ || '감지되지 않음' }}</p>
              <p v-if="selectedReport?.organ_confidence" class="confidence">
                신뢰도: {{ (selectedReport.organ_confidence * 100).toFixed(1) }}%
              </p>
            </div>

            <div v-if="showOrganDetail && selectedReport?.organ" class="card-detail">
              <p class="detail-label">분석 내용</p>
              <p class="detail-value">해당 부위에 맞는 관리법을 적용하세요.</p>
            </div>
          </div>

          <div class="result-card stage-card" @click="toggleStageDetail">
            <div class="card-header">
              <span class="card-icon">🌱</span>
              <h4>성장 단계</h4>
              <span class="expand-icon">{{ showStageDetail ? '▼' : '▶' }}</span>
            </div>
            <div class="card-summary">
              <p class="stage-name">{{ selectedReport?.stage || '감지되지 않음' }}</p>
              <p v-if="selectedReport?.stage_confidence" class="confidence">
                신뢰도: {{ (selectedReport.stage_confidence * 100).toFixed(1) }}%
              </p>
            </div>

            <div v-if="showStageDetail && selectedReport?.stage" class="card-detail">
              <p class="detail-label">관리 팁</p>
              <p class="detail-value">관리에 신경써주세요.</p>
            </div>
          </div>
        </div>

        <button class="delete-result-btn" @click="deleteReport(selectedReport?.id)">
          🗑️ 리포트 삭제
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const reports = ref([])
const loading = ref(true)
const showDetail = ref(false)
const selectedReport = ref(null)
const showPestDetail = ref(false)
const showOrganDetail = ref(false)
const showStageDetail = ref(false)

const loadReports = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('리포트 조회 실패:', error)
      alert('리포트를 불러오는데 실패했습니다.')
    } else {
      reports.value = data || []
    }
  } catch (err) {
    console.error('리포트 로드 오류:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openReportDetail = (report) => {
  selectedReport.value = report
  showDetail.value = true
  showPestDetail.value = false
  showOrganDetail.value = false
  showStageDetail.value = false
}

const closeDetail = () => {
  showDetail.value = false
  showPestDetail.value = false
  showOrganDetail.value = false
  showStageDetail.value = false
}

const togglePestDetail = () => showPestDetail.value = !showPestDetail.value
const toggleOrganDetail = () => showOrganDetail.value = !showOrganDetail.value
const toggleStageDetail = () => showStageDetail.value = !showStageDetail.value

const deleteReport = async (reportId) => {
  if (!confirm('이 리포트를 삭제하시겠습니까?')) return

  try {
    const { error } = await supabase
      .from('analysis_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('리포트 삭제 실패:', error)
      alert('리포트 삭제에 실패했습니다.')
    } else {
      alert('리포트가 삭제되었습니다.')
      closeDetail()
      await loadReports()
    }
  } catch (err) {
    console.error('삭제 오류:', err)
    alert('오류가 발생했습니다.')
  }
}

const goBack = () => router.back()
const goHome = () => router.push('/')

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f6ed 0%, #eef2e6 100%);
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  color: #2c3e50;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.spacer {
  width: 40px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid #cbd5c0;
  border-top-color: #4a6444;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #7f8c8d;
  margin: 0 0 24px 0;
}

.action-btn {
  background: linear-gradient(135deg, #4a6444 0%, #6b856b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.reports-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.report-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.report-main {
  flex: 1;
}

.report-main h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.report-date {
  margin: 0;
  font-size: 12px;
  color: #7f8c8d;
}

.report-arrow {
  font-size: 24px;
  color: #cbd5c0;
}

.report-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 44px;
}

.summary-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 6px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.summary-item .label {
  color: #7f8c8d;
}

.summary-item .value {
  color: #2c3e50;
  font-weight: 600;
}

/* 모달 스타일 (HomePage와 동일) */
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.result-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.result-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-result-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
}

.result-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  background: #eef2e6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-icon {
  font-size: 20px;
}

.card-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

.expand-icon {
  font-size: 12px;
  color: #7f8c8d;
}

.card-summary {
  padding-left: 28px;
}

.pest-name, .organ-name, .stage-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.confidence {
  font-size: 12px;
  color: #7f8c8d;
  margin: 0;
}

.no-detection-msg {
  font-size: 13px;
  color: #2ed573;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.card-detail {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #4a6444;
}

.detail-label {
  font-size: 12px;
  color: #7f8c8d;
  margin: 8px 0 4px 0;
  font-weight: 600;
}

.detail-label:first-child {
  margin-top: 0;
}

.detail-value {
  font-size: 13px;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.pest-card {
  border-left: 4px solid #ff6b6b;
}

.organ-card {
  border-left: 4px solid #4ecdc4;
}

.stage-card {
  border-left: 4px solid #95e1d3;
}

.delete-result-btn {
  margin: 16px;
  padding: 14px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.delete-result-btn:hover {
  transform: translateY(-1px);
}

.delete-result-btn:active {
  transform: translateY(0);
}
</style>
