// ⚠️ 개발용 임시 파일 — 배포 전 반드시 삭제할 것
// 각 화면으로 빠르게 이동할 수 있는 테스트 페이지

import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DevScreen() {
  // useRouter: Expo Router의 내비게이션 훅
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 페이지 제목 */}
      <Text style={styles.title}>🛠️ 개발용 테스트 페이지</Text>

      {/* 배포 전 삭제 경고 문구 */}
      <Text style={styles.warning}>⚠️ 개발용 파일 — 배포 전 삭제할 것</Text>

      <View style={styles.buttonList}>
        {/* 개인 일정 화면으로 이동 */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/personal-schedule')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>📅 개인 일정 (주간 캘린더)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1d2e',
    marginBottom: 10,
  },
  // 빨간 경고 문구
  warning: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cc2222',
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#ffcccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  buttonList: {
    gap: 12,
  },
  // 파란 배경, 흰 텍스트, 둥근 버튼
  button: {
    backgroundColor: '#3a6ff5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2a55d0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
