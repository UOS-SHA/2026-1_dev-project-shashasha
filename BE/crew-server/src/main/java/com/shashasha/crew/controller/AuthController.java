package com.shashasha.crew.controller;

import com.shashasha.crew.dto.AuthResponse;
import com.shashasha.crew.dto.LoginRequest;
import com.shashasha.crew.dto.SignupRequest;
import com.shashasha.crew.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API 입구 (/auth/**).
 * 이 두 엔드포인트는 토큰이 없어도 호출할 수 있다(🔓). 토큰을 "발급받는" 곳이기 때문.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /auth/signup → 회원가입. 성공하면 201 과 토큰+사용자 정보를 응답. */
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    /** POST /auth/login → 로그인. 성공하면 200 과 토큰+사용자 정보를 응답. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
