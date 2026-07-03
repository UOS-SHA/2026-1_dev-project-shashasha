import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toApiErrorMessage } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Mc, useMeeting } from './_layout';

export default function VoteScreen() {
  const { slots, myVote, castVote, confirm, totalMembers, confirmedId } = useMeeting();
  const totalVotes = slots.reduce((sum, slot) => sum + slot.votes, 0);
  const locked = confirmedId != null; // 이미 확정된 모임이면 투표 마감

  // 확정은 "내가 고른 것"이 아니라 "가장 표를 많이 받은 시간대"로 정한다.
  const winner = slots.length > 0 ? [...slots].sort((a, b) => b.votes - a.votes)[0] : null;

  const onVote = (slotId: string) => {
    castVote(slotId).catch((err) => Alert.alert('오류', toApiErrorMessage(err, '투표에 실패했어요.')));
  };

  const onConfirm = async () => {
    if (!winner) return;
    try {
      await confirm(winner.id); // 최다 득표 슬롯으로 확정
      router.push('/meeting/confirmed');
    } catch (err) {
      Alert.alert('오류', toApiErrorMessage(err, '일정 확정에 실패했어요.'));
    }
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
        <ThemedText style={styles.sub}>
          추천 시간 중 하나를 골라 투표해 주세요. 전체 {totalMembers}명 중 {totalVotes}명 참여.
        </ThemedText>

        {locked ? (
          <View style={styles.lockedBanner}>
            <ThemedText style={styles.lockedText}>이미 일정이 확정되어 투표가 마감됐어요.</ThemedText>
          </View>
        ) : null}

        <View style={styles.list}>
          {slots.map((slot) => {
            const selected = myVote === slot.id;
            const ratio = totalVotes > 0 ? slot.votes / totalVotes : 0;

            return (
              <Pressable
                key={slot.id}
                disabled={locked}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => onVote(slot.id)}>
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
          확정하면 가장 많은 표를 받은 시간대로 일정이 정해져요.
        </ThemedText>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            (!winner || locked) && styles.ctaDisabled,
            pressed && !!winner && !locked && styles.pressed,
          ]}
          disabled={!winner || locked}
          onPress={onConfirm}>
          <ThemedText style={styles.ctaText}>
            {locked ? '확정된 일정' : '최다 득표로 일정 확정하기'}
          </ThemedText>
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
  cardSelected: { borderColor: Mc.green, backgroundColor: '#EEF2FF' },
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
  lockedBanner: { backgroundColor: Mc.notice, borderRadius: 12, padding: 14, marginTop: 4 },
  lockedText: { color: Mc.noticeText, fontSize: 13, fontWeight: '700', lineHeight: 19 },
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
