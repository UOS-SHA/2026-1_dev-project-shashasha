import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ===== 타입 정의 =====
// 일정 유형: 'fixed' = 고정(매주 반복), 'variable' = 변동(특정 날짜)
// TypeScript의 유니온 타입(|): 이 두 값 중 하나만 허용
type ScheduleType = 'fixed' | 'variable';

// ===== 상수 =====
// 요일 이름 배열 (인덱스 0=월요일 ~ 6=일요일)
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 색상 상수
const COLOR_FIXED = '#3a6ff5';    // 고정 일정 강조색 (파란색)
const COLOR_VAR = '#e07830';      // 변동 일정 강조색 (오렌지색)
const COLOR_BG = '#eaedf7';       // 화면 배경색
const COLOR_INPUT_BG = '#eceef8'; // 입력 필드 배경색
const COLOR_BORDER = '#cdd0e0';   // 기본 테두리 색

// ===== 메인 컴포넌트 =====
export default function AddScheduleScreen() {
  // useRouter: Expo Router의 내비게이션 훅. back(), push() 등 사용 가능
  const router = useRouter();

  // ===== 상태 관리 =====
  // useState<타입>(초기값) 형태로 선언
  // [현재값, 값을바꾸는함수] 를 배열로 받음

  // 일정 유형 (기본값: 고정 일정)
  const [scheduleType, setScheduleType] = useState<ScheduleType>('fixed');

  // 일정 제목 입력 값
  const [title, setTitle] = useState<string>('');

  // 시작 시간 (사용자가 "09:00" 형식으로 직접 입력)
  const [startTime, setStartTime] = useState<string>('');

  // 종료 시간 (사용자가 "18:00" 형식으로 직접 입력)
  const [endTime, setEndTime] = useState<string>('');

  // 선택된 요일의 인덱스 배열 (예: [0, 2] → 월요일, 수요일)
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // 현재 선택된 유형에 따른 강조색을 하나의 변수로 관리
  const accentColor = scheduleType === 'fixed' ? COLOR_FIXED : COLOR_VAR;

  // ===== 핸들러 함수 =====

  // 일정 유형 변경 핸들러
  // 유형이 바뀌면 요일 선택도 초기화 (고정↔변동 간 선택 방식이 다르므로)
  const handleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    setSelectedDays([]); // 기존 요일 선택 초기화
  };

  // 요일 버튼 토글 핸들러
  // dayIdx: number → 0=월요일, 1=화요일, ..., 6=일요일
  const handleDayToggle = (dayIdx: number) => {
    if (scheduleType === 'fixed') {
      // 고정 일정: 여러 요일 동시 선택 가능 (다중 선택)
      setSelectedDays(prev =>
        prev.includes(dayIdx)
          ? prev.filter(d => d !== dayIdx) // 이미 선택됐으면 제거
          : [...prev, dayIdx],             // 미선택이면 추가 (스프레드로 새 배열)
      );
    } else {
      // 변동 일정: 1개만 선택 가능 (단일 선택)
      // 이미 선택된 것을 다시 누르면 선택 해제
      setSelectedDays(prev =>
        prev.includes(dayIdx) ? [] : [dayIdx],
      );
    }
  };

  // 저장 버튼 핸들러
  // 백엔드 API 연동 전까지 console.log로만 데이터 출력
  const handleSave = () => {
    // trim(): 앞뒤 공백 제거. 비어있으면 기본값 '일정' 사용
    const payload = {
      title: title.trim() || '일정',
      type: scheduleType,
      startTime,
      endTime,
      days: selectedDays,
    };

    // 나중에 이 부분을 API 호출로 교체할 예정
    console.log('[개인일정] 저장할 데이터:', payload);

    // 저장 후 이전 화면(캘린더)으로 돌아가기
    router.back();
  };

  return (
    // SafeAreaView: 노치/홈바 영역을 자동으로 피해주는 컴포넌트
    <SafeAreaView style={styles.safeArea}>

      {/*
        ScrollView: 내용이 화면보다 길어질 때 스크롤 가능하게 해줌
        keyboardShouldPersistTaps="handled": 키보드가 열려있어도 버튼 탭이 정상 동작
      */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ===== 상단 바: 뒤로가기 버튼 + 타이틀 ===== */}
        <View style={styles.topBar}>
          {/* 뒤로가기 버튼: router.back()으로 이전 화면으로 이동 */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.topTitle}>새 일정 추가</Text>

          {/* 타이틀을 정중앙에 맞추기 위한 우측 균형용 빈 공간 */}
          <View style={styles.backBtn} />
        </View>

        {/* ===== 입력 폼 카드 ===== */}
        <View style={styles.card}>

          {/* ─── 일정 유형 선택 ─── */}
          <Text style={styles.sectionLabel}>일정 유형</Text>
          <View style={styles.typeRow}>

            {/* 고정 일정 버튼: 선택 시 파란 배경, 미선택 시 회색 테두리 */}
            <TouchableOpacity
              style={[
                styles.typeBtn,
                // 조건부 스타일: scheduleType이 'fixed'이면 파란 배경
                scheduleType === 'fixed'
                  ? { backgroundColor: COLOR_FIXED, borderColor: COLOR_FIXED }
                  : styles.typeBtnInactive,
              ]}
              onPress={() => handleTypeChange('fixed')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeBtnText,
                scheduleType === 'fixed'
                  ? styles.typeBtnTextActive   // 선택됨: 흰 글씨
                  : styles.typeBtnTextInactive, // 미선택: 회색 글씨
              ]}>
                🔁 고정 일정
              </Text>
            </TouchableOpacity>

            {/* 변동 일정 버튼: 선택 시 오렌지 배경, 미선택 시 회색 테두리 */}
            <TouchableOpacity
              style={[
                styles.typeBtn,
                scheduleType === 'variable'
                  ? { backgroundColor: COLOR_VAR, borderColor: COLOR_VAR }
                  : styles.typeBtnInactive,
              ]}
              onPress={() => handleTypeChange('variable')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeBtnText,
                scheduleType === 'variable'
                  ? styles.typeBtnTextActive
                  : styles.typeBtnTextInactive,
              ]}>
                📌 변동 일정
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── 일정 제목 입력 ─── */}
          <Text style={styles.sectionLabel}>일정 제목</Text>
          {/*
            TextInput: React Native의 텍스트 입력 컴포넌트
            value + onChangeText 조합으로 "제어 컴포넌트" 패턴 사용
          */}
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle} // 입력할 때마다 title 상태 업데이트
            placeholder="예: 수업, 알바, 운동..."
            placeholderTextColor="#aaa"
          />

          {/* ─── 시작/종료 시간 입력 (좌우 배치) ─── */}
          <Text style={styles.sectionLabel}>시간</Text>
          <View style={styles.timeRow}>
            {/* 시작 시간 입력 */}
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              placeholderTextColor="#aaa"
              keyboardType="numeric" // 숫자 키패드로 열기
              maxLength={5}          // "HH:MM" = 최대 5글자
            />

            <Text style={styles.timeSep}>~</Text>

            {/* 종료 시간 입력 */}
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="18:00"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* ─── 요일 선택 ─── */}
          {/* 고정 일정이면 "반복 요일", 변동 일정이면 "날짜 선택" */}
          <View style={styles.dayLabelRow}>
            <Text style={styles.sectionLabel}>
              {scheduleType === 'fixed' ? '반복 요일' : '날짜 선택'}
            </Text>
            <Text style={styles.dayLabelHint}>
              {scheduleType === 'fixed' ? '(다중 선택 가능)' : '(이번 주만)'}
            </Text>
          </View>

          {/* 요일 버튼 7개를 가로로 배치 */}
          <View style={styles.daysRow}>
            {/*
              DAYS.map((day, i) => ...): 배열의 각 항목을 버튼으로 렌더링
              i는 인덱스(0~6), day는 요일 이름("월"~"일")
            */}
            {DAYS.map((day, i) => {
              const isSelected = selectedDays.includes(i);
              return (
                <TouchableOpacity
                  key={i} // React가 리스트 항목을 추적하기 위한 고유 키
                  style={[
                    styles.dayBtn,
                    isSelected
                      ? { backgroundColor: accentColor, borderColor: accentColor }
                      : styles.dayBtnInactive,
                  ]}
                  onPress={() => handleDayToggle(i)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.dayBtnText,
                    isSelected ? styles.dayBtnTextActive : styles.dayBtnTextInactive,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>

        {/* ===== 저장 버튼 =====
            선택한 일정 유형 색상(accentColor)을 배경으로 사용 */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>저장하기</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ===== 스타일 정의 =====
const styles = StyleSheet.create({

  // 전체 화면 (SafeAreaView)
  safeArea: {
    flex: 1,
    backgroundColor: COLOR_BG,
  },
  scroll: {
    flex: 1,
  },
  // contentContainerStyle: ScrollView 내부 콘텐츠 영역 스타일
  scrollContent: {
    padding: 16,
    gap: 16, // 직접 자식 요소들 사이의 간격
  },

  // ─── 상단 바 ───
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 뒤로가기 버튼 (우측 균형용 빈 View도 같은 스타일 공유)
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: '#1a1d2e',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1d2e',
  },

  // ─── 흰색 입력 카드 ───
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8, // 카드 내 섹션들 사이의 간격
  },

  // 각 입력 필드 위에 표시되는 레이블 텍스트
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },

  // ─── 일정 유형 선택 버튼 ───
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,          // 두 버튼이 너비를 반반 나눔
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeBtnInactive: {
    backgroundColor: COLOR_INPUT_BG,
    borderColor: COLOR_BORDER,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  typeBtnTextInactive: {
    color: '#444',
  },

  // ─── 텍스트 입력 필드 ───
  input: {
    backgroundColor: COLOR_INPUT_BG,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1a1d2e',
  },

  // ─── 시간 입력 (시작/종료 좌우 배치) ───
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,          // 두 입력 필드가 너비를 균등하게 나눔
    textAlign: 'center',
  },
  timeSep: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },

  // ─── 요일 레이블 행 ───
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dayLabelHint: {
    fontSize: 10,
    color: '#bbb',
    fontWeight: '400',
  },

  // ─── 요일 선택 버튼 행 ───
  daysRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayBtn: {
    flex: 1,          // 7개 버튼이 너비를 균등하게 나눔
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  dayBtnInactive: {
    backgroundColor: COLOR_INPUT_BG,
    borderColor: COLOR_BORDER,
  },
  dayBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayBtnTextActive: {
    color: '#fff',
  },
  dayBtnTextInactive: {
    color: '#333',
  },

  // ─── 저장 버튼 ───
  saveBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    // 그림자 (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    // 그림자 (Android)
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
