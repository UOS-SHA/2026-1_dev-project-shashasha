package com.shashasha.crew.dto;

import com.shashasha.crew.domain.User;

/**
 * 친구 목록 항목 응답 (GET /friends).
 * FE(friends/index.tsx)의 friend 카드 모양과 맞췄다:
 *   { id, name, handle, status, color }
 *   - id     : 상대방 User.id (시간표 조회 시 /friends/{id}/schedules 로 사용)
 *   - name   : 상대방 닉네임
 *   - status : 상대방 한줄 소개(bio) — 없으면 null
 *   - color  : 아바타 색 (서버가 목록 순서대로 팔레트에서 배정)
 */
public record FriendResponse(
        Long id,
        String name,
        String handle,
        String status,
        String color
) {
    public static FriendResponse from(User friend, String color) {
        return new FriendResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getHandle(),
                friend.getBio(),
                color
        );
    }
}
