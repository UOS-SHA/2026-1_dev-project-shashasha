import { apiClient } from './client';

// 백엔드 MeetingResponse 와 1:1 대응.
export type MeetingStatus = 'confirmed' | 'voting';

export type Meeting = {
  id: number;
  name: string;
  emoji: string;
  members: number;
  nextLabel: string;
  status: MeetingStatus;
};

// POST/PUT /meetings 요청 body (백엔드 MeetingCreateRequest 와 대응).
export type MeetingPayload = {
  name: string;
  emoji?: string;
  members: number;
  nextLabel?: string;
  status: MeetingStatus;
};

/** GET /meetings → 내 모임 목록 */
export async function getMeetings(): Promise<Meeting[]> {
  const { data } = await apiClient.get<Meeting[]>('/meetings');
  return data;
}

/** GET /meetings/{id} → 모임 단건 */
export async function getMeeting(id: number): Promise<Meeting> {
  const { data } = await apiClient.get<Meeting>(`/meetings/${id}`);
  return data;
}

/** POST /meetings → 모임 생성 */
export async function createMeeting(payload: MeetingPayload): Promise<Meeting> {
  const { data } = await apiClient.post<Meeting>('/meetings', payload);
  return data;
}

/** DELETE /meetings/{id} → 모임 삭제 */
export async function deleteMeeting(id: number): Promise<void> {
  await apiClient.delete(`/meetings/${id}`);
}

// ───────────────────────── 일정 매칭 ─────────────────────────

// 백엔드 GoldenSlotResponse 와 1:1 대응.
export type GoldenSlot = {
  id: string;
  day: string;
  time: string;
  available: number;
  votes: number;
};

// 백엔드 TimetableResponse 와 1:1 대응.
export type Timetable = {
  totalMembers: number;
  days: string[];
  times: string[];
  availability: number[][];
  golden: GoldenSlot[];
};

// 백엔드 VoteStateResponse 와 1:1 대응.
export type VoteState = {
  totalMembers: number;
  slots: GoldenSlot[];
  myVote: string | null;
  confirmedId: string | null;
  isOwner: boolean; // 내가 이 모임 방장인지 (방장만 강제 확정 가능)
};

/** GET /meetings/{id}/timetable → 통합 시간표(가능 인원 그리드 + 골든타임) */
export async function getTimetable(meetingId: number): Promise<Timetable> {
  const { data } = await apiClient.get<Timetable>(`/meetings/${meetingId}/timetable`);
  return data;
}

/** GET /meetings/{id}/vote → 투표 현황 */
export async function getVoteState(meetingId: number): Promise<VoteState> {
  const { data } = await apiClient.get<VoteState>(`/meetings/${meetingId}/vote`);
  return data;
}

/** POST /meetings/{id}/vote → 투표(또는 재투표) */
export async function castVote(meetingId: number, slotId: string): Promise<VoteState> {
  const { data } = await apiClient.post<VoteState>(`/meetings/${meetingId}/vote`, { slotId });
  return data;
}

/** POST /meetings/{id}/confirm → 시간대 확정 */
export async function confirmSlot(meetingId: number, slotId: string): Promise<VoteState> {
  const { data } = await apiClient.post<VoteState>(`/meetings/${meetingId}/confirm`, { slotId });
  return data;
}

/** GET /meetings/{id}/members → 이 모임 멤버 이름 목록 (활동 기록 참석자 선택용) */
export async function getMeetingMembers(meetingId: number): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`/meetings/${meetingId}/members`);
  return data;
}
