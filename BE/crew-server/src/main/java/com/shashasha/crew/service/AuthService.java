package com.shashasha.crew.service;

import com.shashasha.crew.domain.User;
import com.shashasha.crew.dto.AuthResponse;
import com.shashasha.crew.dto.LoginRequest;
import com.shashasha.crew.dto.SignupRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.UserRepository;
import com.shashasha.crew.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /** 회원가입 후 곧바로 로그인된 것처럼 토큰을 발급해 돌려준다. */
    @Transactional
    public AuthResponse signup(SignupRequest req) {
        // 1) 필수 약관 동의 확인
        if (!Boolean.TRUE.equals(req.agreedService()) || !Boolean.TRUE.equals(req.agreedPrivacy())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TERMS_NOT_AGREED",
                    "서비스 약관과 개인정보 처리방침에 동의해야 가입할 수 있습니다");
        }

        // 2) 이메일 중복 검사 → 있으면 409
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_DUPLICATED",
                    "이미 가입된 이메일입니다");
        }

        // 3) 비밀번호는 BCrypt 로 암호화해서 저장 (원문은 절대 저장하지 않음)
        String passwordHash = passwordEncoder.encode(req.password());

        // 4) @아이디(handle)는 이메일 앞부분으로 자동 생성 (예: test@... → @test)
        String handle = "@" + req.email().split("@")[0];

        User user = new User(
                req.email(),
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

        String token = tokenProvider.createToken(saved.getId());
        return AuthResponse.of(token, saved);
    }

    /** 로그인: 이메일/비밀번호가 맞으면 토큰을 발급한다. */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // 보안상 "이메일이 없음"과 "비밀번호가 틀림"을 구분하지 않고 똑같이 401 로 응답한다.
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED",
                        "이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "LOGIN_FAILED",
                    "이메일 또는 비밀번호가 올바르지 않습니다");
        }

        String token = tokenProvider.createToken(user.getId());
        return AuthResponse.of(token, user);
    }
}
