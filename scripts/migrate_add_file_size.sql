-- photos 테이블에 file_size 컬럼 추가 (이미 있으면 무시)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
