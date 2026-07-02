package com.shashasha.crew.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 친구 추가 요청 (POST /friends 의 body).
 * 상대방의 @아이디(handle)로 추가한다. 예: { "handle": "@minji" }
 */
public record FriendAddRequest(
        @NotBlank(message = "추가할 친구의 아이디(handle)는 필수입니다") String handle
) {
}
