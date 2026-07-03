package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 시간대 선택 요청 (POST /meetings/{id}/vote, POST /meetings/{id}/confirm 의 body).
 * FE 가 고른 후보 시간대의 코드(GoldenSlot.id)를 담는다. 예: { "slotId": "sat-14" }
 */
public record SlotSelectionRequest(
        @NotBlank(message = "시간대(slotId)는 필수입니다") String slotId
) {
}
