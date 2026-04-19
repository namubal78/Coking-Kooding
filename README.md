# Coking-Cooding

개인 포트폴리오 겸 실동작 풀스택 웹 애플리케이션.  
기존 3개 프로젝트(ESWorld · Flow Task · AAP)의 기능을 하나의 서비스로 통합했습니다.

**프론트엔드 접속:** [namubal78.github.io](https://namubal78.github.io)  
**백엔드 API:** Render (무료 플랜)

---

## 통합된 기능

| 출처 | 기능 |
|---|---|
| ESWorld | 로그인 · JWT 인증 · 플래너(일정 CRUD) |
| Flow Task | 파일 업로드 · 확장자 차단 관리 · 엑셀 내보내기 |
| AAP | 결제 처리(포트원) · 결제 사후 검증 |
| 신규 | 블로그 포스트 CRUD |

---

## 아키텍처

```
namubal78.github.io          Render (무료)
  Next.js 정적 빌드    ──▶   Spring Boot API :8080
  GitHub Pages 호스팅         │
  GitHub Actions 자동 배포    ├── /api/auth
                              ├── /api/blog/posts
                              ├── /api/planner
                              ├── /api/files
                              └── /api/payments
                                       │
                              Supabase PostgreSQL (무료)
```

---

## 기술 스택

### 프론트엔드
| 항목 | 버전 | 선택 이유 |
|---|---|---|
| Next.js | 15.x | ESWorld 기존 스택 유지, 정적 export로 GitHub Pages 무료 배포 |
| React | 19.x | Next.js 기본 의존성 |
| TypeScript | 5.x | 타입 안정성, 유지보수 용이 |
| Tailwind CSS | 4.x | 컴포넌트 단위 스타일링, 빠른 UI 작업 |

### 백엔드
| 항목 | 버전 | 선택 이유 |
|---|---|---|
| Spring Boot | 3.4.4 | Flow Task · AAP 기존 스택 유지, Java 생태계 표준 |
| Java | 17 | Spring Boot 3.x 최소 요구사항 |
| Spring Security + JWT | 3.4.x / jjwt 0.12.6 | ESWorld PyJWT를 Java로 이식 |
| Spring Data JPA | 3.4.x | Flow Task · AAP 기존 스택, 반복 쿼리 코드 제거 |
| PostgreSQL | 최신 | MongoDB(ESWorld) + PostgreSQL(Flow Task·AAP) DB 단일화 |
| Gradle | 8.13 | 기존 빌드 도구 유지, 로컬 캐시 활용 |
| Apache POI | 5.3.0 | Flow Task 엑셀 기능 유지 |

### 인프라
| 항목 | 선택 이유 |
|---|---|
| GitHub Pages | namubal78.github.io URL 유지, 프론트 무료 호스팅 |
| Render | Spring Boot JAR 무료 배포, Dockerfile 없이 Gradle 자동 감지 |
| Supabase | PostgreSQL 500MB 무료, Render DB보다 안정적 |
| GitHub Actions | push 시 자동 빌드·배포, 공개 레포 무제한 무료 |

---

## 프로젝트 구조

```
Coking-Cooding/
├── .github/workflows/
│   ├── deploy-frontend.yml     # push → Next.js 빌드 → GitHub Pages
│   └── deploy-backend.yml      # push → Render 배포 트리거
├── frontend/                   # Next.js 15 (정적 export)
│   └── app/
├── backend/                    # Spring Boot 3.4
│   └── src/main/java/com/cookingcooding/
│       ├── config/             # JWT · Security · CORS
│       ├── auth/               # 로그인 · 회원가입
│       ├── blog/               # 포스트 CRUD
│       ├── planner/            # 일정 CRUD
│       ├── files/              # 파일 업로드 · 확장자 관리
│       └── payment/            # 결제 검증
└── 서평_프로그래머열정을말하다.docx
```

---

## API 엔드포인트

| 도메인 | 메서드 | 경로 | 인증 |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | 불필요 |
| Auth | POST | `/api/auth/register` | 불필요 |
| Blog | GET | `/api/blog/posts` | 불필요 |
| Blog | GET | `/api/blog/posts/{id}` | 불필요 |
| Blog | POST · PUT · DELETE | `/api/blog/posts` | 필요 |
| Planner | GET · POST · PUT · DELETE | `/api/planner` | 필요 |
| Files | GET · POST · DELETE | `/api/files` | 필요 |
| Files | GET · POST · DELETE | `/api/files/extensions` | 필요 |
| Payment | GET | `/api/payments` | 필요 |
| Payment | POST | `/api/payments/verify` | 필요 |

---

## 로컬 실행

### 사전 준비
- Java 17
- Node.js 22
- PostgreSQL (또는 Docker)

### 백엔드
```bash
cd backend
cp .env.example .env        # 환경변수 설정
./gradlew bootRun
# http://localhost:8080
```

### 프론트엔드
```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL 설정
npm install
npm run dev
# http://localhost:3000
```

---

## 배포 설정

### GitHub Actions Secrets 등록 (레포 Settings → Secrets)

| Secret | 값 |
|---|---|
| `API_URL` | Render 백엔드 URL |
| `RENDER_DEPLOY_HOOK_URL` | Render 대시보드 → Deploy Hook URL |
| `PERSONAL_ACCESS_TOKEN` | GitHub PAT (namubal78.github.io 레포 push 권한) |

### Render 환경변수 등록

| 변수 | 값 |
|---|---|
| `DB_URL` | Supabase PostgreSQL 연결 문자열 |
| `DB_USERNAME` | Supabase DB 유저명 |
| `DB_PASSWORD` | Supabase DB 비밀번호 |
| `JWT_SECRET` | 랜덤 256bit 문자열 |
| `CORS_ORIGINS` | `https://namubal78.github.io` |

---

## 향후 계획

- [ ] Next.js 페이지 UI 구현
- [ ] Docker / Docker Compose 로컬 환경 구성
- [ ] Kubernetes 배포 구성
- [ ] Claude API 연동 AI 챗봇 추가
- [ ] Slack MCP → Claude Desktop → 자동 CI/CD 파이프라인

---

## SSG 방식에 대해

현재 프론트엔드는 `output: export` (정적 생성) 방식입니다.  
페이지 HTML은 빌드 시 생성되지만 **실제 데이터(로그인·CRUD 등)는 브라우저에서 백엔드 API를 직접 호출**하므로 모든 기능이 정상 동작합니다.  
유일한 제약은 블로그 SEO이며, 트래픽이 늘어나는 시점에 Vercel SSR로 전환 가능합니다.
