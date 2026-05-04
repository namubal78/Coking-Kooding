/**
 * 블로그 글 일괄 게시 스크립트
 *
 * 사용법:
 * 1. 브라우저에서 namubal78.github.io 로그인
 * 2. 개발자도구 콘솔에서: localStorage.getItem('token') 복사
 * 3. node create-blog-posts.js <위에서 복사한 토큰>
 */

const API = 'https://coking-cooding-api.onrender.com'
const token = process.argv[2]

if (!token) {
  console.error('사용법: node create-blog-posts.js <JWT_TOKEN>')
  process.exit(1)
}

async function createPost(post) {
  const res = await fetch(`${API}/api/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(post),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

const POSTS = [
  {
    title: '[서평] 프로그래머, 열정을 말하다 — 채드 파울러',
    category: '학습',
    excerpt: '불을 지피는 책이지, 토치의 사용 설명서가 아니다. 개발자로 사는 것의 의미를 묻는 책.',
    tags: ['서평', '개발자성장', '책'],
    content: `# 프로그래머, 열정을 말하다 — 채드 파울러 지음

> 작성일: 2023-04-16

---

## What on earth am I here for?

재수 학원 시기는 분명하다. 그런데 이 문구가 내가 마구잡이로 지어냈던 문장인지, 카드 형식의 단어 메모장 앞에 프린팅 되어있는 문구인지 헷갈린다. 확실한 건 저 문장은 15년이 지난 지금에도 아주 선명하게 기억이 난다는 것이다.

나는 도대체 내가 왜 여기에 이러고 있지?

이 질문을 거의 항상 했던 것 같다. 중학교 남자애들 사이에서 키 작은 범생이로서의 내 위치를 자각했을 때에도, 고등학교 수많은 똑똑한 친구들 사이에서 눈치만 좋은 내 위치를 자각했을 때에도, 재수를 하는 고 4였던 동시에 학원에서 여유 넘치는 재수생이었을 때에도.

나는 몰입에 빠져 시간이 순식간에 지나간 경험보다는 여러 가지를 동시에 하면서 환기되고 큰 그림에 집중했던 경험이 많았다. 그런 내 특성을 간직한 채 엔지니어가 되리라 다짐하게 해준 책이다.

---

## 이 책이 줬던 조금의 대답

비록 포스팅 처음의 저 질문을 완벽히 대답해주지는 못 하더라도, 조금이나마 대답을 해줬다고 느꼈다.

> **나는 행복해지기 위해 존재한다.**
> 그리고 그 존재하기 위한 방법으로 개발자란 일을 하기로 했다.
> 개발자는 개발 행위로 예술을 하는 게 아니라 돈을 버는 장사꾼이다.
> 행복하기 위해 돈을 잘 벌기로 하고, 돈을 잘 벌면서도 과연 지금 행복한 지 계속 물으며 살자.

---

## 인상 깊었던 구절들

이 책은 작가의 조언과 그것을 구체적으로 시도해볼 수 있게 하는 **실천하기** 두 부분으로 나뉜다. 실천하기 부분에도 좋은 내용이 많지만, 그러한 방법의 예시는 서평에 싣지 않으려 한다.

> 이 책은 불을 지피는 책이지, 토치의 사용 설명서가 아니기 때문에.

---

### 들어가는 글

> *'삶이 일로써 소비된다면 일을 사랑하는 것이 삶을 사랑하는 가장 중요한 열쇠다.'* — p.11

> *'직장을 잃을까 두렵다면 그 두려움을 없애는 것이 탁월한 경력을 쌓는 데 취해야 할 조치다. 비범한 소프트웨어 개발자는 약해지지 않는다. 헛되이 일자리를 찾지 않는다.'* — p.17

### 1부 — 당신의 시장을 선택하라

> *'가장 못하는 사람이 되는' 상황을 스스로 찾으라. 다른 개발자들과 함께 일해서 삼투 현상처럼 자신의 성장에 도움이 될 만한 자원 프로젝트를 찾아보라* — 4장

### 3부 — 실행

> *'프로그래머들은 가치를 창조한 대가로 돈을 받는다. 이는 배움의 의자에 안주하지 말고 일어나 일을 끝맺어야 함을 의미한다.'* — 23장

> *'자고 있는 잠재력은 돈을 벌어다 주지 못 한다.'* — 23장

> *'지난해 여러분은 얼마나 많은 가치를 만들었는가? 회사의 순이익에 끼친 긍정적인 영향은 무엇인가? 여러분은 무엇을 돌려주었는가?'* — 26장

> *'우리는 모두 대체될 수 있다. 이것을 사실로 받아들이고 그렇게 일하는 사람은 자신을 실제로 변화시킬 수 있고 두말할 것 없이 자신만의 기회를 활용할 수 있다.'* — 30장

> *'어떤 사람이 항상 예라고만 한다면 엄청나게 재능이 있거나 거짓말을 하는 것, 둘 중 하나다. 대개 후자다.'* — 31장

> *'영웅은 결코 당황하지 않는다.'* — 31장

### 4부 — 마케팅은 높으신 분들만 하는 게 아니다

> *'고객은 비즈니스의 요구를 표현하고 개발자는 그 필요를 충족시키기 위해 돈을 받는다. 이 사실을 잊지 말라.'* — 34장

> *'논리적 사고 과정을 통해 자신의 구상을 다듬고 독자를 합리적인 결론으로 이끄는 능력은 후임 유지보수자들이 이해할 수 있는 깔끔한 디자인과 시스템 구현을 만드는 능력과 별로 다르지 않다.'* — 35장

> *'다른 사람들과 함께 일하고 싶어 하는 것이 자연스러운 인간의 성향임을 기억하라. 관계를 인간적으로 만들어야 한다.'* — 36장

> *'자신이 한 말이나 쓴 글을 바꾸지 말라. 특히 자기 이름이 나오는 곳에서 주의하라. 바보가 되지 말라.'* — 40장

> *'크리스는 지독히도 뻔뻔했고 밴드와 함께 앉아도 되는지 항상 질문했다. 사실 크리스는 자신을 정말 유명한 재즈 연주자들과 연주할 수 있게끔 다그친 것이다.'* — 43장

### 5부 — 자신의 강점을 유지보수하라

> *'나쁜 과정이 나쁜 제품을 만들 뿐 아니라 나쁜 제품이 나쁜 과정을 만든다. '아직 안 됐나요? 아직 안 됐어요?'라고 계속해서 물을 때, '아직, 안 됩니다.'라고 대답하는 것만이 올바른 태도임을 깨달으라.'* — 46장

---

## 마무리

앞으로 1년차, 2년차 점점 소속도 바뀌고 위치도 바뀌겠지만, 긴 시간 동안 여러 번 읽어볼 책이란 생각이 들었다.`,
  },

  {
    title: '[트러블슈팅] ExecutorService 활용 이기종 DB lock-timeout 전파 차단',
    category: '트러블슈팅',
    excerpt: 'SMS 발송 로직이 계약 메인 트랜잭션 안에서 외부 이기종 DB에 쿼리를 날리는 구조 — lock_timeout이 전체 TX를 rollback까지 전파하는 문제를 스레드 분리로 해결했습니다.',
    tags: ['Java', 'ExecutorService', '트랜잭션', '레거시'],
    content: `# ExecutorService 활용 이기종 DB lock-timeout 전파 차단

> 프로젝트: 한국저작권위원회 온라인 임치시스템 (Java 1.7 / Spring 3.2.9)

---

## 문제 상황

계약 처리 흐름에서 **DB INSERT 미반영과 SMS 발송 미완료가 동반 발생**하는 현상이 신고됐다.

- 외부 SMS 서버 응답 지연 시 스레드 무한 대기 → 스레드 고갈로 확대될 위험
- 레거시 개발 환경(Java 1.7) → 람다와 CompletableFuture 미지원

---

## 근본 원인 분석

DB사 공식 확인 결과, **SMS 발송 로직이 계약 메인 트랜잭션 안에서 외부 이기종 DB에 쿼리를 날리는 구조**였다.

\`\`\`
[ AS-IS ]
계약 처리(DB UPDATE) → SMS insertSms() [외부 DB INSERT] → TX COMMIT
                                  ↓ lock_timeout 발생
                           TX 전체 ROLLBACK (SMS lock_timeout 전파)
\`\`\`

Spring의 트랜잭션은 ThreadLocal 기반으로 전파된다. 외부 이기종 DB INSERT가 같은 스레드에서 실행되므로, 외부 DB의 lock_timeout이 메인 TX 전체를 블로킹하고 rollback까지 전파되는 구조였다.

---

## 해결 과정

### 핵심 아이디어: TX 전파 범위(ThreadLocal)에서 SMS 로직을 제외

SMS 발송 로직을 **ExecutorService 익명 내부 클래스**로 새 스레드에 위임하면, 별도 스레드에서 실행된 DB INSERT는 메인 TX와 무관하게 독립 처리된다.

\`\`\`java
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<?> smsFuture = executor.submit(new Runnable() {
    @Override
    public void run() {
        // 별도 스레드 → ThreadLocal TX 전파 범위 밖
        smsDao.insertSms(contractId, phoneNumber, message);
    }
});

try {
    // 제안요청서 요구사항 근거: 3초 초과 시 강제 종료
    smsFuture.get(3, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    smsFuture.cancel(true);
    log.warn("SMS 발송 타임아웃 — 계약 처리는 정상 완료");
} finally {
    executor.shutdown();
}
\`\`\`

\`\`\`
[ TO-BE ]
계약 처리(DB UPDATE) → TX COMMIT → SMS insertSms() [별도 스레드, TX 무관]
                                              ↓ 3초 초과 시 강제 종료
\`\`\`

### Java 1.7 제약 대응

람다(`() ->`)와 `CompletableFuture`는 Java 8 이상에서만 사용 가능하다. Java 1.7 환경에서는 **익명 내부 클래스(Anonymous Inner Class)**로 `Runnable`을 구현해야 한다.

---

## 결과

- SMS 발송 실패로 인한 **롤백 이슈 해결**
- 외부 이기종 DB 장애가 계약 처리 흐름에 영향을 주지 않게 구조적으로 개선
- Future.get 타임아웃으로 스레드 고갈 위험 제거

---

## 회고

처음에는 SMS 발송 로직의 예외 처리 누락이라고 예상했다. 하지만 DB사에 직접 문의한 결과 **이기종 DB 사이의 lock_timeout 전파**라는 뜻밖의 원인이었다.

단순 try-catch로 감싸는 것이 아니라 **스레드 분리**로 TX 전파 범위 자체를 끊는 것이 핵심이었다. 레거시 환경이라는 제약 속에서 가용한 도구(ExecutorService + Anonymous Inner Class)로 해결한 경험이었다.`,
  },

  {
    title: '[트러블슈팅] 계약 조회 필드 단위 바인딩 + 전자서명 순서 보장으로 조회 데이터 97% 감소',
    category: '트러블슈팅',
    excerpt: '통 HTML에 의존하는 계약서 구조를 필드 단위 바인딩 JSP로 전환하고, Promise/async-await으로 전자서명 순서를 보장해 조회 데이터를 평균 12KB → 238bytes로 줄였습니다.',
    tags: ['JSP', 'JavaScript', 'Promise', '성능최적화', '레거시'],
    content: `# 계약 조회 필드 단위 바인딩 + 전자서명 순서 보장

> 프로젝트: 한국저작권위원회 온라인 임치시스템 (Java 1.7 / Spring 3.2.9 / JSP / jQuery)

---

## 문제 상황

두 가지 독립적이지만 같은 근본 원인을 가진 문제가 있었다.

### 문제 1: 계약서 특정 항목 수정 시 DB 직접 개입 필요

계약서 내 특정 항목을 수정해야 할 때 개발자가 DB에 직접 UPDATE해야 했다. 수정 이력이 남지 않아 역추적이 불가능한 상태였다.

### 문제 2: 전자서명 중복 요청으로 DB 무한 대기

전자서명 솔루션에 계약 원문이 인자로 전달될 때 에이전트 내부 처리 지연이 발생했다. 지연 중 재시도가 유입되면 **동일 레코드 동시 UPDATE 경합**으로 DB 무한 대기 상태에 빠졌다 (솔루션사 공식 확인).

---

## 근본 원인 분석

두 문제 모두 **조회와 전자서명 원문이 통 HTML(avg 12KB)에 의존**하는 데이터 저장/표현 계층이 분리되지 않은 설계에서 비롯됐다.

\`\`\`
[ AS-IS ]
사용자 조회 요청 → 계약서 HTML 원문 테이블(avg 12KB) → 원문 데이터 전체 렌더링
                                                            ↓ 수정 이력 추적 불가
                                                    일부값 수정 시 DB 직접 개입 필요
\`\`\`

---

## 해결 과정

### 1. 필드 단위 바인딩 JSP로 전환

20~30종 계약 유형 전체를 **하나의 통합 레이아웃 JSP**로 분기 처리하고, 세부 필드값을 직접 바인딩해 출력하는 방식으로 전환했다.

\`\`\`
[ TO-BE ]
사용자 조회 요청 → 계약 마스터/세부값/당사자 테이블 조회(세부값 합산 238bytes)
                    → 레이아웃 JSP include (c:choose/c:when 20종 분기)
                    → 필드 직접 바인딩 렌더링
\`\`\`

기존 HTML 원문은 \`display:none\` 처리하고, 관리자 전용 "AS-IS 계약서 출력" 버튼 클릭 시에만 비교 조회할 수 있도록 유지했다.

### 2. Promise/async-await으로 전자서명 순서 강제

전자서명 처리 함수를 **Promise로 래핑**하고 async/await으로 서명 완료 후에만 서버 전송이 실행되도록 순서를 강제했다.

\`\`\`javascript
async function submitAfterSign() {
  try {
    // 전자서명 완료까지 대기 (중복 요청 구조적 차단)
    await new Promise((resolve, reject) => {
      signSolution.execute({
        onComplete: resolve,
        onError: reject,
      });
    });
    // 서명 완료 후에만 서버 전송
    await submitToServer();
  } catch (e) {
    alert('서명 중 오류가 발생했습니다.');
  }
}
\`\`\`

---

## 결과

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 조회 데이터 크기 | avg 12KB | 238bytes |
| 데이터 감소율 | — | **약 97%** |
| 관리자 DB 개입 | 필수 | 불필요 |
| 수정 이력 추적 | 불가 | 가능 |
| 전자서명 중복 요청 | 발생 | 구조적 차단 |

---

## 회고

"12KB짜리 HTML을 238bytes 세부값으로 대체한다"는 아이디어는 단순하지만, 20~30종 계약 유형을 하나의 통합 레이아웃으로 수렴시키는 과정이 까다로웠다.

전자서명 문제는 솔루션사 공식 문서에도 나오지 않는 동시 요청 경합 이슈였다. Promise 래핑으로 완료 시점을 명시적으로 제어한 것이 핵심이었다.`,
  },

  {
    title: '[트러블슈팅] 우회 경로 분리 + FileChannel 재전송으로 업로드 파일 무결성 확보',
    category: '트러블슈팅',
    excerpt: '클라우드 전환 후 파일 MIME 타입이 "data"로 손상되는 현상. S3FS와 업로드 솔루션 충돌을 역공학적으로 접근해 FileChannel 재전송으로 해결했습니다.',
    tags: ['Java', 'FileChannel', '파일업로드', '클라우드', '데이터무결성'],
    content: `# 우회 경로 분리 + FileChannel 재전송으로 업로드 파일 무결성 확보

> 프로젝트: 한국저작권위원회 온라인 임치시스템 (Java 1.7 / Spring 3.2.9)

---

## 문제 상황

온프레미스에서 클라우드로 전환한 후, **파일이 손상되어 업로드되는 현상**이 발생했다.

- 파일 형식 조회 시 정상 타입(PDF, HWP 등) 대신 **\`data\`** 출력
- 클라우드사, 솔루션사 모두 원인 불명
- 동일 파일을 동일 경로에 재업로드 시 정상 타입이 세팅되는 현상 확인

---

## 원인 분석 (역공학적 접근)

"재업로드 시 정상"이라는 현상에서 시작했다.

1. **파일 쓰기 충돌 가설**: 클라우드 도입 시 구성된 **S3FS(S3를 로컬 파일시스템처럼 마운트)** 환경과 업로드 솔루션의 파일 쓰기 방식이 충돌하는 것으로 특정했다.

2. S3FS는 객체 스토리지를 POSIX 파일시스템으로 에뮬레이션한다. 솔루션의 파일 쓰기 방식(부분 write + flush 타이밍)이 S3FS의 multipart upload 동기화 시점과 맞지 않아 MIME 메타데이터가 깨지는 것으로 판단했다.

---

## 해결 과정

\`\`\`
[ AS-IS ]
사용자 업로드 → 업로드 에이전트 → 서버 직접 저장(S3FS 경로)
                                           ↓ MIME 오판 → 파일 손상
\`\`\`

\`\`\`
[ TO-BE ]
사용자 업로드 → 업로드 에이전트 → 우회 경로(임시 저장)
                                    → 에이전트 완료 이벤트 → AJAX 호출
                                    → uploadTwice 메소드(FileChannel 재전송)
                                    → 경로 정리 → 정상 저장
\`\`\`

### 구체적 구현

**① 우회 경로에 먼저 업로드 후 완료 이벤트 감지**

```javascript
// 솔루션 완료 이벤트에서 AJAX로 재업로드 호출 (순서 보장)
uploadAgent.onComplete = function() {
  $.ajax({
    url: '/contract/uploadTwice',
    data: { tempPath: uploadedTempPath, targetPath: finalPath },
    success: function() { /* 정상 저장 확인 */ }
  });
};
\`\`\`

**② 서버에서 FileChannel로 순차 재전송**

\`\`\`java
public void uploadTwice(String tempPath, String targetPath) {
    File tempFile = new File(tempPath);
    File targetFile = new File(targetPath);

    try (FileChannel src = new FileInputStream(tempFile).getChannel();
         FileChannel dest = new FileOutputStream(targetFile).getChannel()) {
        // transferTo: OS 레벨 Zero-copy 전송 (버퍼링 없이 순차 전송)
        src.transferTo(0, src.size(), dest);
    }

    tempFile.delete();
    // renameTo로 원자적 이동 (파일 시스템 레벨)
    tempFile.renameTo(new File(targetPath));
}
\`\`\`

### 동기 방식을 선택한 이유

비동기로 처리하면 FileChannel 재전송 완료 전에 DB에 파일 경로가 저장될 수 있다.

- 해당 파일은 **법적 효력이 있는 원본 임치 파일**
- DB 저장 시점에 파일이 손상된 상태이면 **치명적 불일치** 발생
- **UX 일시 저하보다 데이터 무결성이 절대적으로 우선한다고 판단**

---

## 결과

- S3FS-솔루션 충돌로 인한 파일 손상 이슈 완전 해결
- 재업로드 후 파일 MIME 타입 정상 세팅 확인

---

## 회고

명확한 원인이 없는 상황에서 "재업로드 시 정상"이라는 단 하나의 단서로 접근했다. 클라우드사와 솔루션사 모두 원인 불명이라고 했을 때, 역공학적으로 가설을 세우고 검증하는 과정이 핵심이었다.

FileChannel의 \`transferTo\`는 OS 레벨 zero-copy 전송이라 버퍼링 없이 안정적으로 파일을 다시 쓸 수 있었다. 법적 효력 있는 파일에서 동기 방식을 선택한 것은 도메인 특성에서 비롯된 판단이었다.`,
  },
]

async function main() {
  console.log(`총 ${POSTS.length}개 글 게시 시작...\n`)
  for (const post of POSTS) {
    try {
      const result = await createPost(post)
      console.log(`✓ [${result.id}] ${post.title}`)
    } catch (e) {
      console.error(`✗ ${post.title}`)
      console.error(`  ${e.message}`)
    }
  }
  console.log('\n완료!')
}

main()
