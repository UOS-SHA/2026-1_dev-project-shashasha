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
    @Transactional
    public List<String> getMemberNames(Long meetingId, Long userId) {
        requireMeeting(meetingId);
        ensureMember(meetingId, userId); // 접속자도 멤버로 포함시켜 이름이 빠지지 않게
        List<String> names = new ArrayList<>();
        for (MeetingMember member : memberRepository.findByMeetingId(meetingId)) {
            userRepository.findById(member.getUserId())
                    .ifPresent(u -> names.add(u.getNickname()));
        }
        return names;
    }

    /** 통합 시간표: 요일×시간 그리드의 가능 인원 + 골든타임 Top3 */
    @Transactional
    public TimetableResponse getTimetable(Long meetingId, Long userId) {
        requireMeeting(meetingId);
        ensureMember(meetingId, userId);

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

    /** 투표 화면 상태: 골든 슬롯(득표 포함) + 내 표 + 확정 여부 */
    @Transactional
    public VoteStateResponse getVoteState(Long meetingId, Long userId) {
        Meeting meeting = requireMeeting(meetingId);
        ensureMember(meetingId, userId);

        List<List<Schedule>> memberSchedules = loadMemberSchedules(meetingId);
        List<GoldenSlotResponse> golden = buildGoldenSlots(memberSchedules, countVotes(meetingId));
        String myVote = voteRepository.findByMeetingIdAndUserId(meetingId, userId)
                .map(Vote::getSlotCode).orElse(null);

        return new VoteStateResponse(memberSchedules.size(), golden, myVote, meeting.getConfirmedSlot());
    }

    /** 투표(또는 재투표): 내 표를 slotId 시간대로 옮긴다. 확정된 모임은 투표할 수 없다. */
    @Transactional
    public VoteStateResponse vote(Long meetingId, Long userId, String slotId) {
        Meeting meeting = requireMeeting(meetingId);
        if (meeting.getConfirmedSlot() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_CONFIRMED",
                    "이미 일정이 확정된 모임이라 투표할 수 없어요");
        }
        requireValidSlot(slotId);
        ensureMember(meetingId, userId);

        voteRepository.findByMeetingIdAndUserId(meetingId, userId)
                .ifPresentOrElse(
                        existing -> existing.changeSlot(slotId),                 // 재투표 → 표 이동
                        () -> voteRepository.save(new Vote(meetingId, userId, slotId)) // 첫 투표
                );

        return getVoteState(meetingId, userId);
    }

    /** 확정: 투표 결과 중 한 시간대로 모임 일정을 확정한다. 라벨은 실제 날짜로 만든다. */
    @Transactional
    public VoteStateResponse confirm(Long meetingId, Long userId, String slotId) {
        Meeting meeting = requireMeeting(meetingId);
        requireValidSlot(slotId);
        ensureMember(meetingId, userId);

        // "sat-18" → "7월 5일 토 · 오후 6:00" 처럼 실제 날짜 라벨로 (모임 카드 날짜 표기 통일)
        String label = SlotLabel.dateLabel(slotId, LocalDate.now());
        meeting.confirm(slotId, label); // 상태 CONFIRMED + 홈 카드 라벨 갱신 (dirty checking 으로 UPDATE)

        return getVoteState(meetingId, userId);
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

    /** 요청한 사용자가 아직 이 모임 멤버가 아니면 멤버로 추가한다. */
    private void ensureMember(Long meetingId, Long userId) {
        if (!memberRepository.existsByMeetingIdAndUserId(meetingId, userId)) {
            memberRepository.save(new MeetingMember(meetingId, userId));
        }
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
