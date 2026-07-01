package com.shashasha.crew.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        // 비밀 문자열을 HMAC-SHA 서명용 키로 변환 (secret 은 32바이트 이상이어야 함)
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
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
