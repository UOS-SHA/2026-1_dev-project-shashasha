package com.shashasha.crew.controller;

import com.shashasha.crew.dto.ScheduleRequest;
import com.shashasha.crew.dto.ScheduleResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.ScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 개인 일정 API 입구 (/schedules/**).
 * JwtAuthFilter 가 먼저 토큰을 검사하므로, 여기 도달했다는 건 로그인된 사용자라는 뜻이다.
 * 필터가 담아둔 userId 로 "내 일정"만 다룬다 (URL 에 내 id 를 넣지 않음).
 */
@RestController
@RequestMapping("/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    /** GET /schedules → 내 일정 전체 */
    @GetMapping
    public List<ScheduleResponse> getMySchedules(HttpServletRequest request) {
        return scheduleService.findMine(userId(request));
    }

    /** POST /schedules → 일정 생성 (201) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleResponse createSchedule(HttpServletRequest request,
                                           @Valid @RequestBody ScheduleRequest body) {
        return scheduleService.create(userId(request), body);
    }

    /** PUT /schedules/{id} → 일정 수정 */
    @PutMapping("/{id}")
    public ScheduleResponse updateSchedule(HttpServletRequest request,
                                           @PathVariable Long id,
                                           @Valid @RequestBody ScheduleRequest body) {
        return scheduleService.update(userId(request), id, body);
    }

    /** DELETE /schedules/{id} → 일정 삭제 (204) */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSchedule(HttpServletRequest request, @PathVariable Long id) {
        scheduleService.delete(userId(request), id);
    }

    /** 필터가 request 에 담아둔 "지금 요청한 사람"의 id 를 꺼낸다. */
    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
    }
}
