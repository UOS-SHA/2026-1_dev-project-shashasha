// 개발 중 임시 리다이렉트 — dev.tsx 삭제 시 이 파일도 함께 삭제할 것
// Redirect: 앱이 "/" 경로에 도달하는 즉시 지정한 경로로 이동시키는 컴포넌트
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/dev" />;
}
