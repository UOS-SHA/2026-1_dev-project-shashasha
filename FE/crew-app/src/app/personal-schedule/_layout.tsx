import { Stack } from 'expo-router';

// personal-schedule 그룹 내부의 스택 네비게이터
// index(캘린더) → add(일정 추가) 이동을 Stack이 처리
export default function PersonalScheduleLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
