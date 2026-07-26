package com.shashasha.crew.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 모임 상태 불변식 테스트.
 *
 * 예전에는 클라이언트가 status 를 직접 지정할 수 있어서 "화면은 확정인데 투표는 계속 되는" 모순
 * 상태가 저장될 수 있었다. 투표 차단은 confirmedSlot 으로 판단하는데 화면 표시는 status 를 보기 때문이다.
 * 이제 status 는 confirmedSlot 에서 계산되므로 두 값이 어긋날 수 없어야 한다.
 */
class MeetingTest {

    @Test
    @DisplayName("새 모임은 확정 슬롯이 없으니 투표 중이다")
    void newMeetingIsVoting() {
        Meeting meeting = new Meeting("수요 독서 모임", "📚", 3, "투표 진행 중");

        assertThat(meeting.isConfirmed()).isFalse();
        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.VOTING);
        assertThat(meeting.getConfirmedSlot()).isNull();
    }

    @Test
    @DisplayName("확정하면 상태와 확정 슬롯이 함께 바뀐다")
    void confirmSetsBothStatusAndSlot() {
        Meeting meeting = new Meeting("한강 러닝 크루", "🏃", 5, "투표 진행 중");

        meeting.confirm("sat-14", "6월 13일 토 · 오후 2:00");

        assertThat(meeting.isConfirmed()).isTrue();
        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.CONFIRMED);
        assertThat(meeting.getConfirmedSlot()).isEqualTo("sat-14");
    }

    @Test
    @DisplayName("모임 정보 수정은 확정 상태를 건드리지 못한다")
    void updateCannotChangeConfirmedState() {
        Meeting meeting = new Meeting("사이드 프로젝트", "💻", 2, "투표 진행 중");

        // 표시 정보만 바꾼다 — status 를 넘길 방법 자체가 없다(시그니처에 없음)
        meeting.update("변조 시도", "!", 1, "확정된 것처럼 보이는 라벨");

        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.VOTING);
        assertThat(meeting.getConfirmedSlot()).isNull();
        assertThat(meeting.getName()).isEqualTo("변조 시도");
    }

    @Test
    @DisplayName("확정된 모임을 수정해도 확정 상태가 풀리지 않는다")
    void updateKeepsConfirmedState() {
        Meeting meeting = new Meeting("확정된 모임", "✅", 4, "라벨");
        meeting.confirm("fri-12", "금요일 12시");

        meeting.update("이름만 변경", "✅", 4, "투표 중인 것처럼 보이는 라벨");

        assertThat(meeting.getStatus()).isEqualTo(MeetingStatus.CONFIRMED);
        assertThat(meeting.getConfirmedSlot()).isEqualTo("fri-12");
    }
}
