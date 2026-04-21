FROM gradle:8.13-jdk17 AS build
WORKDIR /app
# 의존성 레이어 캐시 — build.gradle이 바뀌지 않으면 재다운로드 없음
COPY build.gradle settings.gradle* ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true
# 소스 복사 및 빌드
COPY src ./src
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/coking-cooding-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
