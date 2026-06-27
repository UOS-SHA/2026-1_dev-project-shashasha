import { Stack } from 'expo-router';

// 메인 홈 그룹 스택. 헤더는 각 화면에서 직접 그린다.
export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
