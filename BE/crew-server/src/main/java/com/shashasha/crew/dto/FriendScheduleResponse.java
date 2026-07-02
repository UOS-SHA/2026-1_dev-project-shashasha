package com.shashasha.crew.dto;

/**
 * 친구 시간표 항목 응답 (GET /friends/{id}/schedules).
 * FE(friends/index.tsx)의 friendSchedules 항목 모양과 맞췄다:
 *   { day, title, time, type }
 *   - day   : 요일 라벨 ("월" ~ "일")
 *   - title : 일정 제목
 *   - time  : "10:00 - 12:00" 형식
 *   - type  : "고정" 또는 "변동"
 *
 * 하나의 일정이 여러 요일에 걸치면, 요일마다 한 항목씩 펼쳐서 내려준다.
 */
public record FriendScheduleResponse(
        String day,
        String title,
        String time,
        String type
) {
}
