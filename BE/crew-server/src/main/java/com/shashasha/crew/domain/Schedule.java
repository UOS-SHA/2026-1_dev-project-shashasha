package com.shashasha.crew.domain;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 개인 일정(Schedule) 엔티티 = DB 의 schedule 테이블 한 줄.
 *
 * FE(personal-schedule/index.tsx)의 Schedule 타입과 똑같이 맞췄다:
 *   { t, tp: 'fixed'|'variable', days: number[], sh, sm, eh, em }
 *
 * 일정은 "누구의 것"인지가 중요하므로 userId(주인)를 함께 저장한다.
 * (JwtAuthFilter 가 넣어준 토큰 주인의 id 로 조회/수정/삭제 권한을 가른다.)
 */
@Entity
// 애플리케이션 검증(ScheduleRequest, ScheduleService)이 뚫리거나 다른 경로로 데이터가 들어와도
// 존재할 수 없는 시각이 저장되지 않게 DB 에도 같은 규칙을 건다.
// 주의: ddl-auto=update 는 테이블을 "새로 만들 때"만 이 제약을 넣는다. 이미 있는 테이블에는
//      추가해주지 않으므로, 기존 DB 에 반영하려면 스키마를 새로 만들거나 ALTER TABLE 을 직접 실행해야 한다.
@Table(name = "schedule", check = @CheckConstraint(
        name = "chk_schedule_time",
        constraint = "start_hour BETWEEN 0 AND 23 AND end_hour BETWEEN 0 AND 23"
                + " AND start_minute BETWEEN 0 AND 59 AND end_minute BETWEEN 0 AND 59"
                + " AND (start_hour * 60 + start_minute) < (end_hour * 60 + end_minute)"))
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;              // 이 일정의 주인 (User.id)

    @Column(nullable = false)
    private String title;             // FE 의 t (예: "알바")

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleType type;        // FE 의 tp (fixed/variable)

    // 요일 배열(0=월 ~ 6=일). @ElementCollection 으로 schedule_days 보조 테이블에 저장된다.
    // 0~6 을 벗어난 요일은 MatchingService 가 어떤 후보 시간대와도 매칭하지 못해 조용히 무시되므로,
    // 저장 단계에서 막는다.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "schedule_days", joinColumns = @JoinColumn(name = "schedule_id"))
    @Column(name = "day_index", check = @CheckConstraint(name = "chk_schedule_day_index",
            constraint = "day_index BETWEEN 0 AND 6"))
    private List<Integer> days = new ArrayList<>();

    @Column(nullable = false)
    private int startHour;            // FE 의 sh
    @Column(nullable = false)
    private int startMinute;          // FE 의 sm
    @Column(nullable = false)
    private int endHour;              // FE 의 eh
    @Column(nullable = false)
    private int endMinute;            // FE 의 em

    protected Schedule() {
    }

    public Schedule(Long userId, String title, ScheduleType type, List<Integer> days,
                    int startHour, int startMinute, int endHour, int endMinute) {
        this.userId = userId;
        this.title = title;
        this.type = type;
        this.days = new ArrayList<>(days);
        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;
    }

    /** 일정 내용을 통째로 갱신한다 (PUT /schedules/{id}). userId 는 바뀌지 않는다. */
    public void update(String title, ScheduleType type, List<Integer> days,
                       int startHour, int startMinute, int endHour, int endMinute) {
        this.title = title;
        this.type = type;
        this.days = new ArrayList<>(days);
        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public ScheduleType getType() { return type; }
    public List<Integer> getDays() { return days; }
    public int getStartHour() { return startHour; }
    public int getStartMinute() { return startMinute; }
    public int getEndHour() { return endHour; }
    public int getEndMinute() { return endMinute; }
}
