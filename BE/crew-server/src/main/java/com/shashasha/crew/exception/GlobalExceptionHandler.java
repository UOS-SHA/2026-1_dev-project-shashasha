package com.shashasha.crew.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 모든 컨트롤러에서 발생한 예외를 한 곳에서 잡아 공통 에러 형식으로 변환한다.
 * @RestControllerAdvice = "전역 예외 처리 + JSON 응답" 담당.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 우리가 의도적으로 던진 예외 (중복 409, 인증 실패 401 등) */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException e) {
        ErrorResponse body = new ErrorResponse(e.getStatus().value(), e.getError(), e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(body);
    }

    /** @Valid 검증 실패 → 400. 첫 번째 검증 메시지를 사용자에게 보여준다. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("입력값이 올바르지 않습니다");
        ErrorResponse body = new ErrorResponse(400, "VALIDATION_ERROR", message);
        return ResponseEntity.badRequest().body(body);
    }
}
