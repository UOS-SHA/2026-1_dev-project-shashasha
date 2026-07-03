package com.shashasha.crew.dto;

import java.util.List;

/**
 * 통합 시간표 응답 (GET /meetings/{id}/timetable).
 * FE(meeting/timetable.tsx)의 그리드 + 골든타임 Top3 를 한 번에 내려준다.
 *   - totalMembers : 전체 멤버 수 (가능 인원 비율의 분모)
 *   - days         : 열 라벨 (예: ["금","토","일"])
 *   - times        : 행 라벨 (예: ["10","12",...])
 *   - availability : [행(시간)][열(요일)] 별 가능 인원 수
 *   - golden       : 가능 인원이 가장 많은 Top 3 시간대
 */
public record TimetableResponse(
        int totalMembers,
        List<String> days,
        List<String> times,
        List<List<Integer>> availability,
        List<GoldenSlotResponse> golden
) {
}
