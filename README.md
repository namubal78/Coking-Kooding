# Coking-Cooding

개인 블로그 · 포트폴리오 · 가족 전용 공간을 하나의 서비스로 운영하는 풀스택 웹 애플리케이션.

**프론트엔드:** [namubal78.github.io/Coking-Cooding](https://namubal78.github.io/Coking-Cooding)  
**백엔드 API:** [coking-cooding-api.onrender.com](https://coking-cooding-api.onrender.com/health)

---

## 3개 영역 구조

이 서비스는 세 개의 병렬 영역으로 구성됩니다.

### 1. 블로그 (공개)
학습 기록과 트러블슈팅을 포스팅하는 개인 기술 블로그.  
포스트 내부에서 코킹쿠딩의 실제 구현 기능·코드 블럭으로 바로 이동 가능.

### 2. 포트폴리오 (공개)
기존 실무 프로젝트 소개 + 코킹쿠딩 개발 과정 트러블슈팅 기록.  
코킹쿠딩 구현 기능을 직접 체험하거나 코드를 열람할 수 있는 링크 제공.

### 3. 은새월드 (가족 전용)
Google · Kakao OAuth2 로그인 후 접근 가능한 가족 전용 공간.  
플래너 · 파일 관리 · 결제 기록 등 비공개 기능.  
외부 방문자는 전체 조회 및 댓글만 가능 (별도 가입 없음).

---

## 아키텍처

```
namubal78.github.io
  Next.js 정적 빌드 (GitHub Pages)
  │
  ├── /                  메인 랜딩 (3영역 소개)
  ├── /blog/**           블로그 (공개)
  ├── /portfolio/**      포트폴리오 (공개)
  └── /world/**          은새월드 (OAuth 로그인 필요)
        ├── /world/dashboard
        ├── /world/planner
        ├── /world/files
        └── /world/payments
              │
              ▼
        Render — Spring Boot API :8080
              │
              ├── /api/public/**     인증 불필요 (블로그·댓글 조회)
              ├── /api/portfolio/**  인증 불필요 (프로젝트 메타데이터)
              └── /api/world/**      JWT 필요 (플래너·파일·결제)
                        │
                  Supabase PostgreSQL (aws-1-ap-south-1, 포트 6543 pooler)
```

---

## 기술 스택

### 프론트엔드
| 항목 | 버전 | 선택 이유 |
|---|---|---|
| Next.js | 15.x | 정적 export로 GitHub Pages 무료 배포 |
| React | 19.x | Next.js 기본 의존성 |
| TypeScript | 5.x | 타입 안정성 |
| Tailwind CSS | 4.x | 빠른 UI 작업 |

### 백엔드
| 항목 | 버전 | 선택 이유 |
|---|---|---|
| Spring Boot | 3.4.4 | Java 생태계 표준 |
| Java | 17 | Spring Boot 3.x 최소 요구사항 |
| Spring Security + JWT | 3.4.x | OAuth2 · 가족 화이트리스트 인증 |
| Spring Data JPA | 3.4.x | 반복 쿼리 코드 제거 |
| PostgreSQL | 최신 | DB 단일화 |
| Gradle | 8.13 | 빌드 도구 |

### 인프라
| 항목 | 선택 이유 |
|---|---|
| GitHub Pages | 프론트 무료 호스팅 |
| Render | Docker 이미지 기반 배포 (ghcr.io → Render pull) |
| Supabase | PostgreSQL 500MB 무료, Session pooler IPv4 지원 |
| GitHub Actions | push 시 자동 빌드·배포 |
| GitHub Container Registry | Docker 이미지 저장소 (빌드 속도 개선) |

---

## 백엔드 패키지 구조 (목표)

```
com.cookingcooding
├── config/              JWT · Security · CORS · Health
├── auth/                OAuth2 (Google · Kakao) · JWT 발급
├── public/              블로그 조회 · 댓글 (인증 불필요)
├── portfolio/           프로젝트 메타데이터 (인증 불필요)
└── world/               가족 전용 기능 (JWT 필요)
    ├── planner/         일정 CRUD
    ├── files/           파일 업로드 · 확장자 관리
    └── payment/         결제 검증
```

> 현재는 blog · planner · files · payment 패키지 구조이며, 위 목표 구조로 리팩토링 예정.

---

## API 엔드포인트

### 공개 (인증 불필요)
| 도메인 | 메서드 | 경로 |
|---|---|---|
| Auth | POST | `/api/auth/login` |
| Auth | POST | `/api/auth/register` |
| Auth | GET | `/oauth2/authorization/google` |
| Auth | GET | `/oauth2/authorization/kakao` |
| Blog | GET | `/api/blog/posts` |
| Blog | GET | `/api/blog/posts/{id}` |

### 보호 (JWT 필요)
| 도메인 | 메서드 | 경로 |
|---|---|---|
| Blog | POST · PUT · DELETE | `/api/blog/posts` |
| Planner | GET · POST · PUT · DELETE | `/api/planner` |
| Files | GET · POST · DELETE | `/api/files` |
| Files | GET · POST · DELETE | `/api/files/extensions` |
| Payment | GET | `/api/payments` |
| Payment | POST | `/api/payments/verify` |

---

## 프로젝트 파일 구조

```
Coking-Cooding/
├── .github/workflows/
│   ├── deploy-frontend.yml     # push → Next.js 빌드 → GitHub Pages
│   └── deploy-backend.yml      # backend/** 변경 → Docker 빌드 → ghcr.io → Render
├── frontend/                   # Next.js 15 (정적 export)
│   └── app/
│       ├── blog/
│       ├── portfolio/
│       └── world/
└── backend/                    # Spring Boot 3.4
    └── src/main/java/com/cookingcooding/
        ├── config/
        ├── auth/
        ├── blog/
        ├── planner/
        ├── files/
        └── payment/
```

---

## 로컬 실행

### 사전 준비
- Java 17
- Node.js 22
- PostgreSQL (또는 Docker)

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

## 배포 설정

### GitHub Actions Secrets
| Secret | 용도 |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render 배포 트리거 |
| `PERSONAL_ACCESS_TOKEN` | GitHub Pages 배포용 PAT |

### Render 환경변수
| 변수 | 설명 |
|---|---|
| `SPRING_DATASOURCE_URL` | Supabase JDBC URL (user · password · sslmode 포함) |
| `JWT_SECRET` | 256bit 시크릿 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth2 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 시크릿 |
| `KAKAO_CLIENT_ID` | Kakao OAuth2 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth2 시크릿 |
| `FAMILY_EMAILS` | 은새월드 허용 이메일 목록 (쉼표 구분) |
| `FRONTEND_URL` | `https://namubal78.github.io` |
| `CORS_ORIGINS` | `https://namubal78.github.io` |

---

## 구현 현황

### 완료
- [x] 백엔드 전체 구현 (Auth · Blog · Planner · Files · Payment)
- [x] Google · Kakao OAuth2 로그인 (FAMILY_EMAILS 화이트리스트)
- [x] Supabase PostgreSQL 연결 (Session pooler, 포트 6543)
- [x] Render Docker 이미지 기반 배포 (ghcr.io → Render pull)
- [x] GitHub Actions CI/CD 파이프라인

### 진행 예정
- [ ] 프론트 3영역 라우팅 구조 재편 (blog · portfolio · world)
- [ ] 백엔드 패키지 public · portfolio · world 구조로 리팩토링
- [ ] 메인 랜딩 페이지 (3영역 소개 + 분기)
- [ ] 블로그 ↔ 코킹쿠딩 기능 연동 링크
- [ ] 포트폴리오 페이지 (실무 포폴 + 코킹쿠딩 데모)
- [ ] 은새월드 대시보드 · 플래너 · 파일 · 결제 UI
- [ ] 포트원 결제 실연동 (merchant 계정 필요)
- [ ] Docker Compose 로컬 환경
- [ ] Claude API 챗봇
- [ ] Slack MCP CI/CD 자동화

---

## CI/CD 흐름

```
git push (backend/**)
  → GitHub Actions
  → Docker 빌드 (./backend)
  → ghcr.io/namubal78/coking-cooding-api:latest push
  → Render Deploy Hook 호출
  → Render가 새 이미지 pull & 재배포

git push (frontend/**)
  → GitHub Actions
  → Next.js 정적 빌드
  → namubal78.github.io 배포
```
