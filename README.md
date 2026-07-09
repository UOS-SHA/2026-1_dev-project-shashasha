# SHASHASHA — 모임 일정 매칭 앱

> 친구들과의 모임 약속을 **통합 시간표 · 투표 · 확정**으로 손쉽게 잡는 서비스.
> 각자 개인 일정을 등록하면, 겹치지 않는 시간을 찾아 투표하고 최종 확정합니다.

---

## 주요 기능

- **회원가입 / 로그인** — JWT 토큰 기반 인증
- **개인 일정 관리** — 내 시간표 등록/수정
- **모임(Crew)** — 모임 생성·초대·삭제
- **일정 매칭** — 멤버 시간표 통합 → 가능한 시간대(골든 슬롯) 자동 계산 → 투표 → 확정
- **친구** — 친구 추가 및 친구 일정 조회
- **아카이브** — 지난 모임 기록 보관

---

## 기술 스택

| 구분 | 스택 |
|------|------|
| **프론트엔드** | Expo (React Native 0.85, Expo 56), Expo Router, TanStack Query, Zustand, TypeScript |
| **백엔드** | Spring Boot 4.1, Java 17, Spring Data JPA, Spring Validation |
| **인증** | JWT (jjwt), BCrypt |
| **데이터베이스** | PostgreSQL 16 |
| **인프라** | Docker Compose (로컬 DB) |

---

## 프로젝트 구조

```
2026-1_dev-project-shashasha/
├── FE/crew-app/        # Expo 모바일 앱 (프론트엔드)
│   └── src/
│       ├── app/        # 화면 (Expo Router)
│       ├── api/        # API 호출 함수
│       ├── components/ # 공용 컴포넌트
│       ├── hooks/      # 커스텀 훅
│       └── store/      # 상태관리 (zustand)
├── BE/crew-server/     # Spring Boot 서버 (백엔드)
│   ├── src/main/java/com/shashasha/crew/
│   │   ├── controller/ # REST 엔드포인트
│   │   ├── service/    # 비즈니스 로직 (일정 매칭 등)
│   │   ├── domain/     # JPA 엔티티
│   │   ├── repository/ # DB 접근
│   │   ├── security/   # JWT 인증 필터
│   │   └── dto/        # 요청/응답 객체
│   └── docker-compose.yml  # 로컬 PostgreSQL
└── docs/
    └── API_SPEC.md     # API 명세서
```

---

## 로컬 실행 방법

### 1. 백엔드 (`BE/crew-server`)

```bash
cd BE/crew-server

# 1) PostgreSQL 컨테이너 실행 (Docker 필요)
docker compose up -d

# 2) 서버 실행
./gradlew bootRun        # Windows: gradlew.bat bootRun
```

- 서버는 `http://localhost:8080` 에서 뜹니다.
- DB 접속 정보는 환경변수(`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`)로 덮어쓸 수 있으며, 없으면 `docker-compose.yml`의 기본값(`crew` / `crewpass`)으로 동작합니다.
- 운영 시에는 `JWT_SECRET`을 반드시 길고 무작위한 값으로 설정하세요.

### 2. 프론트엔드 (`FE/crew-app`)

```bash
cd FE/crew-app

# 1) 의존성 설치
npm install

# 2) 환경 변수 설정
cp .env.example .env
# .env 의 EXPO_PUBLIC_API_URL 을 백엔드 주소로 설정
#  - 시뮬레이터:  http://localhost:8080
#  - 실기기 테스트: http://<백엔드 PC의 IP>:8080  (예: http://192.168.1.5:8080)

# 3) 앱 실행
npx expo start
```

- 폰에 **Expo Go** 앱을 설치하고 터미널의 QR 코드를 스캔하면 실행됩니다.
- 웹으로 확인하려면 `npx expo start --web`.

---

## API 개요

Base URL: `http://localhost:8080` · 인증: `Authorization: Bearer <JWT>` 헤더

| 리소스 | 경로 | 설명 |
|--------|------|------|
| 인증 | `/auth` | 회원가입, 로그인 (토큰 불필요) |
| 사용자 | `/users` | 내 프로필 조회/수정 |
| 친구 | `/friends` | 친구 추가·목록·친구 일정 |
| 모임 | `/meetings` | 모임 생성·조회·삭제 |
| 일정 매칭 | `/meetings/{id}` | 통합 시간표·골든 슬롯·투표·확정 |
| 개인 일정 | `/schedules` | 내 일정 등록/수정 |
| 아카이브 | `/archives` | 지난 모임 기록 |

전체 명세는 [docs/API_SPEC.md](docs/API_SPEC.md) 참고.

---

## 현재 이슈 / 알려진 제한사항

핵심 플로우(회원가입·로그인 → 개인 일정 등록 → 모임 생성 → 시간표 통합·골든 슬롯 계산 → 투표 → 확정)는 실 API로 동작합니다. 다만 아래 부분은 아직 미완성이거나 목데이터로 남아 있습니다.

- **친구 채팅**: 채팅방·메시지가 아직 실 API에 연결되지 않은 화면용 목데이터입니다. UI 흐름 확인용으로만 동작하며, 새로고침하면 대화 내용이 초기화됩니다.
- **채팅 내 "모임 시간 추천"**: 현재는 하드코딩된 추천 시간이 표시됩니다. 이후 일정 매칭 API 결과를 이 영역에 연결할 예정입니다.
- **일부 온보딩/샘플 화면**: 약관·완료 등 일부 화면의 예시 데이터는 데모용으로 고정되어 있습니다.
- **디자인 에셋**: 아이콘·이미지 등 일부 에셋은 기본값으로 표시되며, 실제 서비스용 디자인은 추후 적용 예정입니다.
- **실행 환경**: 백엔드는 로컬 Docker PostgreSQL 기준으로 개발되어, 별도 배포 서버 없이 로컬에서 FE·BE를 함께 띄워야 전체 기능을 확인할 수 있습니다.

## 추후 업데이트 계획

- 친구 채팅 실시간 연동(메시지 저장·조회 API) 및 채팅 내 모임 시간 추천 API 연결
- 푸시 알림(투표 요청·모임 확정 안내)
- 디자인 시스템 정리 및 실 에셋 적용
- 백엔드 배포 및 원격 서버 기반 실기기 테스트 환경 구성

---

## 브랜치 규칙

- `main` 직접 push 금지
- `feature/기능명` 으로 브랜치 생성 (예: `feature/login`)
- 작업 후 PR로 머지
