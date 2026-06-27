import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Mc, useMeeting } from './_layout';

const notices = [
  { id: 'n1', tag: '공지', title: '6월 정기 모임 장소가 성수로 확정됐어요', date: '2일 전' },
  { id: 'n2', tag: '회비', title: '2분기 회비 납부 부탁드립니다 🙏', date: '5일 전' },
];

export default function MeetingDashboardScreen() {
  const { slots, confirmedId } = useMeeting();
  const confirmed = slots.find((slot) => slot.id === confirmedId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>수요 독서 모임</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 3.1.1 다음 모임 D-Day */}
        <View style={styles.ddayCard}>
          <View style={styles.ddayTop}>
            <ThemedText style={styles.ddayLabel}>다음 모임까지</ThemedText>
            <View style={styles.ddayBadge}>
              <ThemedText style={styles.ddayBadgeText}>{confirmed ? 'D-2' : '조율 중'}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.ddayDate}>
            {confirmed ? `${confirmed.day} · ${confirmed.time}` : '아직 일정이 확정되지 않았어요'}
          </ThemedText>
          <ThemedText style={styles.ddaySub}>
            {confirmed ? '📍 성수 모임 공간' : '멤버들의 시간표를 맞춰 일정을 정해보세요.'}
          </ThemedText>
        </View>

        {/* 빠른 이동 */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            onPress={() => router.push('/meeting/timetable')}>
            <ThemedText style={styles.actionEmoji}>🗓️</ThemedText>
            <ThemedText style={styles.actionTitle}>통합 시간표</ThemedText>
            <ThemedText style={styles.actionSub}>모두 가능한 시간 확인</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            onPress={() => router.push('/meeting/vote')}>
            <ThemedText style={styles.actionEmoji}>🗳️</ThemedText>
            <ThemedText style={styles.actionTitle}>일정 투표</ThemedText>
            <ThemedText style={styles.actionSub}>추천 시간에 투표하기</ThemedText>
          </Pressable>
        </View>

        {/* 공지사항 */}
        <View style={styles.sectionRow}>
          <ThemedText style={styles.sectionTitle}>공지사항</ThemedText>
          <ThemedText style={styles.sectionMeta}>{notices.length}건</ThemedText>
        </View>

        <View style={styles.noticeList}>
          {notices.map((notice) => (
            <View key={notice.id} style={styles.noticeCard}>
              <View style={styles.noticeTag}>
                <ThemedText style={styles.noticeTagText}>{notice.tag}</ThemedText>
              </View>
              <View style={styles.noticeText}>
                <ThemedText style={styles.noticeTitle}>{notice.title}</ThemedText>
                <ThemedText style={styles.noticeDate}>{notice.date}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Mc.bg },
  header: {
    height: 56,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navIcon: { color: Mc.ink, fontSize: 28, fontWeight: '800', lineHeight: 30 },
  headerTitle: { color: Mc.ink, fontSize: 17, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 16 },
  ddayCard: { backgroundColor: Mc.green, borderRadius: 20, padding: 20, gap: 6 },
  ddayTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ddayLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '800' },
  ddayBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  ddayBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  ddayDate: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', marginTop: 4 },
  ddaySub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  action: {
    flex: 1,
    backgroundColor: Mc.card,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: Mc.line,
  },
  actionEmoji: { fontSize: 24, marginBottom: 4 },
  actionTitle: { color: Mc.ink, fontSize: 15, fontWeight: '900' },
  actionSub: { color: Mc.sub, fontSize: 12, fontWeight: '600' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: Mc.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: Mc.sub, fontSize: 13, fontWeight: '700' },
  noticeList: { gap: 10 },
  noticeCard: {
    backgroundColor: Mc.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Mc.line,
  },
  noticeTag: { backgroundColor: Mc.chip, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  noticeTagText: { color: Mc.chipText, fontSize: 12, fontWeight: '800' },
  noticeText: { flex: 1, gap: 3 },
  noticeTitle: { color: Mc.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  noticeDate: { color: Mc.sub, fontSize: 12, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
