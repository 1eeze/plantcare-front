# 알림 기능 테스트 가이드

PlantCare 알림 시스템을 테스트하는 방법을 안내합니다.

## 🚀 빠른 시작

### 1단계: Supabase 테이블 생성

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. `supabase/notifications_setup.sql` 파일 내용을 복사해서 붙여넣기
5. **Run** 버튼 클릭

✅ notifications 테이블과 자동 트리거가 생성됩니다.

---

## 🧪 테스트 방법

### 방법 1: 브라우저 콘솔에서 테스트 (가장 빠름)

개발 서버를 실행하면 자동으로 테스트 유틸리티가 로드됩니다.

```bash
npm run dev
```

브라우저를 열고 **F12** (개발자 도구) → **Console** 탭에서:

```javascript
// 좋아요 알림 생성
testNotification('social')

// 댓글 알림 생성
testNotification('comment')

// 답글 알림 생성
testNotification('reply')

// 식물 관리 알림 생성
testNotification('plant')

// 랜덤 알림 5개 생성 (배지 카운터 테스트용)
createMultipleTestNotifications(5)

// 내 알림 목록 확인
getMyNotifications()

// 모든 알림 삭제 (초기화)
clearTestNotifications()
```

**결과 확인:**
- 홈 화면 우측 상단의 🔔 아이콘에 빨간 배지 표시
- 알림 페이지(`/notification`)에서 알림 목록 확인
- 알림 클릭 시 해당 게시글로 이동

---

### 방법 2: Supabase SQL로 수동 생성

1. Supabase Dashboard → **SQL Editor**
2. `supabase/test_notifications.sql` 파일 열기
3. 다음 쿼리로 내 user_id 확인:
   ```sql
   SELECT auth.uid() as my_user_id;
   ```
4. 복사한 user_id를 `YOUR_USER_ID_HERE`에 붙여넣기
5. 실행하면 테스트 알림이 생성됩니다

---

### 방법 3: 실제 사용자 시뮬레이션 (가장 현실적)

#### 준비물
- 2개의 계정 (또는 시크릿 창 사용)

#### 테스트 시나리오

**1. 좋아요 알림 테스트**
1. 계정 A로 커뮤니티에 게시글 작성
2. 계정 B로 로그인
3. 계정 A의 게시글에 ❤️ 좋아요 클릭
4. 계정 A로 돌아가서 알림 확인
   - 알림 배지에 `1` 표시
   - 알림 목록에 "새로운 좋아요" 표시

**2. 댓글 알림 테스트**
1. 계정 A로 커뮤니티에 게시글 작성
2. 계정 B로 댓글 작성
3. 계정 A로 돌아가서 알림 확인
   - "새로운 댓글" 알림 표시

**3. 답글 알림 테스트**
1. 계정 A가 댓글 작성
2. 계정 B가 그 댓글에 답글 작성
3. 계정 A로 돌아가서 알림 확인
   - "새로운 답글" 알림 표시

**4. 실시간 업데이트 테스트**
1. 계정 A로 알림 페이지 열기
2. 다른 브라우저에서 계정 B로 좋아요/댓글 남기기
3. 계정 A의 알림 페이지에서 **새로고침 없이** 알림이 실시간으로 나타나는지 확인

---

## ✅ 체크리스트

### 기본 기능
- [ ] 좋아요 누르면 게시글 작성자에게 알림 전송
- [ ] 댓글 작성하면 게시글 작성자에게 알림 전송
- [ ] 대댓글 작성하면 원 댓글 작성자에게 알림 전송
- [ ] 자기 자신의 게시글에 좋아요/댓글 시 알림 안 옴

### UI/UX
- [ ] 홈 화면 알림 배지에 읽지 않은 알림 수 표시
- [ ] 알림 페이지에서 알림 목록 표시
- [ ] 읽지 않은 알림은 배경색 강조
- [ ] 알림 클릭 시 읽음 처리
- [ ] 알림 클릭 시 해당 게시글로 이동

### 실시간 기능
- [ ] 새 알림 발생 시 배지 카운터 실시간 업데이트
- [ ] 알림 페이지 열고 있을 때 새 알림이 즉시 표시
- [ ] 다른 페이지에서 알림 읽으면 배지 카운터 실시간 감소

### 성능
- [ ] 알림 50개 이상 있을 때 스크롤 성능 확인
- [ ] 여러 탭에서 동시에 열어도 정상 작동

---

## 🐛 문제 해결

### 알림이 생성되지 않을 때

1. **notifications 테이블이 없음**
   ```
   Supabase Dashboard → SQL Editor에서
   notifications_setup.sql 실행
   ```

2. **트리거가 없음**
   ```sql
   -- 트리거 확인
   SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_notify%';

   -- 없으면 notifications_setup.sql 다시 실행
   ```

3. **RLS 정책 문제**
   ```sql
   -- RLS 정책 확인
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

### 알림이 표시되지 않을 때

1. **브라우저 콘솔 확인**
   ```javascript
   // F12 → Console에서
   getMyNotifications()
   ```

2. **네트워크 에러 확인**
   - F12 → Network 탭
   - "notifications" 필터
   - 실패한 요청이 있는지 확인

3. **Realtime 구독 확인**
   ```javascript
   // 콘솔에 다음 메시지가 있어야 함
   "SUBSCRIBED to public:notifications_subscription"
   ```

### 알림 배지 카운터가 안 맞을 때

```javascript
// 콘솔에서 강제 새로고침
location.reload()

// 또는 알림 개수 직접 확인
supabase
  .from('notifications')
  .select('*', { count: 'exact' })
  .eq('user_id', (await supabase.auth.getUser()).data.user.id)
  .eq('read', false)
  .then(r => console.log('읽지 않은 알림:', r.count))
```

---

## 📊 데이터 구조

### notifications 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | bigint | 고유 ID |
| user_id | uuid | 알림 받을 사용자 ID |
| type | text | 알림 유형 (social, plant, trade, system) |
| title | text | 알림 제목 |
| message | text | 알림 내용 |
| read | boolean | 읽음 여부 (기본값: false) |
| metadata | jsonb | 추가 정보 (게시글 제목, 댓글 내용 등) |
| related_post_id | bigint | 관련 게시글 ID (nullable) |
| related_user_id | uuid | 관련 사용자 ID (nullable) |
| created_at | timestamp | 생성 시간 |

---

## 🎯 고급 테스트

### 성능 테스트: 대량 알림 생성

```javascript
// 100개의 알림 생성
for (let i = 0; i < 100; i++) {
  await testNotification(['social', 'comment', 'reply', 'plant'][i % 4])
}
```

### 부하 테스트: 실시간 업데이트

```javascript
// 1초마다 알림 생성 (10초간)
let count = 0
const interval = setInterval(() => {
  testNotification('social')
  count++
  if (count >= 10) clearInterval(interval)
}, 1000)
```

### 동시성 테스트

2개의 브라우저 창을 열고:
1. 창 A: 알림 페이지 열기
2. 창 B: 콘솔에서 `testNotification('social')` 실행
3. 창 A에서 즉시 알림이 나타나는지 확인

---

## 📝 참고사항

- 개발 모드(`npm run dev`)에서만 테스트 유틸리티가 자동으로 로드됩니다
- 프로덕션 빌드에는 테스트 코드가 포함되지 않습니다
- 자기 자신에게는 알림이 가지 않도록 설계되었습니다
- 알림은 50개까지만 로드됩니다 (성능 최적화)

---

## 🎉 테스트 완료!

모든 테스트가 통과하면 알림 시스템이 정상적으로 동작하는 것입니다.

문제가 있다면:
1. Supabase Dashboard에서 테이블/트리거 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. 네트워크 탭에서 API 요청 확인
