package com.shashasha.crew.service;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingStatus;
import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.MeetingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional(readOnly = true)
    public List<MeetingResponse> findAll() {
        return meetingRepository.findAll().stream()
                .map(MeetingResponse::from)
                .toList();
    }

    /** 모임 단건 조회 (GET /meetings/{id}). 없으면 404. */
    @Transactional(readOnly = true)
    public MeetingResponse findById(Long id) {
        Meeting meeting = getOrThrow(id);
        return MeetingResponse.from(meeting);
    }

    /** 모임 생성 후, 생성된 결과를 응답 DTO 로 반환 */
    @Transactional
    public MeetingResponse create(MeetingCreateRequest req) {
        Meeting meeting = new Meeting(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel(),
                parseStatus(req.status())
        );
        Meeting saved = meetingRepository.save(meeting); // INSERT 실행
        return MeetingResponse.from(saved);
    }

    /** 모임 수정 (PUT /meetings/{id}). 없으면 404. */
    @Transactional
    public MeetingResponse update(Long id, MeetingCreateRequest req) {
        Meeting meeting = getOrThrow(id);
        meeting.update(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel(),
                parseStatus(req.status())
        );
        // JPA 변경 감지(dirty checking): 트랜잭션이 끝날 때 바뀐 필드가 자동 UPDATE 된다.
        return MeetingResponse.from(meeting);
    }

    /** 모임 삭제 (DELETE /meetings/{id}). 없으면 404. */
    @Transactional
    public void delete(Long id) {
        Meeting meeting = getOrThrow(id);
        meetingRepository.delete(meeting);
    }

    /** id 로 모임을 찾되, 없으면 공통 404 예외를 던지는 헬퍼. */
    private Meeting getOrThrow(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEETING_NOT_FOUND",
                        "모임을 찾을 수 없습니다"));
    }

    /** 문자열 "confirmed" / "voting" → enum. 잘못된 값이면 400 으로 막는다. */
    private MeetingStatus parseStatus(String status) {
        try {
            return MeetingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS",
                    "status 는 confirmed 또는 voting 이어야 합니다");
        }
    }
}
