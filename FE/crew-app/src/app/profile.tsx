import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, OnboardingScreen, SectionCard } from '@/components/onboarding-screen';

export default function ProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [introduction, setIntroduction] = useState('');

  return (
    <OnboardingScreen
      description="모임 멤버들이 알아볼 수 있도록 간단한 프로필을 작성해 주세요."
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/terms')}
      primaryLabel="다음"
      step={1}
      title="반가워요!{'\n'}어떻게 불러드릴까요?">
      <SectionCard style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            autoCapitalize="none"
            maxLength={12}
            onChangeText={setNickname}
            placeholder="예: 모임지기"
            placeholderTextColor={AppColors.muted}
            style={styles.input}
            value={nickname}
          />
          <Text style={styles.counter}>{nickname.length} / 12</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.label}>한 줄 소개</Text>
          <TextInput
            maxLength={40}
            onChangeText={setIntroduction}
            placeholder="좋아하는 활동이나 역할을 알려주세요."
            placeholderTextColor={AppColors.muted}
            style={[styles.input, styles.introductionInput]}
            value={introduction}
          />
          <Text style={styles.counter}>{introduction.length} / 40</Text>
        </View>
      </SectionCard>
      <Text style={styles.tip}>프로필 사진과 자세한 정보는 나중에 설정할 수 있어요.</Text>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 20,
  },
  field: {
    gap: 10,
  },
  label: {
    color: AppColors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    backgroundColor: AppColors.background,
    borderColor: AppColors.border,
    borderRadius: 15,
    borderWidth: 1,
    color: AppColors.ink,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  introductionInput: {
    minHeight: 64,
  },
  counter: {
    color: AppColors.muted,
    fontSize: 11,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: AppColors.border,
    height: 1,
  },
  tip: {
    color: AppColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});
