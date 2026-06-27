import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Onb, StepFooter, StepHeader, stepProgress, useOnboarding } from './_layout';

export default function ProfileScreen() {
  const { nickname, setNickname, intro, setIntro } = useOnboarding();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <StepHeader progress={stepProgress('profile')} />

          <ThemedText style={styles.title}>반가워요!{'\n'}어떻게 불러드릴까요?</ThemedText>
          <ThemedText style={styles.sub}>모임 멤버들이 알아볼 수 있도록 간단한 프로필을 작성해 주세요.</ThemedText>

          <View style={styles.card}>
            <ThemedText style={styles.label}>닉네임</ThemedText>
            <TextInput
              value={nickname}
              onChangeText={(text) => setNickname(text.slice(0, 12))}
              placeholder="예: 모임지기"
              placeholderTextColor={Onb.sub}
              style={styles.input}
            />
            <ThemedText style={styles.counter}>{nickname.length} / 12</ThemedText>

            <View style={styles.divider} />

            <ThemedText style={styles.label}>한 줄 소개</ThemedText>
            <TextInput
              value={intro}
              onChangeText={(text) => setIntro(text.slice(0, 40))}
              placeholder="좋아하는 활동이나 역할을 알려주세요."
              placeholderTextColor={Onb.sub}
              style={[styles.input, styles.multiline]}
              multiline
              textAlignVertical="top"
            />
            <ThemedText style={styles.counter}>{intro.length} / 40</ThemedText>
          </View>

          <ThemedText style={styles.hint}>프로필 사진과 자세한 정보는 나중에 설정할 수 있어요.</ThemedText>
        </ScrollView>

        <View style={styles.footer}>
          <StepFooter
            primaryLabel="다음"
            disabled={nickname.trim().length === 0}
            onPrimary={() => router.push('/terms')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 16 },
  title: { color: Onb.ink, fontSize: 28, fontWeight: '900', lineHeight: 38, marginTop: 6 },
  sub: { color: Onb.sub, fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: Onb.card,
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Onb.line,
  },
  label: { color: Onb.ink, fontSize: 15, fontWeight: '900' },
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
  multiline: { minHeight: 88, paddingTop: 14, paddingBottom: 14 },
  counter: { color: Onb.sub, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Onb.line, marginVertical: 8 },
  hint: { color: Onb.sub, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
});
