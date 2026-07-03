import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Stack } from 'expo-router';

import {
  createArchive,
  getArchives,
  updateArchive as apiUpdateArchive,
  type ArchivePayload,
  type ArchiveRecord,
} from '@/api/archives';

export type { ArchiveRecord };

type ArchiveStoreValue = {
  records: ArchiveRecord[];
  loading: boolean;
  addRecord: (record: ArchivePayload) => Promise<ArchiveRecord>;
  updateRecord: (id: string, record: ArchivePayload) => Promise<void>;
};

const ArchiveStoreContext = createContext<ArchiveStoreValue | null>(null);

function ArchiveStoreProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 화면 진입 시 서버에서 내 기록 전체를 불러온다. (회차/요일/색상은 서버가 계산)
  useEffect(() => {
    let active = true;
    getArchives()
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch(() => {
        // 목록 로드 실패는 조용히 넘긴다(빈 목록으로 시작).
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addRecord = useCallback(async (record: ArchivePayload) => {
    const created = await createArchive(record);
    setRecords((current) => [created, ...current]);
    return created;
  }, []);

  const updateRecord = useCallback(async (id: string, record: ArchivePayload) => {
    const updated = await apiUpdateArchive(id, record);
    setRecords((current) => current.map((item) => (item.id === id ? updated : item)));
  }, []);

  const value = useMemo<ArchiveStoreValue>(
    () => ({ records, loading, addRecord, updateRecord }),
    [records, loading, addRecord, updateRecord],
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
