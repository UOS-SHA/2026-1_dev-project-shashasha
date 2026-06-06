import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import {
  AppColors,
  InfoIcon,
  OnboardingScreen,
  SectionCard,
} from '@/components/onboarding-screen';

export default function PermissionsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [personalized, setPersonalized] = useState(true);

  return (
    <OnboardingScreen
      description="필요한 소식을 놓치지 않고 더 잘 맞는 모임 정보를 받아보세요."
      footerNote="토글은 화면 확인용이며 실제 기기 권한을 요청하지 않습니다."
      onBack={() => router.back()}
      onPrimaryPress={() => router.push('/schedule')}
      primaryLabel="설정하고 계속하기"
      step={3}
      title="편리한 사용을 위해{'\n'}권한을 설정해 주세요.">
      <View style={styles.cards}>
        <SectionCard style={styles.permissionCard}>
          <View style={styles.permissionTop}>
            <InfoIcon>알림</InfoIcon>
            <Switch
              ios_backgroundColor={AppColors.border}
              onValueChange={setNotifications}
              thumbColor={AppColors.card}
              trackColor={{ false: AppColors.border, true: AppColors.primary }}
              value={notifications}
            />
          </View>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>알림</Text>
            <Text style={styles.permissionDescription}>
              일정 확정, 투표 마감, 새로운 공지처럼 중요한 모임 소식을 알려드려요.
            </Text>
          </View>
        </SectionCard>

        <SectionCard style={styles.permissionCard}>
          <View style={styles.permissionTop}>
            <InfoIcon>추천</InfoIcon>
            <Switch
              ios_backgroundColor={AppColors.border}
              onValueChange={setPersonalized}
              thumbColor={AppColors.card}
              trackColor={{ false: AppColors.border, true: AppColors.primary }}
              value={personalized}
            />
          </View>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>맞춤형 정보</Text>
            <Text style={styles.permissionDescription}>
              앱 사용 정보를 바탕으로 내 활동에 잘 맞는 기능과 모임 정보를 추천해요.
            </Text>
          </View>
        </SectionCard>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>언제든 변경할 수 있어요</Text>
        <Text style={styles.noticeText}>
          실제 서비스에서는 기기 설정에서 권한을 변경할 수 있도록 연결할 예정이에요.
        </Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 14,
  },
  permissionCard: {
    gap: 18,
  },
  permissionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  permissionText: {
    gap: 7,
  },
  permissionTitle: {
    color: AppColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  permissionDescription: {
    color: AppColors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  notice: {
    backgroundColor: AppColors.warningSoft,
    borderRadius: 18,
    gap: 5,
    marginTop: 16,
    padding: 16,
  },
  noticeTitle: {
    color: AppColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  noticeText: {
    color: AppColors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
});
