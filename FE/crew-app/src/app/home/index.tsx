import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toApiErrorMessage } from '@/api/client';
import { getMeetings, type Meeting } from '@/api/meetings';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

// 홈 데모용 색상 토큰 (온보딩과 동일한 초록/크림 톤)
const C = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  green: '#5B7FFF',
  chip: '#E3EAFF',
  chipText: '#3A4FC4',
  ink: '#1F2A24',
  sub: '#8A8F8A',
  line: '#E6E7E0',
};

// 홈을 허브로: 각 기능 폴더 입구로 연결 (팀원 폴더는 건드리지 않고 진입만 연결)
const shortcuts = [
  { id: 'archive', emoji: '📒', label: '아카이브', href: '/archive' as const },
  { id: 'friends', emoji: '👥', label: '친구', href: '/friends' as const },
  { id: 'schedule', emoji: '📅', label: '개인 일정', href: '/personal-schedule' as const },
  { id: 'settings', emoji: '⚙️', label: '설정', href: '/settings' as const },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 화면에 들어올 때마다 목록을 새로 불러온다 (모임 생성·삭제 후 돌아오면 반영됨)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(null);
      getMeetings()
        .then((data) => {
          if (active) setMeetings(data);
        })
        .catch((err) => {
          if (active) setError(toApiErrorMessage(err, '모임을 불러오지 못했어요.'));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  // 이번 주 확정 일정 요약: 확정 상태인 첫 모임을 보여준다.
  const confirmedMeeting = meetings.find((meeting) => meeting.status === 'confirmed');

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
              {confirmedMeeting ? (
                <View style={styles.dDay}>
                  <ThemedText style={styles.dDayText}>확정</ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText style={styles.summaryTitle}>
              {confirmedMeeting ? confirmedMeeting.name : '확정된 일정이 없어요'}
            </ThemedText>
            <ThemedText style={styles.summaryWhen}>
              {confirmedMeeting ? confirmedMeeting.nextLabel : '모임에서 시간을 맞춰 일정을 정해보세요.'}
            </ThemedText>
            <View style={styles.summaryFoot}>
              <ThemedText style={styles.summaryPlace}>📍 성수 모임 공간</ThemedText>
              <Pressable
                onPress={() =>
                  router.push(
                    confirmedMeeting
                      ? { pathname: '/meeting', params: { id: String(confirmedMeeting.id) } }
                      : '/meeting',
                  )
                }>
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
            <Pressable onPress={() => router.push('/settings/new-meeting')} hitSlop={8}>
              <ThemedText style={styles.newMeetingLink}>+ 새 모임</ThemedText>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={C.green} />
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <ThemedText style={styles.stateText}>{error}</ThemedText>
            </View>
          ) : meetings.length === 0 ? (
            <View style={styles.stateBox}>
              <ThemedText style={styles.stateText}>아직 가입한 모임이 없어요.</ThemedText>
            </View>
          ) : (
          <View style={styles.list}>
            {meetings.map((meeting) => (
              <Pressable
                key={meeting.id}
                style={({ pressed }) => [styles.meetingCard, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/meeting', params: { id: String(meeting.id) } })}>
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
          )}
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
  newMeetingLink: { color: C.green, fontSize: 14, fontWeight: '900' },
  stateBox: { paddingVertical: 28, alignItems: 'center', justifyContent: 'center' },
  stateText: { color: C.sub, fontSize: 14, fontWeight: '700', textAlign: 'center' },
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
