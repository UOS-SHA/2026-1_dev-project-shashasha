package com.shashasha.crew.repository;

import com.shashasha.crew.domain.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 친구 관계 데이터의 DB 접근 창구.
 *
 *   findByOwnerId                    → 내 친구 목록
 *   existsByOwnerIdAndFriendUserId   → 이미 친구인지 (중복 추가 방지 / 시간표 열람 권한 확인)
 */
public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findByOwnerId(Long ownerId);

    boolean existsByOwnerIdAndFriendUserId(Long ownerId, Long friendUserId);
}
