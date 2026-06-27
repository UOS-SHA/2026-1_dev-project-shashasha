import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Mc, TOTAL_MEMBERS, useMeeting } from './_layout';

const attendees = ['민준', '서연', '지훈', '예은', '하늘'];

export default function ConfirmedScreen() {
  const { slots, confirmedId } = useMeeting();
  // 확정된 슬롯이 없으면 표를 가장 많이 받은 슬롯으로 대체
  const confirmed =
    slots.find((slot) => slot.id === confirmedId) ??
    [...slots].sort((a, b) => b.votes - a.votes)[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeMark}>✓</ThemedText>
          </View>
          <ThemedText style={styles.title}>일정이 확정됐어요!</ThemedText>
          <ThemedText style={styles.sub}>투표 결과를 바탕으로 다음 모임 일정이 정해졌어요.</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardLabel}>최종 확정 일정</ThemedText>
          <ThemedText style={styles.cardDate}>{confirmed.day}</ThemedText>
          <ThemedText style={styles.cardTime}>{confirmed.time}</ThemedText>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>장소</ThemedText>
            <ThemedText style={styles.metaValue}>성수 모임 공간</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>득표</ThemedText>
            <ThemedText style={styles.metaValue}>{confirmed.votes}표</ThemedText>
          </View>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaLabel}>참석</ThemedText>
            <ThemedText style={styles.metaValue}>
              {attendees.length}/{TOTAL_MEMBERS}명
            </ThemedText>
          </View>

          <View style={styles.avatarRow}>
            {attendees.map((name, index) => (
              <View key={name} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
                <ThemedText style={styles.avatarText}>{name[0]}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notice}>
          <ThemedText style={styles.noticeText}>
            확정 일정은 모든 멤버에게 알림으로 공지돼요. (데모에서는 실제 알림이 가지 않아요.)
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          onPress={() => router.navigate('/meeting')}>
          <ThemedText style={styles.primaryText}>모임 홈으로</ThemedText>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.navigate('/home')}>
          <ThemedText style={styles.secondaryText}>내 모임 목록으로</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Mc.bg },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, gap: 20, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: 14 },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Mc.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMark: { color: '#FFFFFF', fontSize: 40, fontWeight: '900' },
  title: { color: Mc.ink, fontSize: 26, fontWeight: '900' },
  sub: { color: Mc.sub, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  card: {
    backgroundColor: Mc.card,
    borderRadius: 20,
    padding: 22,
    gap: 4,
    borderWidth: 1,
    borderColor: Mc.line,
  },
  cardLabel: { color: Mc.green, fontSize: 14, fontWeight: '800' },
  cardDate: { color: Mc.ink, fontSize: 24, fontWeight: '900', marginTop: 4 },
  cardTime: { color: Mc.ink, fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: Mc.line, marginVertical: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  metaLabel: { color: Mc.sub, fontSize: 14, fontWeight: '700' },
  metaValue: { color: Mc.ink, fontSize: 14, fontWeight: '800' },
  avatarRow: { flexDirection: 'row', marginTop: 14 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Mc.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Mc.card,
  },
  avatarOverlap: { marginLeft: -8 },
  avatarText: { color: Mc.green, fontSize: 14, fontWeight: '800' },
  notice: { backgroundColor: Mc.notice, borderRadius: 14, padding: 16 },
  noticeText: { color: Mc.noticeText, fontSize: 13, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 10 },
  primary: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Mc.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondary: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: Mc.green, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
