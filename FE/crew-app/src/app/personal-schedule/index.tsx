import { useEffect, useRef, useState } from 'react';
import {
  Animated,        // 애니메이션 API
  Modal,           // 팝업/바텀시트 오버레이용
  PanResponder,    // 드래그 제스처
  Platform,        // iOS/Android 분기용
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

// ===== 타입 정의 =====

// 일정 하나를 표현하는 타입
type Schedule = {
  t: string;                 // 제목
  tp: 'fixed' | 'variable'; // 고정(매주 반복) | 변동(특정 날짜)
  days: number[];            // 요일 배열: 0=월, 1=화, ..., 6=일
  sh: number; sm: number;    // 시작 시각 (시, 분)
  eh: number; em: number;    // 종료 시각 (시, 분)
};

// 팝업에 전달할 상태 타입
// null이면 팝업 닫힘, 값이 있으면 해당 이벤트의 팝업 열림
type PopupState = { ev: Schedule; idx: number } | null;

// ===== 상수 =====

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9~21시
const ROW_HEIGHT = 54;   // 시간 행 높이 (1시간 = 54px)
const TIME_COL_W = 42;   // 왼쪽 시간 레이블 열 너비
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

// 색상 상수
const COLOR_FIXED = '#3a6ff5';       // 고정 일정 강조색 (파란색)
const COLOR_VAR = '#e07830';         // 변동 일정 강조색 (오렌지색)
const COLOR_BG = '#eaedf7';          // 화면 배경
const COLOR_FIXED_BLOCK = '#cddeff'; // 고정 블록 배경
const COLOR_VAR_BLOCK = '#ffd8a8';   // 변동 블록 배경
const COLOR_INPUT_BG = '#eceef8';    // 입력 필드 배경
const COLOR_BORDER = '#cdd0e0';      // 기본 테두리

// ===== 초기 샘플 데이터 (2개) =====
// useState로 관리하므로 추가/수정/삭제가 실시간으로 반영됨
const INITIAL_EVENTS: Schedule[] = [
  { t: '알바', tp: 'fixed',    days: [0], sh: 9,  sm: 0, eh: 12, em: 0 }, // 월요일 고정
  { t: '팀플', tp: 'variable', days: [4], sh: 15, sm: 0, eh: 17, em: 0 }, // 금요일 변동
];

// ===== 헬퍼 함수 =====

// 숫자 → 2자리 문자열 (예: 9 → "09")
const pad = (n: number): string => n.toString().padStart(2, '0');

// Date 객체 → "HH:MM" 문자열
const formatTime = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// 주 오프셋에 해당하는 월~일 Date 배열 반환
function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
  const toMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + toMonday + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// 주어진 날짜가 오늘인지 확인
function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// "5월 5일 — 11일" 형태의 주간 라벨 생성
function getWeekLabel(dates: Date[]): string {
  const s = dates[0];
  const e = dates[6];
  return `${s.getMonth() + 1}월 ${s.getDate()}일 — ${e.getDate()}일`;
}

// ===== 메인 컴포넌트 =====
export default function PersonalScheduleScreen() {

  // ─── 캘린더 상태 ───
  // const 대신 useState로 관리 → 추가/수정/삭제 시 화면 자동 갱신
  const [events, setEvents] = useState<Schedule[]>(INITIAL_EVENTS);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // ─── 팝업 상태 ───
  // null이면 팝업 숨김
  const [popupState, setPopupState] = useState<PopupState>(null);

  // ─── 바텀시트 상태 ───
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  // null = 추가 모드 / 숫자 = 해당 인덱스 이벤트 수정 모드
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  // Animated.Value: 바텀시트 Y 이동값
  //   600 → 화면 아래 숨김 상태 (초기값)
  //   0   → 화면에 완전히 보이는 상태
  // useRef().current를 렌더 중 접근하면 React Compiler가 오류를 발생시킴 →
  // useState 지연 초기화(() => ...)로 대체: 첫 렌더에만 Animated.Value 생성
  const [sheetAnim] = useState(() => new Animated.Value(600));

  // ─── 바텀시트 폼 상태 ───
  const [formType, setFormType] = useState<'fixed' | 'variable'>('fixed');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<Date>(new Date());
  const [formEndTime, setFormEndTime] = useState<Date>(new Date());
  const [formDays, setFormDays] = useState<number[]>([]);
  // 네이티브 시간 선택기 표시 여부
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  // ─── 그리드 스크롤 ref ───
  const gridScrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);

  // 주 이동 시 스크롤 위치 복원
  useEffect(() => {
    gridScrollRef.current?.scrollTo({ y: scrollYRef.current, animated: false });
  }, [weekOffset]);

  // ─── 바텀시트 드래그 PanResponder ───
  // useState lazy 초기화로 생성 → 렌더 중 ref.current 접근 금지(React Compiler) 우회
  // sheetAnim·setSheetVisible은 안정된 참조라 stale closure 문제 없음
  const [sheetPanHandlers] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) sheetAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 300) {
          setShowStartPicker(false);
          setShowEndPicker(false);
          Animated.timing(sheetAnim, {
            toValue: 600,
            duration: 280,
            useNativeDriver: true,
          }).start(() => setSheetVisible(false));
        } else {
          Animated.spring(sheetAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    }).panHandlers
  );

  // ─── 계산된 값 ───
  const weekDates = getWeekDates(weekOffset);
  // weekOffset이 0이면 오늘이 포함된 주 → 변동 일정 표시
  // 다른 주로 이동하면 변동 일정 숨김 (고정 일정만 표시)
  const isCurrentWeek = weekOffset === 0;
  // 폼 유형에 따른 강조색 (버튼, 저장 버튼 등에 사용)
  const accentColor = formType === 'fixed' ? COLOR_FIXED : COLOR_VAR;

  // ===== 핸들러 함수 =====

  // ─── 바텀시트 열기 (추가 모드) ───
  const openAddSheet = () => {
    setEditingIdx(null);
    setFormType('fixed');
    setFormTitle('');
    setFormDays([]);
    setShowStartPicker(false);
    setShowEndPicker(false);
    // 현재 시각 기준 정각으로 시작/종료 시간 초기화 (09:00~21:00 범위 보정)
    const now = new Date();
    now.setMinutes(0, 0, 0);
    if (now.getHours() < 9) now.setHours(9, 0, 0, 0);
    else if (now.getHours() >= 21) now.setHours(20, 0, 0, 0);
    const later = new Date(now);
    later.setHours(now.getHours() + 1);
    if (later.getHours() > 21) later.setHours(21, 0, 0, 0);
    setFormStartTime(now);
    setFormEndTime(later);
    // 애니메이션 초기 위치로 리셋 후 모달 표시
    sheetAnim.setValue(600);
    setSheetVisible(true);
    // spring: 살짝 탄성있는 슬라이드 업 애니메이션
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  // ─── 바텀시트 열기 (수정 모드) ───
  const openEditSheet = (idx: number) => {
    setPopupState(null); // 팝업이 열려 있으면 먼저 닫기
    const ev = events[idx];
    setEditingIdx(idx);
    setFormType(ev.tp);
    setFormTitle(ev.t);
    setFormDays([...ev.days]);
    setShowStartPicker(false);
    setShowEndPicker(false);
    // 이벤트의 시/분 데이터를 Date 객체로 변환해서 DateTimePicker에 전달
    const startDate = new Date();
    startDate.setHours(ev.sh, ev.sm, 0, 0);
    const endDate = new Date();
    endDate.setHours(ev.eh, ev.em, 0, 0);
    setFormStartTime(startDate);
    setFormEndTime(endDate);
    sheetAnim.setValue(600);
    setSheetVisible(true);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  // ─── 바텀시트 닫기 ───
  // timing: 일정한 속도로 아래로 내려가는 슬라이드 아웃 애니메이션
  const closeSheet = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
    Animated.timing(sheetAnim, {
      toValue: 600,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      // 애니메이션 완료 후 모달 숨김 (beforehand 숨기면 깜빡임 발생)
      setSheetVisible(false);
    });
  };

  // ─── 저장 핸들러 ───
  const handleSave = () => {
    const sh = formStartTime.getHours();
    const sm = formStartTime.getMinutes();
    const eh = formEndTime.getHours();
    const em = formEndTime.getMinutes();
    const title = formTitle.trim() || '일정'; // 빈 제목 방지
    // 요일 미선택 시 월요일(0) 기본값
    const days = formDays.length > 0 ? formDays : [0];

    if (editingIdx !== null) {
      // 수정 모드: 단일 요일 1개만 저장
      const day = formDays.length > 0 ? formDays[0] : 0;
      setEvents(prev => {
        const copy = [...prev];
        copy[editingIdx] = { t: title, tp: formType, days: [day], sh, sm, eh, em };
        return copy;
      });
    } else {
      // 추가 모드: 선택된 요일마다 독립적인 이벤트 생성
      setEvents(prev => [
        ...prev,
        ...days.map(day => ({ t: title, tp: formType, days: [day], sh, sm, eh, em })),
      ]);
    }
    closeSheet();
  };

  // ─── 삭제 핸들러 ───
  const handleDelete = () => {
    if (editingIdx !== null) {
      // filter: 해당 인덱스를 제외한 새 배열 반환
      setEvents(prev => prev.filter((_, i) => i !== editingIdx));
      closeSheet();
    }
  };

  // ─── 요일 버튼 토글 ───
  // 수정 모드: 단일 선택만 허용 / 추가 모드: 다중 토글
  const toggleDay = (dayIndex: number) => {
    if (editingIdx !== null) {
      setFormDays([dayIndex]);
    } else {
      setFormDays(prev =>
        prev.includes(dayIndex)
          ? prev.filter(d => d !== dayIndex)
          : [...prev, dayIndex],
      );
    }
  };

  // ─── 시간 09:00~21:00 범위 보정 ───
  const clampTime = (date: Date): Date => {
    const total = date.getHours() * 60 + date.getMinutes();
    if (total < 9 * 60) {
      const d = new Date(date); d.setHours(9, 0, 0, 0); return d;
    }
    if (total > 21 * 60) {
      const d = new Date(date); d.setHours(21, 0, 0, 0); return d;
    }
    return date;
  };

  // 시작 시간이 종료 시간 이상이면 종료를 시작+1h (최대 21:00)로 보정
  const adjustEndTime = (start: Date, end: Date): Date => {
    const s = start.getHours() * 60 + start.getMinutes();
    const e = end.getHours() * 60 + end.getMinutes();
    if (s >= e) {
      const corrected = new Date(start);
      corrected.setHours(start.getHours() + 1, start.getMinutes(), 0, 0);
      return clampTime(corrected);
    }
    return end;
  };

  // ─── DateTimePicker 변경 콜백 ───
  // Android: 피커가 다이얼로그 형태라 선택 후 자동으로 사라짐 → 상태 false 처리
  // iOS: 스피너가 계속 보임 → 별도로 숨기지 않음 (다른 버튼 누르면 교체됨)
  const onStartTimeChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (date) {
      const clamped = clampTime(date);
      setFormStartTime(clamped);
      setFormEndTime(prev => adjustEndTime(clamped, prev));
    }
  };

  const onEndTimeChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (date) {
      const clamped = clampTime(date);
      setFormEndTime(adjustEndTime(formStartTime, clamped));
    }
  };

  // ===== JSX 렌더링 =====
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ===== 상단 헤더 ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 일정</Text>
        <View style={styles.weekNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setWeekOffset(prev => prev - 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.weekLabel}>{getWeekLabel(weekDates)}</Text>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setWeekOffset(prev => prev + 1)}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== 요일 헤더 ===== */}
      {/* 클릭 기능 없음 — 오늘 날짜만 파란 원으로 강조 */}
      <View style={styles.dayHeader}>
        <View style={{ width: TIME_COL_W }} />
        {weekDates.map((date, i) => {
          const today = isToday(date);
          const isWeekend = i >= 5;
          return (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={[
                styles.dayName,
                isWeekend && styles.dayNameWeekend,
                today && styles.dayNameToday,
              ]}>
                {DAYS[i]}
              </Text>
              {/* 고정 크기 박스로 오늘(원)/일반(숫자) 높이 동일하게 유지 */}
              <View style={styles.dayNumberBox}>
                {today ? (
                  <View style={styles.todayCircle}>
                    <Text style={styles.todayNumber}>{date.getDate()}</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.dayNumber,
                    isWeekend && styles.dayNumberWeekend,
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* ===== 범례 ===== */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLOR_FIXED }]} />
          <Text style={styles.legendText}>고정 일정</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLOR_VAR }]} />
          <Text style={styles.legendText}>변동 일정</Text>
        </View>
      </View>

      {/* ===== 그리드 + FAB ===== */}
      <View style={styles.gridWrapper}>
        <ScrollView
          ref={gridScrollRef}
          style={styles.gridScroll}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => { scrollYRef.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={100}
        >
          <View style={styles.gridContainer}>

            {/* 왼쪽 시간 레이블 열 */}
            <View style={styles.timeCol}>
              {HOURS.map(h => (
                <View key={h} style={styles.timeCell}>
                  <Text style={styles.timeText}>{pad(h)}:00</Text>
                </View>
              ))}
            </View>

            {/* 요일 열들 (7개 고정) */}
            {DAY_INDICES.map(dayIdx => (
              <View key={dayIdx} style={styles.dayCol}>
                {/* 배경 셀: 시간 구분선 역할 */}
                {HOURS.map(h => (
                  <View key={h} style={styles.gridCell} />
                ))}

                {/* 이 요일에 해당하는 일정 블록들
                    변동 일정(variable)은 현재 주(isCurrentWeek)일 때만 표시 */}
                {events
                  .map((ev, idx) => ({ ev, idx })) // 원본 인덱스를 함께 전달
                  .filter(({ ev }) =>
                    ev.days.includes(dayIdx) &&
                    (ev.tp === 'fixed' || isCurrentWeek),
                  )
                  .map(({ ev, idx }) => {
                    const isFixed = ev.tp === 'fixed';
                    // 블록 위치: (시작시각 - 9시) * 행높이 + 분 비율
                    const topPx = (ev.sh - 9) * ROW_HEIGHT + (ev.sm / 60) * ROW_HEIGHT;
                    // 블록 높이: 총 분 / 60 * 행높이 (최소 20px)
                    const heightPx = Math.max(
                      ((ev.eh - ev.sh) * 60 + (ev.em - ev.sm)) / 60 * ROW_HEIGHT,
                      20,
                    );
                    return (
                      // 짧게 탭 → 팝업 / 길게 누르기(500ms) → 수정 바텀시트
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.eventBlock,
                          {
                            top: topPx,
                            height: heightPx,
                            backgroundColor: isFixed ? COLOR_FIXED_BLOCK : COLOR_VAR_BLOCK,
                            borderLeftColor: isFixed ? COLOR_FIXED : COLOR_VAR,
                          },
                        ]}
                        onPress={() => setPopupState({ ev, idx })}
                        onLongPress={() => openEditSheet(idx)}
                        delayLongPress={500}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[styles.eventText, { color: isFixed ? '#1a40b0' : '#8a3e08' }]}
                          numberOfLines={2}
                        >
                          {ev.t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* FAB: 바텀시트 열기 (더 이상 페이지 이동 없음) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openAddSheet}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ===== 일정 요약 팝업 Modal ===== */}
      {/* 일정 블록 짧게 탭 시 표시되는 말풍선 카드 */}
      <Modal
        visible={popupState !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPopupState(null)}
      >
        {/* 배경 전체 탭 시 팝업 닫기 */}
        <TouchableOpacity
          style={styles.popupOverlay}
          onPress={() => setPopupState(null)}
          activeOpacity={1}
        >
          {/* 카드 내부 탭은 팝업 닫히지 않게 이벤트 차단 */}
          <View style={styles.popupCard} onStartShouldSetResponder={() => true}>
            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={styles.popupCloseBtn}
              onPress={() => setPopupState(null)}
            >
              <Text style={styles.popupCloseText}>✕</Text>
            </TouchableOpacity>

            {/* 일정 제목 */}
            <Text style={styles.popupTitle}>{popupState?.ev.t ?? ''}</Text>

            {/* 요일 + 시간 */}
            <Text style={styles.popupTime}>
              {popupState
                ? `${popupState.ev.days.map(d => DAYS[d]).join(', ')}요일  ${pad(popupState.ev.sh)}:${pad(popupState.ev.sm)} ~ ${pad(popupState.ev.eh)}:${pad(popupState.ev.em)}`
                : ''}
            </Text>

            {/* 고정/변동 뱃지 */}
            <View style={[
              styles.popupBadge,
              { backgroundColor: popupState?.ev.tp === 'fixed' ? COLOR_FIXED : COLOR_VAR },
            ]}>
              <Text style={styles.popupBadgeText}>
                {popupState?.ev.tp === 'fixed' ? '🔁 고정 일정' : '📌 변동 일정'}
              </Text>
            </View>

            <Text style={styles.popupHint}>길게 누르면 수정할 수 있어요</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== 바텀시트 Modal ===== */}
      {/* + 버튼 → 추가 / 일정 길게 누르기 → 수정 */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"   // 자체 Animated로 처리하므로 none
        onRequestClose={closeSheet}
      >
        {/* 반투명 오버레이: 탭 시 시트 닫기 */}
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, styles.sheetOverlay]}
          onPress={closeSheet}
          activeOpacity={1}
        />

        {/* 바텀시트 본체: translateY 애니메이션으로 슬라이드 */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          {/* 드래그 핸들: 이 영역에서만 스와이프 다운으로 닫기 가능 */}
          <View style={styles.dragHandleArea} {...sheetPanHandlers}>
            <View style={styles.dragHandle} />
          </View>
          <Text style={styles.sheetTitle}>
            {editingIdx !== null ? '일정 수정' : '새 일정 추가'}
          </Text>

          {/* keyboardShouldPersistTaps: 키보드 열린 상태에서도 버튼 탭 가능 */}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ① 일정 유형 선택 */}
            <Text style={styles.formLabel}>일정 유형</Text>
            <View style={styles.typeRow}>
              {/* 고정 일정 버튼: 선택 시 파란 배경 */}
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  formType === 'fixed'
                    ? { backgroundColor: COLOR_FIXED, borderColor: COLOR_FIXED }
                    : styles.typeBtnInactive,
                ]}
                onPress={() => setFormType('fixed')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.typeBtnText,
                  formType === 'fixed' ? styles.typeBtnTextOn : styles.typeBtnTextOff,
                ]}>
                  🔁 고정 일정
                </Text>
              </TouchableOpacity>

              {/* 변동 일정 버튼: 선택 시 오렌지 배경 */}
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  formType === 'variable'
                    ? { backgroundColor: COLOR_VAR, borderColor: COLOR_VAR }
                    : styles.typeBtnInactive,
                ]}
                onPress={() => setFormType('variable')}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.typeBtnText,
                  formType === 'variable' ? styles.typeBtnTextOn : styles.typeBtnTextOff,
                ]}>
                  📌 변동 일정
                </Text>
              </TouchableOpacity>
            </View>

            {/* ② 일정 제목 */}
            <Text style={styles.formLabel}>일정 제목</Text>
            <TextInput
              style={styles.formInput}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="예: 수업, 알바, 운동..."
              placeholderTextColor="#aaa"
            />

            {/* ③ 시작/종료 시간 (DateTimePicker 사용) */}
            <Text style={styles.formLabel}>시간</Text>
            <View style={styles.timePickerRow}>
              {/* 시작 시간 버튼: 누르면 네이티브 시간 선택 UI 표시 */}
              <TouchableOpacity
                style={[
                  styles.timePickerBtn,
                  showStartPicker && { borderColor: accentColor },
                ]}
                onPress={() => {
                  setShowStartPicker(prev => !prev);
                  setShowEndPicker(false); // 끝 시간 피커는 닫기
                }}
              >
                <Text style={styles.timePickerLabel}>시작</Text>
                <Text style={styles.timePickerValue}>{formatTime(formStartTime)}</Text>
              </TouchableOpacity>

              <Text style={styles.timeSep}>~</Text>

              {/* 종료 시간 버튼 */}
              <TouchableOpacity
                style={[
                  styles.timePickerBtn,
                  showEndPicker && { borderColor: accentColor },
                ]}
                onPress={() => {
                  setShowEndPicker(prev => !prev);
                  setShowStartPicker(false);
                }}
              >
                <Text style={styles.timePickerLabel}>종료</Text>
                <Text style={styles.timePickerValue}>{formatTime(formEndTime)}</Text>
              </TouchableOpacity>
            </View>

            {/* 시작 시간 선택기: 버튼 눌렀을 때만 표시 */}
            {showStartPicker && (
              <DateTimePicker
                value={formStartTime}
                mode="time"
                is24Hour
                // iOS: spinner(스크롤 휠), Android: default(다이얼로그)
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartTimeChange}
              />
            )}

            {/* 종료 시간 선택기 */}
            {showEndPicker && (
              <DateTimePicker
                value={formEndTime}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndTimeChange}
              />
            )}

            {/* ④ 요일 선택 */}
            <Text style={styles.formLabel}>
              {formType === 'fixed' ? '반복 요일' : '날짜 선택'}
              {'  '}
              <Text style={styles.formLabelHint}>
                {editingIdx !== null ? '(1개만 선택)' : '(다중 선택 가능)'}
              </Text>
            </Text>
            <View style={styles.daysRow}>
              {DAYS.map((day, i) => {
                const isSelected = formDays.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayBtn,
                      isSelected
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : styles.dayBtnInactive,
                    ]}
                    onPress={() => toggleDay(i)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.dayBtnText,
                      isSelected ? styles.dayBtnTextOn : styles.dayBtnTextOff,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ⑤ 저장 버튼 */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>저장하기</Text>
            </TouchableOpacity>

            {/* ⑥ 삭제 버튼 — 수정 모드에서만 표시 */}
            {editingIdx !== null && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteBtnText}>삭제</Text>
              </TouchableOpacity>
            )}

            {/* 하단 여백 (홈바/키보드 고려) */}
            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      </Modal>

    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: COLOR_BG },

  // ─── 상단 헤더 ───
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#dde0ee',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1d2e' },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBtn: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 1.5,
    borderColor: '#dde0ee', backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnText: { fontSize: 18, color: '#111', fontWeight: '700', lineHeight: 22 },
  weekLabel: { fontSize: 11, color: '#555', fontWeight: '500' },

  // ─── 요일 헤더 ───
  dayHeader: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#dde0ee',
  },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingTop: 6, height: 52 },
  dayName: { fontSize: 10, fontWeight: '600', color: '#aaa' },
  dayNameWeekend: { color: '#ccc' },
  dayNameToday: { color: COLOR_FIXED },
  // 고정 크기 박스 — 오늘(원 22px) / 일반(숫자 Text) 높이를 동일하게 맞춤
  dayNumberBox: {
    width: 22, height: 22,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  dayNumber: { fontSize: 12, fontWeight: '600', color: '#444' },
  dayNumberWeekend: { color: '#ccc' },
  todayCircle: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLOR_FIXED,
    alignItems: 'center', justifyContent: 'center',
  },
  todayNumber: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // ─── 범례 ───
  legend: {
    flexDirection: 'row', gap: 14, alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: '#dde0ee',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 10, fontWeight: '600', color: '#444' },
  // ─── 그리드 ───
  gridWrapper: { flex: 1 },
  gridScroll: { flex: 1, backgroundColor: COLOR_BG },
  gridContainer: { flexDirection: 'row' },
  timeCol: {
    width: TIME_COL_W, backgroundColor: '#e4e7f4',
    borderRightWidth: 1.5, borderRightColor: '#c8cce0',
  },
  timeCell: {
    height: ROW_HEIGHT, justifyContent: 'flex-start',
    paddingTop: 3, paddingRight: 5,
    borderBottomWidth: 1, borderBottomColor: '#c8cce0',
  },
  timeText: { fontSize: 10, fontWeight: '600', color: '#888', textAlign: 'right' },
  dayCol: { flex: 1 },
  gridCell: {
    height: ROW_HEIGHT, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eef0f8',
    borderLeftWidth: 1, borderLeftColor: '#dde0f0',
  },
  eventBlock: {
    position: 'absolute', left: 2, right: 2,
    borderRadius: 5, borderLeftWidth: 3, padding: 3,
    overflow: 'hidden', zIndex: 2,
  },
  eventText: { fontSize: 10, fontWeight: '700' },

  // ─── FAB ───
  fab: {
    position: 'absolute', bottom: 20, right: 16,
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLOR_FIXED,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2a55d0', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 8, zIndex: 10,
  },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: '300', lineHeight: 32 },

  // ─── 팝업 카드 ───
  popupOverlay: {
    flex: 1, backgroundColor: 'rgba(10,15,40,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  popupCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, width: 240, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 10,
  },
  popupCloseBtn: { position: 'absolute', top: 10, right: 12, padding: 4 },
  popupCloseText: { fontSize: 14, color: '#aaa' },
  popupTitle: { fontSize: 16, fontWeight: '700', color: '#1a1d2e', marginTop: 4 },
  popupTime: { fontSize: 12, color: '#666' },
  popupBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  popupBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  popupHint: { fontSize: 10, color: '#bbb', marginTop: 2 },

  // ─── 바텀시트 ───
  sheetOverlay: { backgroundColor: 'rgba(10,15,40,0.42)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingBottom: 10,
    maxHeight: '88%',
  },
  dragHandleArea: {
    alignItems: 'center', paddingTop: 10, paddingBottom: 10,
  },
  dragHandle: {
    width: 36, height: 4, backgroundColor: '#d0d4e4', borderRadius: 2,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a1d2e', marginBottom: 10 },

  // ─── 폼 공통 ───
  formLabel: { fontSize: 11, fontWeight: '700', color: '#333', marginBottom: 6, marginTop: 12 },
  formLabelHint: { fontSize: 10, fontWeight: '400', color: '#bbb' },
  formInput: {
    backgroundColor: COLOR_INPUT_BG, borderWidth: 1.5, borderColor: COLOR_BORDER,
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12,
    fontSize: 14, color: '#1a1d2e',
  },

  // ─── 유형 선택 버튼 ───
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  typeBtnInactive: { backgroundColor: COLOR_INPUT_BG, borderColor: COLOR_BORDER },
  typeBtnText: { fontSize: 13, fontWeight: '700' },
  typeBtnTextOn: { color: '#fff' },
  typeBtnTextOff: { color: '#444' },

  // ─── 시간 선택 ───
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePickerBtn: {
    flex: 1, backgroundColor: COLOR_INPUT_BG, borderWidth: 1.5, borderColor: COLOR_BORDER,
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center',
  },
  timePickerLabel: { fontSize: 10, color: '#888', fontWeight: '600', marginBottom: 2 },
  timePickerValue: { fontSize: 16, fontWeight: '700', color: '#1a1d2e' },
  timeSep: { fontSize: 16, color: '#888', fontWeight: '500' },

  // ─── 요일 선택 버튼 ───
  daysRow: { flexDirection: 'row', gap: 4 },
  dayBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  dayBtnInactive: { backgroundColor: COLOR_INPUT_BG, borderColor: COLOR_BORDER },
  dayBtnText: { fontSize: 11, fontWeight: '700' },
  dayBtnTextOn: { color: '#fff' },
  dayBtnTextOff: { color: '#333' },

  // ─── 저장 / 삭제 버튼 ───
  saveBtn: {
    padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  deleteBtn: {
    padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8,
    backgroundColor: '#fff0f0', borderWidth: 1.5, borderColor: '#ffcccc',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#cc2222' },
});
