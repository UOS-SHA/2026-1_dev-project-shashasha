import { useState } from 'react';
import {
  Animated,      // 토스트 메시지 페이드 인/아웃 애니메이션에 사용
  Modal,         // 이모지 선택 바텀시트에 사용
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
const COLOR_ACCENT   = '#3a6ff5'; // 파란 강조색 (아바타, 버튼, 배지)
const COLOR_TEXT     = '#1a2340';
const COLOR_GRAY     = '#8e95a9';
const COLOR_BORDER   = '#dde0ee';
const COLOR_INPUT_BG = '#eceef8'; // 입력 필드 배경

// ===== 선택 가능한 이모지 목록 =====
// 프로필 사진 대신 사용할 이모지 10개
const EMOJIS: string[] = ['😊', '😎', '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐧', '🦋'];

// ===== 메인 컴포넌트 =====
export default function ProfileEditScreen() {
  const router = useRouter();

  // ─── 폼 상태 ───
  // 선택된 이모지 (기본값: 😊)
  const [emoji, setEmoji]   = useState<string>('😊');
  // 이름 입력값
  const [name, setName]     = useState<string>('홍길동');
  // 아이디 입력값
  const [handle, setHandle] = useState<string>('@username');
  // 자기소개 입력값 (초기에는 비어 있음)
  const [bio, setBio]       = useState<string>('');

  // ─── 이모지 피커 바텀시트 표시 여부 ───
  const [emojiPickerVisible, setEmojiPickerVisible] = useState<boolean>(false);

  // ─── 토스트 애니메이션 값 ───
  // Animated.Value: 0 = 완전 투명(숨김), 1 = 완전 불투명(표시)
  // useState 지연 초기화로 생성 → React Compiler와의 충돌 방지
  const [toastAnim] = useState(() => new Animated.Value(0));

  // ─── 토스트 표시 여부 (View 렌더링 제어) ───
  // toastAnim 값과 별도로 View 자체를 마운트/언마운트해서 불필요한 레이어 최소화
  const [toastShowing, setToastShowing] = useState<boolean>(false);

  // ─── 이모지 선택 처리 ───
  const handleSelectEmoji = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);        // 아바타 이모지 변경
    setEmojiPickerVisible(false);   // 피커 닫기
  };

  // ─── 토스트 표시 함수 ───
  // Animated.sequence: 여러 애니메이션을 순서대로 실행
  const showToast = () => {
    setToastShowing(true);
    toastAnim.setValue(0); // 시작 전 초기화

    Animated.sequence([
      // ① 300ms 동안 서서히 나타남 (opacity 0 → 1)
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      // ② 1200ms 동안 유지
      Animated.delay(1200),
      // ③ 300ms 동안 서서히 사라짐 (opacity 1 → 0)
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // 애니메이션 완전 종료 후: 토스트 언마운트 + 이전 화면 복귀
      setToastShowing(false);
      router.back();
    });
  };

  // ─── 저장 처리 ───
  const handleSave = () => {
    console.log('[프로필 수정] 저장 데이터:', { emoji, name, handle, bio });
    showToast(); // 토스트 표시 → 애니메이션 종료 후 자동으로 router.back() 호출
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // 키보드가 열린 상태에서도 스크롤 내 버튼을 탭할 수 있도록 설정
        keyboardShouldPersistTaps="handled"
      >

        {/* ===== 상단 흰색 영역 ===== */}
        <View style={styles.topSection}>

          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          {/* 아바타 (탭 → 이모지 피커 열기) + "사진 변경" 텍스트 */}
          <View style={styles.avatarArea}>
            <TouchableOpacity
              onPress={() => setEmojiPickerVisible(true)}
              activeOpacity={0.8}
            >
              {/* avatarWrapper: 수정 배지를 absolute로 위치시키기 위한 80×80 컨테이너 */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  {/* 선택한 이모지가 여기 표시됨 */}
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </View>

                {/* 수정 배지 (우하단, 파란 원 + ✏ 아이콘) */}
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeIcon}>✏</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* 아바타 아래 안내 텍스트 */}
            <Text style={styles.changePhotoText}>사진 변경</Text>
          </View>
        </View>

        {/* ===== 정보 수정 카드 ===== */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>정보 수정</Text>
          </View>

          {/* 이름 입력 */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>이름</Text>
            {/* value/onChangeText: 제어 컴포넌트 (controlled input) 패턴 */}
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#b0b8cc"
              returnKeyType="next"
            />
          </View>

          {/* 필드 사이 구분선 */}
          <View style={styles.divider} />

          {/* 아이디 입력 */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>아이디</Text>
            <TextInput
              style={styles.fieldInput}
              value={handle}
              onChangeText={setHandle}
              placeholder="@아이디"
              placeholderTextColor="#b0b8cc"
              returnKeyType="next"
              autoCapitalize="none" // @ 아이디는 소문자 유지
            />
          </View>

          <View style={styles.divider} />

          {/* 자기소개 입력 (여러 줄 입력 가능) */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>자기소개</Text>
            {/* multiline: 줄바꿈 허용 / textAlignVertical: Android에서 텍스트 상단 정렬 */}
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti]}
              value={bio}
              onChangeText={setBio}
              placeholder="자기소개를 입력하세요..."
              placeholderTextColor="#b0b8cc"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ===== 저장하기 버튼 ===== */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>저장하기</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ===== 토스트 메시지 ===== */}
      {/* toastShowing이 true일 때만 렌더링 (불필요한 레이어 최소화) */}
      {/* Animated 스타일의 opacity는 동적 값이므로 인라인으로 전달 (불가피한 예외) */}
      {toastShowing && (
        <Animated.View style={[styles.toast, { opacity: toastAnim }]}>
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>저장 완료!</Text>
          </View>
        </Animated.View>
      )}

      {/* ===== 이모지 선택 바텀시트 모달 ===== */}
      <Modal
        visible={emojiPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        {/* 반투명 오버레이: 탭하면 피커 닫기 */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setEmojiPickerVisible(false)}
          activeOpacity={1}
        >
          {/* 바텀시트 본체 */}
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {/* 드래그 핸들 */}
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>프로필 사진 선택</Text>

            {/* 이모지 그리드: flexWrap으로 자동 줄바꿈 (2줄 × 5개) */}
            <View style={styles.emojiGrid}>
              {EMOJIS.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[
                    styles.emojiBtn,
                    // 현재 선택된 이모지에 파란 테두리 강조
                    emoji === em && styles.emojiBtnSelected,
                  ]}
                  onPress={() => handleSelectEmoji(em)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiBtnText}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 취소 버튼 */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEmojiPickerVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ─── 상단 흰색 영역 ───
  topSection: {
    backgroundColor: '#fff',
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginTop: 4,
  },
  backBtnText: {
    fontSize: 28,
    color: COLOR_TEXT,
    fontWeight: '300',
  },

  // 아바타 + "사진 변경" 묶음 (중앙 정렬)
  avatarArea: {
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  // 아바타와 배지를 묶는 80×80 컨테이너
  avatarWrapper: {
    width: 80,
    height: 80,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLOR_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 38 },

  // 수정 배지 (우하단 절대 위치)
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeIcon: { fontSize: 11, color: '#fff' },

  changePhotoText: {
    fontSize: 11,
    color: COLOR_GRAY,
  },

  // ─── 수정 카드 ───
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    marginHorizontal: 16,
    marginTop: 20,
    overflow: 'hidden',
  },
  cardTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_TEXT,
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
  // 자기소개 필드: 높이를 더 크게
  fieldInputMulti: {
    minHeight: 80,
    paddingTop: 11,
  },
  // 필드 사이 얇은 구분선
  divider: {
    height: 1,
    backgroundColor: '#f0f2fb',
    marginHorizontal: 16,
  },

  // ─── 저장 버튼 ───
  saveBtn: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#2a55d0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // ─── 토스트 메시지 ───
  // 화면 전체에서 절대 위치로 하단 중앙에 표시
  toast: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // 토스트 내부 박스 (어두운 반투명 배경 + 둥근 모서리)
  toastBox: {
    backgroundColor: 'rgba(26,35,64,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── 모달 반투명 오버레이 ───
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,40,0.5)',
    justifyContent: 'flex-end',
  },

  // ─── 이모지 피커 바텀시트 ───
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 44,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d0d4e4',
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_TEXT,
    marginBottom: 20,
  },

  // ─── 이모지 그리드 ───
  // flexWrap: 한 줄에 5개씩, 넘치면 다음 줄로 자동 배치
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  // 이모지 원형 버튼 (52px)
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLOR_INPUT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 현재 선택된 이모지: 파란 테두리 강조
  emojiBtnSelected: {
    borderWidth: 2.5,
    borderColor: COLOR_ACCENT,
  },
  emojiBtnText: { fontSize: 26 },

  // ─── 취소 버튼 ───
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#eceef8',
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },
});