-- exercises 테이블에 운동 시간(초) 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE exercises
    ADD COLUMN IF NOT EXISTS duration_seconds INT NOT NULL DEFAULT 0;
