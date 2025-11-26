-- 사용자 프로필 공개 범위 설정을 위한 컬럼 추가
-- privacy_plants: 내 식물 공개 범위 ('private' | 'public')
-- privacy_bookmarks: 저장됨 공개 범위 ('private' | 'public')
-- privacy_reports: 리포트 공개 범위 ('private' | 'public')

ALTER TABLE public."Users"
ADD COLUMN IF NOT EXISTS privacy_plants TEXT DEFAULT 'public' CHECK (privacy_plants IN ('private', 'public')),
ADD COLUMN IF NOT EXISTS privacy_bookmarks TEXT DEFAULT 'private' CHECK (privacy_bookmarks IN ('private', 'public')),
ADD COLUMN IF NOT EXISTS privacy_reports TEXT DEFAULT 'public' CHECK (privacy_reports IN ('private', 'public'));

COMMENT ON COLUMN public."Users".privacy_plants IS '내 식물 공개 범위: private(나만 보기), public(전체 공개)';
COMMENT ON COLUMN public."Users".privacy_bookmarks IS '저장됨 공개 범위: private(나만 보기), public(전체 공개)';
COMMENT ON COLUMN public."Users".privacy_reports IS '리포트 공개 범위: private(나만 보기), public(전체 공개)';
