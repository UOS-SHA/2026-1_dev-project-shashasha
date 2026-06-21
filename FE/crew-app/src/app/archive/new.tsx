import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const members = ['나', '민지', '서연', '지훈', '예은', '하늘'];

export default function ArchiveNewScreen() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['나']);

  const toggleMember = (member: string) => {
    setAttendees((current) =>
      current.includes(member) ? current.filter((name) => name !== member) : [...current, member]
    );
  };

  const saveRecord = () => {
    if (!title.trim() || !summary.trim()) {
      Alert.alert('기록을 확인해주세요', '모임 제목과 활동 내용을 입력해주세요.');
      return;
    }
    Alert.alert('기록이 저장되었어요', '현재는 하드코딩 화면이라 목록 데이터에는 반영되지 않아요.', [
      { text: '확인', onPress: () => router.replace('../') },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor="#171821" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>활동 기록 작성</ThemedText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.label}>사진</ThemedText>
          <View style={styles.photoRow}>
            <Pressable style={styles.addPhoto} onPress={() => Alert.alert('사진 추가', '사진 선택 기능은 API 연동 단계에서 연결할 예정이에요.')}>
              <SymbolView name="plus" size={24} tintColor="#5B7FFF" />
              <ThemedText style={styles.addPhotoText}>추가</ThemedText>
            </Pressable>
            <View style={[styles.previewPhoto, { backgroundColor: '#DDE6FF' }]}>
              <ThemedText style={styles.previewPhotoText}>사진 1</ThemedText>
            </View>
            <View style={[styles.previewPhoto, { backgroundColor: '#FDE7A9' }]}>
              <ThemedText style={styles.previewPhotoText}>사진 2</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>모임 제목</ThemedText>
          <TextInput value={title} onChangeText={setTitle} placeholder="예: 4회차 서비스 기획 회의" placeholderTextColor="#A0A6B3" style={styles.input} />
          <ThemedText style={styles.label}>활동 내용</ThemedText>
          <TextInput value={summary} onChangeText={setSummary} placeholder="오늘 모임에서 어떤 이야기를 나눴나요?" placeholderTextColor="#A0A6B3" style={[styles.input, styles.summaryInput]} multiline textAlignVertical="top" />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>참석자</ThemedText>
          <ThemedText style={styles.helper}>참석한 멤버를 선택해주세요.</ThemedText>
          <View style={styles.memberGrid}>
            {members.map((member) => {
              const selected = attendees.includes(member);
              return (
                <Pressable key={member} style={[styles.memberChip, selected && styles.memberChipSelected]} onPress={() => toggleMember(member)}>
                  <View style={[styles.memberAvatar, selected && styles.memberAvatarSelected]}>
                    <ThemedText style={[styles.memberInitial, selected && styles.memberInitialSelected]}>{member[0]}</ThemedText>
                  </View>
                  <ThemedText style={[styles.memberText, selected && styles.memberTextSelected]}>{member}</ThemedText>
                  {selected && <SymbolView name="checkmark" size={14} tintColor="#5B7FFF" />}
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
  header: { height: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E7EAF1' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  headerTitle: { color: '#171821', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7EAF1', gap: 10 },
  label: { color: '#202633', fontSize: 15, fontWeight: '800' },
  helper: { color: '#788091', fontSize: 13, lineHeight: 19, marginTop: -4 },
  photoRow: { flexDirection: 'row', gap: 10 },
  addPhoto: { width: 76, height: 76, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#9EAEED', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F8FF', gap: 3 },
  addPhotoText: { color: '#5B7FFF', fontSize: 11, fontWeight: '800' },
  previewPhoto: { width: 76, height: 76, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewPhotoText: { color: '#5A6170', fontSize: 11, fontWeight: '800' },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#DDE1EA', color: '#202633', fontSize: 14, paddingHorizontal: 13, backgroundColor: '#FBFCFE' },
  summaryInput: { minHeight: 126, paddingTop: 13, paddingBottom: 13 },
  memberGrid: { gap: 8 },
  memberChip: { minHeight: 48, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E5EC', flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberChipSelected: { borderColor: '#AAB9FF', backgroundColor: '#F3F5FF' },
  memberAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECEEF3' },
  memberAvatarSelected: { backgroundColor: '#DCE4FF' },
  memberInitial: { color: '#737B8B', fontSize: 12, fontWeight: '800' },
  memberInitialSelected: { color: '#4C66D8' },
  memberText: { flex: 1, color: '#505867', fontSize: 14, fontWeight: '700' },
  memberTextSelected: { color: '#334FBF' },
  saveButton: { minHeight: 54, borderRadius: 14, backgroundColor: '#5B7FFF', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.74 },
});
