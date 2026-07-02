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
@Table(name = "schedule")
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
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "schedule_days", joinColumns = @JoinColumn(name = "schedule_id"))
    @Column(name = "day_index")
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
