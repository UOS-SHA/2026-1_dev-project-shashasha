import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import type { AuthUser } from '@/api/auth';

// SecureStore 키. 토큰과 최소 사용자 정보를 기기에 안전하게 보관한다.
const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

// 인터셉터(비 React 컨텍스트)에서 동기적으로 토큰을 읽기 위한 캐시.
// zustand store 와 항상 함께 갱신한다.
let currentToken: string | null = null;

/** apiClient 요청 인터셉터가 헤더에 붙일 현재 토큰을 반환한다. */
export function getAuthToken(): string | null {
  return currentToken;
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  /** 앱 시작 시 SecureStore 에서 토큰을 복원한다. */
  restore: () => Promise<void>;
  /** 로그인/회원가입 성공 시 토큰+사용자 정보를 저장한다. */
  setAuth: (token: string, user: AuthUser) => Promise<void>;
  /** 로그아웃: 저장된 인증 정보를 모두 제거한다. */
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  status: 'loading',

  restore: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (token) {
        currentToken = token;
        const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
        set({ token, user, status: 'authenticated' });
        return;
      }
    } catch {
      // 저장소 접근 실패 시에는 로그아웃 상태로 시작한다.
    }

    currentToken = null;
    set({ token: null, user: null, status: 'unauthenticated' });
  },

  setAuth: async (token, user) => {
    currentToken = token;
    set({ token, user, status: 'authenticated' });
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  },

  signOut: async () => {
    currentToken = null;
    set({ token: null, user: null, status: 'unauthenticated' });
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
}));
