package com.shashasha.crew.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청 (POST /auth/signup 의 body).
 *
 * 검증 애너테이션(@Email 등)을 통과하지 못하면 Spring 이 자동으로 400 으로 막아준다.
 * notificationEnabled / personalizeEnabled / agreedMarketing 은 안 보내면 null 이 되어
 * 서비스에서 기본값으로 처리한다(Boolean 객체 타입을 쓴 이유).
 */
public record SignupRequest(
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "이메일 형식이 올바르지 않습니다")
        String email,

        // 4자였을 때는 가능한 조합이 너무 적어 흔한 후보 목록만으로도 뚫린다.
        // 길이가 곧 대입 공격 비용이므로 12자 이상을 요구한다. (로그인 시도 제한은 LoginAttemptGuard)
        // 기존 계정의 비밀번호는 그대로 쓸 수 있고, 이 규칙은 새로 만드는 계정에만 적용된다.
        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 12, max = 72, message = "비밀번호는 12자 이상이어야 합니다")
        String password,

        @NotBlank(message = "닉네임은 필수입니다")
        @Size(max = 12, message = "닉네임은 최대 12자입니다")
        String nickname,

        @Size(max = 40, message = "한줄 소개는 최대 40자입니다")
        String bio,

        Boolean notificationEnabled,
        Boolean personalizeEnabled,
        Boolean agreedService,
        Boolean agreedPrivacy,
        Boolean agreedMarketing
) {
}
