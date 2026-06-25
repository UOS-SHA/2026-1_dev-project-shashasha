import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useArchiveStore } from './_layout';

const members = ['김민지', '이서연', '박지훈', '최예은', '정하늘', '한도윤'];

export default function ArchiveNewScreen() {
  const { addRecord } = useArchiveStore();
  const [date, setDate] = useState('2025.04.12');
  const [place, setPlace] = useState('성수 카페');
  const [memo, setMemo] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['김민지', '이서연']);

  const toggleMember = (member: string) => {
    setAttendees((current) =>
      current.includes(member) ? current.filter((name) => name !== member) : [...current, member]
    );
  };

  const saveRecord = () => {
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(date.trim())) {
      Alert.alert('날짜 형식을 확인해주세요', '날짜는 2025.04.12 형식으로 입력해주세요.');
      return;
    }

    if (!memo.trim()) {
      Alert.alert('내용을 입력해주세요', '오늘 모임에서 어떤 활동을 했는지 간단히 적어주세요.');
      return;
    }

    addRecord({
      date,
      place,
      summary: memo,
      attendees,
      absentees: members.filter((member) => !attendees.includes(member)),
    });
    router.replace('/archive');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ThemedText style={styles.navIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>기록 작성</ThemedText>
        <Pressable style={styles.saveSmallButton} onPress={saveRecord}>
          <ThemedText style={styles.saveSmallText}>저장</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.label}>사진</ThemedText>
          <View style={styles.photoRow}>
            <Pressable
              style={styles.addPhoto}
              onPress={() => Alert.alert('사진 추가', '사진 선택 기능은 API 연동 단계에서 연결할 예정이에요.')}>
              <ThemedText style={styles.addPhotoIcon}>+</ThemedText>
            </Pressable>
            <View style={[styles.previewPhoto, { backgroundColor: '#DDD6FE' }]}>
              <ThemedText style={styles.previewPhotoText}>사진</ThemedText>
            </View>
            <View style={[styles.previewPhoto, { backgroundColor: '#FDE68A' }]}>
              <ThemedText style={styles.previewPhotoText}>사진</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>모임 날짜</ThemedText>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="2025.04.12"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            keyboardType="numbers-and-punctuation"
          />
          <ThemedText style={styles.helper}>YYYY.MM.DD 형식으로 입력하면 요일은 자동으로 계산돼요.</ThemedText>

          <ThemedText style={styles.label}>모임 장소</ThemedText>
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder="예: 성수 카페"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <ThemedText style={styles.label}>활동 내용</ThemedText>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="오늘 모임은 뭐했나요?"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.memoInput]}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>참석자 선택</ThemedText>
          <ThemedText style={styles.helper}>참석한 멤버를 체크하면 목록과 상세 화면에 반영돼요.</ThemedText>
          <View style={styles.memberList}>
            {members.map((member) => {
              const selected = attendees.includes(member);

              return (
                <Pressable key={member} style={styles.checkRow} onPress={() => toggleMember(member)}>
                  <View style={[styles.checkBox, selected && styles.checkBoxSelected]}>
                    {selected && <ThemedText style={styles.checkText}>✓</ThemedText>}
                  </View>
                  <ThemedText style={styles.memberText}>{member}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]} onPress={saveRecord}>
          <ThemedText style={styles.saveText}>기록 저장하기</ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FB' },
  header: {
    height: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: { minWidth: 44, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  navIcon: { color: '#1E1E2E', fontSize: 28, fontWeight: '800', lineHeight: 30 },
  headerTitle: { color: '#1E1E2E', fontSize: 17, fontWeight: '900' },
  saveSmallButton: { borderRadius: 8, backgroundColor: '#5B7FFF', paddingHorizontal: 14, paddingVertical: 7 },
  saveSmallText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E8EDF3', gap: 10 },
  label: { color: '#1E1E2E', fontSize: 15, fontWeight: '900' },
  helper: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  photoRow: { flexDirection: 'row', gap: 8 },
  addPhoto: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: { color: '#5B7FFF', fontSize: 24, fontWeight: '900', lineHeight: 26 },
  previewPhoto: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  previewPhotoText: { color: '#475569', fontSize: 11, fontWeight: '800' },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#1E1E2E',
    fontSize: 14,
    paddingHorizontal: 12,
  },
  memoInput: { minHeight: 130, paddingTop: 12, paddingBottom: 12 },
  memberList: { gap: 8 },
  checkRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxSelected: { backgroundColor: '#5B7FFF', borderColor: '#5B7FFF' },
  checkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  memberText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  saveButton: { minHeight: 54, borderRadius: 12, backgroundColor: '#5B7FFF', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
