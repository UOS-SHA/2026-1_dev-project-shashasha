package com.shashasha.crew.security;

import com.shashasha.crew.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 로그인 실패 횟수를 세어 비밀번호 대입(brute force) 공격을 늦추는 문지기.
 *
 * 시도 제한이 없으면 공격자는 서버가 받아주는 속도만큼 비밀번호 후보를 계속 넣어볼 수 있다.
 * 비밀번호가 짧거나 흔할수록 성공 확률이 급격히 올라가므로, 실패가 쌓이면 잠시 막아 시도 속도를 떨군다.
 *
 * 두 기준을 함께 본다.
 *   - 계정(이메일)별 : 한 사람의 비밀번호를 집중적으로 찍는 공격을 막는다.
 *   - 출발지 IP별   : 여러 계정을 훑는 공격(credential stuffing)을 막는다.
 *     대학 와이파이처럼 여러 사람이 같은 IP 를 쓰는 환경을 고려해 계정보다 임계치를 크게 둔다.
 *
 * 한계(운영 시 알고 있어야 할 점):
 *   - 메모리에만 저장하므로 서버를 재시작하면 카운터가 초기화되고, 인스턴스를 여러 대로 늘리면
 *     인스턴스마다 따로 센다. 본격적으로 막으려면 Redis 같은 공용 저장소로 옮겨야 한다.
 *   - IP 는 요청의 remoteAddr 을 그대로 쓴다. 리버스 프록시를 앞에 두면 모든 요청이 프록시 IP 로
 *     보이므로, 그때는 신뢰할 수 있는 프록시에서 넣어준 X-Forwarded-For 를 쓰도록 바꿔야 한다.
 */
@Component
public class LoginAttemptGuard {

    /** 계정별 허용 실패 횟수 */
    private static final int MAX_FAILURES_PER_ACCOUNT = 5;
    /** IP별 허용 실패 횟수 (공유 IP 환경을 고려해 더 크게) */
    private static final int MAX_FAILURES_PER_IP = 20;

    /** 이 시간 동안 새 실패가 없으면 카운터를 잊는다. */
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(10);
    /** 첫 잠금 시간. 연속으로 다시 걸리면 2배씩 늘어난다. */
    private static final Duration BASE_LOCK = Duration.ofMinutes(5);
    private static final Duration MAX_LOCK = Duration.ofHours(1);

    /** 메모리 폭주 방지 상한. 넘으면 만료된 항목부터 비운다. */
    private static final int MAX_TRACKED_KEYS = 20_000;

    /** 한 키(계정 또는 IP)의 실패 상태 */
    private static final class Attempts {
        private int failures;
        private int lockCount;        // 몇 번째 잠금인지 (잠금 시간을 늘리는 데 쓴다)
        private Instant lastFailureAt = Instant.EPOCH;
        private Instant lockedUntil = Instant.EPOCH;
    }

    private final Map<String, Attempts> attemptsByKey = new ConcurrentHashMap<>();

    /**
     * 지금 로그인 시도를 받아도 되는지 확인한다. 잠긴 상태면 429 로 막는다.
     * 계정이 있는지 없는지와 무관하게 같은 응답을 주므로, 이 응답으로 계정 존재를 알아낼 수는 없다.
     */
    public void checkAllowed(String email, String clientIp) {
        Instant now = Instant.now();
        long waitSeconds = Math.max(remainingLockSeconds(accountKey(email), now),
                remainingLockSeconds(ipKey(clientIp), now));

        if (waitSeconds > 0) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_LOGIN_ATTEMPTS",
                    "로그인 시도가 너무 많습니다. " + waitSeconds + "초 후에 다시 시도해 주세요");
        }
    }

    /** 로그인 실패를 기록한다. 임계치를 넘으면 잠근다. */
    public void recordFailure(String email, String clientIp) {
        Instant now = Instant.now();
        purgeIfCrowded(now);
        registerFailure(accountKey(email), MAX_FAILURES_PER_ACCOUNT, now);
        registerFailure(ipKey(clientIp), MAX_FAILURES_PER_IP, now);
    }

    /** 로그인 성공 → 그 계정의 실패 기록을 지운다. (IP 기록은 다른 계정 공격 흔적일 수 있어 남긴다) */
    public void recordSuccess(String email) {
        attemptsByKey.remove(accountKey(email));
    }

    private void registerFailure(String key, int maxFailures, Instant now) {
        attemptsByKey.compute(key, (k, existing) -> {
            Attempts state = existing == null ? new Attempts() : existing;

            // 마지막 실패가 오래됐으면 처음부터 다시 센다.
            if (state.lastFailureAt.isBefore(now.minus(FAILURE_WINDOW))) {
                state.failures = 0;
            }
            state.failures++;
            state.lastFailureAt = now;

            if (state.failures >= maxFailures) {
                state.lockCount++;
                state.failures = 0;                 // 잠금과 함께 카운터를 비운다
                state.lockedUntil = now.plus(lockDuration(state.lockCount));
            }
            return state;
        });
    }

    /** 잠금 시간: 5분 → 10분 → 20분 … 최대 1시간. 반복 공격일수록 비용이 커진다. */
    private Duration lockDuration(int lockCount) {
        // 지수 계산이 넘치지 않게 지수를 제한한다 (2^10 이면 이미 MAX_LOCK 을 넘는다)
        int exponent = Math.min(lockCount - 1, 10);
        Duration escalated = BASE_LOCK.multipliedBy(1L << exponent);
        return escalated.compareTo(MAX_LOCK) > 0 ? MAX_LOCK : escalated;
    }

    private long remainingLockSeconds(String key, Instant now) {
        Attempts state = attemptsByKey.get(key);
        if (state == null || state.lockedUntil.isBefore(now)) {
            return 0;
        }
        // 0초로 보이지 않게 올림한다.
        return Math.max(1, Duration.between(now, state.lockedUntil).toSeconds());
    }

    /**
     * 항목이 너무 많이 쌓이면 이미 의미 없는 것(잠금이 풀리고 실패 기록도 오래된 것)을 지운다.
     * 공격자가 임의의 이메일을 계속 보내 메모리를 늘리는 것을 막는다.
     */
    private void purgeIfCrowded(Instant now) {
        if (attemptsByKey.size() < MAX_TRACKED_KEYS) {
            return;
        }
        attemptsByKey.values().removeIf(state ->
                state.lockedUntil.isBefore(now) && state.lastFailureAt.isBefore(now.minus(FAILURE_WINDOW)));
    }

    private String accountKey(String email) {
        return "account:" + (email == null ? "" : email);
    }

    private String ipKey(String clientIp) {
        return "ip:" + (clientIp == null ? "" : clientIp);
    }
}
