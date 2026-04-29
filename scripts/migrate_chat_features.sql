-- 실행 위치: Supabase SQL Editor
-- 채팅 이미지 + 읽음 상태 추가

-- 1. messages: 이미지 URL 컬럼, content를 null 허용으로
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- 2. 읽음 상태: 유저별 마지막으로 읽은 메시지 ID
CREATE TABLE IF NOT EXISTS message_reads (
  user_email VARCHAR(255) PRIMARY KEY,
  last_read_id BIGINT NOT NULL DEFAULT 0
);
