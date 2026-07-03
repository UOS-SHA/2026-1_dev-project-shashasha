import { apiClient } from './client';

// 백엔드 ArchiveResponse 와 1:1 대응. (FE archive 의 ArchiveRecord 와 동일 모양)
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

// POST/PUT /archives 요청 body (백엔드 ArchiveCreateRequest 와 대응).
// round/day/title/color 등은 서버가 자동으로 채운다.
export type ArchivePayload = {
  date: string;
  place: string;
  summary: string;
  attendees: string[];
  absentees: string[];
};

/** GET /archives → 내 기록 전체 (최신 회차부터) */
export async function getArchives(): Promise<ArchiveRecord[]> {
  const { data } = await apiClient.get<ArchiveRecord[]>('/archives');
  return data;
}

/** GET /archives/{id} → 기록 단건 */
export async function getArchive(id: string): Promise<ArchiveRecord> {
  const { data } = await apiClient.get<ArchiveRecord>(`/archives/${id}`);
  return data;
}

/** POST /archives → 기록 생성 */
export async function createArchive(payload: ArchivePayload): Promise<ArchiveRecord> {
  const { data } = await apiClient.post<ArchiveRecord>('/archives', payload);
  return data;
}

/** PUT /archives/{id} → 기록 수정 */
export async function updateArchive(id: string, payload: ArchivePayload): Promise<ArchiveRecord> {
  const { data } = await apiClient.put<ArchiveRecord>(`/archives/${id}`, payload);
  return data;
}

/** DELETE /archives/{id} → 기록 삭제 */
export async function deleteArchive(id: string): Promise<void> {
  await apiClient.delete(`/archives/${id}`);
}
