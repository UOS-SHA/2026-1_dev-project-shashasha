import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const records = {
  '1': {
    round: '1회차',
    title: '첫 기획 킥오프',
    date: '2026.04.27',
    place: '학생회관 스터디룸',
    summary:
      'SHASHASHA 앱의 문제 정의를 함께 정리하고, 각자가 맡을 기능과 이번 학기 팀 규칙을 맞췄어요. 다음 모임에서는 와이어프레임을 함께 리뷰하기로 했습니다.',
    attendees: ['나', '서연', '지훈'],
    absentees: ['민지', '예은'],
    color: '#F1765B',
    photos: ['#FFE1D7', '#DBEAFE', '#F6E7B9'],
  },
  '2': {
    round: '2회차',
    title: 'MVP 화면 리뷰',
    date: '2026.05.10',
    place: '학교 중앙도서관',
    summary:
      '탭 구조와 핵심 사용자 플로우를 점검했어요. 활동 기록과 친구 기능에서 사용자가 가장 먼저 확인해야 할 정보를 중심으로 화면 구조를 조정했습니다.',
    attendees: ['나', '민지', '하늘', '도윤'],
    absentees: ['서연', '지훈'],
    color: '#20A67A',
    photos: ['#D8F3EA', '#E9DDFF', '#FFE0E0'],
  },
  '3': {
    round: '3회차',
    title: '봄맞이 작업 회의',
    date: '2026.05.24',
    place: '성수 무드라운지',
    summary:
      '브랜딩 방향을 정리하고 다음 스프린트 역할을 나눴어요. 활동탭의 기록 흐름과 친구탭의 시간 추천 흐름을 우선 구현하기로 결정했습니다.',
    attendees: ['나', '민지', '서연', '지훈', '예은'],
    absentees: ['하늘'],
    color: '#5B7FFF',
    photos: ['#DDE6FF', '#FDE7A9', '#D7F5E9', '#E9DDFF'],
  },
} as const;

export default function ArchiveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = records[id === '1' || id === '2' || id === '3' ? id : '3'];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor="#171821" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>활동 기록</ThemedText>
        <Pressable style={styles.iconButton} onPress={() => router.push('../new')}>
          <SymbolView name="plus" size={20} tintColor="#171821" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.roundBadge, { backgroundColor: record.color }]}>
          <ThemedText style={styles.roundText}>{record.round}</ThemedText>
        </View>
        <ThemedText style={styles.title}>{record.title}</ThemedText>
        <ThemedText style={styles.meta}>{record.date} · {record.place}</ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>활동 요약</ThemedText>
          <ThemedText style={styles.summary}>{record.summary}</ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>사진</ThemedText>
            <ThemedText style={styles.countText}>{record.photos.length}장</ThemedText>
          </View>
          <View style={styles.photoGrid}>
            {record.photos.map((color, index) => (
              <View key={color} style={[styles.photo, { backgroundColor: color }]}>
                <SymbolView name="photo" size={22} tintColor="#5F6674" />
                <ThemedText style={styles.photoText}>사진 {index + 1}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>참석자</ThemedText>
          <View style={styles.memberList}>
            {record.attendees.map((member) => (
              <View key={member} style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: record.color }]}>
                  <ThemedText style={styles.avatarText}>{member[0]}</ThemedText>
                </View>
                <ThemedText style={styles.memberName}>{member}</ThemedText>
                <ThemedText style={styles.attended}>참석</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>미참석자</ThemedText>
          <View style={styles.memberList}>
            {record.absentees.map((member) => (
              <View key={member} style={styles.memberRow}>
                <View style={styles.absentAvatar}>
                  <ThemedText style={styles.absentAvatarText}>{member[0]}</ThemedText>
                </View>
                <ThemedText style={styles.memberName}>{member}</ThemedText>
                <ThemedText style={styles.absent}>미참석</ThemedText>
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
  header: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7EAF1' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  headerTitle: { color: '#171821', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  roundBadge: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  roundText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  title: { color: '#171821', fontSize: 27, fontWeight: '800', lineHeight: 34 },
  meta: { color: '#727989', fontSize: 14, fontWeight: '600' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7EAF1', gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#1D2230', fontSize: 16, fontWeight: '800' },
  countText: { color: '#737B8C', fontSize: 13, fontWeight: '700' },
  summary: { color: '#505868', fontSize: 15, lineHeight: 24 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: '48.5%', aspectRatio: 1.15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoText: { color: '#535B6A', fontSize: 12, fontWeight: '700' },
  memberList: { gap: 10 },
  memberRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  absentAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECEEF3' },
  absentAvatarText: { color: '#747C8C', fontSize: 13, fontWeight: '800' },
  memberName: { flex: 1, color: '#323846', fontSize: 14, fontWeight: '700' },
  attended: { color: '#198B68', fontSize: 12, fontWeight: '800' },
  absent: { color: '#B06470', fontSize: 12, fontWeight: '800' },
});
