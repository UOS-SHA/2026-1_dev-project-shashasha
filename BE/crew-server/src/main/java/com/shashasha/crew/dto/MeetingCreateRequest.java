package com.shashasha.crew.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * 모임 생성 요청 (POST /meetings 의 body).
 * @NotBlank, @Min 같은 검증 애너테이션을 붙이면
 * 잘못된 값이 들어왔을 때 Spring 이 자동으로 400 에러로 막아준다.
 */
public record MeetingCreateRequest(
        @NotBlank(message = "모임 이름은 필수입니다") String name,
        String emoji,
        @Min(value = 1, message = "멤버 수는 1 이상이어야 합니다") int members,
        String nextLabel,
        @NotBlank String status   // "confirmed" 또는 "voting"
) {
}
