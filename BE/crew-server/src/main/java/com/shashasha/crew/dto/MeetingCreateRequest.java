package com.shashasha.crew.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * 모임 생성·수정 요청 (POST /meetings, PUT /meetings/{id} 의 body).
 * @NotBlank, @Min 같은 검증 애너테이션을 붙이면
 * 잘못된 값이 들어왔을 때 Spring 이 자동으로 400 에러로 막아준다.
 *
 * status 는 일부러 받지 않는다: 확정 여부는 서버가 확정 슬롯으로 판단하며,
 * 확정은 POST /meetings/{id}/confirm 전용 동작이다. (Meeting.getStatus() 주석 참고)
 */
public record MeetingCreateRequest(
        @NotBlank(message = "모임 이름은 필수입니다") String name,
        String emoji,
        @Min(value = 1, message = "멤버 수는 1 이상이어야 합니다") int members,
        String nextLabel
) {
}
