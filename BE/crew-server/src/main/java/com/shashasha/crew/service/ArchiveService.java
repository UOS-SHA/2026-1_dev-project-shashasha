package com.shashasha.crew.service;

import com.shashasha.crew.domain.ArchiveRecord;
import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.dto.ArchiveCreateRequest;
import com.shashasha.crew.dto.ArchiveResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ArchiveRecordRepository;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 활동 기록 비즈니스 로직.
 * 원래 FE(archive/_layout.tsx)가 하던 자동 계산(회차/요일/제목/색상)을 서버로 옮겨 담았다.
 */
@Service
public class ArchiveService {

    /** FE 와 동일한 색상 팔레트 (배지색 / 썸네일색 쌍) */
    private static final String[][] PALETTE = {
            {"#5B7FFF", "#DDD6FE"},
            {"#A78BFA", "#C7D2FE"},
            {"#10B981", "#BBF7D0"},
            {"#F97316", "#FDE68A"},
    };

    private static final String[] DAY_LABELS = {"일", "월", "화", "수", "목", "금", "토"};
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy.MM.dd");
    private static final int DEFAULT_PHOTOS = 2;
    private static final String DEFAULT_PLACE = "성수 카페";

    private final ArchiveRecordRepository archiveRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingMemberRepository memberRepository;

    public ArchiveService(ArchiveRecordRepository archiveRepository, MeetingRepository meetingRepository,
                          MeetingMemberRepository memberRepository) {
        this.archiveRepository = archiveRepository;
        this.meetingRepository = meetingRepository;
        this.memberRepository = memberRepository;
    }

    /** 내 기록 전체 (최신 회차부터) */
    @Transactional(readOnly = true)
    public List<ArchiveResponse> findMine(Long userId) {
        return archiveRepository.findByUserIdOrderByRoundDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** 기록 단건 조회 (내 것이 아니면 404) */
    @Transactional(readOnly = true)
    public ArchiveResponse findOne(Long userId, Long id) {
        return toResponse(getMineOrThrow(userId, id));
    }

    /**
     * 기록 생성 — 회차/요일/제목/색상은 서버가 자동으로 매긴다. 회차는 "그 모임" 기준.
     *
     * meetingId 는 클라이언트가 보내는 값이라, 내가 그 모임의 멤버인지 반드시 확인해야 한다.
     * 확인하지 않으면 남의 모임 번호를 넣어 내 기록에 붙일 수 있고, 응답의 meetingName 으로
     * 모임 번호를 훑어 존재 여부와 이름을 알아낼 수도 있다.
     */
    @Transactional
    public ArchiveResponse create(Long userId, ArchiveCreateRequest req) {
        Meeting meeting = requireMyMeeting(userId, req.meetingId());

        int round = (int) archiveRepository.countByUserIdAndMeetingId(userId, meeting.getId()) + 1;
        String[] style = PALETTE[(round - 1) % PALETTE.length];

        ArchiveRecord record = new ArchiveRecord(
                userId,
                meeting.getId(),
                round,
                req.date(),
                dayLabelOf(req.date()),
                place(req.place()),
                round + "회차 활동 기록",
                summary(req.summary()),
                nullSafe(req.attendees()),
                nullSafe(req.absentees()),
                DEFAULT_PHOTOS,
                style[0],
                style[1]
        );
        return toResponse(archiveRepository.save(record));
    }

    /** 기록 수정 (내 것이 아니면 404). 모임 소속은 바꾸지 않는다. */
    @Transactional
    public ArchiveResponse update(Long userId, Long id, ArchiveCreateRequest req) {
        ArchiveRecord record = getMineOrThrow(userId, id);
        record.update(
                req.date(),
                dayLabelOf(req.date()),
                place(req.place()),
                summary(req.summary()),
                nullSafe(req.attendees()),
                nullSafe(req.absentees())
        );
        return toResponse(record);
    }

    /** 기록 삭제 (내 것이 아니면 404) */
    @Transactional
    public void delete(Long userId, Long id) {
        archiveRepository.delete(getMineOrThrow(userId, id));
    }

    /** 기록 → 응답 DTO. 모임 이름을 함께 채운다(모임이 지워졌으면 빈 문자열). */
    private ArchiveResponse toResponse(ArchiveRecord record) {
        String meetingName = meetingRepository.findById(record.getMeetingId())
                .map(Meeting::getName)
                .orElse("");
        return ArchiveResponse.from(record, meetingName);
    }

    /**
     * 내가 멤버인 모임만 돌려준다.
     *
     * "모임이 없음"과 "멤버가 아님"을 똑같이 404 로 응답한다. 여기서 403 을 주면 응답 코드만으로
     * 어떤 모임 번호가 존재하는지 훑을 수 있기 때문이다. (GET /meetings/{id} 는 기존 FE 문구와
     * 맞추려고 403 NOT_A_MEMBER 를 유지하고 있어 정책이 다르다 — 통일 여부는 별도 판단 필요)
     */
    private Meeting requireMyMeeting(Long userId, Long meetingId) {
        if (!memberRepository.existsByMeetingIdAndUserId(meetingId, userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "MEETING_NOT_FOUND",
                    "모임을 찾을 수 없습니다");
        }
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEETING_NOT_FOUND",
                        "모임을 찾을 수 없습니다"));
    }

    private ArchiveRecord getMineOrThrow(Long userId, Long id) {
        return archiveRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ARCHIVE_NOT_FOUND",
                        "활동 기록을 찾을 수 없습니다"));
    }

    /** "2025.04.12" → "토" 같은 요일 라벨. 형식이 이상하면 빈 문자열. */
    private String dayLabelOf(String date) {
        try {
            LocalDate parsed = LocalDate.parse(date.trim(), DATE_FORMAT);
            // getDayOfWeek(): 월=1 ... 일=7 → %7 하면 일=0,월=1,...,토=6 (FE 의 JS getDay 와 동일)
            return DAY_LABELS[parsed.getDayOfWeek().getValue() % 7];
        } catch (Exception e) {
            return "";
        }
    }

    private String place(String value) {
        return (value == null || value.isBlank()) ? DEFAULT_PLACE : value.trim();
    }

    private String summary(String value) {
        return value == null ? "" : value.trim();
    }

    private List<String> nullSafe(List<String> list) {
        return list == null ? List.of() : list;
    }
}
