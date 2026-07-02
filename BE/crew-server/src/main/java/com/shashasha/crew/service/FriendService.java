package com.shashasha.crew.service;

import com.shashasha.crew.domain.Friend;
import com.shashasha.crew.domain.Schedule;
import com.shashasha.crew.domain.ScheduleType;
import com.shashasha.crew.domain.User;
import com.shashasha.crew.dto.FriendResponse;
import com.shashasha.crew.dto.FriendScheduleResponse;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.FriendRepository;
import com.shashasha.crew.repository.ScheduleRepository;
import com.shashasha.crew.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 친구 관련 비즈니스 로직.
 *  - 친구 목록 조회
 *  - @아이디로 친구 추가
 *  - 친구의 시간표 조회 (친구인 경우에만 허용)
 */
@Service
public class FriendService {

    /** FE 와 동일한 아바타 색 팔레트. 목록 순서대로 돌려가며 배정한다. */
    private static final String[] FRIEND_COLORS = {"#5B7FFF", "#F97316", "#10B981", "#F43F5E", "#0EA5E9"};
    private static final String[] DAY_LABELS = {"월", "화", "수", "목", "금", "토", "일"};

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;

    public FriendService(FriendRepository friendRepository, UserRepository userRepository,
                         ScheduleRepository scheduleRepository) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
    }

    /** 내 친구 목록 (아바타 색은 순서대로 배정) */
    @Transactional(readOnly = true)
    public List<FriendResponse> findMine(Long ownerId) {
        List<Friend> friends = friendRepository.findByOwnerId(ownerId);
        List<FriendResponse> result = new ArrayList<>();
        int i = 0;
        for (Friend friend : friends) {
            // 상대 사용자가 (탈퇴 등으로) 없으면 목록에서 조용히 건너뛴다.
            User user = userRepository.findById(friend.getFriendUserId()).orElse(null);
            if (user == null) {
                continue;
            }
            result.add(FriendResponse.from(user, FRIEND_COLORS[i % FRIEND_COLORS.length]));
            i++;
        }
        return result;
    }

    /** @아이디(handle)로 친구 추가 */
    @Transactional
    public FriendResponse add(Long ownerId, String handle) {
        User target = userRepository.findByHandle(handle.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "해당 아이디의 사용자를 찾을 수 없습니다"));

        if (target.getId().equals(ownerId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CANNOT_ADD_SELF",
                    "자기 자신은 친구로 추가할 수 없습니다");
        }
        if (friendRepository.existsByOwnerIdAndFriendUserId(ownerId, target.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "FRIEND_DUPLICATED",
                    "이미 추가된 친구입니다");
        }

        friendRepository.save(new Friend(ownerId, target.getId()));
        // 새로 추가된 친구의 색은 기존 친구 수 다음 순번으로.
        int index = friendRepository.findByOwnerId(ownerId).size() - 1;
        return FriendResponse.from(target, FRIEND_COLORS[Math.max(index, 0) % FRIEND_COLORS.length]);
    }

    /** 친구의 시간표 조회. 친구가 아니면 403 으로 막는다. */
    @Transactional(readOnly = true)
    public List<FriendScheduleResponse> findFriendSchedules(Long ownerId, Long friendUserId) {
        if (!friendRepository.existsByOwnerIdAndFriendUserId(ownerId, friendUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_FRIEND",
                    "친구로 추가된 사용자의 시간표만 볼 수 있습니다");
        }

        List<FriendScheduleResponse> result = new ArrayList<>();
        for (Schedule s : scheduleRepository.findByUserId(friendUserId)) {
            String time = timeLabel(s);
            String type = s.getType() == ScheduleType.FIXED ? "고정" : "변동";
            // 여러 요일에 걸친 일정은 요일마다 한 항목으로 펼친다.
            for (int day : s.getDays()) {
                if (day < 0 || day >= DAY_LABELS.length) {
                    continue;
                }
                result.add(new FriendScheduleResponse(DAY_LABELS[day], s.getTitle(), time, type));
            }
        }
        return result;
    }

    /** 시작/종료 시각을 "10:00 - 12:00" 형식으로 만든다. */
    private String timeLabel(Schedule s) {
        return String.format("%02d:%02d - %02d:%02d",
                s.getStartHour(), s.getStartMinute(), s.getEndHour(), s.getEndMinute());
    }
}
