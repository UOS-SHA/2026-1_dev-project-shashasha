package com.shashasha.crew.domain;

import jakarta.persistence.*;

/**
 * 일정 투표(Vote) 엔티티 = "userId 가 meetingId 모임에서 slotCode 시간대에 투표했다" 는 한 줄.
 *
 * 한 사람은 한 모임에서 하나의 시간대에만 투표할 수 있다(재투표 시 slotCode 만 바뀜).
 * slotCode 는 후보 시간대의 고유 코드(예: "sat-14" = 토요일 14시).
 */
@Entity
@Table(
        name = "vote",
        // 한 모임에서 한 사람당 표는 하나 (재투표는 이 줄의 slotCode 를 갱신)
        uniqueConstraints = @UniqueConstraint(columnNames = {"meetingId", "userId"})
)
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long meetingId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String slotCode;   // 투표한 후보 시간대 코드 (예: "sat-14")

    protected Vote() {
    }

    public Vote(Long meetingId, Long userId, String slotCode) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.slotCode = slotCode;
    }

    /** 다른 시간대로 표를 옮긴다. */
    public void changeSlot(String slotCode) {
        this.slotCode = slotCode;
    }

    public Long getId() { return id; }
    public Long getMeetingId() { return meetingId; }
    public Long getUserId() { return userId; }
    public String getSlotCode() { return slotCode; }
}
