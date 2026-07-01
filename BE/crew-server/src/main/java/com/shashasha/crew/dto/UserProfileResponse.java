package com.shashasha.crew.dto;

import com.shashasha.crew.domain.User;

import java.time.LocalDate;

/**
 * 내 프로필 조회 응답 (GET /users/me).
 * API_SPEC 의 예시 모양에 맞춤:
 *   { id, nickname, handle, email, bio, joinedAt }
 */
public record UserProfileResponse(
        Long id,
        String nickname,
        String handle,
        String email,
        String bio,
        LocalDate joinedAt
) {
    public static UserProfileResponse from(User u) {
        return new UserProfileResponse(
                u.getId(),
                u.getNickname(),
                u.getHandle(),
                u.getEmail(),
                u.getBio(),
                u.getJoinedAt().toLocalDate() // 가입 "날짜"만 (시각은 생략)
        );
    }
}
