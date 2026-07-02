import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { login, toAuthErrorMessage } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/auth';
import { Onb, useOnboarding } from './_layout';

type Mode = 'login' | 'signup';

export default function EmailScreen() {
  const { email, setEmail, password, setPassword } = useOnboarding();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState<Mode>('signup');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = email.includes('@') && password.length >= 4;

  const handleSubmit = async () => {
    if (!valid || submitting) {
      return;
    }
    setError(null);

    // 회원가입: 계정 정보는 컨텍스트에 담고 온보딩 단계로 진행,
    // 실제 /auth/signup 호출은 마지막 complete 화면에서 이뤄진다.
    if (mode === 'signup') {
      router.push('/profile');
      return;
    }

    // 로그인: 지금 바로 /auth/login 을 호출하고 성공하면 홈으로 이동.
    setSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      await setAuth(result.token, result.user);
      router.replace('/home');
    } catch (err) {
      setError(toAuthErrorMessage(err, '이메일 또는 비밀번호를 확인해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>이메일로 시작</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.title}>
            {mode === 'signup' ? '이메일로 가입할까요?' : '다시 만나서 반가워요'}
          </ThemedText>
          <ThemedText style={styles.sub}>
            이메일과 비밀번호로 SHASHASHA를 시작할 수 있어요.
          </ThemedText>

          <View style={styles.tabs}>
            {(['signup', 'login'] as Mode[]).map((value) => {
              const selected = mode === value;

              return (
                <Pressable
                  key={value}
                  style={[styles.tab, selected && styles.tabActive]}
                  onPress={() => setMode(value)}>
                  <ThemedText style={[styles.tabText, selected && styles.tabTextActive]}>
                    {value === 'signup' ? '회원가입' : '로그인'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>이메일</ThemedText>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              placeholder="example@email.com"
              placeholderTextColor={Onb.sub}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!submitting}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>비밀번호</ThemedText>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="비밀번호를 입력해 주세요"
              placeholderTextColor={Onb.sub}
              secureTextEntry
              editable={!submitting}
              style={styles.input}
            />
          </View>

          {error ? <ThemedText style={styles.errorNote}>{error}</ThemedText> : null}

          <ThemedText style={styles.demoNote}>
            {mode === 'signup'
              ? '다음 단계에서 프로필을 설정하면 가입이 완료돼요.'
              : '가입할 때 사용한 이메일과 비밀번호를 입력해 주세요.'}
          </ThemedText>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.submit,
              (!valid || submitting) && styles.submitDisabled,
              pressed && valid && !submitting && styles.pressed,
            ]}
            disabled={!valid || submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitText}>
                {mode === 'signup' ? '가입하고 계속하기' : '로그인'}
              </ThemedText>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  flex: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { color: Onb.ink, fontSize: 28, fontWeight: '800', lineHeight: 30 },
  headerTitle: { color: Onb.ink, fontSize: 16, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 },
  title: { color: Onb.ink, fontSize: 26, fontWeight: '900', lineHeight: 34 },
  sub: { color: Onb.sub, fontSize: 14, lineHeight: 21 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E9EAE3',
    borderRadius: 12,
    padding: 4,
    marginTop: 6,
  },
  tab: { flex: 1, minHeight: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: Onb.card },
  tabText: { color: Onb.sub, fontSize: 14, fontWeight: '800' },
  tabTextActive: { color: Onb.green },
  field: { gap: 8 },
  label: { color: Onb.ink, fontSize: 14, fontWeight: '800' },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Onb.line,
    backgroundColor: Onb.field,
    color: Onb.ink,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  demoNote: { color: Onb.sub, fontSize: 12, lineHeight: 18, marginTop: 4 },
  errorNote: { color: '#C0392B', fontSize: 13, lineHeight: 19, fontWeight: '700', marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  submit: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Onb.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { backgroundColor: '#A9BDB1' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.85 },
});
