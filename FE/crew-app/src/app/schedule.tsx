import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, OnboardingScreen, SectionCard } from '@/components/onboarding-screen';

const DAYS = ['월', '화', '수', '목', '금'];
const TIMES = ['09', '11', '13', '15', '17', '19'];

export default function ScheduleScreen() {
  const router = useRouter();
  const [scheduleName, setScheduleName] = useState('학교·일상');
  const [selectedSlots, setSelectedSlots] = useState(['월-09', '월-11', '수-13', '금-15']);

  function toggleSlot(slot: string) {
    setSelectedSlots((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot],
    );
  }

  return (
    <OnboardingScreen
      description="수업이나 아르바이트처럼 매주 반복되는 시간을 선택해 주세요."
      footerNote="선택한 시간은 데모용이며 앱을 종료하면 저장되지 않습니다."
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/complete')}
      primaryLabel="시간표 저장하기"
      step={4}
      title="기본 시간표를{'\n'}설정해 볼까요?">
      <SectionCard style={styles.nameCard}>
        <Text style={styles.label}>시간표 이름</Text>
        <TextInput
          maxLength={20}
          onChangeText={setScheduleName}
          placeholder="예: 학교·일상"
          placeholderTextColor={AppColors.muted}
          style={styles.input}
          value={scheduleName}
        />
      </SectionCard>

      <View style={styles.scheduleHeading}>
        <View>
          <Text style={styles.scheduleTitle}>반복 일정</Text>
          <Text style={styles.scheduleDescription}>바쁜 시간대를 눌러 표시하세요.</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>{selectedSlots.length}칸 선택</Text>
        </View>
      </View>

      <SectionCard style={styles.gridCard}>
        <View style={styles.gridRow}>
          <View style={styles.timeHeader} />
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
        {TIMES.map((time) => (
          <View key={time} style={styles.gridRow}>
            <Text style={styles.timeLabel}>{time}</Text>
            {DAYS.map((day) => {
              const slot = `${day}-${time}`;
              const selected = selectedSlots.includes(slot);
              return (
                <Pressable
                  accessibilityLabel={`${day}요일 ${time}시`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  key={slot}
                  onPress={() => toggleSlot(slot)}
                  style={({ pressed }) => [
                    styles.slot,
                    selected && styles.selectedSlot,
                    pressed && styles.pressed,
                  ]}>
                  {selected ? <View style={styles.slotDot} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </SectionCard>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  nameCard: {
    gap: 10,
    marginBottom: 26,
  },
  label: {
    color: AppColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: AppColors.background,
    borderColor: AppColors.border,
    borderRadius: 15,
    borderWidth: 1,
    color: AppColors.ink,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  scheduleHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleTitle: {
    color: AppColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  scheduleDescription: {
    color: AppColors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  selectedBadge: {
    backgroundColor: AppColors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  selectedBadgeText: {
    color: AppColors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  gridCard: {
    gap: 7,
    padding: 12,
  },
  gridRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  timeHeader: {
    width: 24,
  },
  dayLabel: {
    color: AppColors.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeLabel: {
    color: AppColors.muted,
    fontSize: 9,
    width: 24,
  },
  slot: {
    backgroundColor: AppColors.background,
    borderColor: AppColors.border,
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    height: 32,
  },
  selectedSlot: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    justifyContent: 'center',
  },
  slotDot: {
    backgroundColor: AppColors.card,
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  pressed: {
    opacity: 0.65,
  },
});
