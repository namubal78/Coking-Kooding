-- 실행 위치: Supabase SQL Editor
-- 역할: exercises 테이블에 user_id 추가, planner_items에 알림 필드 추가

-- 1. exercises: 유저별 운동 목록 분리
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);
-- 기존 exercises를 은새아빠(namubal78@gmail.com) 계정에 할당
UPDATE exercises SET user_id = (SELECT id FROM users WHERE email = 'namubal78@gmail.com') WHERE user_id IS NULL;

-- 2. planner_items: 알림 발송 시각 + 발송 여부
ALTER TABLE planner_items ADD COLUMN IF NOT EXISTS notify_at TIMESTAMP;
ALTER TABLE planner_items ADD COLUMN IF NOT EXISTS notified BOOLEAN NOT NULL DEFAULT FALSE;
