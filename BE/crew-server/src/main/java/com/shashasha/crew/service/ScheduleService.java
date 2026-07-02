package com.shashasha.crew.service;

import com.shashasha.crew.domain.Schedule;
import com.shashasha.crew.domain.ScheduleType;
import com.shashasha.crew.dto.ScheduleRequest;
import com.shashasha.crew.dto.ScheduleResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 개인 일정 비즈니스 로직.
 * 모든 메서드는 "내 것"만 다룬다 — userId 로 소유권을 확인해 남의 일정은 건드리지 못하게 한다.
 */
@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    /** 내 일정 전체 조회 */
    @Transactional(readOnly = true)
    public List<ScheduleResponse> findMine(Long userId) {
        return scheduleRepository.findByUserId(userId).stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    /** 일정 생성 */
    @Transactional
    public ScheduleResponse create(Long userId, ScheduleRequest req) {
        Schedule schedule = new Schedule(
                userId,
                req.t(),
                parseType(req.tp()),
                req.days(),
                req.sh(), req.sm(),
                req.eh(), req.em()
        );
        return ScheduleResponse.from(scheduleRepository.save(schedule));
    }

    /** 일정 수정 (내 일정이 아니면 404) */
    @Transactional
    public ScheduleResponse update(Long userId, Long id, ScheduleRequest req) {
        Schedule schedule = getMineOrThrow(userId, id);
        schedule.update(
                req.t(),
                parseType(req.tp()),
                req.days(),
                req.sh(), req.sm(),
                req.eh(), req.em()
        );
        return ScheduleResponse.from(schedule);
    }

    /** 일정 삭제 (내 일정이 아니면 404) */
    @Transactional
    public void delete(Long userId, Long id) {
        Schedule schedule = getMineOrThrow(userId, id);
        scheduleRepository.delete(schedule);
    }

    /** id 로 "내" 일정을 찾되, 없으면(또는 남의 것이면) 404. */
    private Schedule getMineOrThrow(Long userId, Long id) {
        return scheduleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SCHEDULE_NOT_FOUND",
                        "일정을 찾을 수 없습니다"));
    }

    /** 문자열 "fixed"/"variable" → enum. 잘못된 값이면 400. */
    private ScheduleType parseType(String tp) {
        try {
            return ScheduleType.valueOf(tp.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_SCHEDULE_TYPE",
                    "tp 는 fixed 또는 variable 이어야 합니다");
        }
    }
}
