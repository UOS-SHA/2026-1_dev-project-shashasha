# SHASHASHA API 명세서 (v0.1)

> 🗓️ 작성일 2026-06-30 · 상태: **설계 초안** · 구현 전 합의용 문서
>
> 이 문서는 "앱(FE)과 서버(BE)가 어떤 데이터를 어떤 주소로 주고받을지"를 미리 정해두는 **계약서**입니다.
> FE와 BE가 같은 문서를 보고 동시에 작업합니다.

---

## 0. 공통 규칙 (Conventions)

| 항목            | 값                                                                                  |
| --------------- | ----------------------------------------------------------------------------------- |
| Base URL (개발) | `http://localhost:8080`                                                             |
| Base URL (배포) | _(배포 후 확정 — FE `.env`의 `EXPO_PUBLIC_API_URL`에 입력)_                         |
| 데이터 형식     | JSON (UTF-8)                                                                        |
| 인증 방식       | `Authorization: Bearer <JWT토큰>` 헤더                                              |
| ID 타입         | 정수(Long), 서버가 자동 증가 _(FE는 현재 문자열 id를 쓰지만 연동 시 number로 변경)_ |
| 날짜/시간       | ISO 8601 문자열 (예: `2026-06-30T14:00:00`)                                         |

### 인증 규칙

- `🔓` 표시 = 토큰 없이 호출 가능 (회원가입/로그인)
- 그 외 모든 API = 로그인 후 받은 **JWT 토큰을 헤더에 넣어야** 호출 가능. 토큰 없으면 `401`.
- "내" 데이터(`/users/me`, 내 일정 등)는 토큰 안의 사용자 정보로 자동 구분 → URL에 내 id를 넣지 않음.

### 응답 상태 코드

| 코드               | 의미                                 |
| ------------------ | ------------------------------------ |
| `200 OK`           | 조회/수정 성공                       |
| `201 Created`      | 생성 성공                            |
| `204 No Content`   | 삭제 성공 (응답 본문 없음)           |
| `400 Bad Request`  | 입력값 오류 (검증 실패)              |
| `401 Unauthorized` | 토큰 없음/만료                       |
| `403 Forbidden`    | 권한 없음 (남의 데이터 수정 시도 등) |
| `404 Not Found`    | 대상 없음                            |
| `409 Conflict`     | 중복 (이미 가입한 이메일 등)         |

### 에러 응답 형식 (공통)

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "모임 이름은 필수입니다"
}
```

### 구현 우선순위

- 🟢 **1차 (MVP)** — 핵심 흐름. 로그인 → 모임 → 일정매칭 → 아카이브.
- 🟡 **2차** — 친구, 프로필 편집 등 부가 기능.
- ⚪ **나중** — 실시간 채팅(WebSocket 필요, 난이도 높음).

---

## 1. 데이터 모델 (Entities)

실제 DB 테이블이 될 데이터 구조입니다. 화면 전체를 분석해 도출했습니다.

### User (사용자)

| 필드            | 타입     | 설명                  |
| --------------- | -------- | --------------------- |
| id              | Long     | PK                    |
| email           | String   | 로그인 이메일 (고유)  |
| nickname        | String   | 닉네임 (최대 12자)    |
| bio             | String   | 한줄 소개 (최대 40자) |
| handle          | String   | @아이디               |
| profileImageUrl | String?  | 프로필 사진 (선택)    |
| joinedAt        | DateTime | 가입일                |

### UserPreferences (사용자 설정 · 온보딩에서 수집)

| 필드                                            | 타입    | 설명           |
| ----------------------------------------------- | ------- | -------------- |
| notificationEnabled                             | boolean | 알림 허용      |
| personalizeEnabled                              | boolean | 맞춤 추천 허용 |
| agreedService / agreedPrivacy / agreedMarketing | boolean | 약관 동의 항목 |

### Schedule (개인 일정)

| 필드                                       | 타입   | 설명                                     |
| ------------------------------------------ | ------ | ---------------------------------------- |
| id                                         | Long   | PK                                       |
| userId                                     | Long   | 소유자                                   |
| title                                      | String | 일정 이름                                |
| type                                       | enum   | `FIXED`(고정/반복) 또는 `VARIABLE`(가변) |
| days                                       | int[]  | 요일 (0=월 … 6=일)                       |
| startHour, startMinute, endHour, endMinute | int    | 시작/종료 시각                           |

### Meeting (모임)

| 필드            | 타입    | 설명                                    |
| --------------- | ------- | --------------------------------------- |
| id              | Long    | PK                                      |
| name            | String  | 모임 이름                               |
| emoji           | String? | 아이콘 이모지                           |
| description     | String? | 설명                                    |
| creatorId       | Long    | 만든 사람                               |
| memberCount     | int     | 멤버 수                                 |
| status          | enum    | `VOTING`(투표중) 또는 `CONFIRMED`(확정) |
| place           | String? | 장소                                    |
| nextLabel       | String? | 다음 일정 표시용 텍스트                 |
| confirmedSlotId | Long?   | 확정된 시간 슬롯                        |

### MeetingMember (모임-멤버 연결, N:N)

| 필드      | 타입 | 설명                  |
| --------- | ---- | --------------------- |
| meetingId | Long | 모임                  |
| userId    | Long | 멤버                  |
| role      | enum | `OWNER` 또는 `MEMBER` |

### TimeSlot (모임 후보 시간)

| 필드              | 타입   | 설명                         |
| ----------------- | ------ | ---------------------------- |
| id                | Long   | PK                           |
| meetingId         | Long   | 소속 모임                    |
| day               | String | 요일                         |
| time              | String | 시간 (예: "오후 2:00")       |
| availabilityCount | int    | 가능한 멤버 수 (시간표 겹침) |
| voteCount         | int    | 받은 표 수                   |

### Vote (투표)

| 필드   | 타입 | 설명             |
| ------ | ---- | ---------------- |
| id     | Long | PK               |
| slotId | Long | 투표한 후보 시간 |
| userId | Long | 투표자           |

### Notice (모임 공지)

| 필드      | 타입     | 설명                |
| --------- | -------- | ------------------- |
| id        | Long     | PK                  |
| meetingId | Long     | 소속 모임           |
| tag       | String   | 분류 (공지/회비 등) |
| title     | String   | 제목                |
| content   | String?  | 내용                |
| createdAt | DateTime | 작성일              |

### Friend (친구 관계, N:N)

| 필드         | 타입   | 설명                         |
| ------------ | ------ | ---------------------------- |
| userId       | Long   | 나                           |
| friendUserId | Long   | 친구                         |
| status       | String | 상태 텍스트 ("공강 많음" 등) |

### ChatRoom / ChatMessage / MeetingPoll ⚪ 나중

| 엔티티      | 핵심 필드                                          |
| ----------- | -------------------------------------------------- |
| ChatRoom    | id, name, memberIds[], lastMessage, unreadCount    |
| ChatMessage | id, chatRoomId, senderId, text, createdAt, pollId? |
| MeetingPoll | id, messageId, time, voterCount, voted             |

### Archive (활동 기록)

| 필드      | 타입     | 설명          |
| --------- | -------- | ------------- |
| id        | Long     | PK            |
| meetingId | Long     | 소속 모임     |
| round     | int      | 회차          |
| date      | Date     | 활동 날짜     |
| place     | String   | 장소          |
| title     | String   | 제목          |
| summary   | String   | 요약/메모     |
| photoUrls | String[] | 사진 URL 목록 |
| attendees | String[] | 참석자 이름   |
| absentees | String[] | 불참자 이름   |

### 관계 요약

- User `1 — N` Schedule (한 명이 여러 개인일정)
- User `N — N` Meeting (MeetingMember 연결 테이블)
- Meeting `1 — N` TimeSlot `1 — N` Vote
- Meeting `1 — N` Notice / Archive
- User `N — N` Friend (양방향)
- ChatRoom `1 — N` ChatMessage `1 — 0..1` MeetingPoll

---

## 2. 엔드포인트 (Endpoints)

### 2-A. 인증 · 온보딩 🟢

| 우선 | Method | Path           | 인증 | 설명                               |
| ---- | ------ | -------------- | ---- | ---------------------------------- |
| 🟢   | POST   | `/auth/signup` | 🔓   | 회원가입 (이메일+비번+온보딩 정보) |
| 🟢   | POST   | `/auth/login`  | 🔓   | 로그인 → JWT 토큰 발급             |
| 🟡   | POST   | `/auth/logout` | ✅   | 로그아웃                           |
| 🟡   | DELETE | `/users/me`    | ✅   | 회원 탈퇴                          |

**POST /auth/signup**

```json
// Request
{
  "email": "test@shashasha.com",
  "password": "********",
  "nickname": "지연",
  "bio": "러닝 좋아해요",
  "agreedService": true,
  "agreedPrivacy": true,
  "agreedMarketing": false
}
// Response 201
{ "token": "eyJhbGciOi...", "user": { "id": 1, "nickname": "지연", "email": "test@shashasha.com" } }
```

**POST /auth/login**

```json
// Request
{ "email": "test@shashasha.com", "password": "********" }
// Response 200
{ "token": "eyJhbGciOi...", "user": { "id": 1, "nickname": "지연" } }
```

> 📌 FE: 받은 `token`을 안전한 저장소에 저장하고, `src/api/client.ts`의 `interceptors`에서 모든 요청 헤더에 `Authorization: Bearer <token>` 붙이기.

---

### 2-B. 사용자 · 프로필 🟢/🟡

| 우선 | Method | Path                 | 인증 | 설명                           | 화면             |
| ---- | ------ | -------------------- | ---- | ------------------------------ | ---------------- |
| 🟢   | GET    | `/users/me`          | ✅   | 내 프로필 조회                 | settings/profile |
| 🟡   | PUT    | `/users/profile`     | ✅   | 프로필 수정 (닉네임/소개/사진) | profile-edit     |
| 🟡   | PUT    | `/users/preferences` | ✅   | 알림/맞춤설정 변경             | permissions      |

**GET /users/me → 200**

```json
{
  "id": 1,
  "nickname": "지연",
  "handle": "@jiyeon",
  "email": "test@shashasha.com",
  "bio": "러닝 좋아해요",
  "joinedAt": "2026-03-01"
}
```

---

### 2-C. 개인 일정 🟢

| 우선 | Method | Path                    | 인증 | 설명         | 화면                  |
| ---- | ------ | ----------------------- | ---- | ------------ | --------------------- |
| 🟢   | GET    | `/users/schedules`      | ✅   | 내 일정 전체 | personal-schedule     |
| 🟢   | POST   | `/users/schedules`      | ✅   | 일정 추가    | personal-schedule/add |
| 🟡   | DELETE | `/users/schedules/{id}` | ✅   | 일정 삭제    |                       |

**POST /users/schedules**

```json
// Request
{ "title": "알고리즘 수업", "type": "FIXED", "days": [0, 2], "startHour": 9, "startMinute": 0, "endHour": 10, "endMinute": 30 }
// Response 201
{ "id": 5, "title": "알고리즘 수업", "type": "FIXED", "days": [0,2], "startHour": 9, "startMinute": 0, "endHour": 10, "endMinute": 30 }
```

---

### 2-D. 모임 🟢

| 우선 | Method | Path                     | 인증 | 설명                  | 화면                 |
| ---- | ------ | ------------------------ | ---- | --------------------- | -------------------- |
| 🟢   | GET    | `/meetings`              | ✅   | 내가 가입한 모임 목록 | home                 |
| 🟢   | GET    | `/meetings/{id}`         | ✅   | 모임 상세             | meeting              |
| 🟢   | POST   | `/meetings`              | ✅   | 모임 생성             | settings/new-meeting |
| 🟡   | GET    | `/meetings/{id}/notices` | ✅   | 모임 공지 목록        | meeting              |

**GET /meetings → 200** _(이미 구현 완료 ✅)_

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

**POST /meetings**

```json
// Request
{ "name": "주말 등산 모임", "emoji": "🥾", "description": "가볍게 동네 산", "memberIds": [2, 3, 4] }
// Response 201
{ "id": 5, "name": "주말 등산 모임", "emoji": "🥾", "members": 4, "status": "voting" }
```

---

### 2-E. 일정 매칭 (시간표 · 투표 · 확정) 🟢

앱의 핵심 기능. 멤버 시간표를 겹쳐 후보를 만들고, 투표로 시간을 확정합니다.

| 우선 | Method | Path                       | 인증 | 설명                     | 화면              |
| ---- | ------ | -------------------------- | ---- | ------------------------ | ----------------- |
| 🟢   | GET    | `/meetings/{id}/timetable` | ✅   | 멤버 시간표 겹침(히트맵) | meeting/timetable |
| 🟢   | GET    | `/meetings/{id}/slots`     | ✅   | 후보 시간 + 득표 현황    | meeting/vote      |
| 🟢   | POST   | `/meetings/{id}/votes`     | ✅   | 후보 시간에 투표         | meeting/vote      |
| 🟢   | POST   | `/meetings/{id}/confirm`   | ✅   | 최다 득표 시간으로 확정  | meeting/vote      |
| 🟢   | GET    | `/meetings/{id}/confirmed` | ✅   | 확정 일정 + 참석자       | meeting/confirmed |

**GET /meetings/{id}/slots → 200**

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

**POST /meetings/{id}/votes**

```json
// Request
{ "slotId": 12 }
// Response 200
{ "slotId": 12, "voteCount": 9, "myVoteSlotId": 12 }
```

---

### 2-F. 활동 아카이브 🟢/🟡

| 우선 | Method | Path                    | 인증 | 설명                            | 화면              |
| ---- | ------ | ----------------------- | ---- | ------------------------------- | ----------------- |
| 🟢   | GET    | `/archives`             | ✅   | 활동 기록 목록 (회차/날짜 정렬) | archive           |
| 🟢   | GET    | `/archives/{id}`        | ✅   | 기록 상세                       | archive/[id]      |
| 🟢   | POST   | `/archives`             | ✅   | 기록 생성                       | archive/new       |
| 🟡   | PUT    | `/archives/{id}`        | ✅   | 기록 수정                       | archive/[id]/edit |
| 🟡   | POST   | `/archives/{id}/photos` | ✅   | 사진 업로드 (multipart)         | archive/new       |

**GET /archives → 200**

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

> 📌 사진 업로드는 별도 단계. 처음엔 파일을 클라우드 스토리지(예: AWS S3, Cloudinary)에 올리고 URL만 DB에 저장하는 방식 권장. MVP에선 생략 가능.

---

### 2-G. 친구 🟡

| 우선 | Method | Path                      | 인증 | 설명                  | 화면    |
| ---- | ------ | ------------------------- | ---- | --------------------- | ------- |
| 🟡   | GET    | `/friends`                | ✅   | 친구 목록             | friends |
| 🟡   | POST   | `/friends`                | ✅   | 친구 추가 (@handle로) | friends |
| 🟡   | GET    | `/friends/{id}/schedules` | ✅   | 친구 시간표 보기      | friends |

---

### 2-H. 단톡방 · 채팅 ⚪ 나중 (실시간)

> ⚠️ 실시간 채팅은 일반 REST가 아니라 **WebSocket**이 필요해서 난이도가 높습니다. **맨 마지막에** 별도로 진행하세요. 우선은 "투표 공유" 같은 핵심만 REST로 흉내낼 수 있습니다.

| 우선 | Method | Path                        | 설명                    |
| ---- | ------ | --------------------------- | ----------------------- |
| ⚪   | GET    | `/chat-rooms`               | 단톡방 목록             |
| ⚪   | GET    | `/chat-rooms/{id}/messages` | 메시지 목록             |
| ⚪   | POST   | `/chat-rooms/{id}/messages` | 메시지 전송             |
| ⚪   | WS     | `/ws/chat-rooms/{id}`       | 실시간 수신 (WebSocket) |

---

## 3. 구현 순서 제안

1. **🟢 인증** (`/auth/*`) — 모든 "내 데이터"의 전제. JWT 토큰 발급/검증.
2. **🟢 모임** (`/meetings`) — 이미 GET/POST 동작 중. 멤버 관계만 보강.
3. **🟢 개인 일정 + 일정 매칭** (`/users/schedules`, `/meetings/{id}/slots|votes|confirm`) — 앱의 핵심 가치.
4. **🟢 아카이브** (`/archives`) — 사진 제외하고 텍스트부터.
5. **🟡 프로필 · 친구** — 부가 기능.
6. **⚪ 실시간 채팅** — 마지막, WebSocket 학습 후.

## 4. 진행 체크리스트

- [ ] 이 명세 팀 합의 (FE + BE)
- [ ] 🟢 인증 API 구현 + FE 토큰 연동
- [ ] 🟢 모임 멤버 관계 보강
- [ ] 🟢 개인 일정 API
- [ ] 🟢 일정 매칭(투표) API
- [ ] 🟢 아카이브 API (텍스트)
- [ ] 서버 + DB 배포, FE에 배포 URL 전달
- [ ] 🟡 프로필 · 친구
- [ ] ⚪ 실시간 채팅
