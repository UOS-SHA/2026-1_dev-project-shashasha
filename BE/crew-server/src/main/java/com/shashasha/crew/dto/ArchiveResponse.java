package com.shashasha.crew.dto;

import com.shashasha.crew.domain.ArchiveRecord;

import java.util.List;

/**
 * 활동 기록 응답 (GET /archives 등).
 * FE 의 ArchiveRecord 타입과 똑같은 모양으로 내려준다.
 * (FE 는 id 를 문자열로 다루므로, 숫자 id 를 문자열로 바꿔 준다.)
 */
public record ArchiveResponse(
        String id,
        int round,
        String date,
        String day,
        String place,
        String title,
        String summary,
        List<String> attendees,
        List<String> absentees,
        int photos,
        String color,
        String thumbnail
) {
    public static ArchiveResponse from(ArchiveRecord r) {
        return new ArchiveResponse(
                String.valueOf(r.getId()),
                r.getRound(),
                r.getDate(),
                r.getDay(),
                r.getPlace(),
                r.getTitle(),
                r.getSummary(),
                r.getAttendees(),
                r.getAbsentees(),
                r.getPhotos(),
                r.getColor(),
                r.getThumbnail()
        );
    }
}
