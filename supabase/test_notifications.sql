-- 알림 기능 테스트용 스크립트
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 먼저 현재 로그인한 사용자 ID 확인 (결과를 복사하세요)
SELECT auth.uid() as my_user_id;

-- 2. 위에서 나온 user_id를 아래 'YOUR_USER_ID_HERE'에 붙여넣고 실행하세요
-- 예시: INSERT INTO notifications (user_id, ...) VALUES ('550e8400-e29b-41d4-a716-446655440000', ...)

-- 좋아요 알림 테스트
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  read,
  metadata,
  created_at
) VALUES
-- YOUR_USER_ID_HERE를 위에서 복사한 실제 user_id로 변경하세요
(
  'YOUR_USER_ID_HERE',
  'social',
  '새로운 좋아요',
  '테스트 사용자님이 회원님의 게시글을 좋아합니다',
  false,
  '{"post_title": "테스트 게시글"}',
  NOW()
);

-- 댓글 알림 테스트
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  read,
  metadata,
  created_at
) VALUES
(
  'YOUR_USER_ID_HERE',
  'social',
  '새로운 댓글',
  '테스트 사용자님이 회원님의 게시글에 댓글을 달았습니다',
  false,
  '{"comment_content": "정말 멋진 식물이네요!"}',
  NOW() - INTERVAL '5 minutes'
);

-- 답글 알림 테스트
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  read,
  metadata,
  created_at
) VALUES
(
  'YOUR_USER_ID_HERE',
  'social',
  '새로운 답글',
  '테스트 사용자님이 회원님의 댓글에 답글을 달았습니다',
  false,
  '{"comment_content": "저도 동감합니다!"}',
  NOW() - INTERVAL '10 minutes'
);

-- 여러 알림을 한번에 생성 (읽지 않은 알림 배지 테스트)
INSERT INTO notifications (user_id, type, title, message, read, created_at) VALUES
('YOUR_USER_ID_HERE', 'social', '새로운 좋아요', '김식물님이 회원님의 게시글을 좋아합니다', false, NOW() - INTERVAL '1 hour'),
('YOUR_USER_ID_HERE', 'social', '새로운 댓글', '이정원님이 회원님의 게시글에 댓글을 달았습니다', false, NOW() - INTERVAL '2 hours'),
('YOUR_USER_ID_HERE', 'plant', '물주기 시간', '몬스테라에 물을 줄 시간입니다', false, NOW() - INTERVAL '3 hours'),
('YOUR_USER_ID_HERE', 'social', '새로운 좋아요', '박다육님이 회원님의 게시글을 좋아합니다', true, NOW() - INTERVAL '1 day');

-- 3. 확인: 내 알림 목록 조회
SELECT
  id,
  type,
  title,
  message,
  read,
  created_at
FROM notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
