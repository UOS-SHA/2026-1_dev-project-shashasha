package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 활동 기록 생성/수정 요청 (POST /archives, PUT /archives/{id} 의 body).
 *   { meetingId, date, place, summary, attendees[], absentees[] }
 * 나머지(회차/요일/색상 등)는 서버가 자동으로 채우므로 받지 않는다.
 * (meetingId 는 생성 시 필수. 수정 시에는 무시된다.)
 */
public record ArchiveCreateRequest(
        @NotNull(message = "모임 선택은 필수입니다") Long meetingId,
        @NotBlank(message = "날짜는 필수입니다") String date,  // "2025.04.12"
        String place,
        String summary,
        List<String> attendees,
        List<String> absentees
) {
}
