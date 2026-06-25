import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { Stack } from 'expo-router';

export type ArchiveRecord = {
  id: string;
  round: number;
  date: string;
  day: string;
  place: string;
  title: string;
  summary: string;
  attendees: string[];
  absentees: string[];
  photos: number;
  color: string;
  thumbnail: string;
};

type NewArchiveRecord = {
  date: string;
  place: string;
  summary: string;
  attendees: string[];
  absentees: string[];
};

type ArchiveStoreValue = {
  records: ArchiveRecord[];
  addRecord: (record: NewArchiveRecord) => ArchiveRecord;
  updateRecord: (id: string, record: NewArchiveRecord) => void;
};

const ArchiveStoreContext = createContext<ArchiveStoreValue | null>(null);

const palette = [
  { color: '#5B7FFF', thumbnail: '#DDD6FE' },
  { color: '#A78BFA', thumbnail: '#C7D2FE' },
  { color: '#10B981', thumbnail: '#BBF7D0' },
  { color: '#F97316', thumbnail: '#FDE68A' },
];

function normalizeDate(value: string) {
  const trimmed = value.trim();
  return /^\d{4}\.\d{2}\.\d{2}$/.test(trimmed) ? trimmed : '2025.04.12';
}

function getDayLabel(dateText: string) {
  const [year, month, day] = dateText.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  const labels = ['일', '월', '화', '수', '목', '금', '토'];
  return labels[date.getDay()] ?? '토';
}

function ArchiveStoreProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);

  const value = useMemo<ArchiveStoreValue>(
    () => ({
      records,
      addRecord: (record) => {
        const nextRound = records.length + 1;
        const nextStyle = palette[(nextRound - 1) % palette.length];
        const date = normalizeDate(record.date);
        const created: ArchiveRecord = {
          id: String(Date.now()),
          round: nextRound,
          date,
          day: getDayLabel(date),
          place: record.place.trim() || '성수 카페',
          title: `${nextRound}회차 활동 기록`,
          summary: record.summary.trim(),
          attendees: record.attendees,
          absentees: record.absentees,
          photos: 2,
          color: nextStyle.color,
          thumbnail: nextStyle.thumbnail,
        };

        setRecords((current) => [created, ...current]);
        return created;
      },
      updateRecord: (id, record) => {
        const date = normalizeDate(record.date);
        setRecords((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  date,
                  day: getDayLabel(date),
                  place: record.place.trim() || item.place,
                  summary: record.summary.trim(),
                  attendees: record.attendees,
                  absentees: record.absentees,
                }
              : item
          )
        );
      },
    }),
    [records]
  );

  return <ArchiveStoreContext.Provider value={value}>{children}</ArchiveStoreContext.Provider>;
}

export function useArchiveStore() {
  const value = useContext(ArchiveStoreContext);

  if (!value) {
    throw new Error('useArchiveStore must be used inside ArchiveStoreProvider');
  }

  return value;
}

export default function ArchiveLayout() {
  return (
    <ArchiveStoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ArchiveStoreProvider>
  );
}
