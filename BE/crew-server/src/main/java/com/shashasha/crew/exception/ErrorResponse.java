package com.shashasha.crew.exception;

/**
 * API_SPEC 의 공통 에러 응답 형식.
 *   { "status": 400, "error": "VALIDATION_ERROR", "message": "..." }
 */
public record ErrorResponse(int status, String error, String message) {
}
