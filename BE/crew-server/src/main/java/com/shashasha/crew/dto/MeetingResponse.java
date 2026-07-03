package com.shashasha.crew.dto;

import com.shashasha.crew.domain.Meeting;

/**
 * 클라이언트(앱)에게 내려줄 모임 응답 모양.
 * FE 의 Meeting 타입과 똑같이 맞췄다:
 *   { id, name, emoji, members, nextLabel, status: "confirmed" | "voting" }
 *
 * record = "값만 담는 불변 객체"를 한 줄로 만드는 자바 문법.
 */
public record MeetingResponse(
        Long id,
        String name,
        String emoji,
        int members,
        String nextLabel,
        String status
) {
    /** Meeting 엔티티 → 응답 DTO. members 는 실제 멤버 수를 넣어준다(시간표의 전체 인원과 일치시키기 위함). */
    public static MeetingResponse of(Meeting m, int members) {
        return new MeetingResponse(
                m.getId(),
                m.getName(),
                m.getEmoji(),
                members,
                m.getNextLabel(),
                m.getStatus().name().toLowerCase() // CONFIRMED → "confirmed"
        );
    }
}
