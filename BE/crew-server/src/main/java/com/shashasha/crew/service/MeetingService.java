package com.shashasha.crew.service;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingMember;
import com.shashasha.crew.domain.MeetingStatus;
import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.MeetingMemberRepository;
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
    private final MeetingMemberRepository memberRepository;

    // 생성자 주입: Spring 이 구현체를 알아서 넣어준다.
    public MeetingService(MeetingRepository meetingRepository, MeetingMemberRepository memberRepository) {
        this.meetingRepository = meetingRepository;
        this.memberRepository = memberRepository;
    }

    /**
     * 내가 가입한 모임만 조회 → 응답 DTO 리스트로 변환 (members 는 실제 멤버 수).
     * 예전에는 전체 모임을 돌려줘서 모든 사용자가 같은 목록을 공유하는 버그가 있었다.
     */
    @Transactional(readOnly = true)
    public List<MeetingResponse> findMyMeetings(Long userId) {
        List<Long> myMeetingIds = memberRepository.findByUserId(userId).stream()
                .map(MeetingMember::getMeetingId)
                .toList();
        return meetingRepository.findAllById(myMeetingIds).stream()
                .sorted(java.util.Comparator.comparing(Meeting::getId))
                .map(this::toResponse)
                .toList();
    }

    /** 모임 단건 조회 (GET /meetings/{id}). 없으면 404, 내 모임이 아니면 403. */
    @Transactional(readOnly = true)
    public MeetingResponse findById(Long id, Long userId) {
        Meeting meeting = getOrThrow(id);
        requireMember(id, userId);
        return toResponse(meeting);
    }

    /** 모임 생성 후, 생성된 결과를 응답 DTO 로 반환. 만든 사람은 곧바로 멤버 겸 방장이 된다. */
    @Transactional
    public MeetingResponse create(MeetingCreateRequest req, Long creatorUserId) {
        Meeting meeting = new Meeting(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel(),
                parseStatus(req.status())
        );
        meeting.assignCreator(creatorUserId); // 만든 사람이 방장
        Meeting saved = meetingRepository.save(meeting); // INSERT 실행
        memberRepository.save(new MeetingMember(saved.getId(), creatorUserId)); // 생성자를 멤버로
        return toResponse(saved);
    }

    /** 요청자가 이 모임의 멤버가 아니면 403. (자동 가입 대신 명시적 차단) */
    private void requireMember(Long meetingId, Long userId) {
        if (!memberRepository.existsByMeetingIdAndUserId(meetingId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_A_MEMBER",
                    "이 모임의 멤버가 아니에요");
        }
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
        return toResponse(meeting);
    }

    /** 모임 삭제 (DELETE /meetings/{id}). 없으면 404. */
    @Transactional
    public void delete(Long id) {
        Meeting meeting = getOrThrow(id);
        meetingRepository.delete(meeting);
    }

    /** Meeting → 응답 DTO. members 에 실제 멤버 수를 채워준다. */
    private MeetingResponse toResponse(Meeting meeting) {
        int members = (int) memberRepository.countByMeetingId(meeting.getId());
        return MeetingResponse.of(meeting, members);
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
