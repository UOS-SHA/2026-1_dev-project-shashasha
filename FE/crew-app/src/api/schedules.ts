import { apiClient } from './client';

// 백엔드 ScheduleResponse 와 1:1 대응. (FE personal-schedule 의 Schedule 과 필드명 동일)
export type ScheduleType = 'fixed' | 'variable';

export type Schedule = {
  id: number;
  t: string;                 // 제목
  tp: ScheduleType;          // 고정 | 변동
  days: number[];            // 0=월 ... 6=일
  sh: number; sm: number;    // 시작 시각
  eh: number; em: number;    // 종료 시각
};

// POST/PUT /schedules 요청 body (백엔드 ScheduleRequest 와 대응). id 는 서버가 매긴다.
export type SchedulePayload = Omit<Schedule, 'id'>;

/** GET /schedules → 내 일정 전체 */
export async function getSchedules(): Promise<Schedule[]> {
  const { data } = await apiClient.get<Schedule[]>('/schedules');
  return data;
}

/** POST /schedules → 일정 생성 */
export async function createSchedule(payload: SchedulePayload): Promise<Schedule> {
  const { data } = await apiClient.post<Schedule>('/schedules', payload);
  return data;
}

/** PUT /schedules/{id} → 일정 수정 */
export async function updateSchedule(id: number, payload: SchedulePayload): Promise<Schedule> {
  const { data } = await apiClient.put<Schedule>(`/schedules/${id}`, payload);
  return data;
}

/** DELETE /schedules/{id} → 일정 삭제 */
export async function deleteSchedule(id: number): Promise<void> {
  await apiClient.delete(`/schedules/${id}`);
}
