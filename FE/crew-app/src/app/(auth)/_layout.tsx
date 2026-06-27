import { router, Stack } from 'expo-router';
import { createContext, PropsWithChildren, ReactNode, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

// 온보딩 데모용 색상 토큰 (스크린샷의 초록/크림 톤)
export const Onb = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  green: '#2F5D45',
  greenDark: '#274E3A',
  chip: '#DCE8DF',
  chipText: '#2F5D45',
  ink: '#1F2A24',
  sub: '#8A8F8A',
  line: '#E6E7E0',
  field: '#FBFBF8',
  kakao: '#FEE500',
  notice: '#FBF3D9',
  noticeText: '#8A7A35',
} as const;

// 온보딩 단계 진행 비율 (login은 랜딩이라 진행바 없음)
export const OnboardingSteps = ['profile', 'terms', 'permissions', 'schedule'] as const;
export type OnboardingStep = (typeof OnboardingSteps)[number];

export function stepProgress(step: OnboardingStep) {
  return (OnboardingSteps.indexOf(step) + 1) / OnboardingSteps.length;
}

type OnboardingValue = {
  nickname: string;
  setNickname: (value: string) => void;
  intro: string;
  setIntro: (value: string) => void;
  notification: boolean;
  setNotification: (value: boolean) => void;
  personalize: boolean;
  setPersonalize: (value: boolean) => void;
  selectedCells: Set<string>;
  toggleCell: (key: string) => void;
  agreed: boolean;
  setAgreed: (value: boolean) => void;
};

const OnboardingContext = createContext<OnboardingValue | null>(null);

function OnboardingProvider({ children }: PropsWithChildren) {
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [notification, setNotification] = useState(true);
  const [personalize, setPersonalize] = useState(true);
  // 데모 기본값: 스크린샷처럼 일부 칸이 미리 선택된 상태
  const [selectedCells, setSelectedCells] = useState<Set<string>>(
    () => new Set(['0-0', '0-4', '1-0', '2-2', '3-4'])
  );
  const [agreed, setAgreed] = useState(false);

  const value = useMemo<OnboardingValue>(
    () => ({
      nickname,
      setNickname,
      intro,
      setIntro,
      notification,
      setNotification,
      personalize,
      setPersonalize,
      selectedCells,
      toggleCell: (key) =>
        setSelectedCells((current) => {
          const next = new Set(current);
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
          return next;
        }),
      agreed,
      setAgreed,
    }),
    [nickname, intro, notification, personalize, selectedCells, agreed]
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
