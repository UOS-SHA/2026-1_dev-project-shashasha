import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signup, toAuthErrorMessage } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/auth';
import { Onb, useOnboarding } from './_layout';

export default function CompleteScreen() {
  const {
    email,
    password,
    nickname,
    intro,
    selectedCells,
    notification,
    personalize,
    agreed,
    agreedMarketing,
  } = useOnboarding();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = [
    { label: '프로필', value: nickname.trim() ? '설정 완료' : '건너뜀' },
    { label: '기본 시간표', value: `${selectedCells.size}칸 설정 완료` },
    { label: '권한', value: notification || personalize ? '선택 완료' : '모두 끔' },
  ];

  const handleStart = async () => {
    if (submitting) {
      return;
    }
    setError(null);

    // 이메일/비밀번호는 email 화면에서만 입력받는다. (카카오 데모 등으로) 비어 있으면
    // 회원가입을 진행할 수 없으므로 이메일 가입 화면으로 안내한다.
    if (!email.trim() || !password) {
      setError('이메일로 가입 정보를 먼저 입력해 주세요.');
      router.replace('/email');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signup({
        email: email.trim(),
        password,
        nickname: nickname.trim(),
        bio: intro.trim() || undefined,
        notificationEnabled: notification,
        personalizeEnabled: personalize,
        agreedService: agreed,
        agreedPrivacy: agreed,
        agreedMarketing,
      });
      await setAuth(result.token, result.user);
      router.replace('/home');
    } catch (err) {
      setError(toAuthErrorMessage(err, '회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <ThemedText style={styles.logoMark}>♣</ThemedText>
            <View style={styles.checkBubble}>
              <ThemedText style={styles.checkBubbleText}>✓</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>준비가 모두 끝났어요!</ThemedText>
          <ThemedText style={styles.sub}>
            이제 멤버들과 가능한 시간을 맞추고,{'\n'}우리 모임의 기록을 차곡차곡 남겨보세요.
          </ThemedText>
        </View>

        <View style={styles.card}>
          {items.map((item, index) => (
            <View key={item.label}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                <ThemedText style={styles.rowValue}>{item.value}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <ThemedText style={styles.errorNote}>{error}</ThemedText> : null}
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            submitting && styles.startDisabled,
            pressed && !submitting && styles.pressed,
          ]}
          disabled={submitting}
          onPress={handleStart}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.startText}>SHASHASHA 시작하기</ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, justifyContent: 'center', gap: 32 },
  hero: { alignItems: 'center', gap: 18 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: Onb.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { color: '#FFFFFF', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  checkBubble: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Onb.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBubbleText: { color: Onb.green, fontSize: 15, fontWeight: '900' },
  title: { color: Onb.ink, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  sub: { color: Onb.sub, fontSize: 15, lineHeight: 23, textAlign: 'center' },
  card: {
    backgroundColor: Onb.card,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Onb.line,
  },
  divider: { height: 1, backgroundColor: Onb.line },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { color: Onb.ink, fontSize: 16, fontWeight: '700' },
  rowValue: { color: Onb.green, fontSize: 16, fontWeight: '900' },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8, gap: 10 },
  errorNote: { color: '#C0392B', fontSize: 13, lineHeight: 19, fontWeight: '700', textAlign: 'center' },
  startButton: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: Onb.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startDisabled: { backgroundColor: '#A9BDB1' },
  startText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  pressed: { opacity: 0.85 },
});
