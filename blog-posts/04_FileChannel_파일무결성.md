---
title: [트러블슈팅] 우회 경로 분리 + FileChannel 재전송으로 업로드 파일 무결성 확보
category: 트러블슈팅
excerpt: 클라우드 전환 후 파일 MIME 타입이 "data"로 손상되는 현상. S3FS와 업로드 솔루션 충돌을 역공학적으로 접근해 FileChannel 재전송으로 해결했습니다.
tags: Java,FileChannel,파일업로드,클라우드,데이터무결성
---

# 우회 경로 분리 + FileChannel 재전송으로 업로드 파일 무결성 확보

> 프로젝트: 한국저작권위원회 온라인 임치시스템 (Java 1.7 / Spring 3.2.9)

---

## 문제 상황

온프레미스에서 클라우드로 전환한 후, **파일이 손상되어 업로드되는 현상**이 발생했다.

- 파일 형식 조회 시 정상 타입(PDF, HWP 등) 대신 **"data"** 출력
- 클라우드사, 솔루션사 모두 원인 불명
- 동일 파일을 동일 경로에 재업로드 시 정상 타입이 세팅되는 현상 확인

---

## 원인 분석 (역공학적 접근)

"재업로드 시 정상"이라는 현상에서 시작했다.

클라우드 도입 시 구성된 **S3FS(S3를 로컬 파일시스템처럼 마운트)** 환경과 업로드 솔루션의 파일 쓰기 방식이 충돌하는 것으로 특정했다.

S3FS는 객체 스토리지를 POSIX 파일시스템으로 에뮬레이션한다. 솔루션의 파일 쓰기 방식(부분 write + flush 타이밍)이 S3FS의 multipart upload 동기화 시점과 맞지 않아 MIME 메타데이터가 깨지는 것으로 판단했다.

---

## 해결 과정

```
[ AS-IS ]
사용자 업로드 → 업로드 에이전트 → 서버 직접 저장(S3FS 경로) → MIME 오판 → 파일 손상

[ TO-BE ]
사용자 업로드 → 업로드 에이전트 → 우회 경로(임시 저장)
                                    → 에이전트 완료 이벤트 → AJAX 호출
                                    → uploadTwice(FileChannel 재전송)
                                    → 경로 정리 → 정상 저장
```

### 구체적 구현

**① 솔루션 완료 이벤트에서 AJAX로 재업로드 호출 (순서 보장)**

```javascript
uploadAgent.onComplete = function() {
  $.ajax({
    url: '/contract/uploadTwice',
    data: { tempPath: uploadedTempPath, targetPath: finalPath },
    success: function() { /* 정상 저장 확인 */ }
  });
};
```

**② 서버에서 FileChannel로 순차 재전송**

```java
public void uploadTwice(String tempPath, String targetPath) {
    File tempFile = new File(tempPath);
    File targetFile = new File(targetPath);

    try (FileChannel src = new FileInputStream(tempFile).getChannel();
         FileChannel dest = new FileOutputStream(targetFile).getChannel()) {
        // OS 레벨 zero-copy 전송 (버퍼링 없이 순차 전송)
        src.transferTo(0, src.size(), dest);
    }

    tempFile.delete();
    tempFile.renameTo(new File(targetPath));
}
```

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

FileChannel의 transferTo는 OS 레벨 zero-copy 전송이라 버퍼링 없이 안정적으로 파일을 다시 쓸 수 있었다. 법적 효력 있는 파일에서 동기 방식을 선택한 것은 도메인 특성에서 비롯된 판단이었다.
