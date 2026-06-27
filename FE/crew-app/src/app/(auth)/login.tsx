import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { Onb } from './_layout';

const upcomingMembers = ['민', '서', '준'];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four },
        ]}>
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <ThemedText style={styles.logoMark}>♣</ThemedText>
            </View>
            <ThemedText style={styles.brandName}>SHASHASHA</ThemedText>
          </View>

          <View style={styles.hero}>
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>모임을 더 쉽게, 오래</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>
              모두가 가능한 시간을 찾고,{'\n'}우리의 순간을 기록해요.
            </ThemedText>
            <ThemedText style={styles.heroSub}>
              정기 모임의 일정 조율부터 활동 아카이브까지,{'\n'}SHASHASHA에서 한 번에 관리하세요.
            </ThemedText>
          </View>

          <View style={styles.upcomingCard}>
            <ThemedText style={styles.upcomingLabel}>다음 모임</ThemedText>
            <ThemedText style={styles.upcomingDate}>6월 13일 토요일</ThemedText>

            <View style={styles.avatarRow}>
              {upcomingMembers.map((name, index) => (
                <View key={name} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
                  <ThemedText style={styles.avatarText}>{name}</ThemedText>
                </View>
              ))}
              <View style={[styles.avatar, styles.avatarOverlap, styles.avatarMore]}>
                <ThemedText style={styles.avatarMoreText}>+3</ThemedText>
              </View>
            </View>

            <View style={styles.timeRow}>
              <ThemedText style={styles.timeLabel}>모두 가능한 시간</ThemedText>
              <ThemedText style={styles.timeValue}>오후 2:00</ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.kakaoButton, pressed && styles.pressed]}
              onPress={() => router.push('/profile')}>
              <View style={styles.kakaoDot}>
                <ThemedText style={styles.kakaoDotText}>···</ThemedText>
              </View>
              <ThemedText style={styles.kakaoText}>카카오로 시작하기</ThemedText>
            </Pressable>

            <Pressable style={styles.emailButton} onPress={() => router.push('/email')}>
              <ThemedText style={styles.emailText}>이메일로 시작하기</ThemedText>
            </Pressable>

            <ThemedText style={styles.demoNote}>
              로그인은 데모 화면이며 실제 카카오 계정과 연결되지 않아요.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  container: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.four },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Onb.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  brandName: { color: Onb.ink, fontSize: 22, fontWeight: '900' },
  hero: { gap: 14 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: Onb.chip,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: { color: Onb.chipText, fontSize: 13, fontWeight: '800' },
  heroTitle: { color: Onb.ink, fontSize: 30, fontWeight: '900', lineHeight: 40 },
  heroSub: { color: Onb.sub, fontSize: 15, lineHeight: 23 },
  upcomingCard: {
    backgroundColor: Onb.card,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    shadowColor: '#1F2A24',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  upcomingLabel: { color: Onb.green, fontSize: 14, fontWeight: '800' },
  upcomingDate: { color: Onb.ink, fontSize: 22, fontWeight: '900' },
  avatarRow: { flexDirection: 'row', marginTop: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Onb.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Onb.card,
  },
  avatarOverlap: { marginLeft: -8 },
  avatarText: { color: Onb.green, fontSize: 14, fontWeight: '800' },
  avatarMore: { backgroundColor: '#E9EAE3' },
  avatarMoreText: { color: Onb.sub, fontSize: 13, fontWeight: '800' },
  timeRow: {
    backgroundColor: Onb.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeLabel: { color: Onb.sub, fontSize: 15, fontWeight: '700' },
  timeValue: { color: Onb.green, fontSize: 17, fontWeight: '900' },
  actions: { gap: 12 },
  kakaoButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: Onb.kakao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  kakaoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoDotText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', lineHeight: 12 },
  kakaoText: { color: '#1F2A24', fontSize: 16, fontWeight: '900' },
  emailButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  emailText: { color: Onb.green, fontSize: 14, fontWeight: '800' },
  demoNote: { color: Onb.sub, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  pressed: { opacity: 0.8 },
});
