import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Mc, TOTAL_MEMBERS, useMeeting } from './_layout';

const days = ['금', '토', '일'];
const times = ['10', '12', '14', '16', '18', '20'];

// 멤버 일정을 겹쳐 본 가용 인원 수 (행=시간, 열=요일). 0~6명
const availability = [
  [2, 3, 4],
  [3, 5, 4],
  [4, 6, 5],
  [4, 5, 5],
  [3, 4, 3],
  [2, 3, 2],
];

// 가용 인원이 많을수록 진한 초록
function heatColor(count: number) {
  if (count === 0) return '#F2F3EE';
  const ratio = count / TOTAL_MEMBERS;
  if (ratio >= 0.95) return '#2F5D45';
  if (ratio >= 0.75) return '#4F755F';
  if (ratio >= 0.5) return '#80A18C';
  if (ratio >= 0.25) return '#B4C8BB';
  return '#DCE8DF';
}

export default function TimetableScreen() {
  const { slots } = useMeeting();
  const golden = [...slots].sort((a, b) => b.available - a.available).slice(0, 3);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>통합 시간표</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>모두의 일정을 겹쳐봤어요</ThemedText>
        <ThemedText style={styles.sub}>색이 진할수록 더 많은 멤버가 가능한 시간이에요. (전체 {TOTAL_MEMBERS}명)</ThemedText>

        {/* 3.2.1 통합 시간표 뷰 */}
        <View style={styles.grid}>
          <View style={styles.gridHeader}>
            <View style={styles.timeCol} />
            {days.map((day) => (
              <View key={day} style={styles.dayCell}>
                <ThemedText style={styles.dayText}>{day}</ThemedText>
              </View>
            ))}
          </View>

          {times.map((time, row) => (
            <View key={time} style={styles.gridRow}>
              <View style={styles.timeCol}>
                <ThemedText style={styles.timeText}>{time}</ThemedText>
              </View>
              {days.map((day, col) => {
                const count = availability[row][col];

                return (
                  <View key={`${row}-${col}`} style={[styles.cell, { backgroundColor: heatColor(count) }]}>
                    <ThemedText style={[styles.cellText, count >= 4 && styles.cellTextOn]}>{count}</ThemedText>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <ThemedText style={styles.legendText}>적음</ThemedText>
          <View style={[styles.legendDot, { backgroundColor: '#DCE8DF' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#80A18C' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#2F5D45' }]} />
          <ThemedText style={styles.legendText}>많음</ThemedText>
        </View>

        {/* 3.2.2 골든타임 Top 3 */}
        <ThemedText style={styles.sectionTitle}>골든타임 Top 3</ThemedText>
        <ThemedText style={styles.sub}>가장 많은 멤버가 모일 수 있는 시간을 추천해요.</ThemedText>

        <View style={styles.goldList}>
          {golden.map((slot, index) => (
            <View key={slot.id} style={styles.goldCard}>
              <View style={[styles.rank, index === 0 && styles.rankFirst]}>
                <ThemedText style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</ThemedText>
              </View>
              <View style={styles.goldText}>
                <ThemedText style={styles.goldDay}>{slot.day}</ThemedText>
                <ThemedText style={styles.goldTime}>{slot.time}</ThemedText>
              </View>
              <View style={styles.goldRight}>
                <ThemedText style={styles.goldCount}>
                  {slot.available}/{TOTAL_MEMBERS}
                </ThemedText>
                <ThemedText style={styles.goldCountLabel}>가능</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/meeting/vote')}>
          <ThemedText style={styles.ctaText}>이 시간으로 투표하기</ThemedText>
        </Pressable>
      </View>
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
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 12 },
  title: { color: Mc.ink, fontSize: 24, fontWeight: '900', marginTop: 4 },
  sub: { color: Mc.sub, fontSize: 14, lineHeight: 21 },
  grid: {
    backgroundColor: Mc.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Mc.line,
    gap: 8,
    marginTop: 4,
  },
  gridHeader: { flexDirection: 'row', gap: 8 },
  gridRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  timeCol: { width: 32, alignItems: 'center', justifyContent: 'center' },
  timeText: { color: Mc.sub, fontSize: 13, fontWeight: '700' },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayText: { color: Mc.ink, fontSize: 14, fontWeight: '800' },
  cell: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellText: { color: '#7E8C82', fontSize: 13, fontWeight: '800' },
  cellTextOn: { color: '#FFFFFF' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 },
  legendText: { color: Mc.sub, fontSize: 12, fontWeight: '700' },
  legendDot: { width: 18, height: 14, borderRadius: 4 },
  sectionTitle: { color: Mc.ink, fontSize: 20, fontWeight: '900', marginTop: 12 },
  goldList: { gap: 10, marginTop: 4 },
  goldCard: {
    backgroundColor: Mc.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Mc.line,
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Mc.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankFirst: { backgroundColor: Mc.green },
  rankText: { color: Mc.chipText, fontSize: 14, fontWeight: '900' },
  rankTextFirst: { color: '#FFFFFF' },
  goldText: { flex: 1, gap: 3 },
  goldDay: { color: Mc.sub, fontSize: 13, fontWeight: '700' },
  goldTime: { color: Mc.ink, fontSize: 17, fontWeight: '900' },
  goldRight: { alignItems: 'flex-end' },
  goldCount: { color: Mc.green, fontSize: 18, fontWeight: '900' },
  goldCountLabel: { color: Mc.sub, fontSize: 11, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  cta: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Mc.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.85 },
});
