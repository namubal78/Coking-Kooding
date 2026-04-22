-- Coking-Cooding 역사적 개발 일지 시드 데이터
-- Supabase SQL Editor에서 실행하세요.

INSERT INTO dev_logs (log_date, title, content, created_at, updated_at) VALUES

('2026-04-19', '2026-04-19 개발 일지 (3건)',
$$## 커밋 요약
Spring Boot 백엔드 기동 최적화와 Next.js 메인 랜딩 페이지를 구현하며 프로젝트의 첫 공개 가능한 형태를 갖췄다.

## 주요 변경사항
- `lazy-initialization: true` 활성화로 불필요한 Bean 선로드 제거 → 시작 시간 단축
- deprecated `PostgreSQLDialect` 명시 설정 제거 (Hibernate 자동 감지로 전환)
- 메인 랜딩 페이지 구현: 블로그·포트폴리오·은새월드 3영역 소개 섹션
- ESWorld 파비콘 적용
- README 배포 현황 및 구현 진척도 갱신

## 기술 개념 설명

### Lazy Initialization (지연 초기화)
Spring Boot는 기본적으로 애플리케이션 시작 시 모든 Bean을 미리 생성(Eager)한다. `lazy-initialization: true`로 설정하면 Bean이 실제로 처음 사용될 때까지 생성을 미룬다. 개발/테스트 환경에서 시작 속도를 크게 줄일 수 있으나, 첫 요청 응답이 느려질 수 있다는 트레이드오프가 있다.

### Hibernate Dialect
Hibernate가 SQL을 생성할 때 사용하는 DB별 방언(Dialect). PostgreSQL은 `PostgreSQLDialect`를 사용했으나, Hibernate 6.x부터는 JDBC URL을 보고 자동으로 감지하므로 명시적 설정이 불필요해졌다. 설정을 제거해도 동일하게 동작한다.

### GitHub Pages 정적 배포
Next.js의 `output: 'export'` 옵션으로 빌드하면 순수 HTML/CSS/JS 파일이 생성된다. 이를 GitHub Pages에 배포하면 서버 없이 무료로 정적 사이트를 호스팅할 수 있다. 단, 서버사이드 렌더링(SSR)이나 API Route는 사용할 수 없다.

## 결과
정상 처리됨$$,
'2026-04-19 00:00:00', '2026-04-19 00:00:00'),

('2026-04-21', '2026-04-21 개발 일지 (7건)',
$$## 커밋 요약
Google·Kakao OAuth2 로그인부터 전체 페이지 구현까지, 프로젝트의 핵심 기능 대부분을 하루에 완성했다.

---

## 커밋 1: 대시보드·블로그·플래너·파일·결제 페이지 구현 및 Dockerfile 최적화

### 주요 변경사항
- `dashboard`, `blog`, `planner`, `files`, `payments` 5개 페이지 프론트엔드 구현
- Dockerfile 의존성 레이어 캐시 분리 (`COPY build.gradle` 먼저, 소스 나중) → 코드 변경 시 의존성 재다운로드 방지

### 기술 개념 설명

**Docker 레이어 캐싱**
Dockerfile은 각 명령어(RUN, COPY 등)를 레이어로 쌓는다. 이전 레이어가 변경되지 않으면 캐시를 재사용한다. `COPY . .`를 먼저 하면 소스 한 줄만 바뀌어도 의존성 다운로드부터 다시 한다. 반면 `COPY build.gradle .` → `RUN ./gradlew dependencies` → `COPY src .` 순서로 분리하면 소스 변경 시 의존성 단계를 캐시에서 재사용해 빌드가 수십 배 빨라진다.

---

## 커밋 2: 블로그 동적 라우트 제거 및 빌드 오류 수정

### 주요 변경사항
- Next.js 정적 export에서 동적 라우트(`[id]`) 사용 시 빌드 실패 → `generateStaticParams()` 추가 또는 라우트 제거로 해결

### 기술 개념 설명

**Next.js 정적 Export와 동적 라우트**
`next export`(또는 `output: 'export'`) 모드에서는 빌드 시점에 모든 페이지 경로를 알아야 한다. 동적 라우트(`/blog/[id]`)는 런타임에 결정되므로, 빌드 시 `generateStaticParams()`로 가능한 모든 id값을 미리 알려줘야 한다. 백엔드 API에서 id를 가져와 반환하거나, 해당 라우트를 제거해야 한다.

---

## 커밋 3 & 4: Google/Kakao OAuth2 은새네 로그인 구현

### 주요 변경사항
- Spring Security OAuth2 Client 의존성 추가
- `CustomOAuth2UserService`: Google/Kakao 사용자 정보 파싱 → DB 저장
- `OAuthSuccessHandler`: 로그인 성공 시 JWT 발급 → 프론트 리다이렉트
- Kakao 이메일 null 방어 처리 (Kakao는 이메일 동의 여부에 따라 null 가능)
- `FAMILY_EMAILS` 환경변수로 허용 이메일 화이트리스트 관리
- 세션 정책 `STATELESS` → `IF_REQUIRED`로 변경 (OAuth2 인증 흐름에 세션 필요)

### 기술 개념 설명

**OAuth2 흐름**
1. 사용자가 "Google로 로그인" 클릭 → 구글 인증 서버로 리다이렉트
2. 구글에서 인증 후 Authorization Code 발급 → 백엔드로 콜백
3. 백엔드가 코드로 Access Token 교환 → 사용자 정보 조회
4. DB에 사용자 저장 → JWT 발급 → 프론트로 토큰 전달

**세션 vs STATELESS**
Spring Security는 기본적으로 세션을 사용한다. JWT 기반 API에서는 `STATELESS`로 설정해 세션을 안 쓰지만, OAuth2 인증 흐름은 리다이렉트 전후 상태 유지를 위해 세션이 필요하다. `IF_REQUIRED`로 설정하면 필요할 때만 세션을 생성한다.

---

## 커밋 5: 이메일→이름 매핑, Navbar 사용자 이름 표시

### 주요 변경사항
- `lib/api.ts`에 `EMAIL_NAMES` 맵 추가: `namubal78@gmail.com` → 은새아빠, `1993jhk@gmail.com` → 은새엄마
- Navbar에서 JWT 파싱 후 이름 표시

---

## 커밋 6 & 7: Planner 지연 로딩 오류 & HikariCP 설정

### 주요 변경사항
- `PlannerItem`에 `@JsonIgnore` 추가 → 직렬화 시 순환 참조 방지
- `Post.tags` 타입 `List<String>` → `String` 수정 (DB 컬럼 타입 불일치)
- HikariCP `keepalive-time: 60000ms` 설정 → Supabase 유휴 연결 끊김 방지

### 기술 개념 설명

**HikariCP 커넥션 풀**
Spring Boot 기본 DB 커넥션 풀. 미리 DB 연결을 여러 개 만들어두고 재사용해 성능을 높인다. Supabase 같은 클라우드 DB는 일정 시간 유휴 상태면 연결을 끊는다. `keepalive-time`으로 주기적으로 연결 상태를 확인(`SELECT 1`)해 끊김을 방지한다.

**JPA 지연 로딩(Lazy Loading)**
`@OneToMany(fetch = FetchType.LAZY)`로 설정하면 연관 엔티티를 실제 접근할 때 DB에서 조회한다. JSON 직렬화 시 세션이 닫혀 있으면 `LazyInitializationException` 발생. `@JsonIgnore`로 해당 필드를 직렬화에서 제외하거나, DTO로 변환해 해결한다.

## 결과
정상 처리됨 (OAuth2 로그인 및 전체 페이지 동작 확인)$$,
'2026-04-21 00:00:00', '2026-04-21 00:00:00'),

('2026-04-22', '2026-04-22 개발 일지 (다수)',
$$## 커밋 요약
Demo 섹션·AI 챗봇·사진 앨범·드래프트 기능을 추가하고, Render 배포 안정성과 Spring Security 설정의 다수 트러블슈팅을 해결했다.

---

## 1. 3영역 구조 재편 및 Demo·챗봇·앨범 추가

### 주요 변경사항
- 프론트 구조: `/blog`, `/portfolio`, `/demo`, `/world/**` 4영역으로 재편
- `/demo`: 파일 관리·결제·AI 챗봇 데모 (공개)
- `/world/photos`: Supabase Storage 기반 가족 사진 앨범
- 백엔드: `ChatController` + `ChatService` (Claude Haiku API 프록시)
- 백엔드: `PhotoController` + `PhotoService` (Supabase Storage 업로드/조회/삭제)

### 기술 개념 설명

**Supabase Storage**
Supabase에서 제공하는 파일 저장소. S3 호환 API를 사용하며 Public/Private 버킷을 지원한다. Private 버킷은 직접 URL로 접근 불가 — Signed URL(서명된 URL)을 발급해야 한다. 서명된 URL은 만료 시간이 있어 일정 시간 후 접근이 불가능해진다.

**Signed URL**
파일에 임시 접근 권한을 부여하는 URL. 서버가 비밀키로 URL에 서명을 추가하고 만료 시간을 포함한다. Private 버킷의 파일을 외부에 임시 공개할 때 사용. 이 프로젝트에서는 1시간(3600초) 만료로 설정.

---

## 2. Render 배포 연속 실패 트러블슈팅

### 문제
Render 무료 플랜에서 포트 스캔 타임아웃(290초) 발생. 앱이 290초 안에 포트를 열지 못하면 배포 실패로 간주.

### 원인 분석
- `ddl-auto: update` 설정 시 Hibernate가 시작 시 DB 스키마 동기화 시도
- Supabase DB 연결이 느리거나 타임아웃되면 이 단계에서 수분 대기
- 결과적으로 290초 이내에 포트를 열지 못해 배포 실패

### 해결
`ddl-auto: none` 으로 변경 → Hibernate가 스키마를 건드리지 않음 → DB 연결 지연에도 앱이 빠르게 시작

### 기술 개념 설명

**Hibernate ddl-auto**
- `update`: 시작 시 엔티티와 DB 스키마를 비교해 ALTER TABLE 등 자동 실행. 느리고 예측 불가.
- `validate`: 스키마 검증만 하고 변경하지 않음.
- `none`: 아무것도 안 함. 프로덕션 권장 설정.
- `create`: 시작 시 테이블 드롭 후 재생성. 데이터 날아감.

---

## 3. Spring Security 설정 트러블슈팅

### 문제 1: OPTIONS 프리플라이트 차단
CORS 프리플라이트 요청(OPTIONS)이 Security 필터에서 로그인 페이지로 리다이렉트됨.

**해결:** `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` 추가

### 문제 2: 인증 실패 시 로그인 페이지 리다이렉트
API 서버에서 401 대신 302 리다이렉트 반환 → 프론트에서 에러 감지 불가.

**해결:** `exceptionHandling().authenticationEntryPoint()`로 401 JSON 응답 직접 반환

### 문제 3: lazy-initialization과 MvcRequestMatcher 충돌
`lazy-initialization: true` + Spring Security 6의 `MvcRequestMatcher` 조합에서 ChatController를 찾지 못해 `/api/chat`이 anyRequest().authenticated()로 처리됨.

**해결:** `lazy-initialization: false`로 변경 → 모든 Bean이 시작 시 로드되어 매처가 올바르게 동작

### 기술 개념 설명

**CORS 프리플라이트**
브라우저는 다른 도메인으로 POST/PUT 등 요청 전에 OPTIONS 메서드로 서버에 "이 요청 허용하냐?" 확인을 먼저 보낸다. 이를 프리플라이트라고 한다. 서버가 OPTIONS를 막으면 실제 요청도 보내지 못한다.

**Spring Security MvcRequestMatcher**
Spring Security 6부터 URL 매칭에 `MvcRequestMatcher`를 사용한다. 이는 Spring MVC의 HandlerMapping을 참조하는데, lazy-initialization 환경에서 매처 생성 시점에 컨트롤러가 아직 로드되지 않으면 경로를 인식하지 못한다.

---

## 4. HikariCP Pool 고갈 문제

### 문제
Render 무료 플랜은 15분 비활성 시 슬립. 슬립 후 깨어날 때 기존 DB 연결이 모두 죽어 있어 JwtFilter에서 `SQLTransientConnectionException` 발생 → 401 에러.

### 해결
- `max-lifetime: 1800000ms` (30분) 설정 → Supabase 연결 강제 갱신 주기
- `connection-test-query: SELECT 1` 설정 → 연결 유효성 검사
- Render Starter 플랜($7/월) 업그레이드 → 슬립 없음, 이 문제 원천 해결

---

## 5. 드래프트(개발 일지) 기능 추가

### 주요 변경사항
- `dev_logs` 테이블 추가 (log_date 기준 하루 1개)
- 백엔드: `DevLogController` + `DevLogService` (Claude Haiku로 커밋 요약 자동 생성)
- 프론트: `/world/draft` 페이지 (로그인 필요)
- GitHub Actions `dev-log.yml`: push → 5분 대기 → 웹훅 → Claude 요약 → DB upsert

### 기술 개념 설명

**GitHub Actions 워크플로우**
코드 push, PR, 스케줄 등 이벤트에 반응해 자동으로 실행되는 CI/CD 파이프라인. YAML 파일로 정의하며, 빌드·테스트·배포·알림 등 다양한 작업을 자동화할 수 있다.

**Upsert**
INSERT + UPDATE의 합성어. 데이터가 없으면 INSERT, 있으면 UPDATE. PostgreSQL에서는 `INSERT ... ON CONFLICT DO UPDATE`로 구현. 하루에 여러 커밋이 있어도 같은 날짜의 레코드를 업데이트해 하루 1개 일지를 유지한다.

## 결과
Render Starter 업그레이드 후 전체 기능 정상 동작 확인$$,
'2026-04-22 00:00:00', '2026-04-22 00:00:00')

ON CONFLICT (log_date) DO UPDATE
  SET title = EXCLUDED.title,
      content = EXCLUDED.content,
      updated_at = NOW();
