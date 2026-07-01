package com.shashasha.crew.config;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.domain.MeetingStatus;
import com.shashasha.crew.repository.MeetingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 서버 시작 시 한 번 실행되는 초기 데이터 심기(seeding).
 * DB 가 비어 있을 때만, 홈 화면(home/index.tsx)의 하드코딩 모임 3개를 넣어준다.
 * 덕분에 서버를 처음 켜도 GET /meetings 가 바로 데이터를 돌려준다.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final MeetingRepository meetingRepository;

    public DataSeeder(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    @Override
    public void run(String... args) {
        if (meetingRepository.count() > 0) {
            return; // 이미 데이터가 있으면 아무것도 안 함
        }
        meetingRepository.saveAll(List.of(
                new Meeting("수요 독서 모임", "📚", 6, "6월 13일 토 · 오후 2:00", MeetingStatus.CONFIRMED),
                new Meeting("한강 러닝 크루", "🏃", 9, "투표 진행 중 · 3일 남음", MeetingStatus.VOTING),
                new Meeting("사이드 프로젝트", "💻", 4, "6월 18일 목 · 오후 7:30", MeetingStatus.CONFIRMED)
        ));
    }
}
