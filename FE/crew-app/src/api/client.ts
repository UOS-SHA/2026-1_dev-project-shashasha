import axios, { AxiosError } from "axios";

import { getAuthToken } from "@/store/auth";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
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
