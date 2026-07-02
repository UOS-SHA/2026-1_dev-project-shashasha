package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * 활동 기록 생성/수정 요청 (POST /archives, PUT /archives/{id} 의 body).
 * FE(archive/new.tsx)의 NewArchiveRecord 와 맞췄다:
 *   { date, place, summary, attendees[], absentees[] }
 * 나머지(회차/요일/색상 등)는 서버가 자동으로 채우므로 받지 않는다.
 */
public record ArchiveCreateRequest(
        @NotBlank(message = "날짜는 필수입니다") String date,  // "2025.04.12"
        String place,
        String summary,
        List<String> attendees,
        List<String> absentees
) {
}
