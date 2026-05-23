# Crew App (FE)

## 실행 방법

1. Node.js 18 이상 설치
2. `npm install`
3. `.env.example`을 복사해서 `.env` 만들기 (`cp .env.example .env`)
4. `npx expo start`
5. 폰에 Expo Go 앱 설치 후 QR 스캔

## 폴더 구조

- app/ : 화면 (Expo Router, 파일=경로)
- src/api/ : API 호출 함수
- src/components/ : 공용 컴포넌트
- src/store/ : 상태관리 (zustand)

## 환경 변수

- `.env.example`을 복사해 `.env` 생성
- 실기기 테스트 시 localhost 대신 백엔드 PC의 IP 주소로 변경

## 브랜치 규칙

- main 직접 push 금지
- feature/기능명 으로 브랜치 생성 (예: feature/login)
- 작업 후 PR로 머지
