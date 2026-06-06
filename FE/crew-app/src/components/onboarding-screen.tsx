import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AppColors = {
  background: '#F7F8F4',
  card: '#FFFFFF',
  ink: '#17231C',
  muted: '#69736D',
  border: '#DEE6E0',
  primary: '#286A4A',
  primarySoft: '#E5F0E9',
  warningSoft: '#FFF7D9',
} as const;

type OnboardingScreenProps = PropsWithChildren<{
  step: number;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  onBack: () => void;
  footerNote?: string;
}>;

export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <View style={[styles.brandMark, { height: size, width: size }]}>
      <View style={[styles.brandCircle, { height: size * 0.44, width: size * 0.44 }]} />
      <View
        style={[
          styles.brandCircle,
          styles.brandCircleRight,
          { height: size * 0.44, width: size * 0.44 },
        ]}
      />
      <View
        style={[
          styles.brandCircle,
          styles.brandCircleBottom,
          { height: size * 0.44, width: size * 0.44 },
        ]}
      />
    </View>
  );
}

export function SectionCard({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

export function OnboardingScreen({
  children,
  step,
  title,
  description,
  primaryLabel,
  onPrimaryPress,
  onBack,
  footerNote,
}: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>시작 설정</Text>
            <Text style={styles.progressStep}>{step} / 4</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressValue, { width: `${step * 25}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <View style={styles.content}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>
          {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityLabel="이전 화면"
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onPrimaryPress}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function InfoIcon({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  progressHeader: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  progressTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: AppColors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  progressStep: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: AppColors.border,
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
  },
  progressValue: {
    backgroundColor: AppColors.primary,
    borderRadius: 999,
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 38,
  },
  heading: {
    gap: 12,
  },
  title: {
    color: AppColors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  description: {
    color: AppColors.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  sectionCard: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  footer: {
    gap: 10,
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  footerNote: {
    color: AppColors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  backButtonText: {
    color: AppColors.ink,
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 38,
    marginTop: -3,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: 18,
    flex: 1,
    height: 58,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: AppColors.card,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  brandMark: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    position: 'relative',
  },
  brandCircle: {
    backgroundColor: AppColors.card,
    borderRadius: 999,
    left: '18%',
    position: 'absolute',
    top: '18%',
  },
  brandCircleRight: {
    left: '48%',
  },
  brandCircleBottom: {
    left: '33%',
    top: '48%',
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: AppColors.primarySoft,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  infoIconText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
