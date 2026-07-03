import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { toApiErrorMessage } from '@/api/client';
import { createMeeting } from '@/api/meetings';

// ===== 색상 상수 =====
const COLOR_BG       = '#eaedf7';
const COLOR_ACCENT   = '#5B7FFF';
const COLOR_TEXT     = '#1a2340';
const COLOR_GRAY     = '#8e95a9';
const COLOR_BORDER   = '#dde0ee';
const COLOR_INPUT_BG = '#eceef8';

// 모임 아이콘으로 고를 이모지 후보
const EMOJIS = ['📌', '📚', '🏃', '💻', '🍽️', '🎬', '⚽', '🎸'];

// ===== 메인 컴포넌트 =====
export default function NewMeetingScreen() {
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('📌');
  const [creating, setCreating] = useState<boolean>(false);

  // ─── 모임 생성 (POST /meetings) ───
  const handleCreate = async () => {
    if (creating) return;
    if (!title.trim()) {
      Alert.alert('모임 제목을 입력해주세요', '어떤 모임인지 이름을 정해주세요.');
      return;
    }
    setCreating(true);
    try {
      const created = await createMeeting({
        name: title.trim(),
        emoji,
        members: 1,
        nextLabel: '투표 진행 중',
        status: 'voting',
      });
      // 만든 모임(통합 시간표/투표 화면)으로 이동
      router.replace({ pathname: '/meeting', params: { id: String(created.id) } });
    } catch (err) {
      Alert.alert('오류', toApiErrorMessage(err, '모임을 만들지 못했어요.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== 상단 바 ===== */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>새 모임 생성</Text>
          <View style={styles.topBarRight} />
        </View>

        {/* ===== 모임 이름 ===== */}
        <Text style={styles.sectionLabel}>모임 이름</Text>
        <View style={styles.card}>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={styles.fieldInput}
              value={title}
              onChangeText={setTitle}
              placeholder="예: 수요 독서 모임, 사이드 프로젝트..."
              placeholderTextColor="#b0b8cc"
              returnKeyType="done"
              editable={!creating}
            />
          </View>
        </View>

        {/* ===== 아이콘 선택 ===== */}
        <Text style={styles.sectionLabel}>아이콘</Text>
        <View style={styles.card}>
          <View style={styles.emojiRow}>
            {EMOJIS.map((item) => {
              const selected = item === emoji;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.emojiChip, selected && styles.emojiChipOn]}
                  onPress={() => setEmoji(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ===== 안내 ===== */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            모임을 만들면 내가 방장이 되고, 멤버들과 통합 시간표에서 일정을 겹쳐 시간을 정할 수 있어요.
          </Text>
        </View>

        <View style={{ height: 16 }} />

        {/* ===== 모임 생성하기 버튼 ===== */}
        <TouchableOpacity
          style={[styles.createBtn, creating && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={creating}
          activeOpacity={0.85}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>모임 생성하기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  backBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: COLOR_TEXT, fontWeight: '300' },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: COLOR_TEXT },
  topBarRight: { width: 44 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_GRAY,
    marginBottom: 6,
    marginTop: 16,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    overflow: 'hidden',
  },

  fieldWrapper: { paddingHorizontal: 16, paddingVertical: 12 },
  fieldInput: {
    backgroundColor: COLOR_INPUT_BG,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 13,
    fontSize: 14,
    fontWeight: '500',
    color: COLOR_TEXT,
  },

  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  emojiChip: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    backgroundColor: '#f8faff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipOn: { borderColor: COLOR_ACCENT, backgroundColor: '#eef2ff' },
  emojiText: { fontSize: 22 },

  noteCard: {
    marginTop: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 14,
  },
  noteText: { color: '#3A4FC4', fontSize: 13, lineHeight: 20, fontWeight: '600' },

  createBtn: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2a55d0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
