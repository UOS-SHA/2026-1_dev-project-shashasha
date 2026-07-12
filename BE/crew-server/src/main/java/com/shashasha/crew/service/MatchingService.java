package com.shashasha.crew.service;

import com.shashasha.crew.domain.*;
import com.shashasha.crew.dto.GoldenSlotResponse;
import com.shashasha.crew.dto.TimetableResponse;
import com.shashasha.crew.dto.VoteStateResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * 일정 매칭 로직 (통합 시간표 · 투표 · 확정).
 *
 * 핵심 아이디어:
 *   1) 후보 시간대(금·토·일 × 10~20시, 2시간 블록)를 고정으로 둔다.
 *   2) 각 후보 시간대마다 "그 시간에 개인 일정이 겹치지 않는(=비어 있는) 멤버 수"를 센다 → 가능 인원.
 *   3) 가능 인원이 많은 Top 3 를 골든타임으로 추천하고, 멤버들이 투표해 하나를 확정한다.
 */
@Service
public class MatchingService {

    /** 후보 요일 정의: 화면 라벨(짧은/긴), 요일 인덱스(0=월..6=일), 코드용 영문 */
    private record DayDef(String shortLabel, String fullLabel, int dayOfWeek, String eng) {}

    private static final List<DayDef> DAYS = List.of(
            new DayDef("월", "월요일", 0, "mon"),
            new DayDef("화", "화요일", 1, "tue"),
            new DayDef("수", "수요일", 2, "wed"),
            new DayDef("목", "목요일", 3, "thu"),
            new DayDef("금", "금요일", 4, "fri"),
            new DayDef("토", "토요일", 5, "sat"),
            new DayDef("일", "일요일", 6, "sun")
    );

    /** 후보 시작 시각들(각 2시간 블록). 예: 14 → 14:00~16:00 */
    private static final List<Integer> START_HOURS = List.of(10, 12, 14, 16, 18, 20);

    private static final int BLOCK_HOURS = 2;
    private static final int GOLDEN_COUNT = 3;

    private final MeetingRepository meetingRepository;
    private final MeetingMemberRepository memberRepository;
    private final ScheduleRepository scheduleRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    public MatchingService(MeetingRepository meetingRepository, MeetingMemberRepository memberRepository,
                           ScheduleRepository scheduleRepository, VoteRepository voteRepository,
                           UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.memberRepository = memberRepository;
        this.scheduleRepository = scheduleRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
    }

    /** 이 모임 멤버들의 이름(닉네임) 목록. 활동 기록의 참석자 선택 등에 쓴다. */
    @Transactional(readOnly = true)
    public List<String> getMemberNames(Long meetingId, Long userId) {
        requireMeeting(meetingId);
        requireMember(meetingId, userId);
        List<String> names = new ArrayList<>();
        for (MeetingMember member : memberRepository.findByMeetingId(meetingId)) {
            userRepository.findById(member.getUserId())
                    .ifPresent(u -> names.add(u.getNickname()));
        }
        return names;
    }

    /** 통합 시간표: 요일×시간 그리드의 가능 인원 + 골든타임 Top3 */
    @Transactional(readOnly = true)
    public TimetableResponse getTimetable(Long meetingId, Long userId) {
        requireMeeting(meetingId);
        requireMember(meetingId, userId);

        List<List<Schedule>> memberSchedules = loadMemberSchedules(meetingId);
        int totalMembers = memberSchedules.size();
        Map<String, Integer> voteCounts = countVotes(meetingId);

        // 그리드: 행=시간, 열=요일
        List<List<Integer>> availability = new ArrayList<>();
        for (int startHour : START_HOURS) {
            List<Integer> row = new ArrayList<>();
            for (DayDef day : DAYS) {
                row.add(availableCount(memberSchedules, day.dayOfWeek(), startHour));
            }
            availability.add(row);
        }

        List<GoldenSlotResponse> golden = buildGoldenSlots(memberSchedules, voteCounts);

        List<String> dayLabels = DAYS.stream().map(DayDef::shortLabel).toList();
        List<String> timeLabels = START_HOURS.stream().map(String::valueOf).toList();
        return new TimetableResponse(totalMembers, dayLabels, timeLabels, availability, golden);
    }

    /** 투표 화면 상태: 골든 슬롯(득표 포함) + 내 표 + 확정 여부 + 방장 여부 */
    @Transactional(readOnly = true)
    public VoteStateResponse getVoteState(Long meetingId, Long userId) {
        Meeting meeting = requireMeeting(meetingId);
        requireMember(meetingId, userId);
        return buildVoteState(meeting, userId);
    }

    /** 현재 저장된 상태 그대로 투표 화면 응답을 만든다. (조회/투표/확정 공통) */
    private VoteStateResponse buildVoteState(Meeting meeting, Long userId) {
        Long meetingId = meeting.getId();
        List<List<Schedule>> memberSchedules = loadMemberSchedules(meetingId);
        List<GoldenSlotResponse> golden = buildGoldenSlots(memberSchedules, countVotes(meetingId));
        String myVote = voteRepository.findByMeetingIdAndUserId(meetingId, userId)
                .map(Vote::getSlotCode).orElse(null);
        boolean isOwner = userId.equals(meeting.getCreatorId());

        return new VoteStateResponse(memberSchedules.size(), golden, myVote,
                meeting.getConfirmedSlot(), isOwner);
    }

    /**
     * 투표(또는 재투표): 내 표를 slotId 시간대로 옮긴다. 확정된 모임은 투표할 수 없다.
     * 이 표까지 포함해 "멤버 전원"이 투표를 마치면 최다 득표 시간대로 자동 확정된다.
     */
    @Transactional
    public VoteStateResponse vote(Long meetingId, Long userId, String slotId) {
        Meeting meeting = requireMeeting(meetingId);
        if (meeting.getConfirmedSlot() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_CONFIRMED",
                    "이미 일정이 확정된 모임이라 투표할 수 없어요");
        }
        requireValidSlot(slotId);
        requireMember(meetingId, userId);

        voteRepository.findByMeetingIdAndUserId(meetingId, userId)
                .ifPresentOrElse(
                        existing -> existing.changeSlot(slotId),                 // 재투표 → 표 이동
                        () -> voteRepository.save(new Vote(meetingId, userId, slotId)) // 첫 투표
                );

        autoConfirmIfEveryoneVoted(meeting); // 전원 투표 완료 시 자동 확정

        return buildVoteState(meeting, userId);
    }

    /**
     * 확정: 방장이 투표를 조기 마감한다(예: 끝까지 투표 안 하는 멤버가 있을 때).
     * 평소에는 전원 투표 완료 시 자동 확정되므로 이 기능은 방장용 예비 수단이다.
     * 확정 시간대는 클라이언트가 아니라 서버가 현재 최다 득표로 직접 결정한다.
     */
    @Transactional
    public VoteStateResponse confirm(Long meetingId, Long userId, String slotId) {
        Meeting meeting = requireMeeting(meetingId);
        requireMember(meetingId, userId);

        if (!userId.equals(meeting.getCreatorId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_MEETING_OWNER",
                    "모임 방장만 일정을 확정할 수 있어요");
        }
        if (meeting.getConfirmedSlot() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_CONFIRMED",
                    "이미 확정된 모임이에요");
        }

        String winner = winningSlot(meetingId);
        if (winner == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_VOTES_YET",
                    "아직 아무도 투표하지 않아 확정할 수 없어요");
        }

        // "sat-18" → "7월 5일 토 · 오후 6:00" 처럼 실제 날짜 라벨로 (모임 카드 날짜 표기 통일)
        meeting.confirm(winner, SlotLabel.dateLabel(winner, LocalDate.now()));

        return buildVoteState(meeting, userId);
    }

    // ───────────────────────── 내부 계산 ─────────────────────────

    /** 골든타임: 모든 후보 시간대를 가능 인원 기준으로 정렬해 상위 GOLDEN_COUNT 개를 뽑는다. */
    private List<GoldenSlotResponse> buildGoldenSlots(List<List<Schedule>> memberSchedules,
                                                      Map<String, Integer> voteCounts) {
        List<GoldenSlotResponse> all = new ArrayList<>();
        for (DayDef day : DAYS) {
            for (int startHour : START_HOURS) {
                String code = day.eng() + "-" + startHour;
                int available = availableCount(memberSchedules, day.dayOfWeek(), startHour);
                int votes = voteCounts.getOrDefault(code, 0);
                all.add(new GoldenSlotResponse(code, day.fullLabel(), SlotLabel.timeLabel(startHour), available, votes));
            }
        }
        // 가능 인원 많은 순, 동점이면 득표 많은 순 (투표가 몰린 시간대가 골든에 남도록)
        all.sort(Comparator.comparingInt(GoldenSlotResponse::available).reversed()
                .thenComparing(Comparator.comparingInt(GoldenSlotResponse::votes).reversed()));
        return all.subList(0, Math.min(GOLDEN_COUNT, all.size()));
    }

    /**
     * 특정 시간 블록(dayOfWeek, startHour~startHour+2)에 "일정이 겹치지 않는" 멤버 수를 센다.
     * 개인 일정이 하나도 겹치지 않으면 그 멤버는 그 시간에 참석 가능(available).
     */
    private int availableCount(List<List<Schedule>> memberSchedules, int dayOfWeek, int startHour) {
        int cellStart = startHour * 60;
        int cellEnd = (startHour + BLOCK_HOURS) * 60;

        int free = 0;
        for (List<Schedule> schedules : memberSchedules) {
            boolean conflict = false;
            for (Schedule s : schedules) {
                if (!s.getDays().contains(dayOfWeek)) {
                    continue; // 그 요일에 없는 일정은 무관
                }
                int sStart = s.getStartHour() * 60 + s.getStartMinute();
                int sEnd = s.getEndHour() * 60 + s.getEndMinute();
                // 두 구간이 겹치는 표준 조건: sStart < cellEnd && cellStart < sEnd
                if (sStart < cellEnd && cellStart < sEnd) {
                    conflict = true;
                    break;
                }
            }
            if (!conflict) {
                free++;
            }
        }
        return free;
    }

    /** 이 모임 멤버 각각의 개인 일정 목록을 불러온다. (바깥 리스트 1개 = 멤버 1명) */
    private List<List<Schedule>> loadMemberSchedules(Long meetingId) {
        List<List<Schedule>> result = new ArrayList<>();
        for (MeetingMember member : memberRepository.findByMeetingId(meetingId)) {
            result.add(scheduleRepository.findByUserId(member.getUserId()));
        }
        return result;
    }

    /** 이 모임의 시간대별 득표 수 집계 (slotCode → 표 수) */
    private Map<String, Integer> countVotes(Long meetingId) {
        Map<String, Integer> counts = new HashMap<>();
        for (Vote vote : voteRepository.findByMeetingId(meetingId)) {
            counts.merge(vote.getSlotCode(), 1, Integer::sum);
        }
        return counts;
    }

    /** 요청자가 이 모임의 멤버가 아니면 403. (예전의 "조회만 해도 자동 가입" 버그를 막는다) */
    private void requireMember(Long meetingId, Long userId) {
        if (!memberRepository.existsByMeetingIdAndUserId(meetingId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_A_MEMBER",
                    "이 모임의 멤버가 아니에요");
        }
    }

    /**
     * 멤버 전원이 투표를 마쳤으면 최다 득표 시간대로 자동 확정한다.
     * (표 수 == 멤버 수. 한 명당 표는 하나이므로 표 수가 멤버 수에 도달하면 전원 완료다.)
     */
    private void autoConfirmIfEveryoneVoted(Meeting meeting) {
        Long meetingId = meeting.getId();
        long memberCount = memberRepository.countByMeetingId(meetingId);
        long voteCount = voteRepository.findByMeetingId(meetingId).size();
        if (memberCount == 0 || voteCount < memberCount) {
            return; // 아직 다 안 함
        }
        String winner = winningSlot(meetingId);
        if (winner != null) {
            meeting.confirm(winner, SlotLabel.dateLabel(winner, LocalDate.now()));
        }
    }

    /**
     * 현재 최다 득표 시간대 코드. 동점이면 가능 인원이 많은 쪽,
     * 그래도 같으면 코드 사전순으로 결정한다(항상 같은 결과가 나오도록). 표가 없으면 null.
     */
    private String winningSlot(Long meetingId) {
        Map<String, Integer> voteCounts = countVotes(meetingId);
        if (voteCounts.isEmpty()) {
            return null;
        }
        List<List<Schedule>> memberSchedules = loadMemberSchedules(meetingId);
        return voteCounts.entrySet().stream()
                .max(Comparator
                        .comparingInt(Map.Entry<String, Integer>::getValue)                       // 득표 많은 순
                        .thenComparingInt(e -> availabilityOf(e.getKey(), memberSchedules))        // 동점 → 가능 인원
                        .thenComparing(Map.Entry::getKey, Comparator.reverseOrder()))             // 그래도 동점 → 코드 사전순(작은 쪽)
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /** 특정 슬롯 코드("sat-18")의 가능 인원 수. (동점 처리용) */
    private int availabilityOf(String slotCode, List<List<Schedule>> memberSchedules) {
        DayDef day = requireValidSlot(slotCode);
        return availableCount(memberSchedules, day.dayOfWeek(), startHourOf(slotCode));
    }

    private Meeting requireMeeting(Long meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEETING_NOT_FOUND",
                        "모임을 찾을 수 없습니다"));
    }

    /** slotId("sat-14")가 실제 후보 시간대인지 검증하고, 해당 요일 정의를 돌려준다. */
    private DayDef requireValidSlot(String slotId) {
        String eng = slotId.contains("-") ? slotId.substring(0, slotId.indexOf('-')) : "";
        int startHour = startHourOf(slotId);
        DayDef day = DAYS.stream().filter(d -> d.eng().equals(eng)).findFirst().orElse(null);
        if (day == null || !START_HOURS.contains(startHour)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_SLOT",
                    "존재하지 않는 시간대입니다: " + slotId);
        }
        return day;
    }

    /** "sat-14" → 14. 파싱 실패하면 -1(검증에서 걸러짐). */
    private int startHourOf(String slotId) {
        try {
            return Integer.parseInt(slotId.substring(slotId.indexOf('-') + 1));
        } catch (Exception e) {
            return -1;
        }
    }
}
