package com.shashasha.crew.repository;

import com.shashasha.crew.domain.MeetingMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 모임 멤버 데이터의 DB 접근 창구.
 *
 *   findByMeetingId                    → 이 모임의 멤버 전원
 *   existsByMeetingIdAndUserId         → 이 사람이 이미 멤버인지 (중복 참가 방지)
 *   countByMeetingId                   → 전체 멤버 수 (가능 인원 비율 계산의 분모)
 */
public interface MeetingMemberRepository extends JpaRepository<MeetingMember, Long> {

    List<MeetingMember> findByMeetingId(Long meetingId);

    boolean existsByMeetingIdAndUserId(Long meetingId, Long userId);

    long countByMeetingId(Long meetingId);
}
