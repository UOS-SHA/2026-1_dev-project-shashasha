package com.shashasha.crew.config;

import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.security.JwtTokenProvider;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 인증 관련 공통 빈(Bean) 설정.
 *  1) PasswordEncoder : 비밀번호를 BCrypt 로 암호화/대조하는 도구.
 *  2) JwtAuthFilter 등록 : 로그인이 필요한 "내 데이터" 경로에 토큰 검사 문지기를 세운다.
 *     - 보호: /users, /schedules, /archives, /friends (사용자별 개인 데이터)
 *     - 공개: 로그인/회원가입(/auth/**) 과 모임 목록(/meetings) 은 토큰 없이도 접근 가능
 */
@Configuration
public class SecurityConfig {

    /** BCrypt: 같은 비밀번호라도 매번 다른 해시가 나오고, 원문 복원이 불가능한 안전한 단방향 암호화 */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** JWT 문지기 필터를 로그인이 필요한 경로들에 적용해 등록한다. */
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilter(JwtTokenProvider tokenProvider) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new JwtAuthFilter(tokenProvider));
        // 컬렉션 경로(/schedules)와 하위 경로(/schedules/123)를 모두 확실히 잡으려고 둘 다 등록한다.
        registration.addUrlPatterns(
                "/users", "/users/*",
                "/schedules", "/schedules/*",
                "/archives", "/archives/*",
                "/friends", "/friends/*"
        );
        registration.setOrder(1);
        return registration;
    }
}
