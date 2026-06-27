import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Mc, useMeeting } from './_layout';

export default function VoteScreen() {
  const { slots, myVote, castVote, confirm } = useMeeting();
  const totalVotes = slots.reduce((sum, slot) => sum + slot.votes, 0);

  const onConfirm = () => {
    if (!myVote) return;
    confirm(myVote);
    router.push('/meeting/confirmed');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>일정 투표</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>언제 만날까요?</ThemedText>
        <ThemedText style={styles.sub}>추천 시간 중 하나를 골라 투표해 주세요. 현재 {totalVotes}명 참여.</ThemedText>

        <View style={styles.list}>
          {slots.map((slot) => {
            const selected = myVote === slot.id;
            const ratio = totalVotes > 0 ? slot.votes / totalVotes : 0;

            return (
              <Pressable
                key={slot.id}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => castVote(slot.id)}>
                <View style={styles.cardHead}>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.cardText}>
                    <ThemedText style={styles.cardDay}>{slot.day}</ThemedText>
                    <ThemedText style={styles.cardTime}>{slot.time}</ThemedText>
                  </View>
                  <ThemedText style={styles.voteCount}>{slot.votes}표</ThemedText>
                </View>

                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.round(ratio * 100)}%` }]} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={styles.note}>
          데모 화면이라 다른 멤버의 투표는 미리 반영돼 있어요. 내 선택만 실시간으로 더해집니다.
        </ThemedText>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.cta, !myVote && styles.ctaDisabled, pressed && myVote && styles.pressed]}
          disabled={!myVote}
          onPress={onConfirm}>
          <ThemedText style={styles.ctaText}>투표 확정하고 일정 잡기</ThemedText>
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
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 14 },
  title: { color: Mc.ink, fontSize: 24, fontWeight: '900', marginTop: 4 },
  sub: { color: Mc.sub, fontSize: 14, lineHeight: 21 },
  list: { gap: 12, marginTop: 4 },
  card: {
    backgroundColor: Mc.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Mc.line,
  },
  cardSelected: { borderColor: Mc.green, backgroundColor: '#F4F8F5' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CFD2C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Mc.green },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Mc.green },
  cardText: { flex: 1, gap: 3 },
  cardDay: { color: Mc.sub, fontSize: 13, fontWeight: '700' },
  cardTime: { color: Mc.ink, fontSize: 17, fontWeight: '900' },
  voteCount: { color: Mc.green, fontSize: 15, fontWeight: '900' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#EBEDE6', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: Mc.green },
  note: { color: Mc.sub, fontSize: 12, lineHeight: 18, marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  cta: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: Mc.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#A9BDB1' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.85 },
});
