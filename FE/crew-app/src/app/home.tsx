import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, BrandMark, SectionCard } from '@/components/onboarding-screen';

export default function DemoHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <BrandMark size={38} />
          <View>
            <Text style={styles.greeting}>좋은 오후예요</Text>
            <Text style={styles.title}>{'{AppName}'}</Text>
          </View>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>나</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyHero}>
          <Text style={styles.emptyEyebrow}>온보딩 데모 완료</Text>
          <Text style={styles.emptyTitle}>첫 모임을 만들어 볼까요?</Text>
          <Text style={styles.emptyDescription}>
            모임을 만들면 멤버들과 시간표를 겹쳐 보고 가장 좋은 일정을 찾을 수 있어요.
          </Text>
        </View>

        <SectionCard style={styles.card}>
          <Text style={styles.cardLabel}>이번 주 내 일정</Text>
          <Text style={styles.cardValue}>4개의 고정 일정</Text>
          <View style={styles.barTrack}>
            <View style={styles.barValue} />
          </View>
          <Text style={styles.cardDescription}>시간표 설정이 완료되어 매칭 준비가 되었어요.</Text>
        </SectionCard>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
          <Text style={styles.resetButtonText}>온보딩 다시 보기</Text>
        </Pressable>
        <View style={styles.tabBar}>
          {['홈', '시간표', '아카이브', '내 정보'].map((tab, index) => (
            <View key={tab} style={styles.tab}>
              <View style={[styles.tabDot, index === 0 && styles.activeTabDot]} />
              <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
            </View>
          ))}
        </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  greeting: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: AppColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 18,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyHero: {
    gap: 12,
  },
  emptyEyebrow: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyTitle: {
    color: AppColors.ink,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  emptyDescription: {
    color: AppColors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    gap: 10,
    marginTop: 34,
  },
  cardLabel: {
    color: AppColors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  cardValue: {
    color: AppColors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  barTrack: {
    backgroundColor: AppColors.border,
    borderRadius: 999,
    height: 7,
    marginVertical: 6,
    overflow: 'hidden',
  },
  barValue: {
    backgroundColor: AppColors.primary,
    borderRadius: 999,
    height: '100%',
    width: '38%',
  },
  cardDescription: {
    color: AppColors.muted,
    fontSize: 11,
  },
  footer: {
    gap: 12,
    paddingBottom: 8,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: AppColors.card,
    fontSize: 14,
    fontWeight: '800',
  },
  tabBar: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  tabDot: {
    backgroundColor: AppColors.border,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeTabDot: {
    backgroundColor: AppColors.primary,
  },
  tabText: {
    color: AppColors.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  activeTabText: {
    color: AppColors.primary,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
