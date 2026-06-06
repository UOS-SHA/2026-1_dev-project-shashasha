import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, BrandMark } from '@/components/onboarding-screen';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.top}>
        <View style={styles.brandRow}>
          <BrandMark size={44} />
          <Text style={styles.brandName}>{'{AppName}'}</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>모임을 더 쉽게, 오래</Text>
          </View>
          <Text style={styles.title}>
            모두가 가능한 시간을 찾고,{'\n'}우리의 순간을 기록해요.
          </Text>
          <Text style={styles.description}>
            정기 모임의 일정 조율부터 활동 아카이브까지,{'\n'}
            {'{AppName}'}에서 한 번에 관리하세요.
          </Text>
        </View>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewEyebrow}>다음 모임</Text>
            <Text style={styles.previewDate}>6월 13일 토요일</Text>
          </View>
          <View style={styles.memberRow}>
            {['민', '서', '준', '+3'].map((member, index) => (
              <View key={member} style={[styles.member, { marginLeft: index === 0 ? 0 : -8 }]}>
                <Text style={styles.memberText}>{member}</Text>
              </View>
            ))}
          </View>
          <View style={styles.matchRow}>
            <Text style={styles.matchLabel}>모두 가능한 시간</Text>
            <Text style={styles.matchTime}>오후 2:00</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.kakaoButton, pressed && styles.pressed]}>
          <View style={styles.kakaoBubble}>
            <Text style={styles.kakaoBubbleText}>•••</Text>
          </View>
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
        </Pressable>
        <Text style={styles.footnote}>로그인은 데모 화면이며 실제 카카오 계정과 연결되지 않아요.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
    paddingHorizontal: 24,
  },
  top: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  brandName: {
    color: AppColors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  hero: {
    gap: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: AppColors.ink,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 46,
  },
  description: {
    color: AppColors.muted,
    fontSize: 16,
    lineHeight: 25,
  },
  previewCard: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 22,
    padding: 22,
    shadowColor: '#193A2A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  previewHeader: {
    gap: 6,
  },
  previewEyebrow: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  previewDate: {
    color: AppColors.ink,
    fontSize: 21,
    fontWeight: '800',
  },
  memberRow: {
    flexDirection: 'row',
  },
  member: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderColor: AppColors.card,
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  memberText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  matchRow: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  matchLabel: {
    color: AppColors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  matchTime: {
    color: AppColors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    gap: 12,
    paddingBottom: 14,
    paddingTop: 32,
  },
  kakaoButton: {
    alignItems: 'center',
    backgroundColor: '#FEE500',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 58,
  },
  kakaoBubble: {
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 24,
  },
  kakaoBubbleText: {
    color: '#FEE500',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: -1,
  },
  kakaoText: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '800',
  },
  footnote: {
    color: AppColors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
