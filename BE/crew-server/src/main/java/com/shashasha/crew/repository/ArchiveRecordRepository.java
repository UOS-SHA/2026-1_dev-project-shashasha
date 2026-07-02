package com.shashasha.crew.repository;

import com.shashasha.crew.domain.ArchiveRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 활동 기록 데이터의 DB 접근 창구.
 *
 *   findByUserIdOrderByRoundDesc → 내 기록을 최신 회차부터 (FE 기본 정렬과 동일)
 *   countByUserId                → 다음 회차 번호를 매길 때 사용
 *   findByIdAndUserId            → 그 기록이 "내 것"일 때만 가져오기
 */
public interface ArchiveRecordRepository extends JpaRepository<ArchiveRecord, Long> {

    List<ArchiveRecord> findByUserIdOrderByRoundDesc(Long userId);

    long countByUserId(Long userId);

    Optional<ArchiveRecord> findByIdAndUserId(Long id, Long userId);
}
