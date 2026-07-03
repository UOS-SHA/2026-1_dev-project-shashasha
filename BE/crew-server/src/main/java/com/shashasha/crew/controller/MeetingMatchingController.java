package com.shashasha.crew.controller;

import com.shashasha.crew.dto.SlotSelectionRequest;
import com.shashasha.crew.dto.TimetableResponse;
import com.shashasha.crew.dto.VoteStateResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.MatchingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 일정 매칭 API 입구 (/meetings/{meetingId}/**).
 * JwtAuthFilter 로 보호되며(투표는 "누가" 했는지 알아야 하므로), 필터가 담아둔 userId 를 사용한다.
 */
@RestController
@RequestMapping("/meetings/{meetingId}")
public class MeetingMatchingController {

    private final MatchingService matchingService;

    public MeetingMatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /** GET /meetings/{id}/timetable → 통합 시간표(가능 인원 그리드) + 골든타임 Top3 */
    @GetMapping("/timetable")
    public TimetableResponse getTimetable(HttpServletRequest request, @PathVariable Long meetingId) {
        return matchingService.getTimetable(meetingId, userId(request));
    }

    /** GET /meetings/{id}/vote → 투표 현황(골든 슬롯 득표 + 내 표 + 확정 여부) */
    @GetMapping("/vote")
    public VoteStateResponse getVoteState(HttpServletRequest request, @PathVariable Long meetingId) {
        return matchingService.getVoteState(meetingId, userId(request));
    }

    /** GET /meetings/{id}/members → 이 모임 멤버 이름 목록 (활동 기록 참석자 선택용) */
    @GetMapping("/members")
    public List<String> getMembers(HttpServletRequest request, @PathVariable Long meetingId) {
        return matchingService.getMemberNames(meetingId, userId(request));
    }

    /** POST /meetings/{id}/vote → 투표(또는 재투표) */
    @PostMapping("/vote")
    public VoteStateResponse vote(HttpServletRequest request, @PathVariable Long meetingId,
                                  @Valid @RequestBody SlotSelectionRequest body) {
        return matchingService.vote(meetingId, userId(request), body.slotId());
    }

    /** POST /meetings/{id}/confirm → 시간대 확정 */
    @PostMapping("/confirm")
    public VoteStateResponse confirm(HttpServletRequest request, @PathVariable Long meetingId,
                                     @Valid @RequestBody SlotSelectionRequest body) {
        return matchingService.confirm(meetingId, userId(request), body.slotId());
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
    }
}
