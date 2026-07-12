package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 내 프로필 수정 요청 (PUT /users/me 의 body).
 *
 * 수정 가능한 항목은 닉네임/아이디(handle)/한줄소개뿐이다.
 * 이메일·가입일은 변경 대상이 아니므로 여기 포함하지 않는다.
 * 검증 애너테이션을 통과하지 못하면 Spring 이 자동으로 400 으로 막아준다.
 */
public record UserUpdateRequest(
        @NotBlank(message = "닉네임은 필수입니다")
        @Size(max = 12, message = "닉네임은 최대 12자입니다")
        String nickname,

        @Size(max = 20, message = "아이디는 최대 20자입니다")
        String handle,

        @Size(max = 40, message = "한줄 소개는 최대 40자입니다")
        String bio
) {
}
