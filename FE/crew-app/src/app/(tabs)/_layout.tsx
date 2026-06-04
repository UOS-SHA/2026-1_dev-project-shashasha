import AppTabs from '@/components/app-tabs';

// (tabs) 그룹의 레이아웃: 탭 네비게이터만 담당
// 루트 _layout.tsx 에서 ThemeProvider, AnimatedSplashOverlay를 이미 처리하므로 여기서는 생략
export default function TabsLayout() {
  return <AppTabs />;
}
