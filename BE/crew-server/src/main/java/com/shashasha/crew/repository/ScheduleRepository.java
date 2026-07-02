package com.shashasha.crew.repository;

import com.shashasha.crew.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 개인 일정 데이터의 DB 접근 창구.
 *
 * 메서드 이름 규칙만으로 쿼리가 자동 생성된다:
 *   findByUserId        → 특정 사용자의 일정 전체
 *   findByIdAndUserId   → 그 일정이 "내 것"일 때만 가져오기 (남의 일정 접근 차단)
 */
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByUserId(Long userId);

    Optional<Schedule> findByIdAndUserId(Long id, Long userId);
}
