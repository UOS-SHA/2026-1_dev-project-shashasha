package com.shashasha.crew.service;

import com.shashasha.crew.config.DataSeeder;
import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingMember;
import com.shashasha.crew.domain.Vote;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import com.shashasha.crew.repository.UserRepository;
import com.shashasha.crew.repository.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 회원가입한 사용자에게 "나만의 시작 모임"을 만들어 주는 컴포넌트.
 *
 * 예전에는 모두가 같은 모임 3개를 공유해서, 한 사람이 확정하면 다른 사람은 투표를 못 하는
 * 문제가 있었다. 이제는 가입 시 각 사용자별로 독립된 모임을 만들고, 함께 넣어준 샘플 멤버들의
 * 표를 "미리" 심어 둔다. 그래서 아직 투표하지 않은 사람은 새 사용자 본인 뿐이고,
 * 본인이 마지막 표를 던지는 순간 전원 완료 → 자동 확정되어 투표~확정 전 과정을 온전히 경험한다.
 */
@Service
public class StarterMeetingSeeder {

    /**
     * 스타터 모임 하나의 정의.
     *   members : 이 모임에 넣을 샘플 멤버 이메일
     *   votes   : 그 중 "미리 표를 던진" 샘플 (이메일 → 시간대). members 의 부분집합.
     * votes 가 members 전체를 덮으면 → 새 사용자가 투표하는 순간 전원 완료 → 자동 확정.
     * votes 가 한 명을 비워 두면 → 새 사용자가 투표해도 아직 미완료 → 투표 진행 유지(방장이 강제 확정 가능).
     */
    private record StarterMeeting(String name, String emoji, List<String> members, Map<String, String> votes) {}

    private static final List<StarterMeeting> STARTERS = List.of(
            // ① 전원 미리 투표 → 새 사용자가 투표하면 곧바로 자동 확정 (자동 확정 시연용)
            new StarterMeeting("수요 독서 모임", "📚",
                    List.of("minji@example.com", "seoyeon@example.com", "jihun@example.com"),
                    Map.of(
                            "minji@example.com", "sat-18",
                            "seoyeon@example.com", "sat-18",
                            "jihun@example.com", "fri-16")),
            // ② 샘플 한 명(haneul)을 미투표로 남김 → 새 사용자가 투표해도 진행 중 유지 (방장 강제 확정 시연용)
            new StarterMeeting("한강 러닝 크루", "🏃",
                    List.of("minji@example.com", "seoyeon@example.com", "jihun@example.com",
                            "yeeun@example.com", "haneul@example.com"),
                    Map.of(
                            "minji@example.com", "sat-18",
                            "seoyeon@example.com", "sat-18",
                            "jihun@example.com", "sat-18",
                            "yeeun@example.com", "fri-12")),
            // ③ 전원 미리 투표 → 자동 확정
            new StarterMeeting("사이드 프로젝트", "💻",
                    List.of("minji@example.com", "yeeun@example.com"),
                    Map.of(
                            "minji@example.com", "fri-12",
                            "yeeun@example.com", "fri-12"))
    );

    private final MeetingRepository meetingRepository;
    private final MeetingMemberRepository memberRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    public StarterMeetingSeeder(MeetingRepository meetingRepository, MeetingMemberRepository memberRepository,
                                VoteRepository voteRepository, UserRepository userRepository) {
        this.meetingRepository = meetingRepository;
        this.memberRepository = memberRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
    }

    /** 새로 가입한 사용자에게 시작 모임들을 만들어 준다. (회원가입 트랜잭션 안에서 호출) */
    public void seedFor(Long newUserId) {
        // 샘플 이메일 → userId 매핑 (없으면 건너뛴다)
        Map<String, Long> sampleIds = userRepository.findAll().stream()
                .filter(u -> DataSeeder.SAMPLE_EMAILS.contains(u.getEmail()))
                .collect(Collectors.toMap(u -> u.getEmail(), u -> u.getId()));

        for (StarterMeeting starter : STARTERS) {
            createStarter(newUserId, starter, sampleIds);
        }
    }

    private void createStarter(Long newUserId, StarterMeeting starter, Map<String, Long> sampleIds) {
        // 이 모임에 실제로 넣을 수 있는 샘플 멤버(id 조회 가능한 사람)만 추린다.
        List<String> memberEmails = starter.members().stream()
                .filter(sampleIds::containsKey)
                .toList();

        int memberCount = memberEmails.size() + 1; // 샘플들 + 새 사용자 본인
        Meeting meeting = new Meeting(starter.name(), starter.emoji(), memberCount,
                "투표 진행 중");
        meeting.assignCreator(newUserId); // 새 사용자가 방장
        Meeting saved = meetingRepository.save(meeting);
        Long meetingId = saved.getId();

        // 새 사용자를 멤버로 (아직 투표는 안 한 상태)
        memberRepository.save(new MeetingMember(meetingId, newUserId));

        // 샘플 멤버들을 넣고, 표가 지정된 샘플만 미리 투표시킨다.
        for (String email : memberEmails) {
            Long sampleId = sampleIds.get(email);
            memberRepository.save(new MeetingMember(meetingId, sampleId));
            String slot = starter.votes().get(email);
            if (slot != null) {
                voteRepository.save(new Vote(meetingId, sampleId, slot));
            }
        }
    }
}
