package com.shashasha.crew.service;

import com.shashasha.crew.domain.ArchiveRecord;
import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.dto.ArchiveCreateRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ArchiveRecordRepository;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 활동 기록 생성 시 모임 멤버십 검증 테스트 (보안 자문서 #4).
 *
 * 예전에는 모임 존재 여부만 확인해서, 남의 모임 번호를 넣어 내 활동 기록에 붙일 수 있었다.
 * 게다가 응답에 meetingName 이 들어 있어서 모임 번호를 훑어 존재 여부와 이름을 알아낼 수 있었다.
 */
class ArchiveServiceTest {

    private static final long MEETING_ID = 42L;
    private static final long MEMBER_ID = 1L;
    private static final long ATTACKER_ID = 99L;

    private ArchiveRecordRepository archiveRepository;
    private MeetingRepository meetingRepository;
    private MeetingMemberRepository memberRepository;
    private ArchiveService archiveService;

    @BeforeEach
    void setUp() {
        archiveRepository = mock(ArchiveRecordRepository.class);
        meetingRepository = mock(MeetingRepository.class);
        memberRepository = mock(MeetingMemberRepository.class);
        archiveService = new ArchiveService(archiveRepository, meetingRepository, memberRepository);

        Meeting meeting = new Meeting("피해자의 모임", "📚", 3, "투표 진행 중");
        // id 는 DB 가 채우는 값이라 생성자로 넣을 수 없다. 서비스가 meeting.getId() 로 기록을 만들므로 필요하다.
        ReflectionTestUtils.setField(meeting, "id", MEETING_ID);
        when(meetingRepository.findById(MEETING_ID)).thenReturn(Optional.of(meeting));
    }

    private ArchiveCreateRequest request() {
        return new ArchiveCreateRequest(MEETING_ID, "2026.07.15", "시험 장소",
                "권한 없는 연결 시험", List.of(), List.of());
    }

    @Test
    @DisplayName("비멤버가 남의 모임 번호로 기록을 만들면 404 로 막힌다")
    void create_rejectsNonMember() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, ATTACKER_ID)).thenReturn(false);

        assertThatThrownBy(() -> archiveService.create(ATTACKER_ID, request()))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    // 403 이 아니라 404 다: 응답 코드로 모임 번호의 존재 여부를 훑지 못하게
                    // "없는 모임"과 "내 모임이 아님"을 같은 응답으로 통일했다.
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(e.getError()).isEqualTo("MEETING_NOT_FOUND");
                });

        verify(archiveRepository, never()).save(any());
    }

    @Test
    @DisplayName("존재하지 않는 모임도 같은 404 응답이라 구분되지 않는다")
    void create_missingMeetingLooksIdenticalToForbidden() {
        when(memberRepository.existsByMeetingIdAndUserId(7777L, ATTACKER_ID)).thenReturn(false);
        when(meetingRepository.findById(7777L)).thenReturn(Optional.empty());

        ArchiveCreateRequest missing = new ArchiveCreateRequest(7777L, "2026.07.15", null, null, null, null);

        assertThatThrownBy(() -> archiveService.create(ATTACKER_ID, missing))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(e.getError()).isEqualTo("MEETING_NOT_FOUND");
                });
    }

    @Test
    @DisplayName("멤버는 자기 모임의 활동 기록을 만들 수 있다")
    void create_allowsMember() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, MEMBER_ID)).thenReturn(true);
        when(archiveRepository.countByUserIdAndMeetingId(MEMBER_ID, MEETING_ID)).thenReturn(0L);
        when(archiveRepository.save(any(ArchiveRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = archiveService.create(MEMBER_ID, request());

        assertThat(response.meetingId()).isEqualTo(MEETING_ID);
        assertThat(response.meetingName()).isEqualTo("피해자의 모임");
        assertThat(response.round()).isEqualTo(1);
        verify(archiveRepository).save(any(ArchiveRecord.class));
    }
}
