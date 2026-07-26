package com.shashasha.crew.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT(로그인 토큰) 발급/검증 담당.
 *
 * 토큰이란? "이 사람은 id=1 사용자다" 라는 정보를 서버의 비밀 열쇠로 서명한 문자열.
 * 서명되어 있어서, 누가 내용을 위조하면 검증에서 바로 걸린다.
 * 로그인 성공 시 발급해주고, 이후 요청 헤더에 담겨 오면 검증해서 "누구인지" 알아낸다.
 *
 * 이 안전장치는 서명키가 비밀일 때만 성립한다. 키가 저장소나 로그에 노출되면 공격자가
 * 원하는 userId 로 직접 서명해 정상 토큰을 만들 수 있으므로, 키는 환경변수로만 주입한다.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    /** HS256 서명키의 최소 길이(바이트). 이보다 짧은 값은 키로 쓰지 않는다. */
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        this.key = resolveKey(secret);
        this.expirationMs = expirationMs;
    }

    /**
     * 설정된 비밀 문자열을 서명용 키로 만든다.
     *
     * 값이 없거나 너무 짧으면 실행마다 무작위 키를 새로 만든다. 약한 키로 조용히 동작하는 것보다
     * 재시작 시 토큰이 만료되는 쪽이 안전하다 — 서명키가 알려지면 누구나 임의 사용자의 토큰을
     * 위조할 수 있어서, 로그인 자체가 의미를 잃는다.
     */
    private static SecretKey resolveKey(String secret) {
        byte[] bytes = secret == null ? new byte[0] : secret.trim().getBytes(StandardCharsets.UTF_8);

        if (bytes.length < MIN_SECRET_BYTES) {
            log.warn("JWT_SECRET 이 설정되지 않았거나 {}바이트보다 짧습니다. 이번 실행에만 쓰는 무작위 키를 "
                    + "생성합니다. 서버를 재시작하면 발급된 토큰이 모두 무효가 되므로, 운영 배포에서는 "
                    + "JWT_SECRET 환경변수를 반드시 설정하세요.", MIN_SECRET_BYTES);
            return Jwts.SIG.HS256.key().build();
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    /** userId 를 담은 토큰을 새로 발급한다. (subject = 사용자 PK) */
    public String createToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(String.valueOf(userId)) // 토큰 주인 = 사용자 id
                .issuedAt(now)                   // 발급 시각
                .expiration(expiry)              // 만료 시각
                .signWith(key)                   // 비밀 키로 서명
                .compact();
    }

    /**
     * 토큰을 검증하고 그 안의 userId 를 꺼낸다.
     * 서명이 틀렸거나 만료됐으면 JwtException 이 터지므로, 호출하는 쪽에서 401 처리하면 된다.
     */
    public Long getUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }

    /** 토큰이 유효하면 true, 위조/만료면 false. */
    public boolean isValid(String token) {
        try {
            getUserId(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
