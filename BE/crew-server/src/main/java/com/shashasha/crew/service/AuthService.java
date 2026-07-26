package com.shashasha.crew.service;

import com.shashasha.crew.domain.User;
import com.shashasha.crew.dto.AuthResponse;
import com.shashasha.crew.dto.LoginRequest;
import com.shashasha.crew.dto.SignupRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.UserRepository;
import com.shashasha.crew.security.JwtTokenProvider;
import com.shashasha.crew.security.LoginAttemptGuard;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * 회원가입 / 로그인 비즈니스 로직.
 *  - 회원가입: 이메일 중복 검사 → 비밀번호 암호화 → 저장 → 토큰 발급
 *  - 로그인:   이메일로 사용자 찾기 → 비밀번호 대조 → 토큰 발급
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StarterMeetingSeeder starterMeetingSeeder;
    private final LoginAttemptGuard loginAttemptGuard;

    /**
     * 계정이 없을 때도 비밀번호 대조를 한 번 수행하기 위한 더미 해시.
     *
     * 사용자를 못 찾으면 BCrypt 를 건너뛰고 바로 실패를 돌려주는데, 그러면 응답 시간 차이만으로
     * "이 이메일이 가입되어 있는지"를 알아낼 수 있다(BCrypt 대조는 수십~수백 ms 가 걸린다).
     * 그래서 없는 계정에도 같은 비용을 들인다. 아무 비밀번호와도 일치하지 않아야 하므로
     * 무작위 값으로 만들고 원문은 버린다. (직접 적은 해시 문자열은 형식이 조금만 틀려도
     * BCrypt 가 계산 없이 false 를 반환해 이 보호가 조용히 사라지므로, 실제로 인코딩해 만든다)
     */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider, StarterMeetingSeeder starterMeetingSeeder,
                       LoginAttemptGuard loginAttemptGuard) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.starterMeetingSeeder = starterMeetingSeeder;
        this.loginAttemptGuard = loginAttemptGuard;

        byte[] random = new byte[32];
        new SecureRandom().nextBytes(random);
        this.dummyHash = passwordEncoder.encode(Base64.getEncoder().encodeToString(random));
    }

    /** 회원가입 후 곧바로 로그인된 것처럼 토큰을 발급해 돌려준다. */
    @Transactional
    public AuthResponse signup(SignupRequest req) {
        // 1) 필수 약관 동의 확인
        if (!Boolean.TRUE.equals(req.agreedService()) || !Boolean.TRUE.equals(req.agreedPrivacy())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TERMS_NOT_AGREED",
                    "서비스 약관과 개인정보 처리방침에 동의해야 가입할 수 있습니다");
        }

        // 2) 이메일 중복 검사 → 있으면 409.
        //    대소문자만 다른 주소로 같은 사람이 두 계정을 만들지 못하게 정규화한 값으로 비교/저장한다.
        String email = User.normalizeEmail(req.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_DUPLICATED",
                    "이미 가입된 이메일입니다");
        }

        // 3) 비밀번호는 BCrypt 로 암호화해서 저장 (원문은 절대 저장하지 않음)
        String passwordHash = passwordEncoder.encode(req.password());

        // 4) @아이디(handle)는 이메일 앞부분으로 자동 생성 (예: test@... → @test).
        //    다른 사람이 이미 쓰는 값이면 뒤에 숫자를 붙여 유일하게 만든다.
        String handle = generateUniqueHandle(email);

        User user = new User(
                email,
                passwordHash,
                req.nickname(),
                req.bio(),
                handle,
                // 안 보낸 값은 기본값으로: 알림/맞춤은 켜짐, 마케팅 동의는 꺼짐
                req.notificationEnabled() == null || req.notificationEnabled(),
                req.personalizeEnabled() == null || req.personalizeEnabled(),
                true,  // 위에서 동의 확인을 통과했으므로 true
                true,
                Boolean.TRUE.equals(req.agreedMarketing())
        );
        User saved = userRepository.save(user);

        // 새 사용자에게 "나만의 시작 모임"을 만들어 준다 (투표~확정 흐름을 바로 체험할 수 있도록).
        starterMeetingSeeder.seedFor(saved.getId());

        String token = tokenProvider.createToken(saved.getId());
        return AuthResponse.of(token, saved);
    }

    /**
     * 로그인: 이메일/비밀번호가 맞으면 토큰을 발급한다.
     *
     * 실패가 쌓이면 LoginAttemptGuard 가 잠시 막는다. 시도 제한이 없으면 공격자가 흔한 비밀번호
     * 목록을 서버가 받아주는 속도만큼 계속 넣어볼 수 있어서, 짧은 비밀번호는 시간문제로 뚫린다.
     *
     * @param clientIp 요청 출발지 (계정별 제한과 함께 IP별 제한에도 사용)
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req, String clientIp) {
        String email = User.normalizeEmail(req.email());
        loginAttemptGuard.checkAllowed(email, clientIp);

        // 대소문자가 다른 주소로 가입된 기존 계정도 로그인되도록 IgnoreCase 로 찾는다.
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        // "이메일이 없음"과 "비밀번호가 틀림"을 응답으로도, 응답 시간으로도 구분되지 않게 한다.
        // (계정이 없어도 BCrypt 대조를 한 번 수행해 같은 비용을 들인다)
        String hash = user == null ? dummyHash : user.getPasswordHash();
        boolean matched = passwordEncoder.matches(req.password(), hash);

        if (user == null || !matched) {
            loginAttemptGuard.recordFailure(email, clientIp);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED",
                    "이메일 또는 비밀번호가 올바르지 않습니다");
        }

        loginAttemptGuard.recordSuccess(email);
        String token = tokenProvider.createToken(user.getId());
        return AuthResponse.of(token, user);
    }

    /**
     * 이메일 앞부분으로 @아이디를 만들되, 이미 쓰이는 값이면 뒤에 숫자를 붙여 유일하게 만든다.
     * handle 은 친구 추가의 검색 키라서 중복되면 "누구를 추가한 것인지"가 불확정해진다.
     */
    private String generateUniqueHandle(String email) {
        String localPart = email.split("@")[0];
        // 허용 문자만 남기고(User.HANDLE_REGEX 와 같은 집합), 숫자 접미사가 들어갈 자리를 남겨 자른다.
        String base = localPart.replaceAll("[^A-Za-z0-9._+-]", "");
        if (base.length() < 2) {
            base = "user";
        }
        if (base.length() > 16) {
            base = base.substring(0, 16);
        }

        String candidate = User.normalizeHandle(base);
        for (int suffix = 2; userRepository.existsByHandle(candidate); suffix++) {
            candidate = User.normalizeHandle(base + suffix);
        }
        return candidate;
    }
}
