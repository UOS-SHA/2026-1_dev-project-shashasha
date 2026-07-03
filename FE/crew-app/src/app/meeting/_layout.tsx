import { Stack, useLocalSearchParams } from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { toApiErrorMessage } from '@/api/client';
import {
  castVote as apiCastVote,
  confirmSlot as apiConfirmSlot,
  getTimetable,
  getVoteState,
  type GoldenSlot,
} from '@/api/meetings';

// 일정 매칭 데모용 색상 토큰 (온보딩/홈과 동일한 초록 톤)
export const Mc = {
  bg: '#F3F4EE',
  card: '#FFFFFF',
  green: '#2F5D45',
  greenSoft: '#5C7E6C',
  chip: '#DCE8DF',
  chipText: '#2F5D45',
  ink: '#1F2A24',
  sub: '#8A8F8A',
  line: '#E6E7E0',
  notice: '#FBF3D9',
  noticeText: '#9C8C4A',
} as const;

export type { GoldenSlot };

type MeetingValue = {
  meetingId: number;
  loading: boolean;
  error: string | null;
  totalMembers: number;
  // 통합 시간표 그리드 (행=시간, 열=요일)
  days: string[];
  times: string[];
  availability: number[][];
  // 골든타임 후보(득표 포함)
  slots: GoldenSlot[];
  myVote: string | null;
  confirmedId: string | null;
  castVote: (slotId: string) => Promise<void>;
  confirm: (slotId: string) => Promise<void>;
};

const MeetingContext = createContext<MeetingValue | null>(null);

function MeetingProvider({ children }: PropsWithChildren) {
  // 홈에서 넘겨준 모임 id (없으면 시드된 첫 모임 1번을 기본값으로)
  const params = useLocalSearchParams<{ id?: string }>();
  const meetingId = Number(params.id) || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<number[][]>([]);
  const [slots, setSlots] = useState<GoldenSlot[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  // 화면 진입 시 통합 시간표 + 투표 현황을 함께 불러온다.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getTimetable(meetingId), getVoteState(meetingId)])
      .then(([tt, vs]) => {
        if (!active) return;
        setDays(tt.days);
        setTimes(tt.times);
        setAvailability(tt.availability);
        setTotalMembers(tt.totalMembers);
        setSlots(vs.slots);
        setMyVote(vs.myVote);
        setConfirmedId(vs.confirmedId);
      })
      .catch((err) => {
        if (active) setError(toApiErrorMessage(err, '모임 정보를 불러오지 못했어요.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [meetingId]);

  // 투표 후 서버가 돌려준 최신 상태로 갱신
  const applyVoteState = useCallback(
    (vs: { totalMembers: number; slots: GoldenSlot[]; myVote: string | null; confirmedId: string | null }) => {
      setSlots(vs.slots);
      setMyVote(vs.myVote);
      setConfirmedId(vs.confirmedId);
      setTotalMembers(vs.totalMembers);
    },
    [],
  );

  const castVote = useCallback(
    async (slotId: string) => {
      applyVoteState(await apiCastVote(meetingId, slotId));
    },
    [meetingId, applyVoteState],
  );

  const confirm = useCallback(
    async (slotId: string) => {
      applyVoteState(await apiConfirmSlot(meetingId, slotId));
    },
    [meetingId, applyVoteState],
  );

  const value = useMemo<MeetingValue>(
    () => ({
      meetingId,
      loading,
      error,
      totalMembers,
      days,
      times,
      availability,
      slots,
      myVote,
      confirmedId,
      castVote,
      confirm,
    }),
    [meetingId, loading, error, totalMembers, days, times, availability, slots, myVote, confirmedId, castVote, confirm],
  );

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
}

export function useMeeting() {
  const value = useContext(MeetingContext);

  if (!value) {
    throw new Error('useMeeting must be used inside MeetingProvider');
  }

  return value;
}

export default function MeetingLayout() {
  return (
    <MeetingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MeetingProvider>
  );
}
