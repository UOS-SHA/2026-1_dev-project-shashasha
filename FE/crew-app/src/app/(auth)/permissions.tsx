import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Onb, StepFooter, StepHeader, stepProgress, useOnboarding } from './_layout';

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable style={[styles.toggle, value && styles.toggleOn]} onPress={onToggle}>
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

export default function PermissionsScreen() {
  const { notification, setNotification, personalize, setPersonalize } = useOnboarding();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader progress={stepProgress('permissions')} />

        <ThemedText style={styles.title}>편리한 사용을 위해{'\n'}권한을 설정해 주세요.</ThemedText>
        <ThemedText style={styles.sub}>필요한 소식을 놓치지 않고 더 잘 맞는 모임 정보를 받아보세요.</ThemedText>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>알림</ThemedText>
            </View>
            <Toggle value={notification} onToggle={() => setNotification(!notification)} />
          </View>
          <ThemedText style={styles.cardTitle}>알림</ThemedText>
          <ThemedText style={styles.cardSub}>
            일정 확정, 투표 마감, 새로운 공지처럼 중요한 모임 소식을 알려드려요.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>추천</ThemedText>
            </View>
            <Toggle value={personalize} onToggle={() => setPersonalize(!personalize)} />
          </View>
          <ThemedText style={styles.cardTitle}>맞춤형 정보</ThemedText>
          <ThemedText style={styles.cardSub}>
            앱 사용 정보를 바탕으로 내 활동에 잘 맞는 기능과 모임 정보를 추천해요.
          </ThemedText>
        </View>

        <View style={styles.notice}>
          <ThemedText style={styles.noticeTitle}>언제든 변경할 수 있어요</ThemedText>
          <ThemedText style={styles.noticeText}>
            실제 서비스에서는 기기 설정에서 권한을 변경할 수 있도록 연결할 예정이에요.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <StepFooter
          primaryLabel="설정하고 계속하기"
          note="토글은 화면 확인용이며 실제 기기 권한을 요청하지 않습니다."
          onPrimary={() => router.push('/schedule')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Onb.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 16 },
  title: { color: Onb.ink, fontSize: 28, fontWeight: '900', lineHeight: 38, marginTop: 6 },
  sub: { color: Onb.sub, fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: Onb.card,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: Onb.line,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: Onb.chip, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { color: Onb.chipText, fontSize: 13, fontWeight: '800' },
  cardTitle: { color: Onb.ink, fontSize: 18, fontWeight: '900' },
  cardSub: { color: Onb.sub, fontSize: 14, lineHeight: 21 },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CFD2C8',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: Onb.green },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignSelf: 'flex-start' },
  knobOn: { alignSelf: 'flex-end' },
  notice: { backgroundColor: Onb.notice, borderRadius: 14, padding: 16, gap: 5 },
  noticeTitle: { color: Onb.noticeText, fontSize: 14, fontWeight: '900' },
  noticeText: { color: '#9C8C4A', fontSize: 13, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
});
