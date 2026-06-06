import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, OnboardingScreen, SectionCard } from '@/components/onboarding-screen';

const TERMS = [
  { id: 'age', label: '만 14세 이상입니다', required: true },
  { id: 'service', label: '서비스 이용약관 동의', required: true },
  { id: 'privacy', label: '개인정보 처리방침 동의', required: true },
  { id: 'marketing', label: '새로운 모임 소식 수신 동의', required: false },
] as const;

export default function TermsScreen() {
  const router = useRouter();
  const [checkedTerms, setCheckedTerms] = useState<string[]>([]);
  const allChecked = checkedTerms.length === TERMS.length;

  function toggleTerm(id: string) {
    setCheckedTerms((current) =>
      current.includes(id) ? current.filter((termId) => termId !== id) : [...current, id],
    );
  }

  function toggleAll() {
    setCheckedTerms(allChecked ? [] : TERMS.map((term) => term.id));
  }

  return (
    <OnboardingScreen
      description="안전하고 편리한 모임 운영을 위해 아래 내용을 확인해 주세요."
      footerNote="이 화면은 데모이므로 동의 여부와 관계없이 다음 화면으로 이동합니다."
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/permissions')}
      primaryLabel="확인했어요"
      step={2}
      title="이용 전 약관을{'\n'}확인해 주세요.">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allChecked }}
        onPress={toggleAll}
        style={({ pressed }) => [styles.allAgree, pressed && styles.pressed]}>
        <Check checked={allChecked} />
        <View style={styles.allText}>
          <Text style={styles.allTitle}>모두 동의하기</Text>
          <Text style={styles.allDescription}>선택 항목을 포함해 모든 약관에 동의합니다.</Text>
        </View>
      </Pressable>

      <SectionCard style={styles.termsCard}>
        {TERMS.map((term, index) => {
          const checked = checkedTerms.includes(term.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              key={term.id}
              onPress={() => toggleTerm(term.id)}
              style={({ pressed }) => [
                styles.termRow,
                index !== TERMS.length - 1 && styles.termDivider,
                pressed && styles.pressed,
              ]}>
              <Check checked={checked} small />
              <Text style={styles.termLabel}>{term.label}</Text>
              <Text style={[styles.termType, !term.required && styles.optional]}>
                {term.required ? '필수' : '선택'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </SectionCard>
    </OnboardingScreen>
  );
}

function Check({ checked, small = false }: { checked: boolean; small?: boolean }) {
  return (
    <View style={[styles.check, small && styles.smallCheck, checked && styles.checked]}>
      <Text style={[styles.checkText, checked && styles.checkedText]}>✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  allAgree: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    padding: 18,
  },
  allText: {
    flex: 1,
    gap: 4,
  },
  allTitle: {
    color: AppColors.card,
    fontSize: 17,
    fontWeight: '800',
  },
  allDescription: {
    color: '#DCEDE3',
    fontSize: 11,
    lineHeight: 17,
  },
  termsCard: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  termRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 62,
  },
  termDivider: {
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
  },
  termLabel: {
    color: AppColors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  termType: {
    color: AppColors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  optional: {
    color: AppColors.muted,
  },
  chevron: {
    color: AppColors.muted,
    fontSize: 22,
    fontWeight: '300',
  },
  check: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 10,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  smallCheck: {
    backgroundColor: AppColors.background,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 25,
    width: 25,
  },
  checked: {
    backgroundColor: AppColors.primarySoft,
    borderColor: AppColors.primarySoft,
  },
  checkText: {
    color: AppColors.border,
    fontSize: 16,
    fontWeight: '900',
  },
  checkedText: {
    color: AppColors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
