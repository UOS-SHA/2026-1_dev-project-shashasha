import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ArchiveRecord, useArchiveStore } from './_layout';

type SortTarget = 'round' | 'date';
type SortDirection = 'desc' | 'asc';

const targetOptions: { label: string; value: SortTarget }[] = [
  { label: '회차순', value: 'round' },
  { label: '날짜순', value: 'date' },
];

const directionOptions: { label: string; value: SortDirection }[] = [
  { label: '최신순', value: 'desc' },
  { label: '오래된순', value: 'asc' },
];

function dateValue(dateText: string) {
  return Number(dateText.replace(/\./g, ''));
}

function InitialAvatar({ name, index }: { name: string; index: number }) {
  const colors = ['#5B7FFF', '#F97316', '#10B981', '#F43F5E', '#0EA5E9'];

  return (
    <View style={[styles.avatar, { backgroundColor: colors[index % colors.length] }]}>
      <ThemedText style={styles.avatarText}>{name[0]}</ThemedText>
    </View>
  );
}

function ArchiveCard({ item }: { item: ArchiveRecord }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.archiveCard, pressed && styles.pressed]}
      onPress={() => router.navigate(`/archive/${item.id}`)}>
      <View style={[styles.roundBadge, { backgroundColor: item.color }]}>
        <ThemedText style={styles.roundNumber}>{item.round}</ThemedText>
      </View>

      <View style={styles.cardText}>
        <ThemedText style={styles.cardTitle}>
          {item.date} {item.day} · {item.place}
        </ThemedText>
        <ThemedText style={styles.cardSub}>{item.title}</ThemedText>
        <ThemedText style={styles.cardSummary} numberOfLines={2}>
          {item.summary}
        </ThemedText>
        <View style={styles.avatarRow}>
          {item.attendees.slice(0, 4).map((name, index) => (
            <InitialAvatar key={name} name={name} index={index} />
          ))}
          {item.attendees.length > 4 && (
            <View style={styles.moreAvatar}>
              <ThemedText style={styles.moreAvatarText}>+{item.attendees.length - 4}</ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.thumb, { backgroundColor: item.thumbnail }]}>
        <ThemedText style={styles.thumbText}>사진</ThemedText>
        <ThemedText style={styles.thumbCount}>{item.photos}</ThemedText>
      </View>
    </Pressable>
  );
}

export default function ArchiveHomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { records } = useArchiveStore();
  const [sortTarget, setSortTarget] = useState<SortTarget>('round');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const newestFirst = sortDirection === 'desc';

      if (sortTarget === 'date') {
        return newestFirst ? dateValue(b.date) - dateValue(a.date) : dateValue(a.date) - dateValue(b.date);
      }

      return newestFirst ? b.round - a.round : a.round - b.round;
    });
  }, [records, sortTarget, sortDirection]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInset={{
          top: safeAreaInsets.top,
          bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
        }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + Spacing.three,
            paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          },
        ]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText style={styles.eyebrow}>SHASHASHA</ThemedText>
              <ThemedText style={styles.title}>아카이브</ThemedText>
              <ThemedText style={styles.description}>
                모임 회차별 기록, 사진, 참석 현황을 한눈에 확인해요.
              </ThemedText>
            </View>

            <View style={styles.sortRow}>
              {targetOptions.map((option) => {
                const selected = sortTarget === option.value;

                return (
                  <Pressable
                    key={option.value}
                    style={[styles.sortChip, selected && styles.sortChipActive]}
                    onPress={() => setSortTarget(option.value)}>
                    <ThemedText style={[styles.sortText, selected && styles.sortTextActive]}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            onPress={() => router.navigate('/archive/new')}>
            <View style={styles.createPlus}>
              <ThemedText style={styles.createPlusText}>+</ThemedText>
            </View>
            <ThemedText style={styles.createText}>아카이브 생성</ThemedText>
          </Pressable>

          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>{records.length}</ThemedText>
              <ThemedText style={styles.statLabel}>총 회차</ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>활동 히스토리</ThemedText>
            {records.length > 0 ? (
              <View style={styles.directionRow}>
                {directionOptions.map((option) => {
                  const selected = sortDirection === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.directionChip, selected && styles.directionChipActive]}
                      onPress={() => setSortDirection(option.value)}>
                      <ThemedText style={[styles.directionText, selected && styles.directionTextActive]}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <ThemedText style={styles.sectionMeta}>기록 없음</ThemedText>
            )}
          </View>

          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>아직 기록한 활동이 없어요</ThemedText>
              <ThemedText style={styles.emptyText}>
                아카이브 생성 버튼을 눌러 첫 활동 기록을 남겨보세요.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.archiveList}>
              {sortedRecords.map((item) => (
                <ArchiveCard key={item.id} item={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FB' },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  container: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  header: { gap: Spacing.two },
  headerText: { gap: 4 },
  eyebrow: { color: '#5B7FFF', fontSize: 13, fontWeight: '800' },
  title: { color: '#1E1E2E', fontSize: 30, fontWeight: '800', lineHeight: 38 },
  description: { color: '#64748B', fontSize: 14, lineHeight: 21 },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sortChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: '#5B7FFF' },
  sortText: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  sortTextActive: { color: '#FFFFFF' },
  directionChip: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionChipActive: { backgroundColor: '#1E1E2E', borderColor: '#1E1E2E' },
  directionText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  directionTextActive: { color: '#FFFFFF' },
  createButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#5B7FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  createPlus: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPlusText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  createText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  statRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    minHeight: 70,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 112,
  },
  statValue: { color: '#1E1E2E', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#1E1E2E', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  directionRow: { flexDirection: 'row', gap: 6 },
  archiveList: { gap: 10 },
  archiveCard: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundNumber: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  cardText: { flex: 1, minWidth: 0, gap: 4 },
  cardTitle: { color: '#1E1E2E', fontSize: 14, fontWeight: '800' },
  cardSub: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  cardSummary: { color: '#7B8798', fontSize: 12, lineHeight: 17 },
  avatarRow: { flexDirection: 'row', marginTop: 4 },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -5,
  },
  avatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  moreAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatarText: { color: '#94A3B8', fontSize: 9, fontWeight: '900' },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: { color: '#475569', fontSize: 11, fontWeight: '800' },
  thumbCount: { color: '#475569', fontSize: 10, fontWeight: '700', marginTop: 1 },
  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FEF9EC',
    padding: 14,
  },
  emptyTitle: { color: '#B45309', fontSize: 13, fontWeight: '900', marginBottom: 4 },
  emptyText: { color: '#92400E', fontSize: 12, lineHeight: 18 },
});
