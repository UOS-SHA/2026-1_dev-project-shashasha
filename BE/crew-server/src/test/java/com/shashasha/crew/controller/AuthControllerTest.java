package com.shashasha.crew.controller;

import com.shashasha.crew.dto.AuthResponse;
import com.shashasha.crew.dto.LoginRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 인증 API 의 HTTP 계층 테스트 (보안 자문서 #6).
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private String signupBody(String password) {
        return """
                {
                  "email": "test@example.com",
                  "password": "%s",
                  "nickname": "테스터",
                  "agreedService": true,
                  "agreedPrivacy": true
                }
                """.formatted(password);
    }

    @Test
    @DisplayName("12자 미만 비밀번호로는 가입할 수 없다")
    void signup_rejectsShortPassword() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody("test1234")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));

        verify(authService, never()).signup(any());
    }

    @Test
    @DisplayName("12자 이상 비밀번호는 가입 처리로 넘어간다")
    void signup_acceptsLongEnoughPassword() throws Exception {
        when(authService.signup(any())).thenReturn(
                new AuthResponse("token", new AuthResponse.UserSummary(1L, "테스터", "test@example.com")));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody("twelvechars1")))
                .andExpect(status().isCreated());

        verify(authService).signup(any());
    }

    @Test
    @DisplayName("로그인 시 요청 출발지 IP 가 시도 제한으로 전달된다")
    void login_passesClientIpToService() throws Exception {
        when(authService.login(any(), anyString())).thenReturn(
                new AuthResponse("token", new AuthResponse.UserSummary(1L, "테스터", "test@example.com")));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"test@example.com","password":"twelvechars1"}
                                """))
                .andExpect(status().isOk());

        ArgumentCaptor<String> ip = ArgumentCaptor.forClass(String.class);
        verify(authService).login(any(LoginRequest.class), ip.capture());
        assertThat(ip.getValue()).isNotBlank();
    }

    @Test
    @DisplayName("시도 제한에 걸리면 429 로 응답한다")
    void login_returns429WhenRateLimited() throws Exception {
        when(authService.login(any(), anyString())).thenThrow(new ApiException(
                HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_LOGIN_ATTEMPTS",
                "로그인 시도가 너무 많습니다. 300초 후에 다시 시도해 주세요"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"victim@example.com","password":"0000"}
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("TOO_MANY_LOGIN_ATTEMPTS"));
    }

    @Test
    @DisplayName("계정 없음과 비밀번호 불일치는 같은 401 LOGIN_FAILED 로 응답한다")
    void login_doesNotRevealWhetherAccountExists() throws Exception {
        when(authService.login(any(), anyString())).thenThrow(new ApiException(
                HttpStatus.UNAUTHORIZED, "LOGIN_FAILED", "이메일 또는 비밀번호가 올바르지 않습니다"));

        for (String email : new String[]{"exists@example.com", "does-not-exist@example.com"}) {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"%s","password":"wrongpassword"}
                                    """.formatted(email)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("LOGIN_FAILED"))
                    .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 올바르지 않습니다"));
        }

        verify(authService, never()).signup(eq(null));
    }
}
