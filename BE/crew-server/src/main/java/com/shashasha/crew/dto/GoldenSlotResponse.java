package com.shashasha.crew.dto;

/**
 * 골든타임 후보 시간대 하나. FE(meeting/_layout.tsx)의 GoldenSlot 과 맞췄다:
 *   { id, day, time, available, votes }
 *   - id        : 시간대 코드 (예: "sat-14") — 투표/확정 시 이 값을 보낸다
 *   - day       : 요일 라벨 (예: "토요일")
 *   - time      : 시각 라벨 (예: "오후 2:00")
 *   - available : 이 시간에 비어 있는(참석 가능한) 멤버 수
 *   - votes     : 이 시간대에 투표한 멤버 수
 */
public record GoldenSlotResponse(
        String id,
        String day,
        String time,
        int available,
        int votes
) {
}
