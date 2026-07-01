package com.shashasha.crew.repository;

import com.shashasha.crew.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 모임 데이터의 DB 접근 창구.
 *
 * JpaRepository<Meeting, Long> 만 상속하면
 * findAll(), findById(), save(), delete() ... 같은 메서드를
 * Spring 이 실행 시점에 자동으로 구현해 준다. (직접 작성할 코드 0줄)
 *
 * <Meeting, Long> = "Meeting 엔티티를 다루고, 그 PK 타입은 Long" 이라는 뜻.
 */
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
}
