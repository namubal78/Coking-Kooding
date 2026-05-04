---
title: [트러블슈팅] ExecutorService 활용 이기종 DB lock-timeout 전파 차단
category: 트러블슈팅
excerpt: SMS 발송 로직이 계약 메인 트랜잭션 안에서 외부 이기종 DB에 쿼리를 날리는 구조 — lock_timeout이 전체 TX를 rollback까지 전파하는 문제를 스레드 분리로 해결했습니다.
tags: Java,ExecutorService,트랜잭션,레거시
---

# ExecutorService 활용 이기종 DB lock-timeout 전파 차단

> 프로젝트: 한국저작권위원회 온라인 임치시스템 (Java 1.7 / Spring 3.2.9)

---

## 문제 상황

계약 처리 흐름에서 **DB INSERT 미반영과 SMS 발송 미완료가 동반 발생**하는 현상이 신고됐다.

- 외부 SMS 서버 응답 지연 시 스레드 무한 대기 → 스레드 고갈로 확대될 위험
- 레거시 개발 환경(Java 1.7) → 람다와 CompletableFuture 미지원

---

## 근본 원인 분석

DB사 공식 확인 결과, **SMS 발송 로직이 계약 메인 트랜잭션 안에서 외부 이기종 DB에 쿼리를 날리는 구조**였다.

```
[ AS-IS ]
계약 처리(DB UPDATE) → SMS insertSms() [외부 DB INSERT] → TX COMMIT
                                  ↓ lock_timeout 발생
                           TX 전체 ROLLBACK (SMS lock_timeout 전파)
```

Spring의 트랜잭션은 ThreadLocal 기반으로 전파된다. 외부 이기종 DB INSERT가 같은 스레드에서 실행되므로, 외부 DB의 lock_timeout이 메인 TX 전체를 블로킹하고 rollback까지 전파되는 구조였다.

---

## 해결 과정

### 핵심 아이디어: TX 전파 범위(ThreadLocal)에서 SMS 로직을 제외

SMS 발송 로직을 **ExecutorService 익명 내부 클래스**로 새 스레드에 위임하면, 별도 스레드에서 실행된 DB INSERT는 메인 TX와 무관하게 독립 처리된다.

```java
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
```

```
[ TO-BE ]
계약 처리(DB UPDATE) → TX COMMIT → SMS insertSms() [별도 스레드, TX 무관]
                                              ↓ 3초 초과 시 강제 종료
```

### Java 1.7 제약 대응

람다(`() ->`)와 CompletableFuture는 Java 8 이상에서만 사용 가능하다. Java 1.7 환경에서는 **익명 내부 클래스(Anonymous Inner Class)**로 Runnable을 구현해야 한다.

---

## 결과

- SMS 발송 실패로 인한 **롤백 이슈 해결**
- 외부 이기종 DB 장애가 계약 처리 흐름에 영향을 주지 않게 구조적으로 개선
- Future.get 타임아웃으로 스레드 고갈 위험 제거

---

## 회고

처음에는 SMS 발송 로직의 예외 처리 누락이라고 예상했다. 하지만 DB사에 직접 문의한 결과 **이기종 DB 사이의 lock_timeout 전파**라는 뜻밖의 원인이었다.

단순 try-catch로 감싸는 것이 아니라 **스레드 분리**로 TX 전파 범위 자체를 끊는 것이 핵심이었다. 레거시 환경이라는 제약 속에서 가용한 도구(ExecutorService + Anonymous Inner Class)로 해결한 경험이었다.
