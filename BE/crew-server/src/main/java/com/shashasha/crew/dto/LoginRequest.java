package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 로그인 요청 (POST /auth/login 의 body).
 */
public record LoginRequest(
        @NotBlank(message = "이메일은 필수입니다") String email,
        @NotBlank(message = "비밀번호는 필수입니다") String password
) {
}
