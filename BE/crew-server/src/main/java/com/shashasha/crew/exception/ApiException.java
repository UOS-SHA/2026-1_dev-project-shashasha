package com.shashasha.crew.exception;

import org.springframework.http.HttpStatus;

/**
 * 우리 서비스에서 의도적으로 던지는 예외.
 * 상태코드(409 등)와 에러코드(문자열), 사용자에게 보여줄 메시지를 함께 담는다.
 * GlobalExceptionHandler 가 이걸 잡아서 API_SPEC 의 공통 에러 형식으로 바꿔 응답한다.
 *
 * 예) throw new ApiException(HttpStatus.CONFLICT, "EMAIL_DUPLICATED", "이미 가입된 이메일입니다");
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String error;

    public ApiException(HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }

    public HttpStatus getStatus() { return status; }
    public String getError() { return error; }
}
