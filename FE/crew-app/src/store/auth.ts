import { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { getMyProfile, type AuthUser } from '@/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '@/api/session';

// SecureStore 키. 토큰과 최소 사용자 정보를 기기에 안전하게 보관한다.
const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

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
    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      // 저장소 접근 실패 시에는 로그아웃 상태로 시작한다.
    }

    if (!token) {
      setAuthToken(null);
      set({ token: null, user: null, status: 'unauthenticated' });
      return;
    }

    // 토큰이 "있다"는 것만으로 로그인 상태로 만들면 안 된다. 만료되거나 서명키가 교체된 토큰도
    // 복원되어, 앱은 로그인된 것처럼 보이지만 모든 요청이 401 로 실패하는 상태가 된다.
    // 그래서 서버에 실제로 물어본다(GET /users/me).
    setAuthToken(token);
    try {
      const profile = await getMyProfile();
      const user: AuthUser = {
        id: profile.id,
        nickname: profile.nickname,
        email: profile.email,
      };
      set({ token, user, status: 'authenticated' });
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (error) {
      // 401 = 토큰이 실제로 무효 → 저장된 인증 정보를 버리고 로그아웃 상태로.
      if (error instanceof AxiosError && error.response?.status === 401) {
        setAuthToken(null);
        set({ token: null, user: null, status: 'unauthenticated' });
        await Promise.all([
          SecureStore.deleteItemAsync(TOKEN_KEY),
          SecureStore.deleteItemAsync(USER_KEY),
        ]);
        return;
      }

      // 네트워크 장애나 서버 오류(5xx)는 토큰이 무효라는 뜻이 아니다.
      // 비행기 모드나 서버 재시작 때문에 로그아웃시키면 안 되므로, 저장된 정보로 복원해 둔다.
      let cachedUser: AuthUser | null = null;
      try {
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        cachedUser = userJson ? (JSON.parse(userJson) as AuthUser) : null;
      } catch {
        // 캐시를 못 읽어도 토큰은 유효할 수 있으므로 그대로 진행한다.
      }
      set({ token, user: cachedUser, status: 'authenticated' });
    }
  },

  setAuth: async (token, user) => {
    setAuthToken(token);
    set({ token, user, status: 'authenticated' });
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
  },

  signOut: async () => {
    setAuthToken(null);
    set({ token: null, user: null, status: 'unauthenticated' });
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
}));

// 어떤 요청이든 401 을 받으면 곧바로 로그아웃시킨다.
// (무효한 토큰을 계속 들고 모든 화면에서 인증 오류를 반복하는 상태를 막는다)
setUnauthorizedHandler(() => {
  if (useAuthStore.getState().token !== null) {
    void useAuthStore.getState().signOut();
  }
});
