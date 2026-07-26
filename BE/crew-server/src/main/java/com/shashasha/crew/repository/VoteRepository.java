package com.shashasha.crew.repository;

import com.shashasha.crew.domain.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 투표 데이터의 DB 접근 창구.
 *
 *   findByMeetingId            → 이 모임의 모든 표 (시간대별 득표 집계용)
 *   findByMeetingIdAndUserId   → 내 표 (재투표 시 갱신, myVote 표시)
 */
public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByMeetingId(Long meetingId);

    Optional<Vote> findByMeetingIdAndUserId(Long meetingId, Long userId);

    /** 이 모임의 표 전체 삭제 (모임 삭제 시 정리용) */
    void deleteByMeetingId(Long meetingId);
}
