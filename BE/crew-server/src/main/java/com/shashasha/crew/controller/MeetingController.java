package com.shashasha.crew.controller;

import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.service.MeetingService;
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

    /** GET /meetings  → 모임 전체 목록 (홈 화면의 meetings 배열) */
    @GetMapping
    public List<MeetingResponse> getMeetings() {
        return meetingService.findAll();
    }

    /** GET /meetings/{id} → 모임 단건 조회 */
    @GetMapping("/{id}")
    public MeetingResponse getMeeting(@PathVariable Long id) {
        return meetingService.findById(id);
    }

    /** POST /meetings → 모임 생성. 성공하면 201 Created 와 만든 모임을 응답. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingResponse createMeeting(@Valid @RequestBody MeetingCreateRequest request) {
        return meetingService.create(request);
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
