package com.shashasha.crew.controller;

import com.shashasha.crew.dto.UserProfileResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 본인 관련 API 입구 (/users/**).
 * 이 경로는 JwtAuthFilter 가 먼저 토큰을 검사하므로, 여기 도달했다는 건 이미 인증을 통과했다는 뜻이다.
 * 필터가 request 에 담아둔 userId 를 꺼내 "내 정보"를 구분한다 (URL 에 내 id 를 넣지 않음).
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** GET /users/me → 토큰 주인의 프로필 조회 */
    @GetMapping("/me")
    public UserProfileResponse getMe(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
        return userService.getMyProfile(userId);
    }
}
