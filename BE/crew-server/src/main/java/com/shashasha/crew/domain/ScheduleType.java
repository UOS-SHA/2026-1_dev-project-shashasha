package com.shashasha.crew.domain;

/**
 * 개인 일정의 종류.
 *  - FIXED    : 고정 일정 (매주 반복. 예: 전공 수업)
 *  - VARIABLE : 변동 일정 (그때그때 다른 일정. 예: 팀플)
 *
 * FE(personal-schedule)의 tp: 'fixed' | 'variable' 와 1:1 로 대응한다.
 */
public enum ScheduleType {
    FIXED,
    VARIABLE
}
