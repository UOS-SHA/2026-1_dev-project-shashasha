package com.shashasha.crew.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 보호된 경로(/users/**)로 들어오는 요청을 컨트롤러보다 먼저 가로채서 토큰을 검사하는 "문지기".
 *
 * 흐름:
 *   1) Authorization 헤더에서 "Bearer <토큰>" 을 꺼낸다.
 *   2) 없거나 형식이 틀리면 → 401 로 막는다.
 *   3) 토큰이 위조/만료면 → 401 로 막는다.
 *   4) 유효하면 → 토큰 속 userId 를 request 에 담아두고 통과시킨다.
 *      컨트롤러는 request.getAttribute("userId") 로 "지금 요청한 사람"을 알 수 있다.
 *
 * 이 필터를 어떤 경로에 적용할지는 FilterConfig 에서 정한다.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    /** request 에 userId 를 담아둘 때 쓰는 키. 컨트롤러도 이 상수를 함께 쓴다. */
    public static final String USER_ID_ATTRIBUTE = "userId";

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider tokenProvider;

    public JwtAuthFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 브라우저의 CORS 사전 요청(OPTIONS)은 토큰 없이도 통과시켜야 한다.
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            writeUnauthorized(response, "로그인이 필요합니다");
            return;
        }

        String token = header.substring(BEARER_PREFIX.length());
        if (!tokenProvider.isValid(token)) {
            writeUnauthorized(response, "토큰이 유효하지 않거나 만료되었습니다");
            return;
        }

        // 통과: "지금 요청한 사람"의 id 를 담아두고 다음 단계로
        request.setAttribute(USER_ID_ATTRIBUTE, tokenProvider.getUserId(token));
        filterChain.doFilter(request, response);
    }

    /** 401 응답을 공통 에러 형식 JSON 으로 직접 써준다. */
    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        // 따옴표 깨짐을 막으려고 메시지의 " 를 escape 한다.
        String safe = message.replace("\"", "\\\"");
        response.getWriter().write(
                "{\"status\":401,\"error\":\"UNAUTHORIZED\",\"message\":\"" + safe + "\"}"
        );
    }
}
