import { Stack } from 'expo-router';

// settings 그룹 내부 스택 네비게이터
// index → profile → profile-edit, new-meeting 이동을 Stack이 처리
// headerShown: false → 각 화면에서 직접 커스텀 헤더를 만들 것이므로 기본 헤더 숨김
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
