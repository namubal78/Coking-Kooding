# Coking-Cooding

블로그 · 포트폴리오 · 가족 전용 공간(은새월드)을 하나의 서비스로 운영하는 풀스택 웹 애플리케이션.

**프론트엔드:** [namubal78.github.io](https://namubal78.github.io)  
**백엔드 API:** [coking-cooding-api.onrender.com](https://coking-cooding-api.onrender.com/health)

---

## 서비스 구조

### 1. 블로그 `/blog` (공개)
개인 기술 블로그. 학습 기록·트러블슈팅·서평 포스팅.

### 2. 포트폴리오 `/portfolio` (공개)
실무 프로젝트 소개 + Coking-Cooding 개발 과정 기록.

### 3. 데모 `/demo` (공개)
Spring Boot 기능 데모:
- 파일 업로드·확장자 관리
- 결제 기록 조회
- AI 챗봇 (Claude Haiku API 프록시)

### 4. 은새월드 `/world` (Google·Kakao 로그인 필요)
가족 전용 공간:
- 대시보드
- 플래너 (일정 CRUD)
- 앨범 (Supabase Storage Private 버킷 + Signed URL)
- 드래프트 (커밋마다 자동 생성되는 개발 일지)

---

## 아키텍처

```
namubal78.github.io (GitHub Pages — Next.js 정적 export)
  │
  ├── /blog, /portfolio, /demo    공개 영역
  └── /world/**                   은새월드 (JWT 필요)
              │
              ▼
  coking-cooding-api.onrender.com (Render Starter — Spring Boot)
              │
              ├── Supabase PostgreSQL  (ap-south-1, pooler:6543)
              └── Supabase Storage    (photos 버킷, Private)
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
| Spring Security + JWT | 6.x | OAuth2 + 화이트리스트 인증 |
| Spring Data JPA | 3.4.x | — |
| PostgreSQL | 17 | Supabase 호스팅 |

### 인프라 & 외부 서비스
| 항목 | 용도 | 비용 |
|---|---|---|
| GitHub Pages | 프론트 호스팅 | 무료 |
| Render Starter | 백엔드 호스팅 (상시 가동) | $7/월 |
| Supabase | PostgreSQL + Storage | 무료 (1GB 이하) |
| Anthropic API | AI 챗봇 + 드래프트 요약 | 사용량 기반 |
| GitHub Actions | CI/CD 자동화 | 무료 |
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
└── planner/      일정 CRUD
```

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
| `/api/dev-logs/webhook` | POST | 드래프트 웹훅 (시크릿 필요) |

### 보호 (JWT 필요)
| 경로 | 메서드 | 설명 |
|---|---|---|
| `/api/blog/posts` | POST·PUT·DELETE | 블로그 작성·수정·삭제 |
| `/api/planner` | GET·POST·PUT·DELETE | 플래너 |
| `/api/files` | POST·DELETE | 파일 업로드·삭제 |
| `/api/photos` | GET·POST·DELETE | 앨범 |
| `/api/dev-logs` | GET | 드래프트 조회 |
| `/api/payments/verify` | POST | 결제 검증 |

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
  → POST /api/dev-logs/webhook
  → Claude Haiku 요약 생성
  → dev_logs 테이블 upsert
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
│   ├── seed_dev_logs.sql      # 역사적 개발 일지 초기 데이터
│   └── seed_blog_review.sql   # 서평 블로그 포스트
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
        └── planner/
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

## Render 환경변수

| 변수 | 설명 |
|---|---|
| `DB_URL` | Supabase JDBC URL |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | 256bit 시크릿 키 |
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

---

## 구현 현황

### 완료
- [x] Google · Kakao OAuth2 로그인 (FAMILY_EMAILS 화이트리스트)
- [x] 블로그 CRUD
- [x] 플래너 CRUD
- [x] 파일 업로드·관리
- [x] 결제 기록 조회
- [x] AI 챗봇 (Claude Haiku)
- [x] 사진 앨범 (Supabase Storage Private + Signed URL)
- [x] 드래프트 (커밋마다 Claude 자동 요약)
- [x] Render Starter 상시 가동
- [x] GitHub Actions CI/CD (3개 워크플로우)

### 예정
- [ ] Slack Bot 연동 (배포 알림 + 간단 질문)
- [ ] 드래프트 PDF 출력
- [ ] 포트폴리오 페이지 상세화
- [ ] 포트원 결제 실연동
