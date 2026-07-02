import { AxiosError } from 'axios';

import { apiClient } from './client';

// 백엔드 AuthResponse.UserSummary 와 1:1 대응.
export type AuthUser = {
  id: number;
  nickname: string;
  email: string;
};

// 백엔드 AuthResponse 와 1:1 대응.
export type AuthResponse = {
  token: string;
  user: AuthUser;
};

// POST /auth/signup 요청 body (백엔드 SignupRequest 와 대응).
// 선택 항목은 생략 가능하며 서버가 기본값으로 처리한다.
export type SignupPayload = {
  email: string;
  password: string;
  nickname: string;
  bio?: string;
  notificationEnabled?: boolean;
  personalizeEnabled?: boolean;
  agreedService?: boolean;
  agreedPrivacy?: boolean;
  agreedMarketing?: boolean;
};

// POST /auth/login 요청 body (백엔드 LoginRequest 와 대응).
export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * 백엔드 에러 응답을 사용자에게 보여줄 한 줄 메시지로 정규화한다.
 * Spring 은 { message, ... } 형태로 에러를 내려주므로 그 message 를 우선 사용한다.
 */
export function toAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as { message?: string } | undefined;
      if (data?.message) {
        return data.message;
      }
      return fallback;
    }
    // 응답 자체가 없으면 네트워크/서버 연결 문제.
    return '서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.';
  }
  return fallback;
}

/** POST /auth/signup → 회원가입 후 토큰+사용자 정보를 반환. */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
  return data;
}

/** POST /auth/login → 로그인 후 토큰+사용자 정보를 반환. */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

/** GET /users/me → 현재 로그인된 사용자 프로필 조회(토큰 필요). */
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/users/me');
  return data;
}
