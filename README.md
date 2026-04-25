# Coking-Cooding

블로그 · 포트폴리오 · 가족 전용 공간(은새월드)을 하나의 서비스로 운영하는 풀스택 웹 애플리케이션.

**프론트엔드:** [namubal78.github.io](https://namubal78.github.io)  
**백엔드 API:** [coking-cooding-api.onrender.com](https://coking-cooding-api.onrender.com/health)

---

## 서비스 구조

### 1. 블로그 `/blog` (공개)
개인 기술 블로그. 학습 기록·트러블슈팅·서평 포스팅. Toast UI Editor 기반 마크다운 작성.

### 2. 포트폴리오 `/portfolio` (공개)
실무 프로젝트 소개 + Coking-Cooding 개발 과정 기록.

### 3. 데모 `/demo` (공개)
Spring Boot 기능 데모:
- 파일 업로드·확장자 관리
- 결제 기록 조회
- AI 챗봇 (Claude Haiku API 프록시)

### 4. 은새월드 `/world` (Google·Kakao 로그인 필요)
가족 전용 공간:
- **대시보드** — 요약 뷰
- **플래너** — 월간/주간 일정 CRUD + 음성인식(Claude Haiku NLP) 일정 추가
- **운동 트래커** — 운동 CRUD, 세트 체크박스, 운동·휴식 타이머 (TTS 알림), 동영상 업로드, 주간·월간 통계
- **앨범** — Supabase Storage Public 버킷 + 공개 URL 바둑판 그리드
- **드래프트** — 커밋마다 GitHub Actions → Claude API → 자동 개발 일지 생성

---

## 아키텍처

```
namubal78.github.io (GitHub Pages — Next.js 15 정적 export)
  │
  ├── /blog, /portfolio, /demo    공개 영역
  └── /world/**                   은새월드 (JWT 필요)
              │
              ▼
  coking-cooding-api.onrender.com (Render Starter — Spring Boot 3.4.4)
              │
              ├── Supabase PostgreSQL  (ap-south-1, pooler:6543)
              └── Supabase Storage    (photos / workout-videos — Public 버킷)
```

---

## 기술 스택

### 프론트엔드
| 항목 | 버전 | 비고 |
|---|---|---|
| Next.js | 15.x | 정적 export → GitHub Pages |
| React | 19.x | — |
| TypeScript | 5.x | — |
| Tailwind CSS | 4.x | — |

### 백엔드
| 항목 | 버전 | 비고 |
|---|---|---|
| Spring Boot | 3.4.4 | — |
| Java | 17 | — |
| Spring Security + JWT | 6.x | OAuth2 + FAMILY_EMAILS 화이트리스트 |
| Spring Data JPA | 3.4.x | ddl-auto: none (수동 마이그레이션) |
| PostgreSQL | 17 | Supabase 호스팅 |

### 인프라 & 외부 서비스
| 항목 | 용도 | 비용 |
|---|---|---|
| GitHub Pages | 프론트 호스팅 | 무료 |
| Render Starter | 백엔드 호스팅 (상시 가동) | $7/월 |
| Supabase | PostgreSQL + Storage (photos / workout-videos) | 무료 |
| Anthropic API | AI 챗봇 + 드래프트 요약 (claude-haiku-4-5) | ~$1.5/월 |
| Slack | 배포 알림 (chat.postMessage) | 무료 |
| GitHub Actions | CI/CD 자동화 (3개 워크플로우) | 무료 |
| GitHub Container Registry | Docker 이미지 저장 | 무료 |

---

## 백엔드 패키지 구조

```
com.cookingcooding
├── config/       JWT · Security · CORS
├── auth/         OAuth2 (Google · Kakao) · JWT 발급
├── blog/         포스트 CRUD
├── chat/         Claude API 프록시
├── devlog/       커밋 자동 개발 일지
├── files/        파일 업로드·확장자
├── payment/      결제 기록
├── photos/       Supabase Storage 앨범
├── planner/      일정 CRUD
└── workout/      운동 트래커 (exercises · workout_logs · workout_videos)
```

---

## 주요 DB 테이블

| 테이블 | 용도 |
|---|---|
| `users` | 로그인 사용자 |
| `posts` | 블로그 포스트 |
| `planner_items` | 플래너 일정 |
| `photos` | 앨범 메타데이터 |
| `dev_logs` | 자동 개발 일지 |
| `uploaded_files` | 데모 업로드 파일 |
| `payments` | 결제 기록 |
| `exercises` | 운동 목록 (name, total_sets, rest_seconds, duration_seconds) |
| `workout_logs` | 일별 세트 완료 기록 |
| `workout_videos` | 운동별 동영상 Supabase 경로 |

---

## API 엔드포인트

### 공개 (인증 불필요)
| 경로 | 메서드 | 설명 |
|---|---|---|
| `/health` | GET | 헬스체크 |
| `/api/auth/login` | POST | 이메일 로그인 |
| `/api/auth/register` | POST | 회원가입 |
| `/oauth2/authorization/google` | GET | Google OAuth2 |
| `/oauth2/authorization/kakao` | GET | Kakao OAuth2 |
| `/api/blog/posts` | GET | 블로그 목록 |
| `/api/blog/posts/{id}` | GET | 블로그 상세 |
| `/api/chat` | POST | AI 챗봇 |
| `/api/files` | GET | 파일 목록 |
| `/api/payments` | GET | 결제 목록 |
| `/api/dev-logs/webhook` | POST | 드래프트 웹훅 (X-Webhook-Secret 필요) |

### 보호 (JWT 필요)
| 경로 | 메서드 | 설명 |
|---|---|---|
| `/api/blog/posts` | POST·PUT·DELETE | 블로그 작성·수정·삭제 |
| `/api/planner` | GET·POST·PUT·DELETE | 플래너 |
| `/api/files` | POST·DELETE | 파일 업로드·삭제 |
| `/api/photos` | GET·POST·DELETE | 앨범 |
| `/api/dev-logs` | GET | 드래프트 조회 |
| `/api/payments/verify` | POST | 결제 검증 |
| `/api/workout/exercises` | GET·POST·PUT·DELETE | 운동 CRUD |
| `/api/workout/logs` | GET·POST | 일별 세트 기록 |
| `/api/workout/logs/{id}/increment` | POST | 세트 증가 |
| `/api/workout/stats` | GET | 기간별 통계 |
| `/api/workout/stats/detail` | GET | 날짜별 운동 세부 |
| `/api/workout/exercises/{id}/video` | GET·POST·DELETE | 동영상 관리 |
| `/api/workout/voice` | POST | 음성인식 NLP |

---

## CI/CD 흐름

```
git push (backend/**)
  → deploy-backend.yml
  → Docker 빌드 → ghcr.io push → Render 재배포

git push (frontend/**)
  → deploy-frontend.yml
  → Next.js 빌드 → GitHub Pages 배포

git push (any)
  → dev-log.yml
  → 5분 대기 (Render 배포 완료 대기)
  → git diff 추출 (코드 파일 한정, 최대 6KB)
  → POST /api/dev-logs/webhook (커밋 정보 + diff)
  → Claude Haiku 기술 일지 생성 (다중 BEFORE/AFTER + 키워드 설명)
  → dev_logs 테이블 upsert
  → Slack #dev-log 채널 배포 알림
```

---

## 프로젝트 파일 구조

```
Coking-Cooding/
├── .github/workflows/
│   ├── deploy-backend.yml
│   ├── deploy-frontend.yml
│   └── dev-log.yml
├── scripts/
│   ├── migrate_add_file_size.sql
│   ├── migrate_add_exercise_duration.sql
│   ├── seed_dev_logs.sql
│   └── seed_blog_review.sql
├── frontend/
│   └── app/
│       ├── blog/
│       ├── portfolio/
│       ├── demo/
│       │   ├── files/
│       │   ├── payments/
│       │   └── chat/
│       └── world/
│           ├── dashboard/
│           ├── planner/
│           ├── workout/
│           ├── photos/
│           └── draft/
└── backend/
    └── src/main/java/com/cookingcooding/
        ├── config/
        ├── auth/
        ├── blog/
        ├── chat/
        ├── devlog/
        ├── files/
        ├── payment/
        ├── photos/
        ├── planner/
        └── workout/
```

---

## 로컬 실행

### 사전 준비
- Java 17
- Node.js 22

### 백엔드
```bash
cd backend
./gradlew bootRun
# http://localhost:8080
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## GitHub Secrets

| Secret | 용도 |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render 배포 트리거 |
| `PERSONAL_ACCESS_TOKEN` | GitHub Pages 배포용 PAT |
| `API_URL` | 백엔드 API URL |
| `WEBHOOK_SECRET` | 드래프트 웹훅 인증 |
| `SLACK_BOT_TOKEN` | Slack 배포 알림 봇 토큰 |
| `SLACK_CHANNEL_ID` | Slack 알림 채널 ID |

## Render 환경변수

| 변수 | 설명 |
|---|---|
| `DB_URL` | Supabase JDBC URL (pooler:6543) |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | 256bit 이상 시크릿 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth2 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 시크릿 |
| `KAKAO_CLIENT_ID` | Kakao OAuth2 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth2 시크릿 |
| `FAMILY_EMAILS` | 은새월드 허용 이메일 (쉼표 구분) |
| `FRONTEND_URL` | `https://namubal78.github.io` |
| `CORS_ORIGINS` | `https://namubal78.github.io` |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role 키 |
| `SUPABASE_BUCKET` | `photos` |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `WEBHOOK_SECRET` | 드래프트 웹훅 시크릿 |
| `SLACK_BOT_TOKEN` | Slack 봇 토큰 |
| `SLACK_SIGNING_SECRET` | Slack 서명 시크릿 |
| `SLACK_CHANNEL_ID` | Slack 알림 채널 ID |

---

## 구현 현황

### 완료
- [x] Google · Kakao OAuth2 로그인 (FAMILY_EMAILS 화이트리스트)
- [x] 블로그 CRUD (Toast UI Editor, 페이지네이션)
- [x] 플래너 CRUD + 음성인식 일정 추가 (Claude Haiku NLP)
- [x] 파일 업로드·관리 (확장자·용량 표시)
- [x] 결제 기록 조회
- [x] AI 챗봇 (Claude Haiku)
- [x] 사진 앨범 (Supabase Storage Public + 공개 URL)
- [x] 드래프트 (커밋마다 Claude 자동 기술 일지 — diff 기반 다중 BEFORE/AFTER)
- [x] Slack 배포 알림 (push마다 채널 알림)
- [x] Render Starter 상시 가동
- [x] GitHub Actions CI/CD (3개 워크플로우)
- [x] 운동 트래커
  - 운동 CRUD (이름·세트·운동시간·휴식시간)
  - 세트 체크박스 + 음성인식 세트 완료
  - 운동 타이머 + 휴식 타이머 (TTS 30초·10초·5초 알림)
  - 휴식 종료 시 다음 세트 자동 시작
  - TTS 볼륨 삼각형 슬라이더 + 음소거
  - 운동별 동영상 업로드/재생 (Supabase workout-videos)
  - 주간·월간 통계 (바 차트·캘린더, 세트별 시각화)

### 예정
- [ ] Slack Bot 멘션 응답 (Event Subscriptions URL 등록 + app_mention + 채널 /invite)
- [ ] 드래프트 PDF 출력
- [ ] /about 페이지 자기소개 텍스트
- [ ] 포트원 결제 실연동
