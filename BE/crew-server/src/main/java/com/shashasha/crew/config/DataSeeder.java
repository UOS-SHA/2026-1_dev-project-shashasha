package com.shashasha.crew.config;

import com.shashasha.crew.domain.*;
import com.shashasha.crew.repository.ScheduleRepository;
import com.shashasha.crew.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 서버 시작 시 한 번 실행되는 초기 데이터 심기(seeding).
 *
 * 예전에는 여기서 "모두가 공유하는 모임 3개"를 만들어, 모든 사용자가 같은 모임 목록을 보고
 * 조회만 해도 멤버가 되는 버그가 있었다. 이제 모임은 회원가입 시 각 사용자별로 따로 만들어지므로
 * (StarterMeetingSeeder), 여기서는 그 스타터 모임에 함께 넣어줄 "샘플 멤버 5명 + 그들의 개인 일정"만
 * 심는다. 덕분에 새 사용자도 통합 시간표가 채워진 상태에서 투표를 경험할 수 있다.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    /** 스타터 모임에 함께 넣어줄 샘플 멤버들의 이메일 (StarterMeetingSeeder 가 이 값으로 조회한다) */
    public static final List<String> SAMPLE_EMAILS = List.of(
            "minji@example.com", "seoyeon@example.com", "jihun@example.com",
            "yeeun@example.com", "haneul@example.com"
    );

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ScheduleRepository scheduleRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 샘플 멤버가 이미 있으면 아무것도 안 함
        if (userRepository.existsByEmail(SAMPLE_EMAILS.get(0))) {
            return;
        }

        // 샘플 사용자 5명 + 개인 일정. 요일: 0=월 ... 4=금, 5=토, 6=일
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
