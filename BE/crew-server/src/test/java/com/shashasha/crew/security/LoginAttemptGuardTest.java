package com.shashasha.crew.security;

import com.shashasha.crew.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 로그인 시도 제한 테스트.
 *
 * 시도 제한이 없으면 공격자가 서버가 받아주는 속도만큼 비밀번호 후보를 계속 넣어볼 수 있다.
 * 임계치·잠금·초기화가 실제로 동작하는지는 눈으로 봐선 알 수 없어서 테스트로 고정한다.
 */
class LoginAttemptGuardTest {

    private static final String IP = "203.0.113.10";

    private LoginAttemptGuard guard;

    @BeforeEach
    void setUp() {
        // 상태를 메모리에 들고 있으므로 테스트마다 새로 만든다.
        guard = new LoginAttemptGuard();
    }

    @Test
    @DisplayName("실패가 임계치 미만이면 계속 시도할 수 있다")
    void allowsAttemptsBelowThreshold() {
        for (int i = 0; i < 4; i++) {
            guard.recordFailure("victim@example.com", IP);
        }

        assertThatCode(() -> guard.checkAllowed("victim@example.com", IP))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("같은 계정으로 5회 실패하면 429 로 막힌다")
    void locksAccountAfterFiveFailures() {
        for (int i = 0; i < 5; i++) {
            guard.recordFailure("victim@example.com", IP);
        }

        assertThatThrownBy(() -> guard.checkAllowed("victim@example.com", IP))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(e.getError()).isEqualTo("TOO_MANY_LOGIN_ATTEMPTS");
                });
    }

    @Test
    @DisplayName("잠긴 계정과 무관한 다른 계정은 (같은 IP 라도) 계속 시도할 수 있다")
    void lockIsScopedToTheAccount() {
        for (int i = 0; i < 5; i++) {
            guard.recordFailure("victim@example.com", IP);
        }

        assertThatCode(() -> guard.checkAllowed("someone-else@example.com", IP))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("로그인 성공하면 그 계정의 실패 기록이 지워진다")
    void successResetsAccountCounter() {
        for (int i = 0; i < 4; i++) {
            guard.recordFailure("victim@example.com", IP);
        }
        guard.recordSuccess("victim@example.com");

        // 초기화되었으므로 4번 더 실패해도 아직 잠기지 않아야 한다.
        for (int i = 0; i < 4; i++) {
            guard.recordFailure("victim@example.com", IP);
        }

        assertThatCode(() -> guard.checkAllowed("victim@example.com", IP))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("여러 계정을 훑는 공격은 IP 임계치(20회)에서 막힌다")
    void locksIpAfterManyFailuresAcrossAccounts() {
        // 계정마다 1회씩만 실패시켜 계정별 임계치(5회)에는 걸리지 않게 한다.
        for (int i = 0; i < 20; i++) {
            guard.recordFailure("target" + i + "@example.com", IP);
        }

        // 21번째 계정은 실패 기록이 없지만, 같은 IP 라서 막힌다.
        assertThatThrownBy(() -> guard.checkAllowed("fresh-target@example.com", IP))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("TOO_MANY_LOGIN_ATTEMPTS"));
    }

    @Test
    @DisplayName("IP 가 잠겨도 다른 IP 에서는 시도할 수 있다")
    void ipLockIsScopedToTheIp() {
        for (int i = 0; i < 20; i++) {
            guard.recordFailure("target" + i + "@example.com", IP);
        }

        assertThatCode(() -> guard.checkAllowed("fresh-target@example.com", "198.51.100.7"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("잠금 안내에 남은 시간이 포함된다")
    void lockMessageTellsHowLongToWait() {
        for (int i = 0; i < 5; i++) {
            guard.recordFailure("victim@example.com", IP);
        }

        assertThatThrownBy(() -> guard.checkAllowed("victim@example.com", IP))
                .hasMessageContaining("초 후에");
    }
}
