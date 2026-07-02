package com.shashasha.crew.domain;

import jakarta.persistence.*;

/**
 * 친구 관계(Friend) 엔티티 = "ownerId 가 friendUserId 를 친구로 추가했다" 는 한 줄.
 *
 * 단방향으로 저장한다(내 친구 목록 기준). 서로 친구가 되려면 두 줄이 생기는 구조지만,
 * MVP 단계에서는 "내가 추가한 친구 목록"만 있으면 화면(friends/index)이 동작한다.
 */
@Entity
@Table(
        name = "friend",
        // 같은 사람을 두 번 친구로 추가하지 못하게 (ownerId, friendUserId) 조합을 유일하게 묶는다.
        uniqueConstraints = @UniqueConstraint(columnNames = {"ownerId", "friendUserId"})
)
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;        // 친구 목록의 주인 (나)

    @Column(nullable = false)
    private Long friendUserId;   // 내가 추가한 상대방의 User.id

    protected Friend() {
    }

    public Friend(Long ownerId, Long friendUserId) {
        this.ownerId = ownerId;
        this.friendUserId = friendUserId;
    }

    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public Long getFriendUserId() { return friendUserId; }
}
