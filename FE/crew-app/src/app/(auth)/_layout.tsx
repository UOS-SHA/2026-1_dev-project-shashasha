import { router, Stack } from 'expo-router';
import { createContext, PropsWithChildren, ReactNode, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// 온보딩 데모용 색상 토큰 (앱 공통 파란 톤). green 키는 호환을 위해 유지하되 값은 파랑.
export const Onb = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  green: '#5B7FFF',
  greenDark: '#3F5BD6',
  chip: '#E3EAFF',
  chipText: '#3A4FC4',
  ink: '#1F2A24',
  sub: '#8A8F8A',
  line: '#E6E7E0',
  field: '#FBFBF8',
  kakao: '#FEE500',
  notice: '#FBF3D9',
  noticeText: '#8A7A35',
} as const;

// 온보딩 단계 진행 비율 (login은 랜딩이라 진행바 없음)
export const OnboardingSteps = ['profile', 'terms', 'permissions'] as const;
export type OnboardingStep = (typeof OnboardingSteps)[number];

export function stepProgress(step: OnboardingStep) {
  return (OnboardingSteps.indexOf(step) + 1) / OnboardingSteps.length;
}

type OnboardingValue = {
  // 회원가입에 사용할 계정 정보 (email 화면에서 입력받아 complete 에서 최종 전송)
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  intro: string;
  setIntro: (value: string) => void;
  notification: boolean;
  setNotification: (value: boolean) => void;
  personalize: boolean;
  setPersonalize: (value: boolean) => void;
  agreed: boolean;
  setAgreed: (value: boolean) => void;
  agreedMarketing: boolean;
  setAgreedMarketing: (value: boolean) => void;
};

const OnboardingContext = createContext<OnboardingValue | null>(null);

function OnboardingProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [notification, setNotification] = useState(true);
  const [personalize, setPersonalize] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  const value = useMemo<OnboardingValue>(
    () => ({
      email,
      setEmail,
      password,
      setPassword,
      nickname,
      setNickname,
      intro,
      setIntro,
      notification,
      setNotification,
      personalize,
      setPersonalize,
      agreed,
      setAgreed,
      agreedMarketing,
      setAgreedMarketing,
    }),
    [email, password, nickname, intro, notification, personalize, agreed, agreedMarketing]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error('useOnboarding must be used inside OnboardingProvider');
  }

  return value;
}

// 상단 "시작 설정" 라벨 + 진행바 (스크린샷 공통 헤더)
export function StepHeader({ progress }: { progress: number }) {
  return (
    <View style={scaffold.header}>
      <ThemedText style={scaffold.headerLabel}>시작 설정</ThemedText>
      <View style={scaffold.track}>
        <View style={[scaffold.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

// 하단 뒤로가기 + 메인 버튼 (스크린샷 공통 푸터)
export function StepFooter({
  primaryLabel,
  onPrimary,
  note,
  disabled,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  note?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <View style={scaffold.footerWrap}>
      {note ? <ThemedText style={scaffold.note}>{note}</ThemedText> : null}
      <View style={scaffold.footerRow}>
        <Pressable style={scaffold.backButton} onPress={() => router.back()}>
          <ThemedText style={scaffold.backIcon}>‹</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            scaffold.primaryButton,
            disabled && scaffold.primaryDisabled,
            pressed && !disabled && scaffold.pressed,
          ]}
          disabled={disabled}
          onPress={onPrimary}>
          <ThemedText style={scaffold.primaryText}>{primaryLabel}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const scaffold = StyleSheet.create({
  header: { gap: 10 },
  headerLabel: { color: Onb.ink, fontSize: 14, fontWeight: '800' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#E2E4DB', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: Onb.green },
  footerWrap: { gap: 10 },
  note: { color: Onb.sub, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  footerRow: { flexDirection: 'row', gap: 12 },
  backButton: {
    width: 64,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Onb.card,
    borderWidth: 1,
    borderColor: Onb.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: Onb.ink, fontSize: 26, fontWeight: '800', lineHeight: 28 },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Onb.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: { backgroundColor: '#A9BDB1' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.85 },
});

export default function AuthLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
