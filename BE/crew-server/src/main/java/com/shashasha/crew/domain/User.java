package com.shashasha.crew.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * 사용자(User) 엔티티 = DB 의 users 테이블 한 줄.
 *
 * 회원가입 시 만들어지고, 로그인의 기준이 된다.
 * 비밀번호는 절대 원문 그대로 저장하지 않고, BCrypt 로 단방향 암호화한 값(passwordHash)만 저장한다.
 *
 * API_SPEC 의 UserPreferences(알림/맞춤/약관동의)는 MVP 단계라 별도 테이블 대신
 * 이 User 안의 컬럼들로 함께 담았다. (나중에 분리해도 됨)
 */
@Entity
@Table(name = "users") // "user" 는 일부 DB 의 예약어라 충돌을 피하려고 복수형 users 사용
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // 이메일은 로그인 키라서 중복 불가
    private String email;

    @Column(nullable = false)
    private String passwordHash;             // BCrypt 로 암호화된 비밀번호 (원문 아님)

    @Column(nullable = false, length = 12)
    private String nickname;                 // 닉네임 (최대 12자)

    @Column(length = 40)
    private String bio;                      // 한줄 소개 (최대 40자, 선택)

    private String handle;                   // @아이디 (가입 시 이메일 앞부분으로 자동 생성)

    private String profileImageUrl;          // 프로필 사진 URL (선택)

    @Column(nullable = false)
    private LocalDateTime joinedAt;          // 가입일

    // ── 온보딩에서 수집하는 설정/약관 동의 (UserPreferences) ──
    private boolean notificationEnabled;     // 알림 허용
    private boolean personalizeEnabled;      // 맞춤 추천 허용
    private boolean agreedService;           // (필수) 서비스 약관 동의
    private boolean agreedPrivacy;           // (필수) 개인정보 처리방침 동의
    private boolean agreedMarketing;         // (선택) 마케팅 수신 동의

    // JPA 는 빈 생성자가 반드시 필요하다 (규칙)
    protected User() {
    }

    // 회원가입 시 코드에서 새 User 를 만드는 생성자 (id, joinedAt 은 서버가 채움)
    public User(String email, String passwordHash, String nickname, String bio, String handle,
                boolean notificationEnabled, boolean personalizeEnabled,
                boolean agreedService, boolean agreedPrivacy, boolean agreedMarketing) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.bio = bio;
        this.handle = handle;
        this.notificationEnabled = notificationEnabled;
        this.personalizeEnabled = personalizeEnabled;
        this.agreedService = agreedService;
        this.agreedPrivacy = agreedPrivacy;
        this.agreedMarketing = agreedMarketing;
        this.joinedAt = LocalDateTime.now();
    }

    // 조회용 getter 들
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getNickname() { return nickname; }
    public String getBio() { return bio; }
    public String getHandle() { return handle; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public boolean isNotificationEnabled() { return notificationEnabled; }
    public boolean isPersonalizeEnabled() { return personalizeEnabled; }
    public boolean isAgreedService() { return agreedService; }
    public boolean isAgreedPrivacy() { return agreedPrivacy; }
    public boolean isAgreedMarketing() { return agreedMarketing; }
}
