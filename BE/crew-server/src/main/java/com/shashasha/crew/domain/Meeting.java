package com.shashasha.crew.domain;

import jakarta.persistence.*;

/**
 * 모임(Meeting) 엔티티 = DB 의 meeting 테이블 한 줄.
 *
 * @Entity 가 붙으면 JPA 가 이 클래스를 보고 테이블을 자동으로 만들어준다.
 * 지금은 홈 화면(home/index.tsx)의 하드코딩 데이터와 똑같은 필드만 담았다.
 * (나중에 멤버, 날짜 등을 제대로 모델링하면서 확장하면 된다.)
 */
@Entity
@Table(name = "meeting")
public class Meeting {

    @Id // 기본키(PK) — 각 줄을 구분하는 고유 번호
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB가 1,2,3... 자동 증가
    private Long id;

    @Column(nullable = false)
    private String name;        // 예: "수요 독서 모임"

    private String emoji;       // 예: "📚"

    @Column(nullable = false)
    private int memberCount;    // FE 의 members

    private String nextLabel;   // 예: "6월 13일 토 · 오후 2:00"

    // 투표로 확정된 시간대 코드(예: "sat-14"). 아직 확정 전이면 null.
    // 확정 여부의 유일한 판단 근거다 (status 컬럼이 아니라 이 값을 본다).
    private String confirmedSlot;

    // 확정 상태를 DB 컬럼으로도 남긴다(조회 쿼리·기존 데이터 호환용).
    // 쓰기는 confirm() 한 곳에서만 하고, 읽기는 getStatus() 가 confirmedSlot 으로 계산한다.
    @Enumerated(EnumType.STRING) // enum 을 "CONFIRMED" 같은 문자열로 저장 (숫자보다 안전)
    @Column(nullable = false)
    private MeetingStatus status;

    // 모임을 만든 사람(방장)의 userId. 방장만 강제 확정 등 권한을 가진다.
    private Long creatorId;

    // JPA 는 빈 생성자가 반드시 필요하다 (규칙)
    protected Meeting() {
    }

    // 새 모임을 코드에서 만들 때 쓰는 생성자 (id 는 DB가 채우므로 받지 않음).
    // 새 모임은 확정 슬롯이 없으니 언제나 VOTING 으로 시작한다 — 상태를 외부에서 받지 않는다.
    public Meeting(String name, String emoji, int memberCount, String nextLabel) {
        this.name = name;
        this.emoji = emoji;
        this.memberCount = memberCount;
        this.nextLabel = nextLabel;
        this.status = MeetingStatus.VOTING;
    }

    // 기존 모임의 표시 정보를 바꾼다 (PUT /meetings/{id} 에서 사용).
    // 엔티티에 setter 를 흩어놓지 않고, "한 번에 갱신"하는 메서드로 모아 두면 변경 지점이 명확하다.
    // status / confirmedSlot 은 일부러 받지 않는다: 확정은 confirm() 만의 책임이다.
    public void update(String name, String emoji, int memberCount, String nextLabel) {
        this.name = name;
        this.emoji = emoji;
        this.memberCount = memberCount;
        this.nextLabel = nextLabel;
    }

    // 투표 결과로 시간대를 확정한다: 상태를 CONFIRMED 로 바꾸고, 홈 카드에 보일 라벨도 갱신한다.
    public void confirm(String slotCode, String nextLabel) {
        this.confirmedSlot = slotCode;
        this.status = MeetingStatus.CONFIRMED;
        this.nextLabel = nextLabel;
    }

    // 방장(만든 사람)을 지정한다. 생성 직후 한 번만 설정한다.
    public void assignCreator(Long creatorId) {
        this.creatorId = creatorId;
    }

    // 조회용 getter 들 (JPA 와 JSON 변환이 이 메서드들을 사용한다)
    public Long getId() { return id; }
    public Long getCreatorId() { return creatorId; }
    public String getConfirmedSlot() { return confirmedSlot; }
    public String getName() { return name; }
    public String getEmoji() { return emoji; }
    public int getMemberCount() { return memberCount; }
    public String getNextLabel() { return nextLabel; }

    /** 확정 여부. 투표 가능 판단(MatchingService)과 화면 표시가 같은 값을 보게 하는 기준. */
    public boolean isConfirmed() { return confirmedSlot != null; }

    /**
     * 표시용 상태. 저장된 status 컬럼을 그대로 돌려주지 않고 확정 슬롯에서 계산한다.
     * 예전에는 클라이언트가 status 를 직접 지정할 수 있어서 "화면은 확정인데 투표는 계속 되는"
     * 모순 상태가 저장될 수 있었다. 이제 두 값은 구조적으로 어긋날 수 없다.
     */
    public MeetingStatus getStatus() {
        return isConfirmed() ? MeetingStatus.CONFIRMED : MeetingStatus.VOTING;
    }
}
