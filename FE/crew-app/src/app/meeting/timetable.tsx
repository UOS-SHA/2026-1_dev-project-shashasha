import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Mc, useMeeting } from './_layout';

// 가용 인원이 많을수록 진한 초록
function heatColor(count: number, total: number) {
  if (count === 0) return '#F2F3EE';
  const ratio = total > 0 ? count / total : 0;
  if (ratio >= 0.95) return '#3F5BD6';
  if (ratio >= 0.75) return '#5B7FFF';
  if (ratio >= 0.5) return '#8AA0FF';
  if (ratio >= 0.25) return '#C2CEFF';
  return '#E3EAFF';
}

export default function TimetableScreen() {
  // 통합 시간표 그리드·골든타임은 모두 서버에서 계산된 값이다.
  const { days, times, availability, totalMembers, slots, loading } = useMeeting();
  const golden = slots;

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
        <ThemedText style={styles.sub}>색이 진할수록 더 많은 멤버가 가능한 시간이에요. (전체 {totalMembers}명)</ThemedText>

        {loading ? <ActivityIndicator style={{ marginTop: 24 }} color={Mc.green} /> : null}

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
                  <View key={`${row}-${col}`} style={[styles.cell, { backgroundColor: heatColor(count, totalMembers) }]}>
                    <ThemedText style={[styles.cellText, count >= 4 && styles.cellTextOn]}>{count}</ThemedText>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <ThemedText style={styles.legendText}>적음</ThemedText>
          <View style={[styles.legendDot, { backgroundColor: '#E3EAFF' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#8AA0FF' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#3F5BD6' }]} />
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
                  {slot.available}/{totalMembers}
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
