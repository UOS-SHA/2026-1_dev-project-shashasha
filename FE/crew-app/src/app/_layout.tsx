import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

// 루트 레이아웃: Stack을 루트 네비게이터로 사용
//
// 구조:
//   Stack (루트)
//   ├── (tabs)       → 탭 화면들 (index, explore). 괄호 그룹이라 URL에 포함 안 됨
//   └── personal-schedule → 개인 일정 화면 (탭 위에 전체 화면으로 push)
//
// NativeTabs만 루트로 두면 iOS 네이티브 탭 컨트롤러 특성상 등록되지 않은 경로로
// 이동이 불가능하다. Stack이 루트를 담당해야 어느 경로든 push 할 수 있다.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {/* headerShown: false → 각 화면이 자체 헤더를 관리 */}
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
