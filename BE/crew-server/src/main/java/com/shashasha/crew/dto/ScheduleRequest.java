package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 개인 일정 생성/수정 요청 (POST /schedules, PUT /schedules/{id} 의 body).
 * FE 의 Schedule 타입과 필드명을 맞춰, 앱이 보내는 JSON 을 그대로 받는다:
 *   { t, tp, days, sh, sm, eh, em }
 */
public record ScheduleRequest(
        @NotBlank(message = "일정 제목은 필수입니다") String t,   // 제목
        @NotBlank String tp,                                   // "fixed" 또는 "variable"
        @NotEmpty(message = "요일을 하나 이상 선택해야 합니다") List<Integer> days,
        @NotNull Integer sh, @NotNull Integer sm,              // 시작 시/분
        @NotNull Integer eh, @NotNull Integer em               // 종료 시/분
) {
}
