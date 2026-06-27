import { Stack } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

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

export const TOTAL_MEMBERS = 6;

export type GoldenSlot = {
  id: string;
  day: string;
  time: string;
  available: number;
  votes: number;
};

// 3.2.2 골든타임: 멤버 일정이 가장 많이 겹치는 Top 3 슬롯 (데모 고정값)
const initialSlots: GoldenSlot[] = [
  { id: 'sat-14', day: '6월 13일 토', time: '오후 2:00', available: 6, votes: 3 },
  { id: 'sat-16', day: '6월 13일 토', time: '오후 4:00', available: 5, votes: 2 },
  { id: 'sun-11', day: '6월 14일 일', time: '오전 11:00', available: 5, votes: 1 },
];

type MeetingValue = {
  slots: GoldenSlot[];
  myVote: string | null;
  castVote: (slotId: string) => void;
  confirmedId: string | null;
  confirm: (slotId: string) => void;
};

const MeetingContext = createContext<MeetingValue | null>(null);

function MeetingProvider({ children }: PropsWithChildren) {
  const [slots, setSlots] = useState<GoldenSlot[]>(initialSlots);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const value = useMemo<MeetingValue>(
    () => ({
      slots,
      myVote,
      castVote: (slotId) => {
        setSlots((current) =>
          current.map((slot) => {
            // 이전 투표는 회수하고 새로 고른 슬롯에 +1
            let votes = slot.votes;
            if (slot.id === myVote) votes -= 1;
            if (slot.id === slotId) votes += 1;
            return { ...slot, votes };
          })
        );
        setMyVote(slotId);
      },
      confirmedId,
      confirm: (slotId) => setConfirmedId(slotId),
    }),
    [slots, myVote, confirmedId]
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
