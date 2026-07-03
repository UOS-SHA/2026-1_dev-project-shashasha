package com.shashasha.crew.service;

import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * 후보 시간대 코드("sat-18")를 사람이 읽는 라벨로 바꾸는 헬퍼.
 * 확정 라벨은 "가장 가까운 그 요일의 실제 날짜"로 만들어, 모임 카드의 날짜 표기 형식을 통일한다.
 *   예) "sat-18" → "7월 5일 토 · 오후 6:00"
 */
public final class SlotLabel {

    private SlotLabel() {}

    /** "sat-18" → "sat" */
    public static String engOf(String code) {
        int dash = code.indexOf('-');
        return dash > 0 ? code.substring(0, dash) : "";
    }

    /** "sat-18" → 18 (파싱 실패 시 -1) */
    public static int hourOf(String code) {
        try {
            return Integer.parseInt(code.substring(code.indexOf('-') + 1));
        } catch (Exception e) {
            return -1;
        }
    }

    /** 영문 요일 코드 → 자바 DayOfWeek (월~일) */
    public static DayOfWeek dayOfWeekOf(String eng) {
        return switch (eng) {
            case "mon" -> DayOfWeek.MONDAY;
            case "tue" -> DayOfWeek.TUESDAY;
            case "wed" -> DayOfWeek.WEDNESDAY;
            case "thu" -> DayOfWeek.THURSDAY;
            case "fri" -> DayOfWeek.FRIDAY;
            case "sat" -> DayOfWeek.SATURDAY;
            case "sun" -> DayOfWeek.SUNDAY;
            default -> null;
        };
    }

    /** 영문 요일 코드 → 한글 한 글자 (월~일) */
    public static String dayKor(String eng) {
        return switch (eng) {
            case "mon" -> "월";
            case "tue" -> "화";
            case "wed" -> "수";
            case "thu" -> "목";
            case "fri" -> "금";
            case "sat" -> "토";
            case "sun" -> "일";
            default -> "";
        };
    }

    /** 시작 시각(시) → "오전 10:00" / "오후 2:00" */
    public static String timeLabel(int hour) {
        if (hour < 12) {
            return "오전 " + hour + ":00";
        }
        if (hour == 12) {
            return "오후 12:00";
        }
        return "오후 " + (hour - 12) + ":00";
    }

    /**
     * 확정 라벨: 오늘 이후 가장 가까운 해당 요일의 실제 날짜로 만든다.
     *   예) 오늘이 7월 4일 금이고 코드가 "sat-18" → "7월 5일 토 · 오후 6:00"
     */
    public static String dateLabel(String code, LocalDate today) {
        String eng = engOf(code);
        int hour = hourOf(code);
        DayOfWeek target = dayOfWeekOf(eng);
        if (target == null || hour < 0) {
            return timeLabel(hour); // 방어적 폴백
        }
        LocalDate date = today;
        while (date.getDayOfWeek() != target) {
            date = date.plusDays(1);
        }
        return String.format("%d월 %d일 %s · %s",
                date.getMonthValue(), date.getDayOfMonth(), dayKor(eng), timeLabel(hour));
    }
}
