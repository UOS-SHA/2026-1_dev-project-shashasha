package com.shashasha.crew.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 요청 DTO 의 검증 애너테이션 테스트.
 *
 * 애너테이션은 컴파일러가 의미를 확인해 주지 않는다. 특히 List 원소에 붙는 제약
 * (`List<@Min(0) @Max(6) Integer> days`)은 위치가 조금만 달라도 조용히 무시되므로,
 * 실제로 위반이 잡히는지 검증기로 직접 확인한다.
 */
class RequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    // ─────────────────────── 일정 (자문서 PoC 재현) ───────────────────────

    @Test
    @DisplayName("자문서의 잘못된 일정 요청이 그대로 거부된다 (days:[0,8], sh:25, sm:90, em:-30)")
    void scheduleRequest_rejectsAdvisoryPoc() {
        ScheduleRequest req = new ScheduleRequest(
                "잘못된 일정", "fixed", List.of(0, 8), 25, 90, 10, -30);

        var violations = validator.validate(req);

        // 요일 8, 시 25, 분 90, 분 -30 → 최소 4건
        assertThat(violations).hasSizeGreaterThanOrEqualTo(4);
        assertThat(violations).extracting(v -> v.getPropertyPath().toString())
                .anyMatch(path -> path.startsWith("days"));
    }

    @Test
    @DisplayName("요일은 0~6 만 허용한다")
    void scheduleRequest_dayRange() {
        assertThat(validator.validate(schedule(List.of(-1), 10, 0, 12, 0))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(7), 10, 0, 12, 0))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(0, 6), 10, 0, 12, 0))).isEmpty();
    }

    @Test
    @DisplayName("시는 0~23, 분은 0~59 만 허용한다")
    void scheduleRequest_timeRange() {
        assertThat(validator.validate(schedule(List.of(0), 24, 0, 12, 0))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(0), -1, 0, 12, 0))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(0), 10, 60, 12, 0))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(0), 10, 0, 12, 60))).isNotEmpty();
        assertThat(validator.validate(schedule(List.of(0), 23, 59, 23, 59))).isEmpty();
    }

    @Test
    @DisplayName("요일 배열이 비어 있으면 거부한다")
    void scheduleRequest_requiresAtLeastOneDay() {
        assertThat(validator.validate(schedule(List.of(), 10, 0, 12, 0))).isNotEmpty();
    }

    @Test
    @DisplayName("일정 유형은 fixed/variable 만 허용한다")
    void scheduleRequest_typePattern() {
        assertThat(validator.validate(new ScheduleRequest("알바", "hacked", List.of(0), 10, 0, 12, 0)))
                .isNotEmpty();
        assertThat(validator.validate(new ScheduleRequest("알바", "fixed", List.of(0), 10, 0, 12, 0)))
                .isEmpty();
        assertThat(validator.validate(new ScheduleRequest("알바", "VARIABLE", List.of(0), 10, 0, 12, 0)))
                .isEmpty();
    }

    private ScheduleRequest schedule(List<Integer> days, int sh, int sm, int eh, int em) {
        return new ScheduleRequest("알바", "fixed", days, sh, sm, eh, em);
    }

    // ─────────────────────── 회원가입 비밀번호 ───────────────────────

    @Test
    @DisplayName("비밀번호 12자 미만은 거부한다")
    void signupRequest_rejectsShortPassword() {
        assertThat(validator.validate(signup("1234"))).isNotEmpty();           // 예전 최소 길이
        assertThat(validator.validate(signup("elevenchars"))).isNotEmpty();    // 11자
        assertThat(validator.validate(signup("twelvechars1"))).isEmpty();      // 12자
    }

    @Test
    @DisplayName("BCrypt 가 무시하는 73자 이상은 거부한다")
    void signupRequest_rejectsOverlongPassword() {
        assertThat(validator.validate(signup("a".repeat(73)))).isNotEmpty();
        assertThat(validator.validate(signup("a".repeat(72)))).isEmpty();
    }

    private SignupRequest signup(String password) {
        return new SignupRequest("test@example.com", password, "닉네임", null,
                true, true, true, true, false);
    }

    // ─────────────────────── @아이디 형식 ───────────────────────

    @Test
    @DisplayName("@아이디는 @ + 2~20자 형식만 허용한다")
    void userUpdateRequest_handleFormat() {
        assertThat(validator.validate(profile("@minji"))).isEmpty();
        assertThat(validator.validate(profile("@min.ji_1"))).isEmpty();
        assertThat(validator.validate(profile("minji"))).isNotEmpty();          // @ 없음
        assertThat(validator.validate(profile("@a"))).isNotEmpty();             // 너무 짧음
        assertThat(validator.validate(profile("@" + "a".repeat(21)))).isNotEmpty(); // 너무 김
        assertThat(validator.validate(profile("@min ji"))).isNotEmpty();        // 공백
        assertThat(validator.validate(profile("@민지"))).isNotEmpty();          // 허용 문자 아님
    }

    private UserUpdateRequest profile(String handle) {
        return new UserUpdateRequest("닉네임", handle, null);
    }

    // ─────────────────────── 모임 생성 (status 제거 확인) ───────────────────────

    @Test
    @DisplayName("모임 생성 요청에는 status 필드가 없다 (서버가 확정 슬롯으로 계산)")
    void meetingCreateRequest_hasNoStatusField() {
        assertThat(MeetingCreateRequest.class.getRecordComponents())
                .extracting(java.lang.reflect.RecordComponent::getName)
                .containsExactly("name", "emoji", "members", "nextLabel")
                .doesNotContain("status");
    }
}
