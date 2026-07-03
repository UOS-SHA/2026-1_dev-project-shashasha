package com.shashasha.crew.config;

import com.shashasha.crew.domain.*;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import com.shashasha.crew.repository.ScheduleRepository;
import com.shashasha.crew.repository.UserRepository;
import com.shashasha.crew.repository.VoteRepository;
import com.shashasha.crew.service.SlotLabel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * 서버 시작 시 한 번 실행되는 초기 데이터 심기(seeding).
 * DB 가 비어 있을 때만 실행되며, 데모가 바로 자연스럽게 돌아가도록 다음을 넣어준다:
 *   1) 모임 3개
 *   2) 샘플 사용자 5명 (+ 각자의 개인 일정)
 *   3) 5명을 3개 모임 "전부"의 멤버로 등록 → 어느 모임을 열어도 통합 시간표가 채워짐
 *   4) 확정 모임은 실제 날짜 라벨로 확정, 투표 진행 모임은 표를 미리 심어 활발해 보이게
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final MeetingMemberRepository memberRepository;
    private final VoteRepository voteRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(MeetingRepository meetingRepository, UserRepository userRepository,
                      ScheduleRepository scheduleRepository, MeetingMemberRepository memberRepository,
                      VoteRepository voteRepository, PasswordEncoder passwordEncoder) {
        this.meetingRepository = meetingRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (meetingRepository.count() > 0) {
            return; // 이미 데이터가 있으면 아무것도 안 함
        }

        // 1) 모임 3개 (라벨/상태는 아래에서 확정 처리로 덮어씀)
        List<Meeting> meetings = meetingRepository.saveAll(List.of(
                new Meeting("수요 독서 모임", "📚", 5, "투표 진행 중", MeetingStatus.VOTING),
                new Meeting("한강 러닝 크루", "🏃", 5, "투표 진행 중 · 3일 남음", MeetingStatus.VOTING),
                new Meeting("사이드 프로젝트", "💻", 5, "투표 진행 중", MeetingStatus.VOTING)
        ));
        Long m1 = meetings.get(0).getId();
        Long m2 = meetings.get(1).getId();
        Long m3 = meetings.get(2).getId();

        // 2) 샘플 사용자 5명 + 개인 일정. 요일: 0=월 ... 4=금, 5=토, 6=일
        Long minji = seedUser("minji@example.com", "김민지", "공강 많음");
        seedSchedule(minji, "전공 수업", ScheduleType.FIXED, List.of(4), 10, 0, 12, 0);  // 금 10-12
        seedSchedule(minji, "동아리", ScheduleType.VARIABLE, List.of(5), 14, 0, 16, 0);  // 토 14-16

        Long seoyeon = seedUser("seoyeon@example.com", "이서연", "오후 가능");
        seedSchedule(seoyeon, "교양 수업", ScheduleType.FIXED, List.of(5), 10, 0, 12, 0); // 토 10-12
        seedSchedule(seoyeon, "알바", ScheduleType.FIXED, List.of(6), 18, 0, 20, 0);      // 일 18-20

        Long jihun = seedUser("jihun@example.com", "박지훈", "수요일 추천");
        seedSchedule(jihun, "랩 미팅", ScheduleType.FIXED, List.of(4), 18, 0, 21, 0);     // 금 18-21
        seedSchedule(jihun, "스터디", ScheduleType.VARIABLE, List.of(5), 12, 0, 14, 0);   // 토 12-14

        Long yeeun = seedUser("yeeun@example.com", "최예은", "친구 추가됨");
        seedSchedule(yeeun, "운동", ScheduleType.VARIABLE, List.of(6), 14, 0, 16, 0);     // 일 14-16
        seedSchedule(yeeun, "프로젝트", ScheduleType.FIXED, List.of(4), 14, 0, 16, 0);    // 금 14-16

        Long haneul = seedUser("haneul@example.com", "정하늘", "시간표 확인");
        seedSchedule(haneul, "수업", ScheduleType.FIXED, List.of(5), 16, 0, 18, 0);       // 토 16-18
        seedSchedule(haneul, "봉사활동", ScheduleType.VARIABLE, List.of(6), 10, 0, 12, 0);// 일 10-12

        List<Long> everyone = List.of(minji, seoyeon, jihun, yeeun, haneul);

        // 3) 5명을 3개 모임 전부의 멤버로 등록 (로그인한 사용자는 접속 시 자동으로 추가됨)
        for (Long meetingId : List.of(m1, m2, m3)) {
            for (Long userId : everyone) {
                memberRepository.save(new MeetingMember(meetingId, userId));
            }
        }

        // 4) 투표 심기 + 확정 처리
        //    (이 멤버 조합의 골든타임 후보는 fri-12, fri-16, sat-18)
        // m1: sat-18 로 확정 (4명이 그 시간에 찬성했다고 표시)
        seedVotes(m1, List.of(minji, seoyeon, yeeun, haneul), "sat-18");
        seedVotes(m1, List.of(jihun), "fri-16");
        confirm(meetings.get(0), "sat-18");

        // m2: 투표 진행 중 — 표만 심어 활발하게 (sat-18 이 3표로 선두)
        seedVotes(m2, List.of(minji, seoyeon, jihun), "sat-18");
        seedVotes(m2, List.of(yeeun), "fri-12");
        seedVotes(m2, List.of(haneul), "fri-16");

        // m3: fri-12 로 확정
        seedVotes(m3, List.of(minji, jihun, yeeun), "fri-12");
        seedVotes(m3, List.of(seoyeon), "sat-18");
        confirm(meetings.get(2), "fri-12");
    }

    /** 모임을 특정 시간대 코드로 확정한다 (상태 CONFIRMED + 실제 날짜 라벨). */
    private void confirm(Meeting meeting, String slotCode) {
        meeting.confirm(slotCode, SlotLabel.dateLabel(slotCode, LocalDate.now()));
        meetingRepository.save(meeting);
    }

    /** 여러 사용자가 같은 시간대에 투표한 것으로 표를 심는다. */
    private void seedVotes(Long meetingId, List<Long> userIds, String slotCode) {
        for (Long userId : userIds) {
            voteRepository.save(new Vote(meetingId, userId, slotCode));
        }
    }

    /** 샘플 사용자 한 명을 만들고 id 를 돌려준다. (비밀번호는 모두 "test1234") */
    private Long seedUser(String email, String nickname, String bio) {
        String handle = "@" + email.split("@")[0];
        User user = new User(
                email,
                passwordEncoder.encode("test1234"),
                nickname,
                bio,
                handle,
                true, true, true, true, false
        );
        return userRepository.save(user).getId();
    }

    private void seedSchedule(Long userId, String title, ScheduleType type, List<Integer> days,
                              int sh, int sm, int eh, int em) {
        scheduleRepository.save(new Schedule(userId, title, type, days, sh, sm, eh, em));
    }
}
