import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

// 루트 네비게이터: 온보딩/홈/각 기능 폴더를 스택으로 묶는다.
// (기존 NativeTabs는 템플릿 Home/Explore 탭만 있어 실제 기능 화면에 닿지 못해 Stack으로 교체)
// 각 기능 폴더(archive, friends, settings, personal-schedule, (auth), home, meeting)는
// 자체 _layout.tsx 스택을 그대로 사용하므로 이 변경의 영향을 받지 않는다.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
