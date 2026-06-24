import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ===== 색상 상수 =====
const COLOR_BG     = '#eaedf7';
const COLOR_ACCENT = '#3a6ff5'; // 파란 강조색 (아바타 배경, 수정 배지, 버튼)
const COLOR_TEXT   = '#1a2340';
const COLOR_GRAY   = '#8e95a9';
const COLOR_BORDER = '#dde0ee';

// ===== 하드코딩된 프로필 데이터 (API 연동 전 임시) =====
const PROFILE = {
  name:     '홍길동',
  handle:   '@username',
  email:    'user@example.com',
  bio:      '',             // 비어있으면 회색 이탤릭 텍스트로 표시
  joinedAt: '2026.05.09',
};

// ===== 메인 컴포넌트 =====
export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ===== 상단 흰색 영역 (뒤로가기 + 아바타 + 이름 + 이메일) ===== */}
        <View style={styles.topSection}>

          {/* 뒤로가기 버튼: 탭 영역 44px 이상 확보 */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>

          {/* 아바타 + 이름 + 이메일 (중앙 정렬) */}
          <View style={styles.avatarArea}>

            {/* avatarWrapper: 80×80 박스로 수정 배지를 absolute로 정확히 위치시킴 */}
            <View style={styles.avatarWrapper}>
              {/* 원형 아바타 (80px, 파란 배경) */}
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>😊</Text>
              </View>

              {/* 수정 배지: 우하단에 절대 위치, 현재 탭 시 아무 동작 없음 */}
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeIcon}>✏</Text>
              </View>
            </View>

            {/* 이름 */}
            <Text style={styles.profileName}>{PROFILE.name}</Text>
            {/* 이메일 */}
            <Text style={styles.profileEmail}>{PROFILE.email}</Text>
          </View>
        </View>

        {/* ===== 내 정보 카드 ===== */}
        <View style={styles.card}>
          {/* 카드 섹션 타이틀 */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>내 정보</Text>
          </View>

          {/* 이름 */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{PROFILE.name}</Text>
          </View>

          {/* 아이디 */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>아이디</Text>
            <Text style={styles.infoValue}>{PROFILE.handle}</Text>
          </View>

          {/* 이메일 */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{PROFILE.email}</Text>
          </View>

          {/* 자기소개: 비어 있으면 회색 이탤릭, 있으면 일반 텍스트 */}
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>자기소개</Text>
            {PROFILE.bio ? (
              <Text style={styles.infoValue}>{PROFILE.bio}</Text>
            ) : (
              <Text style={styles.infoValueEmpty}>아직 자기소개가 없어요</Text>
            )}
          </View>

          {/* 가입일 (마지막 행 — 구분선 없음) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>가입일</Text>
            <Text style={styles.infoValue}>{PROFILE.joinedAt}</Text>
          </View>
        </View>

        {/* ===== 프로필 수정하기 버튼 ===== */}
        {/* 누르면 /settings/profile-edit 화면으로 이동 */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push('/settings/profile-edit')}
          activeOpacity={0.85}
        >
          <Text style={styles.editBtnText}>프로필 수정하기</Text>
        </TouchableOpacity>

      </ScrollView>
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

  // 뒤로가기 버튼 (44×44 터치 영역 확보)
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

  // 아바타 + 이름 + 이메일 묶음 (화면 중앙 정렬)
  avatarArea: {
    alignItems: 'center',
    marginTop: 8,
  },

  // avatarWrapper: 아바타와 수정 배지를 relative 컨테이너로 묶음
  // 크기를 80×80으로 고정해야 배지의 absolute 위치가 정확하게 적용됨
  avatarWrapper: {
    width: 80,
    height: 80,
    marginBottom: 14,
  },

  // 원형 아바타 (80px, 파란 배경)
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLOR_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 38 },

  // 수정 배지: avatarWrapper 우하단에 절대 위치
  // 현재 탭 시 아무 동작 없음 (추후 사진 변경 기능 연동 예정)
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
    // 흰 테두리로 아바타와 자연스럽게 구분
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeIcon: { fontSize: 11, color: '#fff' },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_TEXT,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: COLOR_GRAY,
  },

  // ─── 정보 카드 ───
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

  // ─── 정보 행 ───
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  // 마지막 행을 제외한 행에 하단 구분선 추가
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2fb',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLOR_GRAY,
  },
  // 일반 값: 굵은 텍스트, 우측 정렬
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_TEXT,
    maxWidth: 220,
    textAlign: 'right',
  },
  // 자기소개 없을 때: 회색 이탤릭
  infoValueEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLOR_GRAY,
    maxWidth: 220,
    textAlign: 'right',
  },

  // ─── 프로필 수정하기 버튼 ───
  editBtn: {
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
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});