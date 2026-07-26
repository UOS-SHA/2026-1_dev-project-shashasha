package com.shashasha.crew.controller;

import com.shashasha.crew.service.ScheduleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 일정 API 가 HTTP 경로에서 실제로 400 을 돌려주는지 확인한다.
 *
 * DTO 에 애너테이션을 달아도 컨트롤러에 @Valid 가 빠져 있으면 아무 효과가 없다.
 * 그 연결이 살아 있는지는 요청을 실제로 보내 봐야 알 수 있어서 이 층을 따로 둔다.
 */
@WebMvcTest(ScheduleController.class)
class ScheduleControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ScheduleService scheduleService;

    private static final String INVALID_SCHEDULE = """
            {
              "t": "잘못된 일정",
              "tp": "fixed",
              "days": [0, 8],
              "sh": 25,
              "sm": 90,
              "eh": 10,
              "em": -30
            }
            """;

    @Test
    @DisplayName("범위를 벗어난 일정 생성 요청은 400 이고 서비스까지 가지 않는다")
    void createSchedule_rejectsOutOfRangeValues() throws Exception {
        mockMvc.perform(post("/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(INVALID_SCHEDULE))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));

        verify(scheduleService, never()).create(any(), any());
    }

    @Test
    @DisplayName("잘못된 일정 유형도 400 이다")
    void createSchedule_rejectsInvalidType() throws Exception {
        String body = """
                {"t":"알바","tp":"hacked","days":[0],"sh":10,"sm":0,"eh":12,"em":0}
                """;

        mockMvc.perform(post("/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verify(scheduleService, never()).create(any(), any());
    }

    @Test
    @DisplayName("요일을 하나도 고르지 않으면 400 이다")
    void createSchedule_rejectsEmptyDays() throws Exception {
        String body = """
                {"t":"알바","tp":"fixed","days":[],"sh":10,"sm":0,"eh":12,"em":0}
                """;

        mockMvc.perform(post("/schedules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
