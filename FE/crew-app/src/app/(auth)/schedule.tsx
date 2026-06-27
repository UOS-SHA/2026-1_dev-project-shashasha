import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Onb, StepFooter, StepHeader, stepProgress, useOnboarding } from './_layout';

const days = ['월', '화', '수', '목', '금'];
const times = ['09', '11', '13', '15', '17', '19'];

export default function ScheduleScreen() {
  const { selectedCells, toggleCell } = useOnboarding();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader progress={stepProgress('schedule')} />

        <ThemedText style={styles.title}>기본 시간표를{'\n'}설정해 볼까요?</ThemedText>
        <ThemedText style={styles.sub}>수업이나 아르바이트처럼 매주 반복되는 시간을 선택해 주세요.</ThemedText>

        <View style={styles.nameCard}>
          <ThemedText style={styles.nameLabel}>시간표 이름</ThemedText>
          <View style={styles.nameField}>
            <ThemedText style={styles.nameValue}>학교·일상</ThemedText>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <ThemedText style={styles.sectionTitle}>반복 일정</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>{selectedCells.size}칸 선택</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.sectionSub}>바쁜 시간대를 눌러 표시하세요.</ThemedText>

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
                const key = `${row}-${col}`;
                const on = selectedCells.has(key);

                return (
                  <Pressable
                    key={key}
                    style={[styles.cell, on && styles.cellOn]}
                    onPress={() => toggleCell(key)}>
                    {on && <View style={styles.dot} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <StepFooter
          primaryLabel="시간표 저장하기"
          note="선택한 시간은 데모용이며 앱을 종료하면 저장되지 않습니다."
          onPrimary={() => router.push('/complete')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 14 },
  title: { color: Onb.ink, fontSize: 28, fontWeight: '900', lineHeight: 38, marginTop: 6 },
  sub: { color: Onb.sub, fontSize: 14, lineHeight: 21 },
  nameCard: {
    backgroundColor: Onb.card,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: Onb.line,
  },
  nameLabel: { color: Onb.ink, fontSize: 15, fontWeight: '900' },
  nameField: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Onb.line,
    backgroundColor: Onb.field,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  nameValue: { color: Onb.ink, fontSize: 15, fontWeight: '700' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: { color: Onb.ink, fontSize: 20, fontWeight: '900' },
  countBadge: { backgroundColor: Onb.chip, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  countText: { color: Onb.chipText, fontSize: 13, fontWeight: '800' },
  sectionSub: { color: Onb.sub, fontSize: 13, marginTop: -6 },
  grid: {
    backgroundColor: Onb.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Onb.line,
    gap: 8,
  },
  gridHeader: { flexDirection: 'row', gap: 8 },
  gridRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  timeCol: { width: 32, alignItems: 'center', justifyContent: 'center' },
  timeText: { color: Onb.sub, fontSize: 13, fontWeight: '700' },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayText: { color: Onb.ink, fontSize: 14, fontWeight: '800' },
  cell: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E8E1',
    backgroundColor: '#F7F8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: { backgroundColor: Onb.green, borderColor: Onb.green },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
});
