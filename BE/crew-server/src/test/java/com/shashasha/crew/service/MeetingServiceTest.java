package com.shashasha.crew.service;

import com.shashasha.crew.domain.Meeting;
import com.shashasha.crew.dto.MeetingCreateRequest;
import com.shashasha.crew.dto.MeetingResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.ArchiveRecordRepository;
import com.shashasha.crew.repository.MeetingMemberRepository;
import com.shashasha.crew.repository.MeetingRepository;
import com.shashasha.crew.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 모임 수정·삭제 권한 테스트 (보안 자문서 #1).
 *
 * 예전에는 인증만 되어 있으면 남의 모임을 수정·삭제할 수 있었다. 모임 식별자는 1,2,3... 순차 증가라
 * 아무 번호나 넣어 보면 되는 상태였다. 아래 테스트는 그 PoC 를 서비스 계층에서 재현한다.
 */
class MeetingServiceTest {

    private static final long MEETING_ID = 42L;
    private static final long OWNER_ID = 1L;
    private static final long MEMBER_ID = 2L;
    private static final long ATTACKER_ID = 99L;

    private MeetingRepository meetingRepository;
    private MeetingMemberRepository memberRepository;
    private VoteRepository voteRepository;
    private ArchiveRecordRepository archiveRepository;
    private MeetingService meetingService;

    private Meeting meeting;

    @BeforeEach
    void setUp() {
        meetingRepository = mock(MeetingRepository.class);
        memberRepository = mock(MeetingMemberRepository.class);
        voteRepository = mock(VoteRepository.class);
        archiveRepository = mock(ArchiveRecordRepository.class);
        meetingService = new MeetingService(meetingRepository, memberRepository,
                voteRepository, archiveRepository);

        meeting = new Meeting("피해자의 모임", "📚", 3, "투표 진행 중");
        meeting.assignCreator(OWNER_ID);
        // id 는 DB 가 채우는 값이라 생성자로 넣을 수 없다.
        ReflectionTestUtils.setField(meeting, "id", MEETING_ID);

        when(meetingRepository.findById(MEETING_ID)).thenReturn(Optional.of(meeting));
    }

    private MeetingCreateRequest request(String name) {
        return new MeetingCreateRequest(name, "!", 1, "변조됨");
    }

    // ─────────────────────── 수정 (PUT /meetings/{id}) ───────────────────────

    @Test
    @DisplayName("비멤버의 모임 수정은 403 NOT_A_MEMBER 로 막힌다")
    void update_rejectsNonMember() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, ATTACKER_ID)).thenReturn(false);

        assertThatThrownBy(() -> meetingService.update(MEETING_ID, ATTACKER_ID, request("공격자가 변경한 모임")))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(e.getError()).isEqualTo("NOT_A_MEMBER");
                });

        // 데이터가 실제로 바뀌지 않았는지도 확인한다.
        assertThat(meeting.getName()).isEqualTo("피해자의 모임");
    }

    @Test
    @DisplayName("멤버지만 방장이 아니면 모임 수정은 403 NOT_MEETING_OWNER 로 막힌다")
    void update_rejectsMemberWhoIsNotOwner() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, MEMBER_ID)).thenReturn(true);

        assertThatThrownBy(() -> meetingService.update(MEETING_ID, MEMBER_ID, request("멤버가 변경")))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown -> {
                    ApiException e = (ApiException) thrown;
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(e.getError()).isEqualTo("NOT_MEETING_OWNER");
                });

        assertThat(meeting.getName()).isEqualTo("피해자의 모임");
    }

    @Test
    @DisplayName("방장은 모임을 수정할 수 있다")
    void update_allowsOwner() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, OWNER_ID)).thenReturn(true);
        when(memberRepository.countByMeetingId(MEETING_ID)).thenReturn(3L);

        MeetingResponse response = meetingService.update(MEETING_ID, OWNER_ID, request("방장이 바꾼 이름"));

        assertThat(response.name()).isEqualTo("방장이 바꾼 이름");
        assertThat(meeting.getName()).isEqualTo("방장이 바꾼 이름");
    }

    @Test
    @DisplayName("존재하지 않는 모임 수정은 404 다 (권한 검사보다 먼저)")
    void update_missingMeetingIs404() {
        when(meetingRepository.findById(7777L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> meetingService.update(7777L, ATTACKER_ID, request("없는 모임")))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("MEETING_NOT_FOUND"));
    }

    // ─────────────────────── 삭제 (DELETE /meetings/{id}) ───────────────────────

    @Test
    @DisplayName("비멤버의 모임 삭제는 403 으로 막히고 아무것도 지워지지 않는다")
    void delete_rejectsNonMember() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, ATTACKER_ID)).thenReturn(false);

        assertThatThrownBy(() -> meetingService.delete(MEETING_ID, ATTACKER_ID))
                .isInstanceOf(ApiException.class);

        verify(meetingRepository, never()).delete(any());
        verify(memberRepository, never()).deleteByMeetingId(anyLong());
        verify(voteRepository, never()).deleteByMeetingId(anyLong());
        verify(archiveRepository, never()).deleteByMeetingId(anyLong());
    }

    @Test
    @DisplayName("멤버지만 방장이 아니면 모임 삭제도 막힌다")
    void delete_rejectsMemberWhoIsNotOwner() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, MEMBER_ID)).thenReturn(true);

        assertThatThrownBy(() -> meetingService.delete(MEETING_ID, MEMBER_ID))
                .isInstanceOf(ApiException.class)
                .satisfies(thrown ->
                        assertThat(((ApiException) thrown).getError()).isEqualTo("NOT_MEETING_OWNER"));

        verify(meetingRepository, never()).delete(any());
    }

    @Test
    @DisplayName("방장이 삭제하면 멤버십·투표·활동기록까지 함께 정리된다")
    void delete_byOwnerCleansUpRelatedData() {
        when(memberRepository.existsByMeetingIdAndUserId(MEETING_ID, OWNER_ID)).thenReturn(true);

        meetingService.delete(MEETING_ID, OWNER_ID);

        // 고아 데이터가 남지 않아야 한다 (자문서: 모임 삭제 시 연관 데이터 미정리)
        verify(archiveRepository).deleteByMeetingId(MEETING_ID);
        verify(voteRepository).deleteByMeetingId(MEETING_ID);
        verify(memberRepository).deleteByMeetingId(MEETING_ID);
        verify(meetingRepository).delete(meeting);
    }

    // ─────────────────────── 생성 / 상태 ───────────────────────

    @Test
    @DisplayName("모임 생성은 항상 투표 중으로 시작한다 (클라이언트가 status 를 못 정한다)")
    void create_alwaysStartsAsVoting() {
        when(meetingRepository.save(any(Meeting.class))).thenAnswer(invocation -> {
            Meeting saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 100L);
            return saved;
        });
        when(memberRepository.countByMeetingId(100L)).thenReturn(1L);

        MeetingResponse response = meetingService.create(
                new MeetingCreateRequest("새 모임", "🥾", 1, "투표 진행 중"), OWNER_ID);

        assertThat(response.status()).isEqualTo("voting");
    }
}
