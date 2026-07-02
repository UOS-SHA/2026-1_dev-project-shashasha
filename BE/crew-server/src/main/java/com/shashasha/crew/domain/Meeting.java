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

    @Enumerated(EnumType.STRING) // enum 을 "CONFIRMED" 같은 문자열로 저장 (숫자보다 안전)
    @Column(nullable = false)
    private MeetingStatus status;

    // JPA 는 빈 생성자가 반드시 필요하다 (규칙)
    protected Meeting() {
    }

    // 새 모임을 코드에서 만들 때 쓰는 생성자 (id 는 DB가 채우므로 받지 않음)
    public Meeting(String name, String emoji, int memberCount, String nextLabel, MeetingStatus status) {
        this.name = name;
        this.emoji = emoji;
        this.memberCount = memberCount;
        this.nextLabel = nextLabel;
        this.status = status;
    }

    // 기존 모임의 내용을 통째로 바꾼다 (PUT /meetings/{id} 에서 사용).
    // 엔티티에 setter 를 흩어놓지 않고, "한 번에 갱신"하는 메서드로 모아 두면 변경 지점이 명확하다.
    public void update(String name, String emoji, int memberCount, String nextLabel, MeetingStatus status) {
        this.name = name;
        this.emoji = emoji;
        this.memberCount = memberCount;
        this.nextLabel = nextLabel;
        this.status = status;
    }

    // 조회용 getter 들 (JPA 와 JSON 변환이 이 메서드들을 사용한다)
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmoji() { return emoji; }
    public int getMemberCount() { return memberCount; }
    public String getNextLabel() { return nextLabel; }
    public MeetingStatus getStatus() { return status; }
}
