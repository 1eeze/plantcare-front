# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고할 가이드입니다.

## 프로젝트 개요

PlantCare는 식물 관리를 위한 Vue 3 + Vite 프론트엔드 애플리케이션입니다. Supabase를 백엔드로 사용하며, 식물 추적, 커뮤니티 기능, 시세 정보, AI 기반 병충해 분석 등의 기능을 제공합니다.

## 개발 명령어

```bash
# 개발 서버 실행 (포트 5174)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

참고: README에는 `npm run serve`와 `npm run lint`가 언급되어 있지만, package.json에는 해당 스크립트가 없습니다. `npm run dev`를 사용하세요.

## 아키텍처

### 인증 및 라우팅

- **Supabase 인증**: 모든 인증은 [src/utils/supabase.js](src/utils/supabase.js)의 Supabase 클라이언트를 통해 처리됩니다
- **전역 라우트 가드**: [src/router/index.js:150-199](src/router/index.js#L150-L199)에서 공개 경로(`/login`, `/signup`, `/auth/callback`)를 제외한 모든 경로에 인증을 강제합니다
- **닉네임 필수**: OAuth 로그인 후, 메인 앱에 접근하기 전에 `/signup/step2`에서 프로필(닉네임 추가)을 완성해야 합니다
- **개발 환경 자동 로그인**: 개발 모드에서는 `dev@example.com` 계정으로 자동 로그인을 시도합니다 ([src/composables/useAuthGuard.js](src/composables/useAuthGuard.js) 참고)

### 앱 초기화 흐름

1. [src/App.vue](src/App.vue)에서 세션 확인 중 800ms 동안 스플래시 화면 표시
2. 세션이 없으면 `/login`으로 리다이렉트
3. 라우터 가드에서 사용자 프로필/닉네임 확인
4. 프로필이 불완전하면 `/signup/step2`로 강제 이동

### 레이아웃 구조

- **MainLayout**: [src/components/MainLayout.vue](src/components/MainLayout.vue)가 모든 인증된 페이지를 감싸고 BottomNav를 포함합니다
- **중첩 라우팅**: 메인 앱 라우트들은 라우터 설정에서 MainLayout의 자식 라우트로 구성됩니다
- **라우트 메타**: 보호된 라우트는 `meta.requiresAuth`, 하단 네비게이션 표시 제어는 `meta.showBottomNav` 사용

### 주요 기능 및 컴포넌트

**홈** (`/`)
- AI 병충해 분석을 위한 카메라 통합이 포함된 식물 관리
- 배지 카운터가 있는 알림 시스템
- 사이드 메뉴 네비게이션

**인증**
- 이메일/비밀번호 또는 OAuth를 통한 로그인 (로컬 개발용 리다이렉트 설정됨)
- 다단계 회원가입 플로우: Step1 (약관동의) → Step2 (닉네임) → Step3 (선택정보) → Complete
- `/update-password`에서 비밀번호 재설정

**커뮤니티** (`/community`)
- `/write`에서 게시글 작성 (인증 필요)
- 댓글 시스템
- Container 기반 레이아웃

**시세** (`/marketprice`)
- 식물 시세 정보 조회
- `/plant/:id`에서 상세 정보

**프로필** (`/profile`)
- 사용자 프로필 조회 및 수정
- Supabase Edge Function을 통한 회원 탈퇴

### Supabase 통합

**Edge Functions**
- `withdraw-user`: Users 테이블과 messages에 대한 CASCADE 작업으로 사용자 계정 삭제 처리
- [supabase/functions/](supabase/functions/)에 위치
- 브라우저 요청을 위한 CORS 헤더 사용

**API 헬퍼**
- [src/utils/supabase.js:9-31](src/utils/supabase.js#L9-L31)의 `apiFetch()`는 자동 인증 토큰 주입으로 fetch를 래핑합니다
- localStorage의 `access_token`을 anon key보다 우선시합니다

**데이터베이스 스키마 참고사항**
- 메인 사용자 테이블: `Users` (대문자 U)
- 사용자 프로필에는 `name` 필드(닉네임) 포함
- 사용자 삭제를 위한 Foreign key CASCADE 설정됨

## 경로 별칭

Vite에서 `@` 별칭이 `src/` 디렉토리를 가리키도록 설정됨 ([vite.config.js:12](vite.config.js#L12))

## 코드 패턴

### Vue Composition API
모든 최신 컴포넌트는 `<script setup>` 문법을 사용합니다

### 컴포넌트 구성
```
src/components/
├── common/          # 공통 컴포넌트 (BottomNav, SplashScreen)
├── Home/            # 홈 기능 컴포넌트
├── Community/       # 커뮤니티 기능 컴포넌트
├── MarketPrice/     # 시세 기능 컴포넌트
├── Profile/         # 프로필 기능 컴포넌트
├── Signup/          # 다단계 회원가입 컴포넌트
└── chat/            # 채팅 팝업 컴포넌트
```

### 인증 패턴
- 현재 세션을 확인하려면 항상 `supabase.auth.getSession()`을 await합니다
- 라우트 보호를 위해 라우터 네비게이션 가드를 사용합니다
- Edge Function 호출을 위해 localStorage에 액세스 토큰을 저장합니다

## 중요 사항

- 개발 서버는 포트 5174에서 실행됩니다 (비표준)
- OAuth 리다이렉트가 `redirectTo` 옵션으로 로컬 개발용으로 설정되어 있습니다
- Supabase URL과 anon key가 코드에 커밋되어 있습니다 (공개 키이므로 프론트엔드에서는 허용됨)
- AI 병충해 분석은 첫 호출 시 20-30초 소요될 수 있습니다 (콜드 스타트)
