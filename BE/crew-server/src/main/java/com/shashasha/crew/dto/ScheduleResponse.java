package com.shashasha.crew.dto;

import com.shashasha.crew.domain.Schedule;

import java.util.List;

/**
 * 개인 일정 응답 (GET /schedules 등).
 * FE 의 Schedule 타입과 똑같은 모양으로 내려준다:
 *   { id, t, tp, days, sh, sm, eh, em }
 * (id 는 수정/삭제 때 어떤 일정인지 가리키기 위해 함께 준다.)
 */
public record ScheduleResponse(
        Long id,
        String t,
        String tp,
        List<Integer> days,
        int sh, int sm,
        int eh, int em
) {
    public static ScheduleResponse from(Schedule s) {
        return new ScheduleResponse(
                s.getId(),
                s.getTitle(),
                s.getType().name().toLowerCase(), // FIXED → "fixed"
                s.getDays(),
                s.getStartHour(), s.getStartMinute(),
                s.getEndHour(), s.getEndMinute()
        );
    }
}
