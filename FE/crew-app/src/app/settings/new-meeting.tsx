import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ===== 색상 상수 =====
const COLOR_BG       = '#eaedf7';
const COLOR_ACCENT   = '#3a6ff5';
const COLOR_TEXT     = '#1a2340';
const COLOR_GRAY     = '#8e95a9';
const COLOR_BORDER   = '#dde0ee';
const COLOR_INPUT_BG = '#eceef8';

// ===== 타입 정의 =====

// 참여자 한 명을 표현하는 타입
type Member = {
  id: number;
  label: string;   // 화면에 표시할 이름
  initial: string; // 원형 아이콘에 표시할 이니셜 (1~2자)
};

// 추천 시간 슬롯을 표현하는 타입
type TimeSlot = {
  id: number;
  label: string;   // 표시 텍스트 (예: "오후 2:00 - 4:00")
  starred: boolean; // ★ 강조 슬롯 여부
};

// ===== 하드코딩된 초기 데이터 (API 연동 전 임시) =====

// 참여자 목록: "나(Me)", "김민준", "이지은"
const INITIAL_MEMBERS: Member[] = [
  { id: 0, label: '나(Me)',  initial: 'Me' },
  { id: 1, label: '김민준', initial: '준' },
  { id: 2, label: '이지은', initial: '은' },
];

// 추천 시간 슬롯 3개
const TIME_SLOTS: TimeSlot[] = [
  { id: 0, label: '오후 2:00 - 4:00',  starred: true  },  // ① 최우선 추천
  { id: 1, label: '오후 1:00 - 2:00',  starred: false },  // ②
  { id: 2, label: '오전 10:00 - 11:00', starred: false }, // ③
];

// ===== 메인 컴포넌트 =====
export default function NewMeetingScreen() {
  const router = useRouter();

  // ─── 폼 상태 ───
  const [title, setTitle]       = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [memo, setMemo]         = useState<string>('');

  // ─── 선택된 시간 슬롯 ID ───
  // null = 아무것도 선택 안 됨, 숫자 = 선택된 슬롯의 id
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // ─── 참여자 추가 ───
  // 실제 기능은 API 연동 후 구현 예정
  const handleAddMember = () => {
    console.log('[새 모임 생성] 참여자 추가 버튼 클릭');
  };

  // ─── 모임 생성 ───
  // console.log로 데이터 출력 후 이전 화면으로 복귀
  const handleCreate = () => {
    const selectedTime = TIME_SLOTS.find(s => s.id === selectedSlot);
    console.log('[새 모임 생성] 생성 데이터:', {
      title,
      location,
      memo,
      selectedTime: selectedTime?.label ?? '미선택',
      members: INITIAL_MEMBERS.map(m => m.label),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // 키보드가 열려 있어도 스크롤 안의 버튼을 탭할 수 있게
        keyboardShouldPersistTaps="handled"
      >

        {/* ===== 상단 바 ===== */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>새 모임 생성</Text>

          {/* 좌우 대칭을 위한 빈 공간 */}
          <View style={styles.topBarRight} />
        </View>

        {/* ===== 섹션: 참여자 ===== */}
        <Text style={styles.sectionLabel}>참여자</Text>
        <View style={styles.card}>
          {/* 참여자 + 추가 버튼을 가로로 나열 */}
          <View style={styles.membersRow}>

            {/* 하드코딩된 멤버 3명 */}
            {INITIAL_MEMBERS.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                {/* 원형 아이콘 */}
                <View style={styles.memberCircle}>
                  <Text style={styles.memberInitial}>{member.initial}</Text>
                </View>
                {/* 이름 레이블 */}
                <Text style={styles.memberLabel} numberOfLines={1}>
                  {member.label}
                </Text>
              </View>
            ))}

            {/* "+ 추가" 버튼: 현재는 console.log만 */}
            <TouchableOpacity
              style={styles.memberItem}
              onPress={handleAddMember}
              activeOpacity={0.7}
            >
              {/* 원형 플러스 버튼 */}
              <View style={[styles.memberCircle, styles.addCircle]}>
                <Text style={styles.addIcon}>+</Text>
              </View>
              <Text style={styles.memberLabel}>추가</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* ===== 섹션: 입력 필드 ===== */}
        <Text style={styles.sectionLabel}>모임 정보</Text>
        <View style={styles.card}>

          {/* 모임 제목 */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>모임 제목</Text>
            <TextInput
              style={styles.fieldInput}
              value={title}
              onChangeText={setTitle}
              placeholder="예: 팀 회의, 스터디..."
              placeholderTextColor="#b0b8cc"
              returnKeyType="next"  // 다음 필드로 이동 버튼
            />
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 장소 또는 화상 링크 */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>장소 또는 화상 회의 링크</Text>
            <TextInput
              style={styles.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="예: 강남역 스타벅스"
              placeholderTextColor="#b0b8cc"
              returnKeyType="next"
            />
          </View>

          <View style={styles.divider} />

          {/* 설명 / 안건 / 메모 — multiline TextInput */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>설명 / 안건 / 메모</Text>
            {/* multiline: 여러 줄 입력 가능 / textAlignVertical: Android에서 텍스트 상단 정렬 */}
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti]}
              value={memo}
              onChangeText={setMemo}
              placeholder="선택 사항"
              placeholderTextColor="#b0b8cc"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

        </View>

        {/* ===== 섹션: 겹치는 시간 확인 ===== */}
        <Text style={styles.sectionLabel}>겹치는 시간 확인</Text>

        {/* 추천 시간 카드 3개 */}
        {TIME_SLOTS.map((slot) => {
          // 현재 카드가 선택된 상태인지 여부
          const isSelected = selectedSlot === slot.id;

          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotCard,
                // ★ 강조 슬롯: 파란 테두리
                slot.starred && !isSelected && styles.slotCardStarred,
                // 선택된 슬롯: 파란 배경
                isSelected && styles.slotCardSelected,
              ]}
              onPress={() => setSelectedSlot(slot.id)}
              activeOpacity={0.75}
            >
              {/* 별표 아이콘 (강조 슬롯에만 표시) */}
              {slot.starred && (
                <Text style={[styles.slotStar, isSelected && styles.slotStarSelected]}>
                  ★{' '}
                </Text>
              )}
              <Text style={[
                styles.slotLabel,
                isSelected && styles.slotLabelSelected,  // 선택 시 흰 텍스트
              ]}>
                {slot.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 하단 여백 (버튼 위 공간) */}
        <View style={{ height: 16 }} />

        {/* ===== 모임 생성하기 버튼 ===== */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>모임 생성하기</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // ─── 상단 바 ───
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: COLOR_TEXT,
    fontWeight: '300',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  topBarRight: { width: 44 },

  // ─── 섹션 레이블 ───
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_GRAY,
    marginBottom: 6,
    marginTop: 16,
    marginLeft: 4,
  },

  // ─── 흰색 카드 ───
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    overflow: 'hidden',
  },

  // ─── 참여자 행 ───
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',     // 참여자가 많아지면 줄 바꿈
    gap: 16,
    padding: 16,
  },
  // 참여자 한 명 (아이콘 + 이름)을 세로로 묶는 래퍼
  memberItem: {
    alignItems: 'center',
    gap: 5,
    width: 52,
  },
  // 원형 아이콘 배경
  memberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR_ACCENT,  // 파란 배경
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  memberLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLOR_TEXT,
    textAlign: 'center',
  },
  // "+ 추가" 버튼 아이콘 스타일 (회색 배경)
  addCircle: {
    backgroundColor: '#dde0ee',  // 회색으로 차별화
  },
  addIcon: {
    fontSize: 22,
    fontWeight: '400',
    color: COLOR_GRAY,
    lineHeight: 26,
  },

  // ─── 입력 필드 ───
  fieldWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_GRAY,
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: COLOR_INPUT_BG,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontSize: 14,
    fontWeight: '500',
    color: COLOR_TEXT,
  },
  // 메모 필드는 높이를 더 크게
  fieldInputMulti: {
    minHeight: 90,
    paddingTop: 11,
  },
  // 카드 내 필드 사이 구분선
  divider: {
    height: 1,
    backgroundColor: '#f0f2fb',
    marginHorizontal: 16,
  },

  // ─── 시간 슬롯 카드 ───
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  // ★ 강조 슬롯: 파란 테두리
  slotCardStarred: {
    borderColor: COLOR_ACCENT,
  },
  // 선택된 슬롯: 파란 배경
  slotCardSelected: {
    backgroundColor: COLOR_ACCENT,
    borderColor: COLOR_ACCENT,
  },
  slotStar: {
    fontSize: 14,
    color: COLOR_ACCENT,
    fontWeight: '700',
  },
  slotStarSelected: {
    color: '#fff',  // 선택된 상태에서는 흰색 별
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_TEXT,
  },
  slotLabelSelected: {
    color: '#fff',  // 선택된 상태에서는 흰색 텍스트
  },

  // ─── 모임 생성하기 버튼 ───
  createBtn: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2a55d0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
