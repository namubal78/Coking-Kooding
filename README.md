# Coking-Cooding

블로그 · 포트폴리오 · 가족 전용 공간을 하나의 서비스로 운영하는 풀스택 웹 애플리케이션.

**Live:** [namubal78.github.io](https://namubal78.github.io)  
**API:** [coking-cooding-api.onrender.com](https://coking-cooding-api.onrender.com)

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 |
| Backend | Spring Boot 3.4.4 · Java 17 · Spring Security · JWT · OAuth2 |
| Database | PostgreSQL (Supabase) · HikariCP · Hibernate 6 |
| Storage | Supabase Storage |
| Realtime | WebSocket · STOMP · SockJS |
| Push | Web Push VAPID · Service Worker |
| AI | Anthropic Claude Haiku 4.5 API |
| CI/CD | GitHub Actions → Docker (ghcr.io) → Render / GitHub Pages |

---

## Architecture

```
GitHub Push
    │
    ├─ deploy-backend.yml
    │       └─ Docker build → ghcr.io → Render (Spring Boot)
    │                                          │
    │                                    PostgreSQL (Supabase)
    │                                    Supabase Storage
    │
    ├─ deploy-frontend.yml
    │       └─ Next.js static export → GitHub Pages
    │
    └─ dev-log.yml
            └─ 2분 대기 → 백엔드 웹훅 → Claude Haiku API 요약
                       → dev_logs 테이블 upsert → Slack 알림
```

---

## Backend 설계 포인트

### 1. 인증 · 인가

- **OAuth2 (Google + Kakao)** 소셜 로그인 — 가족 이메일 화이트리스트(`FAMILY_EMAILS`)로 접근 제어
- **iOS Safari ITP 대응**: `SameSite=None; Secure` 쿠키에 OAuth state 저장하는 `CookieOAuth2AuthorizationRequestRepository` 구현
- **JWT 발급**: 인증 성공 후 JWT 발급 → 프론트 localStorage → 이후 Bearer 헤더 인증
- Spring Security FilterChain에서 `MvcRequestMatcher`로 공개/보호 엔드포인트 분리

### 2. 배포 안정성 (Render Starter 콜드스타트 없는 상시 가동)

Render 배포 초기 반복 실패 원인:
- `ddl-auto: update` → Hibernate 스키마 동기화 중 DB 타임아웃 → 290초 포트 스캔 타임아웃

해결:

```yaml
jpa:
  hibernate:
    ddl-auto: none
datasource:
  hikari:
    keepalive-time: 60000      # 유휴 커넥션 유지 (Supabase 풀러 timeout 대응)
    connection-timeout: 60000
    max-lifetime: 1800000
```

`lazy-init + MvcRequestMatcher` 충돌도 함께 해결.

### 3. WebSocket 실시간 메신저

- STOMP + SockJS 기반 가족 채팅
- `/api/messenger/unread` 폴링으로 미읽음 카운트 → Navbar 뱃지 표시 (PC/모바일)
- `message_reads` 테이블: 사용자별 `lastReadId` 저장 → 읽음 처리 즉시 반영
- Web Push VAPID로 앱 포그라운드/백그라운드 푸시 알림

### 4. AI 자동 개발 일지 파이프라인

```
GitHub Push
  → GitHub Actions (deploy-backend.yml 완료 후)
  → dev-log.yml 워크플로 실행 (2분 대기)
  → POST /api/dev-log/webhook (HMAC-SHA256 서명 검증)
  → Claude Haiku API: 커밋 diff 기술 요약 생성
  → dev_logs 테이블 upsert (commit_sha UNIQUE)
  → Slack Bot 알림 (성공/실패 분기)
```

Claude API 요청은 커밋 SHA 기반 멱등 처리 — 워크플로 재실행 시 중복 생성 없음.

### 5. Supabase Storage 연동

파일 업로드 · 조회 · 삭제를 Spring `RestTemplate`으로 Supabase Storage REST API와 직접 통신:

```java
// 업로드
restTemplate.exchange(
    supabaseUrl + "/storage/v1/object/" + bucket + "/" + storagePath,
    HttpMethod.POST, new HttpEntity<>(file.getBytes(), headers), String.class
);

// 스토리지 사용량: Storage list API로 실제 파일 크기 합산
// POST /storage/v1/object/list/{bucket} → metadata.size 합산
// DB 컬럼 대신 Storage API 직접 조회 → 기존 파일도 정확히 반영
```

### 6. 보안

- 블로그 댓글: 비로그인 사용자 패스워드 BCrypt 해싱, XSS 방어 (서버 사이드 이스케이프)
- OAuth2 state: `CookieOAuth2AuthorizationRequestRepository`로 CSRF 방어
- 웹훅 수신: HMAC-SHA256 서명 검증
- Slack 이벤트: Signing Secret 검증

---

## API 구조

```
/api/auth/**           JWT 발급
/oauth2/**             Google · Kakao OAuth2 콜백
/api/blog/posts        블로그 CRUD
/api/blog/comments     댓글 · 대댓글 (비로그인 BCrypt 패스워드)
/api/photos/**         사진 업로드 · 삭제 · 스토리지 용량
/api/workout/**        운동 CRUD · 타이머 · 통계 · 음성인식 NLP
/api/planner/**        플래너 CRUD
/api/messenger/**      WebSocket STOMP · 읽음 처리 · 미읽음 카운트
/api/push/**           Web Push 구독 · 발송
/api/dev-log/webhook   GitHub Actions 개발일지 웹훅
/api/demo/**           AI 챗봇 · 파일 업로드 · 결제 데모 (공개)
```

---

## DB 스키마 (주요)

| 테이블 | 설명 |
|--------|------|
| `users` | OAuth2 이메일 기반 사용자 |
| `posts` | 블로그 게시글 |
| `comments` | 댓글 · 대댓글 (parent_id self-ref) |
| `dev_logs` | AI 자동 개발 일지 (commit_sha UNIQUE) |
| `photos` | Supabase Storage 파일 메타데이터 |
| `planner_items` | 플래너 일정 |
| `exercises` | 운동 종목 |
| `workout_logs` | 날짜별 세트 완료 기록 |
| `messages` | WebSocket 채팅 메시지 |
| `message_reads` | 사용자별 마지막 읽은 메시지 ID |
| `push_subscriptions` | Web Push VAPID 구독 정보 |

---

## CI/CD

### `deploy-backend.yml` — backend/** 변경 시

```
Docker multi-stage build (gradle → jre-slim)
→ ghcr.io push
→ Render Deploy Hook
→ Slack 성공/실패 알림
```

### `deploy-frontend.yml` — frontend/** 변경 시

```
npm ci && next build (static export)
→ GitHub Pages (gh-pages branch)
```

### `dev-log.yml` — 모든 main push

```
120초 대기 (Render 재시작 완료 대기)
→ curl POST /api/dev-log/webhook (HMAC 서명)
```

---

## Local Setup

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

환경변수: `backend/.env.example`, `frontend/.env.local.example` 참고.
