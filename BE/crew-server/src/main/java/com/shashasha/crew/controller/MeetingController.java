package com.shashasha.crew.controller;

import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 모임 API 입구.
 *
 * @RestController : 이 클래스의 반환값을 자동으로 JSON 으로 바꿔준다.
 * @RequestMapping("/meetings") : 이 컨트롤러의 모든 주소는 /meetings 로 시작.
 */
@RestController
@RequestMapping("/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    /** GET /meetings  → 내가 가입한 모임 목록 (홈 화면의 meetings 배열) */
    @GetMapping
    public List<MeetingResponse> getMeetings(HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
        return meetingService.findMyMeetings(userId);
    }

    /** GET /meetings/{id} → 모임 단건 조회 (내 모임만) */
    @GetMapping("/{id}")
    public MeetingResponse getMeeting(HttpServletRequest httpRequest, @PathVariable Long id) {
        Long userId = (Long) httpRequest.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
        return meetingService.findById(id, userId);
    }

    /** POST /meetings → 모임 생성. 성공하면 201 Created 와 만든 모임을 응답. (만든 사람이 첫 멤버) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingResponse createMeeting(HttpServletRequest httpRequest,
                                         @Valid @RequestBody MeetingCreateRequest request) {
        Long userId = (Long) httpRequest.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
        return meetingService.create(request, userId);
    }

    /** PUT /meetings/{id} → 모임 수정. 수정된 모임을 응답. */
    @PutMapping("/{id}")
    public MeetingResponse updateMeeting(@PathVariable Long id,
                                         @Valid @RequestBody MeetingCreateRequest request) {
        return meetingService.update(id, request);
    }

    /** DELETE /meetings/{id} → 모임 삭제. 성공하면 204 No Content. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeeting(@PathVariable Long id) {
        meetingService.delete(id);
    }
}
