import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Onb, StepFooter, StepHeader, stepProgress, useOnboarding } from './_layout';

const terms = [
  { key: 'age', label: '만 14세 이상입니다', required: true },
  { key: 'service', label: '서비스 이용약관 동의', required: true },
  { key: 'privacy', label: '개인정보 처리방침 동의', required: true },
  { key: 'marketing', label: '새로운 모임 소식 수신 동의', required: false },
];

export default function TermsScreen() {
  const { setAgreed } = useOnboarding();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allChecked = checked.size === terms.length;
  const requiredChecked = useMemo(
    () => terms.filter((item) => item.required).every((item) => checked.has(item.key)),
    [checked]
  );

  useEffect(() => {
    setAgreed(requiredChecked);
  }, [requiredChecked, setAgreed]);

  const toggleAll = () => {
    setChecked(allChecked ? new Set() : new Set(terms.map((item) => item.key)));
  };

  const toggleItem = (key: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader progress={stepProgress('terms')} />

        <ThemedText style={styles.title}>이용 전 약관을{'\n'}확인해 주세요.</ThemedText>
        <ThemedText style={styles.sub}>안전하고 편리한 모임 운영을 위해 아래 내용을 확인해 주세요.</ThemedText>

        <Pressable style={styles.allCard} onPress={toggleAll}>
          <View style={[styles.allCheck, allChecked && styles.allCheckOn]}>
            <ThemedText style={[styles.allCheckMark, allChecked && styles.allCheckMarkOn]}>✓</ThemedText>
          </View>
          <View style={styles.allText}>
            <ThemedText style={styles.allTitle}>모두 동의하기</ThemedText>
            <ThemedText style={styles.allSub}>선택 항목을 포함해 모든 약관에 동의합니다.</ThemedText>
          </View>
        </Pressable>

        <View style={styles.list}>
          {terms.map((item, index) => {
            const on = checked.has(item.key);

            return (
              <Pressable key={item.key} onPress={() => toggleItem(item.key)}>
                {index > 0 && <View style={styles.itemDivider} />}
                <View style={styles.itemRow}>
                  <View style={[styles.itemCheck, on && styles.itemCheckOn]}>
                    <ThemedText style={[styles.itemMark, on && styles.itemMarkOn]}>✓</ThemedText>
                  </View>
                  <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                  <ThemedText style={[styles.tag, item.required ? styles.required : styles.optional]}>
                    {item.required ? '필수' : '선택'}
                  </ThemedText>
                  <ThemedText style={styles.chevron}>›</ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <StepFooter
          primaryLabel="확인했어요"
          note="이 화면은 데모이므로 동의 여부와 관계없이 다음 화면으로 이동합니다."
          onPrimary={() => router.push('/permissions')}
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
  allCard: {
    backgroundColor: Onb.green,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  allCheck: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allCheckOn: { backgroundColor: '#FFFFFF' },
  allCheckMark: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '900' },
  allCheckMarkOn: { color: Onb.green },
  allText: { flex: 1, gap: 3 },
  allTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  allSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 17 },
  list: {
    backgroundColor: Onb.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Onb.line,
  },
  itemDivider: { height: 1, backgroundColor: Onb.line },
  itemRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EDEEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCheckOn: { backgroundColor: Onb.chip },
  itemMark: { color: '#C2C5BC', fontSize: 13, fontWeight: '900' },
  itemMarkOn: { color: Onb.green },
  itemLabel: { flex: 1, color: Onb.ink, fontSize: 15, fontWeight: '700' },
  tag: { fontSize: 12, fontWeight: '800' },
  required: { color: Onb.green },
  optional: { color: Onb.sub },
  chevron: { color: Onb.sub, fontSize: 18, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
});
