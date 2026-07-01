package com.shashasha.crew.service;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingStatus;
import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 모임 관련 비즈니스 로직.
 * Controller 와 Repository 사이에서 "실제 처리"를 담당한다.
 */
@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    // 생성자 주입: Spring 이 MeetingRepository 구현체를 알아서 넣어준다.
    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    /** 모임 전체 조회 → 응답 DTO 리스트로 변환 */
    public List<MeetingResponse> findAll() {
        return meetingRepository.findAll().stream()
                .map(MeetingResponse::from)
                .toList();
    }

    /** 모임 생성 후, 생성된 결과를 응답 DTO 로 반환 */
    public MeetingResponse create(MeetingCreateRequest req) {
        Meeting meeting = new Meeting(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel(),
                // 문자열 "confirmed" → enum CONFIRMED 로 변환
                MeetingStatus.valueOf(req.status().toUpperCase())
        );
        Meeting saved = meetingRepository.save(meeting); // INSERT 실행
        return MeetingResponse.from(saved);
    }
}
