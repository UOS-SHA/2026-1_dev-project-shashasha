package com.shashasha.crew.domain;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 활동 기록(ArchiveRecord) 엔티티 = DB 의 archive_record 테이블 한 줄.
 *
 * FE(archive/_layout.tsx)의 ArchiveRecord 타입과 맞췄다:
 *   { id, round, date, day, place, title, summary, attendees[], absentees[], photos, color, thumbnail }
 *
 * 사용자가 입력하는 값은 date/place/summary/attendees/absentees 뿐이고,
 * round/day/title/color/thumbnail/photos 는 서버(ArchiveService)가 자동으로 채운다.
 * (원래 FE 가 하던 계산을 서버로 옮긴 것.)
 */
@Entity
@Table(name = "archive_record")
public class ArchiveRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;             // 이 기록의 주인 (User.id)

    @Column(nullable = false)
    private int round;              // 회차 (사용자별 1,2,3...)

    @Column(nullable = false)
    private String date;            // "2025.04.12" 형식 (FE 와 동일)

    private String day;             // 요일 라벨 (예: "토") — date 로부터 계산

    private String place;           // 장소

    private String title;           // "1회차 활동 기록" — round 로부터 계산

    @Column(length = 1000)
    private String summary;         // 활동 요약

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "archive_attendees", joinColumns = @JoinColumn(name = "record_id"))
    @Column(name = "name")
    private List<String> attendees = new ArrayList<>();   // 참석자 이름들

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "archive_absentees", joinColumns = @JoinColumn(name = "record_id"))
    @Column(name = "name")
    private List<String> absentees = new ArrayList<>();   // 불참자 이름들

    private int photos;             // 사진 개수 (지금은 기본값)
    private String color;           // 회차 배지 색 (팔레트에서 자동 배정)
    private String thumbnail;       // 썸네일 배경색 (팔레트에서 자동 배정)

    protected ArchiveRecord() {
    }

    public ArchiveRecord(Long userId, int round, String date, String day, String place,
                         String title, String summary, List<String> attendees, List<String> absentees,
                         int photos, String color, String thumbnail) {
        this.userId = userId;
        this.round = round;
        this.date = date;
        this.day = day;
        this.place = place;
        this.title = title;
        this.summary = summary;
        this.attendees = new ArrayList<>(attendees);
        this.absentees = new ArrayList<>(absentees);
        this.photos = photos;
        this.color = color;
        this.thumbnail = thumbnail;
    }

    /** 사용자가 고칠 수 있는 값(날짜/요일/장소/요약/참석·불참)만 갱신한다. round/색상 등은 유지. */
    public void update(String date, String day, String place, String summary,
                       List<String> attendees, List<String> absentees) {
        this.date = date;
        this.day = day;
        this.place = place;
        this.summary = summary;
        this.attendees = new ArrayList<>(attendees);
        this.absentees = new ArrayList<>(absentees);
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public int getRound() { return round; }
    public String getDate() { return date; }
    public String getDay() { return day; }
    public String getPlace() { return place; }
    public String getTitle() { return title; }
    public String getSummary() { return summary; }
    public List<String> getAttendees() { return attendees; }
    public List<String> getAbsentees() { return absentees; }
    public int getPhotos() { return photos; }
    public String getColor() { return color; }
    public String getThumbnail() { return thumbnail; }
}
