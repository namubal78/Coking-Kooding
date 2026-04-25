-- 가족 메신저 메시지 테이블
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS messages (
    id         BIGSERIAL PRIMARY KEY,
    sender_email VARCHAR(255) NOT NULL,
    sender_name  VARCHAR(100) NOT NULL,
    content      TEXT         NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
