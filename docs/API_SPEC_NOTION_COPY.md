# SHASHASHA API 명세서

> 작성일: 2026-06-30  
> 상태: 설계 초안  
> 목적: FE와 BE가 같은 API 계약을 보고 동시에 개발하기 위한 문서

이 문서는 SHASHASHA 앱과 서버가 주고받는 데이터 구조, 인증 규칙, 엔드포인트, 요청/응답 예시를 정리한 API 명세입니다.

---

## 1. 공통 규칙

### Base URL

| 환경 | URL |
| --- | --- |
| 개발 | `http://localhost:8080` |
| 배포 | 배포 후 확정. FE `.env`의 `EXPO_PUBLIC_API_URL`에 입력 |

### 요청/응답 형식

| 항목 | 규칙 |
| --- | --- |
| 데이터 형식 | JSON, UTF-8 |
| 인증 방식 | `Authorization: Bearer <JWT토큰>` |
| ID 타입 | Long, 서버 자동 증가 |
| 날짜/시간 | ISO 8601 문자열. 예: `2026-06-30T14:00:00` |

### 인증 규칙

| 표시 | 의미 |
| --- | --- |
| 🔓 | 토큰 없이 호출 가능 |
| ✅ | 로그인 후 JWT 토큰 필요 |

- 회원가입, 로그인은 토큰 없이 호출합니다.
- 그 외 API는 요청 헤더에 `Authorization: Bearer <token>`을 붙입니다.
- 내 정보, 내 일정처럼 사용자 본인 데이터는 토큰에서 사용자 정보를 읽어 처리합니다.
- 토큰이 없거나 만료되면 `401 Unauthorized`를 반환합니다.

### 공통 응답 상태 코드

| 코드 | 의미 |
| --- | --- |
| `200 OK` | 조회/수정 성공 |
| `201 Created` | 생성 성공 |
| `204 No Content` | 삭제 성공. 응답 본문 없음 |
| `400 Bad Request` | 입력값 오류 |
| `401 Unauthorized` | 토큰 없음 또는 만료 |
| `403 Forbidden` | 권한 없음 |
| `404 Not Found` | 대상 없음 |
| `409 Conflict` | 중복 데이터 |

### 공통 에러 응답

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "모임 이름은 필수입니다"
}
```

---

## 2. 구현 우선순위

| 우선순위 | 범위 | 설명 |
| --- | --- | --- |
| 🟢 1차 MVP | 인증, 모임, 개인 일정, 일정 매칭, 아카이브 | 핵심 사용자 흐름 |
| 🟡 2차 | 프로필 편집, 친구 | 부가 기능 |
| ⚪ 나중 | 실시간 채팅 | WebSocket 필요 |

---

## 3. 데이터 모델

### User

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| email | String | 로그인 이메일. 고유값 |
| nickname | String | 닉네임. 최대 12자 |
| bio | String | 한줄 소개. 최대 40자 |
| handle | String | 사용자 아이디. 예: `@jiyeon` |
| profileImageUrl | String? | 프로필 이미지 URL |
| joinedAt | DateTime | 가입일 |

### UserPreferences

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| notificationEnabled | boolean | 알림 허용 여부 |
| personalizeEnabled | boolean | 맞춤 추천 허용 여부 |
| agreedService | boolean | 서비스 약관 동의 |
| agreedPrivacy | boolean | 개인정보 처리방침 동의 |
| agreedMarketing | boolean | 마케팅 수신 동의 |

### Schedule

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| userId | Long | 일정 소유자 |
| title | String | 일정 이름 |
| type | enum | `FIXED` 또는 `VARIABLE` |
| days | int[] | 요일. 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일 |
| startHour | int | 시작 시 |
| startMinute | int | 시작 분 |
| endHour | int | 종료 시 |
| endMinute | int | 종료 분 |

### Meeting

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| name | String | 모임 이름 |
| emoji | String? | 모임 아이콘 이모지 |
| description | String? | 모임 설명 |
| creatorId | Long | 만든 사용자 ID |
| memberCount | int | 멤버 수 |
| status | enum | `VOTING` 또는 `CONFIRMED` |
| place | String? | 확정 장소 |
| nextLabel | String? | 다음 일정 표시 텍스트 |
| confirmedSlotId | Long? | 확정된 시간 슬롯 ID |

### MeetingMember

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| meetingId | Long | 모임 ID |
| userId | Long | 사용자 ID |
| role | enum | `OWNER` 또는 `MEMBER` |

### TimeSlot

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| meetingId | Long | 모임 ID |
| day | String | 요일 |
| time | String | 시간. 예: `오후 2:00` |
| availabilityCount | int | 가능한 멤버 수 |
| voteCount | int | 받은 표 수 |

### Vote

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| slotId | Long | 투표한 후보 시간 ID |
| userId | Long | 투표자 ID |

### Notice

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| meetingId | Long | 모임 ID |
| tag | String | 공지 분류 |
| title | String | 제목 |
| content | String? | 내용 |
| createdAt | DateTime | 작성일 |

### Friend

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| userId | Long | 내 사용자 ID |
| friendUserId | Long | 친구 사용자 ID |
| status | String | 친구 상태 텍스트 |

### Archive

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | Long | PK |
| meetingId | Long | 모임 ID |
| round | int | 회차 |
| date | Date | 활동 날짜 |
| place | String | 장소 |
| title | String | 제목 |
| summary | String | 요약 또는 메모 |
| photoUrls | String[] | 사진 URL 목록 |
| attendees | String[] | 참석자 이름 목록 |
| absentees | String[] | 불참자 이름 목록 |

### 나중에 구현할 모델

| 엔티티 | 핵심 필드 |
| --- | --- |
| ChatRoom | id, name, memberIds, lastMessage, unreadCount |
| ChatMessage | id, chatRoomId, senderId, text, createdAt, pollId |
| MeetingPoll | id, messageId, time, voterCount, voted |

---

## 4. API 목록

### 인증/온보딩

| 우선 | Method | Path | 인증 | 설명 |
| --- | --- | --- | --- | --- |
| 🟢 | POST | `/auth/signup` | 🔓 | 회원가입 |
| 🟢 | POST | `/auth/login` | 🔓 | 로그인 |
| 🟡 | POST | `/auth/logout` | ✅ | 로그아웃 |
| 🟡 | DELETE | `/users/me` | ✅ | 회원 탈퇴 |

### 사용자/프로필

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟢 | GET | `/users/me` | ✅ | 내 프로필 조회 | settings/profile |
| 🟡 | PUT | `/users/profile` | ✅ | 프로필 수정 | profile-edit |
| 🟡 | PUT | `/users/preferences` | ✅ | 사용자 설정 변경 | permissions |

### 개인 일정

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟢 | GET | `/users/schedules` | ✅ | 내 일정 목록 | personal-schedule |
| 🟢 | POST | `/users/schedules` | ✅ | 일정 추가 | personal-schedule/add |
| 🟡 | DELETE | `/users/schedules/{id}` | ✅ | 일정 삭제 | personal-schedule |

### 모임

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟢 | GET | `/meetings` | ✅ | 내가 가입한 모임 목록 | home |
| 🟢 | GET | `/meetings/{id}` | ✅ | 모임 상세 | meeting |
| 🟢 | POST | `/meetings` | ✅ | 모임 생성 | settings/new-meeting |
| 🟡 | GET | `/meetings/{id}/notices` | ✅ | 모임 공지 목록 | meeting |

### 일정 매칭

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟢 | GET | `/meetings/{id}/timetable` | ✅ | 멤버 시간표 히트맵 | meeting/timetable |
| 🟢 | GET | `/meetings/{id}/slots` | ✅ | 후보 시간과 득표 현황 | meeting/vote |
| 🟢 | POST | `/meetings/{id}/votes` | ✅ | 후보 시간 투표 | meeting/vote |
| 🟢 | POST | `/meetings/{id}/confirm` | ✅ | 최다 득표 시간 확정 | meeting/vote |
| 🟢 | GET | `/meetings/{id}/confirmed` | ✅ | 확정 일정 조회 | meeting/confirmed |

### 활동 아카이브

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟢 | GET | `/archives` | ✅ | 활동 기록 목록 | archive |
| 🟢 | GET | `/archives/{id}` | ✅ | 활동 기록 상세 | archive/[id] |
| 🟢 | POST | `/archives` | ✅ | 활동 기록 생성 | archive/new |
| 🟡 | PUT | `/archives/{id}` | ✅ | 활동 기록 수정 | archive/[id]/edit |
| 🟡 | POST | `/archives/{id}/photos` | ✅ | 사진 업로드 | archive/new |

### 친구

| 우선 | Method | Path | 인증 | 설명 | 화면 |
| --- | --- | --- | --- | --- | --- |
| 🟡 | GET | `/friends` | ✅ | 친구 목록 | friends |
| 🟡 | POST | `/friends` | ✅ | 친구 추가 | friends |
| 🟡 | GET | `/friends/{id}/schedules` | ✅ | 친구 시간표 조회 | friends |

### 단톡방/채팅

| 우선 | Method | Path | 인증 | 설명 |
| --- | --- | --- | --- | --- |
| ⚪ | GET | `/chat-rooms` | ✅ | 단톡방 목록 |
| ⚪ | GET | `/chat-rooms/{id}/messages` | ✅ | 메시지 목록 |
| ⚪ | POST | `/chat-rooms/{id}/messages` | ✅ | 메시지 전송 |
| ⚪ | WS | `/ws/chat-rooms/{id}` | ✅ | 실시간 메시지 수신 |

---

## 5. 엔드포인트 상세

### POST `/auth/signup`

회원가입을 처리하고 JWT 토큰을 발급합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | 🔓 필요 없음 |
| 성공 코드 | `201 Created` |
| 실패 코드 | `400`, `409` |

Request

```json
{
  "email": "test@shashasha.com",
  "password": "********",
  "nickname": "지연",
  "bio": "러닝 좋아해요",
  "agreedService": true,
  "agreedPrivacy": true,
  "agreedMarketing": false
}
```

Response 201

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "nickname": "지연",
    "email": "test@shashasha.com"
  }
}
```

Validation

| 필드 | 규칙 |
| --- | --- |
| email | 필수, 이메일 형식, 고유값 |
| password | 필수 |
| nickname | 필수, 최대 12자 |
| agreedService | true 필수 |
| agreedPrivacy | true 필수 |
| agreedMarketing | 선택 |

---

### POST `/auth/login`

이메일과 비밀번호로 로그인하고 JWT 토큰을 발급합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | 🔓 필요 없음 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401` |

Request

```json
{
  "email": "test@shashasha.com",
  "password": "********"
}
```

Response 200

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "nickname": "지연"
  }
}
```

FE 메모

- 받은 `token`은 안전한 저장소에 저장합니다.
- `src/api/client.ts`의 interceptor에서 모든 요청에 `Authorization: Bearer <token>`을 붙입니다.

---

### GET `/users/me`

현재 로그인한 사용자의 프로필을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `404` |

Response 200

```json
{
  "id": 1,
  "nickname": "지연",
  "handle": "@jiyeon",
  "email": "test@shashasha.com",
  "bio": "러닝 좋아해요",
  "profileImageUrl": null,
  "joinedAt": "2026-03-01"
}
```

---

### PUT `/users/profile`

내 프로필 정보를 수정합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401` |

Request

```json
{
  "nickname": "지연",
  "bio": "러닝 좋아해요",
  "profileImageUrl": "https://example.com/profile.png"
}
```

Response 200

```json
{
  "id": 1,
  "nickname": "지연",
  "handle": "@jiyeon",
  "bio": "러닝 좋아해요",
  "profileImageUrl": "https://example.com/profile.png"
}
```

---

### PUT `/users/preferences`

알림, 맞춤 추천 등 사용자 설정을 변경합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401` |

Request

```json
{
  "notificationEnabled": true,
  "personalizeEnabled": true
}
```

Response 200

```json
{
  "notificationEnabled": true,
  "personalizeEnabled": true
}
```

---

### GET `/users/schedules`

내 개인 일정을 전체 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401` |

Response 200

```json
[
  {
    "id": 5,
    "title": "알고리즘 수업",
    "type": "FIXED",
    "days": [0, 2],
    "startHour": 9,
    "startMinute": 0,
    "endHour": 10,
    "endMinute": 30
  }
]
```

---

### POST `/users/schedules`

내 개인 일정을 추가합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `201 Created` |
| 실패 코드 | `400`, `401` |

Request

```json
{
  "title": "알고리즘 수업",
  "type": "FIXED",
  "days": [0, 2],
  "startHour": 9,
  "startMinute": 0,
  "endHour": 10,
  "endMinute": 30
}
```

Response 201

```json
{
  "id": 5,
  "title": "알고리즘 수업",
  "type": "FIXED",
  "days": [0, 2],
  "startHour": 9,
  "startMinute": 0,
  "endHour": 10,
  "endMinute": 30
}
```

Validation

| 필드 | 규칙 |
| --- | --- |
| title | 필수 |
| type | `FIXED` 또는 `VARIABLE` |
| days | 0~6 사이 숫자 배열 |
| startHour/endHour | 0~23 |
| startMinute/endMinute | 0~59 |
| 종료 시각 | 시작 시각보다 늦어야 함 |

---

### DELETE `/users/schedules/{id}`

내 개인 일정을 삭제합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `204 No Content` |
| 실패 코드 | `401`, `403`, `404` |

Response 204

응답 본문 없음.

---

### GET `/meetings`

내가 가입한 모임 목록을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401` |
| 구현 상태 | 이미 구현 완료 |

Response 200

```json
[
  {
    "id": 1,
    "name": "수요 독서 모임",
    "emoji": "📚",
    "members": 6,
    "nextLabel": "6월 13일 토 · 오후 2:00",
    "status": "confirmed"
  },
  {
    "id": 2,
    "name": "한강 러닝 크루",
    "emoji": "🏃",
    "members": 9,
    "nextLabel": "투표 진행 중 · 3일 남음",
    "status": "voting"
  }
]
```

FE 주의

- 현재 FE가 문자열 id를 쓰고 있다면 API 연동 시 number로 맞춥니다.
- 서버 enum은 `VOTING`, `CONFIRMED`로 두되, FE 표시값은 필요하면 소문자로 변환합니다.

---

### GET `/meetings/{id}`

모임 상세 정보를 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "id": 1,
  "name": "수요 독서 모임",
  "emoji": "📚",
  "description": "매주 책을 읽고 이야기하는 모임",
  "members": 6,
  "status": "CONFIRMED",
  "place": "성수",
  "nextLabel": "6월 13일 토 · 오후 2:00",
  "confirmedSlotId": 12
}
```

---

### POST `/meetings`

새 모임을 생성합니다. 생성자는 자동으로 `OWNER` 멤버가 됩니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `201 Created` |
| 실패 코드 | `400`, `401`, `404` |

Request

```json
{
  "name": "주말 등산 모임",
  "emoji": "🥾",
  "description": "가볍게 동네 산",
  "memberIds": [2, 3, 4]
}
```

Response 201

```json
{
  "id": 5,
  "name": "주말 등산 모임",
  "emoji": "🥾",
  "members": 4,
  "status": "VOTING"
}
```

Validation

| 필드 | 규칙 |
| --- | --- |
| name | 필수 |
| emoji | 선택 |
| description | 선택 |
| memberIds | 선택. 존재하는 사용자 ID 목록 |

---

### GET `/meetings/{id}/notices`

모임 공지 목록을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
[
  {
    "id": 1,
    "tag": "공지",
    "title": "이번 주 모임 장소 안내",
    "content": "성수역 3번 출구 앞에서 만나요.",
    "createdAt": "2026-06-30T14:00:00"
  }
]
```

---

### GET `/meetings/{id}/timetable`

모임 멤버들의 개인 일정을 겹쳐 시간표 히트맵 데이터를 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "meetingId": 1,
  "memberCount": 6,
  "cells": [
    {
      "day": 0,
      "hour": 9,
      "minute": 0,
      "availableCount": 4,
      "busyCount": 2
    },
    {
      "day": 2,
      "hour": 15,
      "minute": 0,
      "availableCount": 6,
      "busyCount": 0
    }
  ]
}
```

FE 메모

- 히트맵 화면에서 `availableCount`가 높을수록 가능한 시간으로 표시합니다.
- 시간 단위는 30분 단위부터 시작하는 것을 권장합니다.

---

### GET `/meetings/{id}/slots`

모임 후보 시간과 득표 현황을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "myVoteSlotId": 12,
  "totalVotes": 14,
  "slots": [
    {
      "id": 11,
      "day": "수",
      "time": "오후 3:00",
      "availabilityCount": 8,
      "voteCount": 6
    },
    {
      "id": 12,
      "day": "토",
      "time": "오후 2:00",
      "availabilityCount": 7,
      "voteCount": 8
    }
  ]
}
```

---

### POST `/meetings/{id}/votes`

후보 시간에 투표합니다. 한 사용자는 한 모임에서 하나의 후보 시간에만 투표한다고 가정합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401`, `403`, `404` |

Request

```json
{
  "slotId": 12
}
```

Response 200

```json
{
  "slotId": 12,
  "voteCount": 9,
  "myVoteSlotId": 12
}
```

정책

- 이미 다른 후보에 투표한 상태에서 다시 투표하면 기존 투표를 새 후보로 변경합니다.
- 후보 시간이 해당 모임에 속하지 않으면 `400` 또는 `404`를 반환합니다.

---

### POST `/meetings/{id}/confirm`

모임 시간을 확정합니다. 기본 정책은 최다 득표 후보를 확정하는 것입니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401`, `403`, `404` |

Request

```json
{
  "slotId": 12
}
```

Response 200

```json
{
  "meetingId": 1,
  "status": "CONFIRMED",
  "confirmedSlotId": 12,
  "day": "토",
  "time": "오후 2:00",
  "place": "성수"
}
```

정책

- 모임장만 확정할 수 있게 할지, 멤버 모두 가능하게 할지는 BE/FE 합의 필요.
- MVP에서는 `OWNER`만 확정 가능하게 두는 것을 권장합니다.

---

### GET `/meetings/{id}/confirmed`

확정된 모임 일정과 참석 가능자를 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "meetingId": 1,
  "name": "수요 독서 모임",
  "day": "토",
  "time": "오후 2:00",
  "place": "성수",
  "attendees": ["지연", "민수", "서연"],
  "absentees": ["도윤"]
}
```

---

### GET `/archives`

활동 기록 목록을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401` |

Response 200

```json
[
  {
    "id": 1,
    "round": 12,
    "date": "2025.04.12",
    "day": "토",
    "place": "성수",
    "title": "4월 정기모임",
    "summary": "독서 토론",
    "photos": 4,
    "attendees": ["지연", "민수"]
  }
]
```

---

### GET `/archives/{id}`

활동 기록 상세 정보를 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "id": 1,
  "meetingId": 1,
  "round": 12,
  "date": "2025.04.12",
  "day": "토",
  "place": "성수",
  "title": "4월 정기모임",
  "summary": "독서 토론",
  "photoUrls": [
    "https://example.com/archive/1.png"
  ],
  "attendees": ["지연", "민수"],
  "absentees": ["도윤"]
}
```

---

### POST `/archives`

활동 기록을 생성합니다. MVP에서는 사진 없이 텍스트 정보부터 저장합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟢 MVP |
| 인증 | ✅ 필요 |
| 성공 코드 | `201 Created` |
| 실패 코드 | `400`, `401`, `403`, `404` |

Request

```json
{
  "meetingId": 1,
  "round": 12,
  "date": "2025-04-12",
  "place": "성수",
  "title": "4월 정기모임",
  "summary": "독서 토론",
  "attendees": ["지연", "민수"],
  "absentees": ["도윤"]
}
```

Response 201

```json
{
  "id": 1,
  "meetingId": 1,
  "round": 12,
  "date": "2025-04-12",
  "place": "성수",
  "title": "4월 정기모임",
  "summary": "독서 토론"
}
```

---

### PUT `/archives/{id}`

활동 기록을 수정합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401`, `403`, `404` |

Request

```json
{
  "place": "성수",
  "title": "4월 정기모임",
  "summary": "책 이야기와 다음 모임 계획을 정리했습니다.",
  "attendees": ["지연", "민수"],
  "absentees": ["도윤"]
}
```

Response 200

```json
{
  "id": 1,
  "place": "성수",
  "title": "4월 정기모임",
  "summary": "책 이야기와 다음 모임 계획을 정리했습니다.",
  "attendees": ["지연", "민수"],
  "absentees": ["도윤"]
}
```

---

### POST `/archives/{id}/photos`

활동 기록에 사진을 업로드합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| Content-Type | `multipart/form-data` |
| 성공 코드 | `200 OK` |
| 실패 코드 | `400`, `401`, `403`, `404` |

Request

```text
photos: File[]
```

Response 200

```json
{
  "archiveId": 1,
  "photoUrls": [
    "https://example.com/archive/1.png",
    "https://example.com/archive/2.png"
  ]
}
```

메모

- MVP에서는 생략 가능합니다.
- 실제 구현 시 AWS S3 또는 Cloudinary에 업로드하고 DB에는 URL만 저장하는 방식을 권장합니다.

---

### GET `/friends`

친구 목록을 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401` |

Response 200

```json
[
  {
    "id": 2,
    "nickname": "민수",
    "handle": "@minsu",
    "profileImageUrl": null,
    "status": "공강 많음"
  }
]
```

---

### POST `/friends`

친구를 추가합니다. MVP 이후에는 친구 요청/수락 플로우로 확장할 수 있습니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `201 Created` |
| 실패 코드 | `400`, `401`, `404`, `409` |

Request

```json
{
  "handle": "@minsu"
}
```

Response 201

```json
{
  "id": 2,
  "nickname": "민수",
  "handle": "@minsu",
  "status": "친구"
}
```

---

### GET `/friends/{id}/schedules`

친구의 시간표를 조회합니다.

| 항목 | 값 |
| --- | --- |
| 우선순위 | 🟡 2차 |
| 인증 | ✅ 필요 |
| 성공 코드 | `200 OK` |
| 실패 코드 | `401`, `403`, `404` |

Response 200

```json
{
  "friend": {
    "id": 2,
    "nickname": "민수",
    "handle": "@minsu"
  },
  "schedules": [
    {
      "id": 8,
      "title": "운영체제 수업",
      "type": "FIXED",
      "days": [1, 3],
      "startHour": 13,
      "startMinute": 0,
      "endHour": 14,
      "endMinute": 30
    }
  ]
}
```

---

## 6. FE 연동 메모

### 토큰 저장 및 요청 헤더

로그인 또는 회원가입 응답으로 받은 토큰을 저장한 뒤, API 클라이언트에서 모든 인증 요청에 헤더를 붙입니다.

```ts
Authorization: `Bearer ${token}`
```

### ID 타입

- 서버 ID는 Long/number 기준입니다.
- FE mock 데이터가 문자열 id를 사용한다면 API 연동 시 number로 변경합니다.

### Enum 표기

서버 내부 enum은 대문자 사용을 권장합니다.

| 도메인 | 값 |
| --- | --- |
| Schedule.type | `FIXED`, `VARIABLE` |
| Meeting.status | `VOTING`, `CONFIRMED` |
| MeetingMember.role | `OWNER`, `MEMBER` |

FE 화면에서는 필요에 따라 `confirmed`, `voting`처럼 소문자 표시값으로 변환해도 됩니다.

---

## 7. 구현 순서

1. 인증 API 구현: `/auth/signup`, `/auth/login`
2. FE 토큰 저장 및 interceptor 연동
3. 모임 API 보강: `/meetings`, `/meetings/{id}`, 모임 멤버 관계
4. 개인 일정 API 구현: `/users/schedules`
5. 일정 매칭 API 구현: `/meetings/{id}/slots`, `/votes`, `/confirm`
6. 아카이브 API 구현: `/archives`
7. 서버와 DB 배포 후 FE에 배포 URL 전달
8. 프로필, 친구 기능 구현
9. WebSocket 기반 채팅 구현

---

## 8. 진행 체크리스트

- [ ] API 명세 팀 합의
- [ ] 인증 API 구현
- [ ] FE 토큰 저장 및 API client 연동
- [ ] 모임 멤버 관계 보강
- [ ] 개인 일정 API 구현
- [ ] 일정 매칭 API 구현
- [ ] 아카이브 API 구현
- [ ] 서버 + DB 배포
- [ ] FE `.env`에 배포 URL 반영
- [ ] 프로필 편집 구현
- [ ] 친구 기능 구현
- [ ] 실시간 채팅 구현
