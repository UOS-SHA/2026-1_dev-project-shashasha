# ── 1단계: 빌드 ───────────────────────────────────────────────
# JDK 17로 gradlew를 실행해 실행 가능한 jar를 만든다.
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# gradle 래퍼와 설정만 먼저 복사해서 의존성 캐시 레이어를 만든다.
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# 소스 복사 후 테스트는 건너뛰고 빌드 (배포 속도 ↑)
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# ── 2단계: 실행 ───────────────────────────────────────────────
# 빌드 결과 jar만 가벼운 JRE 이미지에 담아 실행한다.
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# 클라우드가 주입하는 PORT 환경변수로 리슨한다 (application.properties의 ${PORT:8080}와 연동).
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
