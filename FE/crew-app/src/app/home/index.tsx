import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

// 홈 데모용 색상 토큰 (온보딩과 동일한 초록/크림 톤)
const C = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  green: '#2F5D45',
  chip: '#DCE8DF',
  chipText: '#2F5D45',
  ink: '#1F2A24',
  sub: '#8A8F8A',
  line: '#E6E7E0',
};

type Meeting = {
  id: string;
  name: string;
  emoji: string;
  members: number;
  nextLabel: string;
  status: 'confirmed' | 'voting';
};

// 홈을 허브로: 각 기능 폴더 입구로 연결 (팀원 폴더는 건드리지 않고 진입만 연결)
const shortcuts = [
  { id: 'archive', emoji: '📒', label: '아카이브', href: '/archive' as const },
  { id: 'friends', emoji: '👥', label: '친구', href: '/friends' as const },
  { id: 'schedule', emoji: '📅', label: '개인 일정', href: '/personal-schedule' as const },
  { id: 'settings', emoji: '⚙️', label: '설정', href: '/settings' as const },
];

const meetings: Meeting[] = [
  { id: 'book', name: '수요 독서 모임', emoji: '📚', members: 6, nextLabel: '6월 13일 토 · 오후 2:00', status: 'confirmed' },
  { id: 'run', name: '한강 러닝 크루', emoji: '🏃', members: 9, nextLabel: '투표 진행 중 · 3일 남음', status: 'voting' },
  { id: 'study', name: '사이드 프로젝트', emoji: '💻', members: 4, nextLabel: '6월 18일 목 · 오후 7:30', status: 'confirmed' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.five },
        ]}>
        <View style={styles.container}>
          <View style={styles.topRow}>
            <View>
              <ThemedText style={styles.greeting}>안녕하세요 👋</ThemedText>
              <ThemedText style={styles.brand}>SHASHASHA</ThemedText>
            </View>
            <View style={styles.profileCircle}>
              <ThemedText style={styles.profileText}>나</ThemedText>
            </View>
          </View>

          {/* 1.2.2 이번 주 확정 일정 요약 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHead}>
              <ThemedText style={styles.summaryLabel}>이번 주 확정 일정</ThemedText>
              <View style={styles.dDay}>
                <ThemedText style={styles.dDayText}>D-2</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.summaryTitle}>수요 독서 모임</ThemedText>
            <ThemedText style={styles.summaryWhen}>6월 13일 토요일 · 오후 2:00</ThemedText>
            <View style={styles.summaryFoot}>
              <ThemedText style={styles.summaryPlace}>📍 성수 모임 공간</ThemedText>
              <Pressable onPress={() => router.push('/meeting')}>
                <ThemedText style={styles.summaryLink}>자세히 ›</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* 바로가기: 각 기능 폴더 입구 */}
          <View style={styles.shortcutRow}>
            {shortcuts.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
                onPress={() => router.push(item.href)}>
                <ThemedText style={styles.shortcutEmoji}>{item.emoji}</ThemedText>
                <ThemedText style={styles.shortcutLabel}>{item.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* 1.2.1 내가 가입한 모임 리스트 */}
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>내 모임</ThemedText>
            <ThemedText style={styles.sectionMeta}>{meetings.length}개</ThemedText>
          </View>

          <View style={styles.list}>
            {meetings.map((meeting) => (
              <Pressable
                key={meeting.id}
                style={({ pressed }) => [styles.meetingCard, pressed && styles.pressed]}
                onPress={() => router.push('/meeting')}>
                <View style={styles.meetingIcon}>
                  <ThemedText style={styles.meetingEmoji}>{meeting.emoji}</ThemedText>
                </View>
                <View style={styles.meetingText}>
                  <ThemedText style={styles.meetingName}>{meeting.name}</ThemedText>
                  <ThemedText style={styles.meetingNext}>{meeting.nextLabel}</ThemedText>
                </View>
                <View style={styles.meetingRight}>
                  <View
                    style={[
                      styles.statusChip,
                      meeting.status === 'voting' ? styles.statusVoting : styles.statusConfirmed,
                    ]}>
                    <ThemedText
                      style={[
                        styles.statusText,
                        meeting.status === 'voting' ? styles.statusTextVoting : styles.statusTextConfirmed,
                      ]}>
                      {meeting.status === 'voting' ? '투표 중' : '확정'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.meetingMembers}>멤버 {meeting.members}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  container: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: C.sub, fontSize: 14, fontWeight: '700' },
  brand: { color: C.ink, fontSize: 24, fontWeight: '900', marginTop: 2 },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { color: C.green, fontSize: 15, fontWeight: '900' },
  summaryCard: {
    backgroundColor: C.green,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '800' },
  dDay: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  dDayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  summaryTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 4 },
  summaryWhen: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '700' },
  summaryFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryPlace: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
  summaryLink: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  shortcutRow: { flexDirection: 'row', gap: 10 },
  shortcut: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.line,
  },
  shortcutEmoji: { fontSize: 22 },
  shortcutLabel: { color: C.ink, fontSize: 12, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: C.sub, fontSize: 13, fontWeight: '700' },
  list: { gap: 10 },
  meetingCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  meetingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingEmoji: { fontSize: 22 },
  meetingText: { flex: 1, gap: 4 },
  meetingName: { color: C.ink, fontSize: 16, fontWeight: '800' },
  meetingNext: { color: C.sub, fontSize: 13, fontWeight: '600' },
  meetingRight: { alignItems: 'flex-end', gap: 6 },
  statusChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  statusConfirmed: { backgroundColor: C.chip },
  statusVoting: { backgroundColor: '#FBF3D9' },
  statusText: { fontSize: 11, fontWeight: '900' },
  statusTextConfirmed: { color: C.green },
  statusTextVoting: { color: '#9C8C4A' },
  meetingMembers: { color: C.sub, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
