import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ArchiveRecord, useArchiveStore } from './_layout';

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <ThemedText style={styles.avatarText}>{name[0]}</ThemedText>
    </View>
  );
}

function NotFoundState() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>기록 상세</ThemedText>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.notFound}>
        <ThemedText style={styles.sectionTitle}>기록을 찾을 수 없어요</ThemedText>
        <ThemedText style={styles.summary}>목록에서 생성한 기록을 다시 선택해주세요.</ThemedText>
      </View>
    </SafeAreaView>
  );
}

export default function ArchiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useArchiveStore();
  const record = records.find((item) => item.id === id);

  if (!record) {
    return <NotFoundState />;
  }

  return <ArchiveDetailContent record={record} />;
}

function ArchiveDetailContent({ record }: { record: ArchiveRecord }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {record.round}회차 | {record.date}
        </ThemedText>
        <Pressable style={styles.iconButton} onPress={() => router.navigate(`/archive/${record.id}/edit`)}>
          <ThemedText style={styles.editText}>편집</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.roundBadge, { backgroundColor: record.color }]}>
          <ThemedText style={styles.roundText}>{record.round}회차</ThemedText>
        </View>

        <ThemedText style={styles.title}>{record.title}</ThemedText>
        <ThemedText style={styles.meta}>
          {record.date} {record.day} · {record.place}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>활동 요약</ThemedText>
          <ThemedText style={styles.summary}>{record.summary}</ThemedText>
          <ThemedText style={styles.moreText}>더보기</ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>사진 갤러리</ThemedText>
            <ThemedText style={styles.countText}>{record.photos}장</ThemedText>
          </View>
          <View style={styles.photoGrid}>
            {Array.from({ length: Math.min(record.photos, 4) }).map((_, index) => (
              <View key={index} style={[styles.photo, { backgroundColor: index % 2 === 0 ? '#DDD6FE' : '#FDE68A' }]}>
                <ThemedText style={styles.photoText}>
                  {index === 3 && record.photos > 4 ? `+${record.photos - 3}` : `사진 ${index + 1}`}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>참석 명단</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberScroll}>
            {record.attendees.map((member, index) => (
              <View key={member} style={styles.avatarItem}>
                <Avatar name={member} color={['#5B7FFF', '#F97316', '#10B981', '#F43F5E', '#0EA5E9'][index % 5]} />
                <ThemedText style={styles.avatarName}>{member}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>미참석자</ThemedText>
          <View style={styles.absentList}>
            {record.absentees.map((member) => (
              <View key={member} style={styles.absentChip}>
                <ThemedText style={styles.absentText}>{member}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FB' },
  header: {
    height: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconButton: { minWidth: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  navIcon: { color: '#1E1E2E', fontSize: 28, fontWeight: '800', lineHeight: 30 },
  editText: { color: '#5B7FFF', fontSize: 13, fontWeight: '900' },
  headerTitle: { color: '#1E1E2E', fontSize: 16, fontWeight: '800' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  notFound: { flex: 1, justifyContent: 'center', padding: 24, gap: 8 },
  roundBadge: { alignSelf: 'flex-start', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  roundText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  title: { color: '#1E1E2E', fontSize: 26, fontWeight: '900', lineHeight: 33 },
  meta: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E8EDF3', gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#1E1E2E', fontSize: 16, fontWeight: '900' },
  countText: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },
  summary: { color: '#475569', fontSize: 14, lineHeight: 22 },
  moreText: { color: '#A78BFA', fontSize: 13, fontWeight: '900' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: '48.5%', aspectRatio: 1.1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: '#475569', fontSize: 15, fontWeight: '900' },
  memberScroll: { gap: 12, paddingRight: 8 },
  avatarItem: { alignItems: 'center', gap: 5, width: 58 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  avatarName: { color: '#475569', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  absentList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  absentChip: { borderRadius: 20, backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 7 },
  absentText: { color: '#DC2626', fontSize: 12, fontWeight: '800' },
});
