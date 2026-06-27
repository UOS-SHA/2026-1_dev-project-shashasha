import { Redirect } from 'expo-router';

// 앱 첫 진입점. 온보딩(로그인)으로 보낸다.
// 데모 중 온보딩을 건너뛰고 바로 메인 홈을 보려면 href를 '/home'으로 바꾸면 된다.
export default function Index() {
  return <Redirect href="/login" />;
}
