package com.shashasha.crew.dto;

import com.shashasha.crew.domain.User;

/**
 * 회원가입/로그인 성공 시 내려주는 응답.
 * FE 는 token 을 저장소에 보관하고, 이후 모든 요청 헤더에 Bearer 로 붙인다.
 *   { "token": "...", "user": { "id": 1, "nickname": "지연", "email": "..." } }
 */
public record AuthResponse(
        String token,
        UserSummary user
) {
    /** 토큰 + User 엔티티 → 응답 DTO 로 변환 */
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(token, UserSummary.from(user));
    }

    /** 응답에 함께 담는 최소 사용자 정보 (비밀번호 등 민감 정보는 절대 포함하지 않음) */
    public record UserSummary(Long id, String nickname, String email) {
        public static UserSummary from(User user) {
            return new UserSummary(user.getId(), user.getNickname(), user.getEmail());
        }
    }
}
