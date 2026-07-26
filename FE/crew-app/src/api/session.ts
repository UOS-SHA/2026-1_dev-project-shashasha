/**
 * API 계층과 인증 스토어 사이의 얇은 연결 지점.
 *
 * 이 파일은 아무것도 import 하지 않는다. apiClient 는 토큰을 읽어야 하고 스토어는 토큰을 써야 하는데,
 * 둘이 서로를 직접 import 하면 client → store → api/auth → client 순환 참조가 생긴다.
 * 그래서 "값을 담아두는 곳"만 여기 두고 양쪽이 이 파일만 바라보게 한다.
 */

// 인터셉터(비 React 컨텍스트)에서 동기적으로 읽어야 하므로 스토어 밖에 캐시한다.
let currentToken: string | null = null;

/** apiClient 요청 인터셉터가 헤더에 붙일 현재 토큰. */
export function getAuthToken(): string | null {
  return currentToken;
}

/** 로그인/로그아웃/복원 시 스토어가 토큰 캐시를 갱신한다. */
export function setAuthToken(token: string | null): void {
  currentToken = token;
}

// 서버가 401 을 돌려줬을 때 실행할 처리(= 로그아웃). 스토어가 시작 시 등록한다.
let unauthorizedHandler: (() => void) | null = null;

/** 인증 스토어가 "401 이면 이렇게 처리해라"를 등록한다. */
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

/** apiClient 응답 인터셉터가 401 을 만났을 때 호출한다. */
export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}
