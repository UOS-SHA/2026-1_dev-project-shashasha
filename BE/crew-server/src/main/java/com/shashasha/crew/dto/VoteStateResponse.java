package com.shashasha.crew.dto;

import java.util.List;

/**
 * 투표 화면 상태 응답 (GET /meetings/{id}/vote).
 * FE(meeting/vote.tsx)의 useMeeting 스토어가 쓰는 값과 맞췄다:
 *   - totalMembers : 전체 멤버 수
 *   - slots        : 투표 후보(골든) 시간대 목록 (각자 votes 포함)
 *   - myVote       : 내가 투표한 시간대 코드 (아직 안 했으면 null)
 *   - confirmedId  : 확정된 시간대 코드 (아직 확정 전이면 null)
 */
public record VoteStateResponse(
        int totalMembers,
        List<GoldenSlotResponse> slots,
        String myVote,
        String confirmedId
) {
}
