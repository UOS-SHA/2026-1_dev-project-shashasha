package com.shashasha.crew.service;

import com.shashasha.crew.domain.User;
import com.shashasha.crew.dto.UserProfileResponse;
import com.shashasha.crew.dto.UserUpdateRequest;
import com.shashasha.crew.exception.ApiException;
import com.shashasha.crew.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 본인 정보 조회 등 "내 데이터" 로직.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** 토큰에서 꺼낸 userId 로 내 프로필을 조회한다. */
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다"));
        return UserProfileResponse.from(user);
    }

    /**
     * 토큰에서 꺼낸 userId 의 프로필(닉네임/아이디/한줄소개)을 수정하고, 갱신된 프로필을 돌려준다.
     *
     * @아이디는 친구 추가의 검색 키라서 중복을 허용하면 안 된다. 형식은 DTO 의 @Pattern 이 막고,
     * "이미 다른 사람이 쓰는 값인지"는 여기서 확인해 409 로 돌려준다.
     */
    @Transactional
    public UserProfileResponse updateMyProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다"));

        String handle = User.normalizeHandle(request.handle());
        // 내가 이미 쓰던 값을 그대로 저장하는 경우는 중복이 아니다.
        if (handle != null && !handle.equals(user.getHandle()) && userRepository.existsByHandle(handle)) {
            throw new ApiException(HttpStatus.CONFLICT, "HANDLE_DUPLICATED",
                    "이미 사용 중인 아이디입니다");
        }

        user.updateProfile(request.nickname(), handle, request.bio());
        return UserProfileResponse.from(user);
    }
}
