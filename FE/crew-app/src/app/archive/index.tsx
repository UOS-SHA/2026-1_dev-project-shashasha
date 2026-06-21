import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const archiveItems = [
  {
    id: 3,
    title: '봄맞이 작업 회의',
    date: '2026.05.24',
    place: '성수 무드라운지',
    summary: '브랜딩 방향을 정리하고 다음 스프린트 역할을 나눴어요.',
    attendees: ['나', '민지', '서연', '지훈', '예은'],
    absentees: ['하늘'],
    photos: 6,
    color: '#5B7FFF',
    photoColors: ['#DDE6FF', '#FDE7A9', '#D7F5E9'],
  },
  {
    id: 2,
    title: 'MVP 화면 리뷰',
    date: '2026.05.10',
    place: '학교 중앙도서관',
    summary: '탭 구조와 핵심 사용자 플로우를 점검했어요.',
    attendees: ['나', '민지', '하늘', '도윤'],
    absentees: ['서연', '지훈'],
    photos: 4,
    color: '#20A67A',
    photoColors: ['#D8F3EA', '#E9DDFF', '#FFE0E0'],
  },
  {
    id: 1,
    title: '첫 기획 킥오프',
    date: '2026.04.27',
    place: '학생회관 스터디룸',
    summary: 'SHASHASHA 앱의 문제 정의와 팀 규칙을 맞췄어요.',
    attendees: ['나', '서연', '지훈'],
    absentees: ['민지', '예은'],
    photos: 3,
    color: '#F1765B',
    photoColors: ['#FFE1D7', '#DBEAFE', '#F6E7B9'],
  },
];

const filters = ['전체', '최근순', '사진 있음'];

export default function ArchiveHomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();

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
            <View>
              <ThemedText style={styles.eyebrow}>SHASHASHA 활동탭</ThemedText>
              <ThemedText style={styles.title}>활동 아카이브</ThemedText>
              <ThemedText style={styles.description}>
                모임 회차별 기록, 사진, 참석 현황을 한눈에 확인해요.
              </ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              onPress={() => router.push('./new')}>
              <SymbolView name="plus" size={22} tintColor="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>3</ThemedText>
              <ThemedText style={styles.statLabel}>총 기록</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>13</ThemedText>
              <ThemedText style={styles.statLabel}>누적 참석</ThemedText>
            </View>
            <View style={styles.statBox}>
              <ThemedText style={styles.statValue}>13</ThemedText>
              <ThemedText style={styles.statLabel}>사진</ThemedText>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
            onPress={() => router.push('./new')}>
            <View style={styles.createIconWrap}>
              <SymbolView name="camera.fill" size={18} tintColor="#5B7FFF" />
            </View>
            <View style={styles.createTextWrap}>
              <ThemedText style={styles.createTitle}>모임 기록 업로드</ThemedText>
              <ThemedText style={styles.createSub}>사진과 간단한 일지를 남겨요</ThemedText>
            </View>
            <SymbolView name="chevron.right" size={16} tintColor="#6B7280" />
          </Pressable>

          <View style={styles.filterRow}>
            {filters.map((filter, index) => (
              <Pressable
                key={filter}
                style={({ pressed }) => [
                  styles.filterChip,
                  index === 0 && styles.filterChipActive,
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={[styles.filterText, index === 0 && styles.filterTextActive]}>
                  {filter}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.listHeader}>
            <ThemedText style={styles.sectionTitle}>활동 히스토리</ThemedText>
            <ThemedText style={styles.sectionMeta}>최신 3개</ThemedText>
          </View>

          <View style={styles.archiveList}>
            {archiveItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.archiveCard, pressed && styles.pressed]}
                onPress={() =>
                  router.push(`./${item.id}`)
                }>
                <View style={[styles.roundBadge, { backgroundColor: item.color }]}>
                  <ThemedText style={styles.roundNumber}>{item.id}</ThemedText>
                  <ThemedText style={styles.roundLabel}>회차</ThemedText>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleWrap}>
                      <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                      <ThemedText style={styles.cardMeta}>
                        {item.date} · {item.place}
                      </ThemedText>
                    </View>
                    <View style={styles.photoCount}>
                      <SymbolView name="photo.on.rectangle" size={13} tintColor="#6B7280" />
                      <ThemedText style={styles.photoCountText}>{item.photos}</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.summary}>{item.summary}</ThemedText>

                  <View style={styles.previewPhotos}>
                    {item.photoColors.map((color, index) => (
                      <View key={color} style={[styles.photoPreview, { backgroundColor: color }]}>
                        <ThemedText style={styles.photoText}>사진 {index + 1}</ThemedText>
                      </View>
                    ))}
                  </View>

                  <View style={styles.peopleBlock}>
                    <View style={styles.peopleRow}>
                      <ThemedText style={styles.peopleLabel}>참석</ThemedText>
                      <View style={styles.avatarStack}>
                        {item.attendees.slice(0, 4).map((name, index) => (
                          <View
                            key={name}
                            style={[
                              styles.avatar,
                              { marginLeft: index === 0 ? 0 : -8, backgroundColor: item.color },
                            ]}>
                            <ThemedText style={styles.avatarText}>{name[0]}</ThemedText>
                          </View>
                        ))}
                      </View>
                      <ThemedText style={styles.peopleNames}>{item.attendees.join(', ')}</ThemedText>
                    </View>
                    <View style={styles.peopleRow}>
                      <ThemedText style={styles.peopleLabelMuted}>미참석</ThemedText>
                      <ThemedText style={styles.absentNames}>{item.absentees.join(', ')}</ThemedText>
                    </View>
                  </View>
                </View>

                <SymbolView name="chevron.right" size={15} tintColor="#A3A8B3" />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  eyebrow: {
    color: '#5B7FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#171821',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: Spacing.one,
  },
  description: {
    color: '#626876',
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.one,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B7FFF',
  },
  pressed: {
    opacity: 0.72,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    minHeight: 76,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EAF1',
  },
  statValue: {
    color: '#171821',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  statLabel: {
    color: '#7A8190',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  createButton: {
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4FF',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  createIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  createTitle: {
    color: '#171821',
    fontSize: 16,
    fontWeight: '800',
  },
  createSub: {
    color: '#7A8190',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterChip: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E8EF',
  },
  filterChipActive: {
    backgroundColor: '#171821',
    borderColor: '#171821',
  },
  filterText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  sectionTitle: {
    color: '#171821',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: '#8A91A0',
    fontSize: 12,
    fontWeight: '700',
  },
  archiveList: {
    gap: Spacing.three,
  },
  archiveCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E8F0',
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  roundBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundNumber: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 22,
  },
  roundLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: '#171821',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },
  cardMeta: {
    color: '#7A8190',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  photoCount: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F7',
  },
  photoCountText: {
    color: '#5F6674',
    fontSize: 12,
    fontWeight: '800',
  },
  summary: {
    color: '#4E5564',
    fontSize: 14,
    lineHeight: 20,
  },
  previewPhotos: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photoPreview: {
    flex: 1,
    minHeight: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    color: '#4B5260',
    fontSize: 11,
    fontWeight: '800',
  },
  peopleBlock: {
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  peopleRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  peopleLabel: {
    width: 42,
    color: '#222631',
    fontSize: 12,
    fontWeight: '900',
  },
  peopleLabelMuted: {
    width: 42,
    color: '#9A6170',
    fontSize: 12,
    fontWeight: '900',
  },
  avatarStack: {
    flexDirection: 'row',
    width: 82,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  peopleNames: {
    flex: 1,
    color: '#5F6674',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  absentNames: {
    flex: 1,
    color: '#9A6170',
    fontSize: 12,
    fontWeight: '700',
  },
});
