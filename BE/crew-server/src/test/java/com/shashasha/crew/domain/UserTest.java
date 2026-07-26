package com.shashasha.crew.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @아이디·이메일 정규화 규칙 테스트.
 *
 * 이 규칙이 깨지면 "같은 사람인데 다른 사람으로 취급"되는 문제가 생긴다.
 * handle 은 친구 추가의 검색 키이고 유니크 제약이 걸려 있어서, 대소문자나 @ 유무로 값이 갈리면
 * 중복 검사를 통과해 버린다.
 */
class UserTest {

    @Test
    @DisplayName("handle: 대소문자·공백·@ 유무가 달라도 같은 값으로 정규화된다")
    void normalizeHandle_unifiesVariants() {
        assertThat(User.normalizeHandle("minji")).isEqualTo("@minji");
        assertThat(User.normalizeHandle("@minji")).isEqualTo("@minji");
        assertThat(User.normalizeHandle("MINJI")).isEqualTo("@minji");
        assertThat(User.normalizeHandle("  @Minji  ")).isEqualTo("@minji");
    }

    @Test
    @DisplayName("handle: 빈 값이나 null 은 null 로 처리된다")
    void normalizeHandle_blankBecomesNull() {
        assertThat(User.normalizeHandle(null)).isNull();
        assertThat(User.normalizeHandle("")).isNull();
        assertThat(User.normalizeHandle("   ")).isNull();
    }

    @Test
    @DisplayName("email: 대소문자·공백을 없애 같은 주소가 두 계정이 되지 않게 한다")
    void normalizeEmail_lowercasesAndTrims() {
        assertThat(User.normalizeEmail(" Kim@Example.COM ")).isEqualTo("kim@example.com");
        assertThat(User.normalizeEmail(null)).isNull();
    }
}
