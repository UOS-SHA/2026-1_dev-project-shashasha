import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, BrandMark } from '@/components/onboarding-screen';

export default function CompleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.successMark}>
          <BrandMark size={72} />
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        </View>
        <View style={styles.heading}>
          <Text style={styles.title}>준비가 모두 끝났어요!</Text>
          <Text style={styles.description}>
            이제 멤버들과 가능한 시간을 맞추고,{'\n'}우리 모임의 기록을 차곡차곡 남겨보세요.
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <SummaryRow label="프로필" value="설정 완료" />
          <View style={styles.divider} />
          <SummaryRow label="기본 시간표" value="설정 완료" />
          <View style={styles.divider} />
          <SummaryRow label="권한" value="선택 완료" />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/home')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>{'{AppName}'} 시작하기</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  successMark: {
    alignSelf: 'center',
    marginBottom: 34,
    position: 'relative',
  },
  checkBadge: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    bottom: -9,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: -9,
    width: 32,
  },
  checkText: {
    color: AppColors.primary,
    fontSize: 17,
    fontWeight: '900',
  },
  heading: {
    gap: 12,
  },
  title: {
    color: AppColors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  description: {
    color: AppColors.muted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 40,
    paddingHorizontal: 18,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  summaryLabel: {
    color: AppColors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    backgroundColor: AppColors.border,
    height: 1,
  },
  button: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: AppColors.card,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
