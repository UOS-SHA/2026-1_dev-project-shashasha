package com.shashasha.crew.service;

import com.shashasha.crew.domain.Schedule;
import com.shashasha.crew.dto.ScheduleRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 일정 시각 관계 검증 테스트 (보안 자문서: 일정 요일 및 시간 값 검증 누락).
 *
 * 각 값의 범위는 ScheduleRequest 의 @Min/@Max 가 막고(RequestValidationTest 참고),
 * "시작 < 종료" 같은 필드 사이의 관계는 애너테이션으로 표현할 수 없어 서비스가 검증한다.
 *
 * 시작이 종료보다 뒤인 일정이 저장되면 MatchingService 의 겹침 판정이 거의 항상 거짓이 되어,
 * 실제로 바쁜 사람이 한가한 사람으로 집계되고 추천 시간대가 틀어진다.
 */
class ScheduleServiceTest {

    private static final long USER_ID = 1L;

    private ScheduleRepository scheduleRepository;
    private ScheduleService scheduleService;

    @BeforeEach
    void setUp() {
        scheduleRepository = mock(ScheduleRepository.class);
        scheduleService = new ScheduleService(scheduleRepository);
    }

    private ScheduleRequest request(List<Integer> days, int sh, int sm, int eh, int em) {
        return new ScheduleRequest("알바", "fixed", days, sh, sm, eh, em);
    }

    @Test
    @DisplayName("종료가 시작보다 빠르면 400 으로 거부된다 (18:00 → 10:00)")
    void create_rejectsEndBeforeStart() {
        assertThatThrownBy(() -> scheduleService.create(USER_ID, request(List.of(0), 18, 0, 10, 0)))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(e.getError()).isEqualTo("INVALID_SCHEDULE_TIME_RANGE");
                });

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("시작과 종료가 같으면 400 으로 거부된다 (길이 0인 일정)")
    void create_rejectsEqualStartAndEnd() {
        assertThatThrownBy(() -> scheduleService.create(USER_ID, request(List.of(0), 10, 30, 10, 30)))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("INVALID_SCHEDULE_TIME_RANGE"));
    }

    @Test
    @DisplayName("분 단위까지 비교한다 (10:30 → 10:00 은 거부)")
    void create_comparesMinutesToo() {
        assertThatThrownBy(() -> scheduleService.create(USER_ID, request(List.of(0), 10, 30, 10, 0)))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("INVALID_SCHEDULE_TIME_RANGE"));
    }

    @Test
    @DisplayName("같은 요일을 중복 선택하면 400 으로 거부된다")
    void create_rejectsDuplicateDays() {
        assertThatThrownBy(() -> scheduleService.create(USER_ID, request(List.of(0, 2, 0), 10, 0, 12, 0)))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(e.getError()).isEqualTo("DUPLICATED_SCHEDULE_DAY");
                });

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("정상 일정은 저장된다")
    void create_savesValidSchedule() {
        when(scheduleRepository.save(any(Schedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = scheduleService.create(USER_ID, request(List.of(0, 4), 10, 0, 12, 30));

        assertThat(response.sh()).isEqualTo(10);
        assertThat(response.em()).isEqualTo(30);
        assertThat(response.days()).containsExactly(0, 4);
        verify(scheduleRepository).save(any(Schedule.class));
    }

    @Test
    @DisplayName("수정도 같은 규칙으로 검증한다 (일정을 찾기 전에 막는다)")
    void update_appliesSameValidation() {
        assertThatThrownBy(() -> scheduleService.update(USER_ID, 5L, request(List.of(0), 23, 0, 1, 0)))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("INVALID_SCHEDULE_TIME_RANGE"));

        // 검증이 먼저 돌아서 DB 조회조차 하지 않는다.
        verify(scheduleRepository, never()).findByIdAndUserId(any(), any());
    }
}
