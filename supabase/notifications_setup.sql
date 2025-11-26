-- PlantCare 알림 시스템 설정
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('plant', 'trade', 'social', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  metadata jsonb,
  related_post_id bigint,
  related_user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- 3. RLS (Row Level Security) 정책 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 5. RLS 정책: 사용자는 자신의 알림만 업데이트 가능 (읽음 표시)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. RLS 정책: 시스템에서 알림 생성 가능 (모든 사용자가 다른 사용자에게 알림 생성 가능)
CREATE POLICY "Users can create notifications for others"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 7. 좋아요 발생 시 자동 알림 생성 함수
CREATE OR REPLACE FUNCTION notify_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  post_title text;
  liker_name text;
BEGIN
  -- 게시글 작성자 ID와 제목 조회
  SELECT user_id, title INTO post_author_id, post_title
  FROM posts
  WHERE id = NEW.post_id;

  -- 좋아요 누른 사람의 닉네임 조회
  SELECT name INTO liker_name
  FROM "Users"
  WHERE id = NEW.user_id;

  -- 자기 자신의 게시글에 좋아요를 누른 경우 알림 생성하지 않음
  IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      related_post_id,
      related_user_id
    ) VALUES (
      post_author_id,
      'social',
      '새로운 좋아요',
      COALESCE(liker_name, '사용자') || '님이 회원님의 게시글을 좋아합니다',
      jsonb_build_object('post_title', post_title),
      NEW.post_id,
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 좋아요 트리거 생성
DROP TRIGGER IF EXISTS trigger_notify_like ON likes;
CREATE TRIGGER trigger_notify_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_like();

-- 9. 댓글 발생 시 자동 알림 생성 함수
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id uuid;
  post_title text;
  commenter_name text;
  parent_comment_author_id uuid;
BEGIN
  -- 게시글 작성자 ID와 제목 조회
  SELECT user_id, title INTO post_author_id, post_title
  FROM posts
  WHERE id = NEW.post_id;

  -- 댓글 작성자의 닉네임 조회
  SELECT name INTO commenter_name
  FROM "Users"
  WHERE id = NEW.user_id;

  -- 대댓글인 경우 원 댓글 작성자에게도 알림
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_author_id
    FROM comments
    WHERE id = NEW.parent_id;

    -- 원 댓글 작성자에게 알림 (자기 자신 제외)
    IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.user_id THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        metadata,
        related_post_id,
        related_user_id
      ) VALUES (
        parent_comment_author_id,
        'social',
        '새로운 답글',
        COALESCE(commenter_name, '사용자') || '님이 회원님의 댓글에 답글을 달았습니다',
        jsonb_build_object('comment_content', LEFT(NEW.content, 50)),
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;

  -- 게시글 작성자에게 알림 (자기 자신 제외, 대댓글의 경우 중복 방지)
  IF post_author_id IS NOT NULL
     AND post_author_id != NEW.user_id
     AND (NEW.parent_id IS NULL OR post_author_id != parent_comment_author_id) THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      related_post_id,
      related_user_id
    ) VALUES (
      post_author_id,
      'social',
      '새로운 댓글',
      COALESCE(commenter_name, '사용자') || '님이 회원님의 게시글에 댓글을 달았습니다',
      jsonb_build_object('comment_content', LEFT(NEW.content, 50)),
      NEW.post_id,
      NEW.user_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 댓글 트리거 생성
DROP TRIGGER IF EXISTS trigger_notify_comment ON comments;
CREATE TRIGGER trigger_notify_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment();

-- 완료!
-- 이제 프론트엔드에서 notifications 테이블을 조회하여 알림을 표시할 수 있습니다.
