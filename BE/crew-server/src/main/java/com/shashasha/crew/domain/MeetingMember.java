package com.shashasha.crew.domain;

import jakarta.persistence.*;

/**
 * 모임 멤버(MeetingMember) 엔티티 = "userId 가 meetingId 모임에 속해 있다" 는 한 줄.
 *
 * 일정 매칭(가능 인원 계산)은 "이 모임에 누가 있는지"를 알아야 하므로,
 * 모임과 사용자를 잇는 이 연결 테이블이 필요하다.
 */
@Entity
@Table(
        name = "meeting_member",
        // 같은 사람이 같은 모임에 두 번 들어가지 못하게 (meetingId, userId) 조합을 유일하게 묶는다.
        uniqueConstraints = @UniqueConstraint(columnNames = {"meetingId", "userId"})
)
public class MeetingMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long meetingId;

    @Column(nullable = false)
    private Long userId;

    protected MeetingMember() {
    }

    public MeetingMember(Long meetingId, Long userId) {
        this.meetingId = meetingId;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public Long getMeetingId() { return meetingId; }
    public Long getUserId() { return userId; }
}
