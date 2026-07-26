package com.shashasha.crew.service;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingMember;
import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ArchiveRecordRepository;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import com.shashasha.crew.repository.VoteRepository;
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
    private final VoteRepository voteRepository;
    private final ArchiveRecordRepository archiveRepository;

    // 생성자 주입: Spring 이 구현체를 알아서 넣어준다.
    public MeetingService(MeetingRepository meetingRepository, MeetingMemberRepository memberRepository,
                          VoteRepository voteRepository, ArchiveRecordRepository archiveRepository) {
        this.meetingRepository = meetingRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
        this.archiveRepository = archiveRepository;
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

    /**
     * 모임 생성 후, 생성된 결과를 응답 DTO 로 반환. 만든 사람은 곧바로 멤버 겸 방장이 된다.
     * 새 모임은 항상 "투표 중"으로 시작한다(확정 슬롯이 없으므로). 클라이언트가 status 를
     * 지정할 수 없게 한 이유는 Meeting.getStatus() 주석 참고.
     */
    @Transactional
    public MeetingResponse create(MeetingCreateRequest req, Long creatorUserId) {
        Meeting meeting = new Meeting(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel()
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

    /**
     * 요청자가 이 모임의 방장이 아니면 403.
     * 멤버십을 먼저 확인하므로 "비멤버"와 "멤버지만 방장 아님"이 다른 코드로 구분된다.
     * (MatchingService.confirm() 과 같은 순서 · 같은 에러 코드를 쓴다)
     */
    private void requireOwner(Meeting meeting, Long userId, String action) {
        requireMember(meeting.getId(), userId);
        if (!userId.equals(meeting.getCreatorId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_MEETING_OWNER",
                    "모임 방장만 " + action + " 수 있어요");
        }
    }

    /**
     * 모임 수정 (PUT /meetings/{id}). 없으면 404, 방장이 아니면 403.
     * 확정 상태와 확정 슬롯은 여기서 건드리지 않는다 — 확정은 투표 API(POST /meetings/{id}/confirm)
     * 전용 동작이라, 이 API 로 상태만 바꿔 "확정 표시인데 투표는 계속 되는" 모순을 만들 수 없다.
     */
    @Transactional
    public MeetingResponse update(Long id, Long userId, MeetingCreateRequest req) {
        Meeting meeting = getOrThrow(id);
        requireOwner(meeting, userId, "모임 정보를 바꿀");
        meeting.update(
                req.name(),
                req.emoji(),
                req.members(),
                req.nextLabel()
        );
        // JPA 변경 감지(dirty checking): 트랜잭션이 끝날 때 바뀐 필드가 자동 UPDATE 된다.
        return toResponse(meeting);
    }

    /**
     * 모임 삭제 (DELETE /meetings/{id}). 없으면 404, 방장이 아니면 403.
     *
     * 멤버십·투표·활동기록은 meetingId 를 단순 숫자로만 들고 있어서 JPA 가 모임과의 관계를 모른다.
     * 즉 모임만 지우면 이들이 "없는 모임"을 가리키는 고아 데이터로 남는다. 그래서 같은 트랜잭션에서
     * 자식 데이터를 먼저 지우고 모임을 지운다. (FE 도 "되돌릴 수 없어요"로 안내한다)
     */
    @Transactional
    public void delete(Long id, Long userId) {
        Meeting meeting = getOrThrow(id);
        requireOwner(meeting, userId, "모임을 삭제할");

        archiveRepository.deleteByMeetingId(id);
        voteRepository.deleteByMeetingId(id);
        memberRepository.deleteByMeetingId(id);
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
}
