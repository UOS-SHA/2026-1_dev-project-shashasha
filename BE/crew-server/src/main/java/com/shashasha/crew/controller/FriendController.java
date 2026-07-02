package com.shashasha.crew.controller;

import com.shashasha.crew.dto.FriendAddRequest;
import com.shashasha.crew.dto.FriendResponse;
import com.shashasha.crew.dto.FriendScheduleResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.FriendService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 친구 API 입구 (/friends/**).
 * JwtAuthFilter 로 보호되며, 토큰 주인의 친구 관계만 다룬다.
 */
@RestController
@RequestMapping("/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    /** GET /friends → 내 친구 목록 */
    @GetMapping
    public List<FriendResponse> getMyFriends(HttpServletRequest request) {
        return friendService.findMine(userId(request));
    }

    /** POST /friends → @아이디로 친구 추가 (201) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FriendResponse addFriend(HttpServletRequest request,
                                    @Valid @RequestBody FriendAddRequest body) {
        return friendService.add(userId(request), body.handle());
    }

    /** GET /friends/{id}/schedules → 친구의 시간표 (친구인 경우에만) */
    @GetMapping("/{id}/schedules")
    public List<FriendScheduleResponse> getFriendSchedules(HttpServletRequest request,
                                                           @PathVariable Long id) {
        return friendService.findFriendSchedules(userId(request), id);
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
    }
}
