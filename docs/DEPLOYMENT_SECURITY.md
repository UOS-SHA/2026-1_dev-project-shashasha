# 배포 전 보안 조치

보안 자문서(GitHub Security Advisories) 대응으로 코드를 고쳤지만, **코드 배포만으로는 끝나지 않는
항목들**이 있다. 서버 환경변수와 DB 는 여기 적힌 절차를 직접 실행해야 한다.

**방침: 배포와 함께 DB 를 초기화한다.** 기존 데이터에는 이미 문제 값(중복 @아이디, 범위를 벗어난
일정, 고아 데이터 등)이 들어가 있어서 하나씩 고치려면 손이 많이 간다. 데이터가 아직 시연용뿐이므로
초기화하는 편이 단순하고 안전하다. 무엇보다 **초기화하면 이번에 추가한 DB 제약이 자동으로 붙는다**
(이유와 실측 결과는 [§3](#3-db-초기화)).

---

## 0. 배포 순서 (먼저 읽을 것)

```
1. 로컬 확인:  docker compose up -d  →  gradlew test  →  gradlew bootRun 으로 흐름 점검
2. 커밋 / PR 병합
3. 관리자: JWT_SECRET 설정 (§1) + DB_PASSWORD 새로 정하기 (§2)
4. 관리자: 새 BE 배포
5. 관리자: DB 초기화 (§3)  →  BE 재시작
6. FE preview 빌드  →  동작 확인
7. 팀 공지: 계정이 초기화됐으니 재가입 / 새 비밀번호는 12자 이상
```

지켜야 하는 순서가 두 개 있다.

**BE 를 FE 보다 먼저 배포한다.** 새 FE 는 모임 생성 요청에서 `status` 를 보내지 않는데, 예전 BE 는
그 값을 필수(`@NotBlank`)로 받는다. 순서를 바꾸면 **모임 생성이 400 으로 실패한다.**
반대 방향(예전 FE + 새 BE)은 문제가 없다 — 예전 FE 가 보내는 `status` 는 새 BE 가 그냥 무시한다.

**새 BE 를 배포한 뒤에 DB 를 초기화한다.** 예전 BE 가 테이블을 다시 만들면 제약이 빠진 예전 스키마가
생긴다. 이 경우 서버는 아무 문제 없이 돌아가기 때문에 **눈으로는 알 수 없다.**

그리고 **§1 서명키를 교체하면 모든 사용자가 로그아웃된다.** 앱은 401 을 받으면 자동으로 로그인
화면으로 가지만, 미리 안내하는 편이 좋다.

---

## 1. JWT 서명키 설정 (필수 · 최우선)

이전 코드에는 `application.properties` 에 서명키 기본값이 그대로 커밋되어 있었다.

```
jwt.secret=${JWT_SECRET:dev-only-shashasha-super-secret-key-change-me-please-32+}
```

`${JWT_SECRET:기본값}` 문법은 "환경변수가 있으면 그 값, **없으면 뒤의 기본값**"이라는 뜻이다.
즉 지금까지 서버가 정상 동작했다는 사실은 `JWT_SECRET` 이 설정되어 있었다는 근거가 되지 않는다.
설정하지 않아도 커밋된 기본값으로 잘 돌아갔고, 그게 바로 이 취약점이다.
(`.env.example` 에도 `# JWT_SECRET=` 이 주석 처리되어 있다 — 팀 템플릿 자체에 값이 없었다)

이 값을 아는 사람은 누구나 `"이 사람은 id=1 사용자다"` 라고 적힌 토큰을 직접 서명해서 만들 수 있다.
서버는 그것을 정상 로그인으로 받아들인다. 즉 **비밀번호 없이 임의 사용자로 로그인하는 것과 같다.**
저장소가 공개되어 있었다면 이 키는 이미 유출된 것으로 간주해야 한다.

**이번 변경으로 `JWT_SECRET` 은 사실상 필수가 되었다.** 기본값을 제거했으므로, 설정하지 않으면
서버가 실행할 때마다 무작위 키를 새로 만든다. 위조는 불가능해지지만 **재시작마다 전원 로그아웃**된다.

```bash
# 32바이트 이상의 무작위 값 생성
openssl rand -base64 48

# 서버 실행 방식에 맞게 주입
#   docker run     → -e JWT_SECRET='<값>'
#   docker-compose → environment: JWT_SECRET=<값>
#   systemd        → Environment="JWT_SECRET=<값>"
```

키를 새로 넣으면 **기존에 발급된 모든 토큰이 무효화된다.** 이게 목적이다 — 유출된 키로 만든
위조 토큰과 평문 HTTP 구간에서 탈취된 정상 토큰이 함께 죽는다. 사용자는 앱에서 다시 로그인하면 되고,
앱은 401 을 받으면 자동으로 로그아웃 상태로 전환된다(`FE/crew-app/src/api/client.ts`).

**설정됐는지 확인하는 방법**: 앱에서 로그인해 둔 뒤 서버를 재시작한다. 로그인이 유지되면 제대로
설정된 것이고, 로그아웃되면 설정되지 않은 것이다. 서버 로그에도 경고가 남는다.

## 2. DB 접속 정보

`application.properties` 의 DB 기본값은 로컬 개발용이다.

```
spring.datasource.password=${DB_PASSWORD:crewpass}
```

여기도 같은 `${환경변수:기본값}` 문법이다. 다만 DB 는 서명키와 달리 **추론이 가능하다** — 서버가 DB 에
정상 접속하고 있다면 둘 중 하나다.

1. `DB_PASSWORD` 가 설정되어 있다 → 문제 없음. 확인만 하면 된다.
2. 운영 DB 비밀번호가 실제로 `crewpass` 다 → **저장소에 공개된 비밀번호를 쓰고 있다.** 교체 필요.

```bash
# 서버에서 확인
env | grep -E 'DB_URL|DB_USERNAME|DB_PASSWORD'
```

**어느 쪽이든, DB 를 초기화하는 이번이 비밀번호를 새로 정하기 가장 좋은 시점이다.** 데이터가 어차피
없어지므로 기존 값이 무엇이었는지 알아낼 필요도 없다. 새 비밀번호를 정해 DB 계정과 환경변수에 함께
넣으면 된다.

---

## 3. DB 초기화

기존 데이터를 버리고 스키마를 처음부터 다시 만든다.

### 왜 이게 제약까지 해결하는가

`ddl-auto=update` 는 테이블이 **없을 때는** `CREATE TABLE` 을 실행하면서 엔티티에 선언한 유니크
제약과 `@CheckConstraint` 를 함께 넣는다. 반면 테이블이 **이미 있으면** 컬럼 추가 정도만 하고
제약은 건드리지 않는다.

실제로 같은 코드로 두 경우를 비교했다. (2026-07-26, 로컬 Postgres 16)

|                          | 기존 스키마에 그냥 배포 | `DROP SCHEMA` 후 재기동                          |
| ------------------------ | ----------------------- | ------------------------------------------------ |
| `users.handle` UNIQUE    | ❌ 생성 안 됨           | ✅ `uktpu0euqmn8f2vw66lyuv3dfoh UNIQUE (handle)` |
| `chk_schedule_time`      | ❌ 생성 안 됨           | ✅ 생성됨                                        |
| `chk_schedule_day_index` | ❌ 생성 안 됨           | ✅ 생성됨                                        |

**코드에 제약을 선언해 두어도 기존 테이블에는 붙지 않는다**는 것이 실측으로 확인됐다.
초기화하지 않고 배포하면 서버는 정상 동작하면서도 제약만 없는 상태가 된다.

### 순서

```bash
# 1) 새 BE 를 배포한 뒤, BE 를 잠시 멈춘다
#    (테이블을 쓰는 중이면 DROP 이 막히고, 예전 BE 가 살아 있으면 예전 스키마가 다시 생긴다)

# 2) 스키마를 비운다
psql -U <계정> -d crew -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

# 3) BE 를 다시 시작한다
#    → Hibernate 가 테이블을 새로 만들고(제약 포함), DataSeeder 가 샘플 5명을 심는다
```

### 완료 확인

3줄 이상 나오면 정상이다.

```sql
SELECT conname FROM pg_constraint
WHERE conname IN ('chk_schedule_time', 'chk_schedule_day_index')
   OR (conrelid = 'users'::regclass AND contype = 'u');
```

### 초기화 후 자동으로 복구되는 것

- **샘플 멤버 5명 + 그들의 개인 일정** — `DataSeeder` 가 서버 시작 시 심는다.
  비밀번호는 무작위로 생성되고 버려지므로 아무도 로그인할 수 없다.
  (예전에는 `test1234` 가 코드에 적혀 있어서 누구나 로그인할 수 있었다)
- **스타터 모임 3개** — `StarterMeetingSeeder` 가 **회원가입할 때마다** 그 사용자 전용으로 만든다.
  샘플 멤버들의 표도 미리 심어져서, 새 사용자는 가입 직후부터 투표~확정 흐름을 그대로 체험할 수 있다.

즉 초기화 후 새로 가입하면 예전과 똑같은 데모 상태가 된다.

### 사라지는 것

기존 사용자 계정, 개인 일정, 직접 만든 모임, 투표, 활동 기록이 **전부 삭제된다.**
되돌릴 방법이 없으니, 남기고 싶은 데이터가 있으면 초기화 전에 백업을 받아 둔다.

---

## 4. HTTPS 전환 — 이번에는 **보류** (미해결 항목)

> **현재 상태: 적용하지 않음.** API 주소는 `http://141.164.45.201:8080` 평문 HTTP 그대로이고,
> `app.json` 의 `usesCleartextTraffic: true` 도 그대로 유지했다. 현재로서는 보류하기로
> 결정했다. 아래는 나중에 진행할 때를 위한 절차다.

**보류하는 동안 남아 있는 위험을 명시해 둔다.** 같은 와이파이의 공격자나 중간 경로의 장비가
**로그인 요청의 이메일·비밀번호와 이후 모든 요청의 JWT 를 그대로 읽을 수 있다.** 학교처럼 여러 사람이
같은 무선망을 쓰는 환경에서는 실제로 재현 가능한 공격이다. 다른 항목(§1 서명키 교체 등)을 모두
적용해도 이 경로는 닫히지 않는다. 공개 와이파이에서 쓰지 않도록 안내하는 것이 임시 완화책이다.

### 4-1. 도메인 준비 — 돈을 쓰지 않아도 된다

IP 주소로는 일반적인 공인 인증서를 발급받을 수 없어 **호스트네임이 필요하다.** 다만 도메인을
구매할 필요는 없다.

- **무료 서브도메인 서비스** (권장): DuckDNS 같은 곳에서 `shashasha.duckdns.org` 형태의 주소를
  무료로 받아 `141.164.45.201` 로 연결한다. Let's Encrypt 의 DNS-01 방식과 함께 쓸 수 있다.
- **학교 도메인**: 학과·동아리 명의로 서브도메인을 받을 수 있는지 확인해 볼 만하다.
- **Cloudflare**: 도메인을 올려 프록시를 켜면 인증서를 Cloudflare 가 처리한다(도메인은 필요).
- 참고로 Let's Encrypt 는 IP 주소용 단기 인증서 발급도 시작했지만, ACME 클라이언트 지원과 갱신
  주기 때문에 무료 서브도메인 쪽이 더 단순하다.

### 4-2. 앱 설정 되돌리기 (HTTPS 를 실제로 적용할 때)

지금은 평문 설정이 그대로이므로, HTTPS 를 적용하는 시점에 아래 두 곳을 바꿔야 한다.

- `FE/crew-app/eas.json` 의 `EXPO_PUBLIC_API_URL` 두 곳 → `https://<발급받은 호스트네임>`
- `FE/crew-app/app.json` 의 `expo-build-properties` 블록(`usesCleartextTraffic: true`) 제거

### 4-3. 인증서 발급과 리버스 프록시

```bash
# Nginx + Let's Encrypt 예시
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

Nginx 가 443 에서 TLS 를 받고 내부 8080 으로 넘기게 한다.

```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # 브라우저가 다음부터 http로 접근하지 않게 한다
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 평문으로 온 요청은 https로 넘긴다
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$host$request_uri;
}
```

### 4-4. 8080 포트 외부 차단

프록시를 세워도 `http://141.164.45.201:8080` 이 열려 있으면 평문 경로가 그대로 남는다.

```bash
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw deny 8080/tcp
```

### 4-5. 프록시를 세운 뒤 해야 하는 코드 변경

`LoginAttemptGuard` 는 로그인 시도 제한에 요청의 `remoteAddr` 를 쓴다. 리버스 프록시를 앞에 두면
**모든 요청이 프록시 IP 하나로 보여서 IP별 제한이 전체 사용자에게 걸린다.**
프록시가 넣어주는 `X-Forwarded-For` 를 쓰도록 `AuthController.login()` 을 바꿔야 한다.

```properties
# application.properties — 신뢰할 수 있는 프록시가 앞에 있을 때만 켠다
server.forward-headers-strategy=framework
```

이 설정 없이 `X-Forwarded-For` 를 그대로 신뢰하면, 공격자가 헤더를 위조해 IP별 제한을 우회할 수 있다.

### 4-6. 앱 재배포와 사용자 안내

- `eas.json` 의 두 곳을 실제 도메인으로 치환하고 preview/production 빌드를 다시 만든다.
- 평문 구간에서 사용된 비밀번호는 노출된 것으로 봐야 한다. 사용자에게 비밀번호 변경을 안내한다.
- §1 의 `JWT_SECRET` 교체로 탈취된 토큰은 이미 무효화된다.

---

## 남은 과제

아래는 이번 패치 범위에 포함되지 않았다.

- **HTTPS 미적용** (§4). 남은 항목 중 가장 위험도가 높다.
- **로그인 시도 제한이 메모리에만 저장된다.** 서버를 재시작하면 카운터가 초기화되고, 인스턴스를
  여러 대로 늘리면 인스턴스마다 따로 센다. 본격적으로 막으려면 Redis 같은 공용 저장소로 옮겨야 한다.
- **유출된 비밀번호 목록 차단이 없다.** 길이(12자)만 검사하므로 `password1234` 같은 값은 통과한다.
  Have I Been Pwned 의 k-anonymity API 나 로컬 금지 목록을 붙이는 것을 검토할 만하다.
- **비밀번호 변경·재설정 API 가 없다.** 위 안내를 하려면 사용자가 스스로 비밀번호를 바꿀 수 있어야 한다.
- **`ddl-auto=update` 를 쓰고 있다.** 이번에 DB 를 초기화해야 제약이 붙는 이유가 이것이다.
  Flyway 같은 마이그레이션 도구로 옮기면 스키마 변경이 배포에 포함되어 추적되고, 다음부터는
  초기화 없이도 제약을 반영할 수 있다.
