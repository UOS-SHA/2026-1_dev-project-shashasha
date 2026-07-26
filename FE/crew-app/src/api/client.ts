import axios, { AxiosError } from "axios";

import { getAuthToken, notifyUnauthorized } from "./session";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  // Render 무료 티어는 유휴 시 서버가 잠들어 첫 요청에 콜드스타트(~30-60초)가 걸린다.
  // 10초로는 첫 요청이 타임아웃돼 "연결 실패"로 보이므로 60초로 늘린다.
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// 저장된 JWT 토큰이 있으면 모든 요청에 Authorization 헤더를 붙인다.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 토큰이 무효해진 경우(만료·서명키 교체·계정 삭제) 서버는 401 을 돌려준다.
 * 이때 저장된 토큰을 정리하지 않으면 앱은 로그인된 것처럼 보이면서 모든 화면에서 인증 오류만 반복한다.
 *
 * 401 에만 반응한다는 점이 중요하다. 네트워크 장애나 500 까지 로그아웃으로 처리하면
 * 서버 재시작·비행기 모드처럼 토큰과 무관한 상황에서 사용자를 쫓아내게 된다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

/**
 * 백엔드 에러 응답을 사용자에게 보여줄 한 줄 메시지로 정규화한다.
 * 백엔드는 공통 에러 형식 { message, ... } 로 응답하므로 그 message 를 우선 사용한다.
 */
export function toApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as { message?: string } | undefined;
      return data?.message ?? fallback;
    }
    // 응답 자체가 없으면 네트워크/서버 연결 문제.
    return "서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.";
  }
  return fallback;
}
