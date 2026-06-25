import { useState } from 'react';
import {
  Modal,         // 로그아웃/탈퇴 확인 팝업에 사용
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ===== 색상 상수 =====
const COLOR_BG     = '#eaedf7'; // 화면 배경
const COLOR_ACCENT = '#3a6ff5'; // 파란 강조색
const COLOR_TEXT   = '#1a2340'; // 기본 텍스트
const COLOR_GRAY   = '#8e95a9'; // 회색 텍스트
const COLOR_RED    = '#e03535'; // 위험 항목(로그아웃/탈퇴)
const COLOR_BORDER = '#dde0ee'; // 카드 테두리

// ===== 회원 탈퇴 단계 타입 =====
// 0 = 모달 닫힘
// 1 = 1단계: "정말 탈퇴할 건가요?" 첫 번째 확인
// 2 = 2단계: "되돌릴 수 없어요" 최종 확인
type WithdrawStep = 0 | 1 | 2;

// ===== 메인 컴포넌트 =====
export default function SettingsScreen() {
  // useRouter: expo-router 내비게이션 훅
  const router = useRouter();

  // ─── 로그아웃 모달 표시 여부 ───
  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);

  // ─── 회원 탈퇴 단계 ───
  // 0이면 모달 닫힘, 1이면 1단계 모달, 2이면 2단계 모달
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>(0);

  // ─── 로그아웃 처리 ───
  // API 연동 전: console.log로만 처리
  const handleLogout = () => {
    console.log('[설정] 로그아웃 처리');
    setLogoutVisible(false);
  };

  // ─── 회원 탈퇴 최종 처리 (2단계 "탈퇴하기" 버튼) ───
  const handleWithdraw = () => {
    console.log('[설정] 회원 탈퇴 처리');
    setWithdrawStep(0); // 모달 닫기
  };

  return (
    // SafeAreaView: 노치·홈바 영역을 피해 콘텐츠 배치
    <SafeAreaView style={styles.safeArea}>

      {/* ===== 고정 헤더 (ScrollView 바깥에 배치 → 스크롤해도 항상 상단에 고정) ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      {/* ===== 스크롤 가능한 콘텐츠 영역 ===== */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ===== 내 정보 카드 ===== */}
        <View style={styles.card}>
          {/* 카드 섹션 타이틀 */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>내 정보</Text>
          </View>

          {/* 프로필 행: 아바타 + 이름/이메일 + 화살표 → /settings/profile 이동 */}
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => router.push('/settings/profile')}
            activeOpacity={0.7}
          >
            {/* 원형 아바타 (48px, 파란 배경, 이모지) */}
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>😊</Text>
            </View>

            {/* 이름 + 이메일 */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>홍길동</Text>
              <Text style={styles.profileEmail}>user@example.com</Text>
            </View>

            {/* 오른쪽 화살표 */}
            <Text style={styles.arrowGray}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ===== 계정 카드 ===== */}
        <View style={styles.card}>
          {/* 카드 섹션 타이틀 */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>계정</Text>
          </View>

          {/* 로그아웃 항목 (구분선 있음) */}
          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowBorder]}
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuTextDanger}>로그아웃</Text>
            <Text style={styles.arrowRed}>›</Text>
          </TouchableOpacity>

          {/* 회원 탈퇴 항목 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setWithdrawStep(1)} // 1단계 모달 열기
            activeOpacity={0.7}
          >
            <Text style={styles.menuTextDanger}>회원 탈퇴</Text>
            <Text style={styles.arrowRed}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 앱 버전 */}
        <Text style={styles.version}>Schedulr v1.0.0</Text>

      </ScrollView>

      {/* ===== 로그아웃 바텀시트 모달 ===== */}
      {/* animationType="slide": Modal이 화면 아래에서 위로 슬라이드됨 */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutVisible(false)}
      >
        {/* 반투명 오버레이: 탭하면 모달 닫기 */}
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setLogoutVisible(false)}
          activeOpacity={1}
        >
          {/* 시트 본체: onStartShouldSetResponder로 오버레이 탭 이벤트 차단 */}
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {/* 상단 드래그 핸들 (시각적 힌트) */}
            <View style={styles.handle} />

            {/* 이모지 + 제목 + 설명 */}
            <Text style={styles.sheetEmoji}>👋</Text>
            <Text style={styles.sheetTitle}>로그아웃</Text>
            <Text style={styles.sheetDesc}>
              {'정말 로그아웃 하시겠어요?\n언제든지 다시 로그인할 수 있어요.'}
            </Text>

            {/* 취소 / 로그아웃 버튼 */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setLogoutVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.btnDangerText}>로그아웃</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== 회원 탈퇴 모달 (1단계 + 2단계 공용) ===== */}
      {/* withdrawStep > 0 이면 모달 표시 (1 또는 2) */}
      <Modal
        visible={withdrawStep > 0}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawStep(0)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setWithdrawStep(0)}
          activeOpacity={1}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />

            {withdrawStep === 1 ? (
              /* ─── 1단계: 첫 번째 확인 ─── */
              <>
                <Text style={styles.sheetEmoji}>⚠️</Text>
                <Text style={styles.sheetTitle}>회원 탈퇴</Text>
                <Text style={styles.sheetDesc}>
                  {'정말로 회원을 탈퇴하시겠어요?\n탈퇴 시 모든 데이터가 영구적으로\n삭제되며 복구할 수 없어요.'}
                </Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={() => setWithdrawStep(0)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCancelText}>취소</Text>
                  </TouchableOpacity>
                  {/* 확인 → 2단계로 전환 (모달을 닫지 않고 내용만 교체) */}
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDanger]}
                    onPress={() => setWithdrawStep(2)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnDangerText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* ─── 2단계: 최종 확인 ─── */
              <>
                <Text style={styles.sheetEmoji}>🚨</Text>
                {/* 제목을 빨간색으로 강조 */}
                <Text style={[styles.sheetTitle, styles.sheetTitleDanger]}>
                  회원 탈퇴를 진행합니다
                </Text>
                <Text style={styles.sheetDesc}>
                  {'이 작업은 되돌릴 수 없어요.\n정말 탈퇴를 진행하시겠어요?'}
                </Text>

                {/* 삭제 항목 목록 (빨간 박스) */}
                <View style={styles.dangerBox}>
                  <Text style={styles.dangerBoxItem}>· 모든 개인 일정 데이터 삭제</Text>
                  <Text style={styles.dangerBoxItem}>· 참여 중인 모임에서 자동 퇴장</Text>
                  <Text style={styles.dangerBoxItem}>· 계정 복구 불가</Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={() => setWithdrawStep(0)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCancelText}>취소</Text>
                  </TouchableOpacity>
                  {/* 탈퇴하기: 더 진한 빨간색(#c01010) */}
                  <TouchableOpacity
                    style={[styles.btn, styles.btnWithdraw]}
                    onPress={handleWithdraw}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnDangerText}>탈퇴하기</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({

  // ─── 전체 레이아웃 ───
  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ─── 상단 고정 헤더 ───
  // 흰 배경 + 하단 구분선 + 텍스트 중앙 정렬
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLOR_TEXT,
  },

  // ─── 카드 공통 ───
  // 흰 배경, 둥근 모서리(16), 테두리, 가로 여백
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden', // 안쪽 요소가 둥근 모서리 밖으로 나오지 않게
  },
  // 카드 내 섹션 타이틀 (상단 구분선으로 구분)
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

  // ─── 프로필 행 (아바타 + 이름/이메일 + 화살표) ───
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  // 원형 아바타 (48px, 파란 배경 — COLOR_ACCENT 사용)
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLOR_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  // 이름 + 이메일 컨테이너 (flex:1 로 남은 공간 차지)
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_TEXT,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: COLOR_GRAY,
  },

  // ─── 계정 섹션 메뉴 행 ───
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  // 항목 사이 구분선 (마지막 항목 제외)
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2fb',
  },
  menuTextDanger: {
    fontSize: 15,
    fontWeight: '600',
    color: COLOR_RED,
  },

  // ─── 화살표 아이콘 ───
  arrowGray: {
    fontSize: 20,
    color: '#c8cce0',
    fontWeight: '300',
  },
  arrowRed: {
    fontSize: 20,
    color: '#e0a0a0', // 연한 빨간색
    fontWeight: '300',
  },

  // ─── 앱 버전 텍스트 ───
  version: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 11,
    color: '#c0c4d8',
  },

  // ─── 모달 반투명 오버레이 ───
  // justifyContent: 'flex-end' → 시트가 화면 하단에 붙음
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,40,0.5)',
    justifyContent: 'flex-end',
  },

  // ─── 바텀시트 본체 ───
  // 상단만 둥글게, 아래는 화면 끝까지
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 44, // 홈바 영역 여백
    alignItems: 'center',
  },

  // 상단 드래그 핸들 (회색 바)
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d0d4e4',
    borderRadius: 2,
    marginBottom: 20,
  },

  // 이모지 (시트 상단 아이콘 역할)
  sheetEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },

  // 시트 제목
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLOR_TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  // 2단계 탈퇴: 제목을 빨간색으로 오버라이드
  sheetTitleDanger: {
    color: COLOR_RED,
  },

  // 시트 설명 텍스트
  sheetDesc: {
    fontSize: 13,
    color: COLOR_GRAY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // 탈퇴 항목 나열 박스 (빨간 배경)
  dangerBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcccc',
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  dangerBoxItem: {
    fontSize: 13,
    color: COLOR_RED,
    lineHeight: 22,
  },

  // ─── 버튼 공통 ───
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  // 취소 버튼 (회색 배경)
  btnCancel: {
    backgroundColor: '#eceef8',
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },
  // 빨간 버튼 (#e03535 — 로그아웃, 탈퇴 1단계 확인)
  btnDanger: {
    backgroundColor: COLOR_RED,
  },
  // 더 진한 빨간 버튼 (#c01010 — 탈퇴 2단계 최종)
  btnWithdraw: {
    backgroundColor: '#c01010',
  },
  btnDangerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});