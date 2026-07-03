import { apiClient } from './client';

// 백엔드 FriendResponse 와 1:1 대응.
export type Friend = {
  id: number;         // 상대방 User.id
  name: string;       // 닉네임
  handle: string;     // @아이디
  status: string | null; // 한줄 소개(bio)
  color: string;      // 아바타 색
};

// 백엔드 FriendScheduleResponse 와 1:1 대응.
export type FriendSchedule = {
  day: string;    // 요일 라벨 ("월" ~ "일")
  title: string;
  time: string;   // "10:00 - 12:00"
  type: string;   // "고정" | "변동"
};

/** GET /friends → 내 친구 목록 */
export async function getFriends(): Promise<Friend[]> {
  const { data } = await apiClient.get<Friend[]>('/friends');
  return data;
}

/** POST /friends → @아이디로 친구 추가 */
export async function addFriend(handle: string): Promise<Friend> {
  const { data } = await apiClient.post<Friend>('/friends', { handle });
  return data;
}

/** GET /friends/{id}/schedules → 친구의 시간표 */
export async function getFriendSchedules(friendId: number): Promise<FriendSchedule[]> {
  const { data } = await apiClient.get<FriendSchedule[]>(`/friends/${friendId}/schedules`);
  return data;
}
