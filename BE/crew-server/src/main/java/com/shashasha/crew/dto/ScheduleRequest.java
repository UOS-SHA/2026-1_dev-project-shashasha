package com.shashasha.crew.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 개인 일정 생성/수정 요청 (POST /schedules, PUT /schedules/{id} 의 body).
 * FE 의 Schedule 타입과 필드명을 맞춰, 앱이 보내는 JSON 을 그대로 받는다:
 *   { t, tp, days, sh, sm, eh, em }
 *
 * 값이 "있는지"만 보면 부족하다. 요일 8, 시각 25시처럼 존재할 수 없는 값이 저장되면
 * 통합 시간표의 겹침 계산(MatchingService)이 그 일정을 없는 것처럼 지나쳐, 실제로는 바쁜 사람이
 * 한가한 사람으로 집계되고 추천 시간대가 틀어진다. 그래서 범위까지 여기서 막는다.
 * (시작 < 종료 같은 "필드 사이의 관계"는 애너테이션으로 표현할 수 없어 ScheduleService 에서 검증한다)
 */
public record ScheduleRequest(
        @NotBlank(message = "일정 제목은 필수입니다")
        @Size(max = 100, message = "일정 제목은 100자 이하여야 합니다")
        String t,                                              // 제목

        @NotBlank(message = "일정 유형은 필수입니다")
        @Pattern(regexp = "(?i)fixed|variable", message = "tp 는 fixed 또는 variable 이어야 합니다")
        String tp,                                             // "fixed" 또는 "variable"

        @NotEmpty(message = "요일을 하나 이상 선택해야 합니다")
        List<
                @NotNull(message = "요일 값은 비어 있을 수 없습니다")
                @Min(value = 0, message = "요일은 0(월) 이상이어야 합니다")
                @Max(value = 6, message = "요일은 6(일) 이하여야 합니다")
                Integer
        > days,

        @NotNull(message = "시작 시각은 필수입니다")
        @Min(value = 0, message = "시작 시는 0 이상이어야 합니다")
        @Max(value = 23, message = "시작 시는 23 이하여야 합니다")
        Integer sh,                                            // 시작 시

        @NotNull(message = "시작 분은 필수입니다")
        @Min(value = 0, message = "시작 분은 0 이상이어야 합니다")
        @Max(value = 59, message = "시작 분은 59 이하여야 합니다")
        Integer sm,                                            // 시작 분

        @NotNull(message = "종료 시각은 필수입니다")
        @Min(value = 0, message = "종료 시는 0 이상이어야 합니다")
        @Max(value = 23, message = "종료 시는 23 이하여야 합니다")
        Integer eh,                                            // 종료 시

        @NotNull(message = "종료 분은 필수입니다")
        @Min(value = 0, message = "종료 분은 0 이상이어야 합니다")
        @Max(value = 59, message = "종료 분은 59 이하여야 합니다")
        Integer em                                             // 종료 분
) {
}
