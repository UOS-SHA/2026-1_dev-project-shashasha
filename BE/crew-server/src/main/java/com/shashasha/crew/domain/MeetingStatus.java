package com.shashasha.crew.domain;

/**
 * 모임 상태. FE 의 status: 'confirmed' | 'voting' 와 1:1로 맞춤.
 * enum 으로 두면 오타로 잘못된 값이 저장되는 걸 막아준다.
 */
public enum MeetingStatus {
    CONFIRMED, // 확정
    VOTING     // 투표 중
}
