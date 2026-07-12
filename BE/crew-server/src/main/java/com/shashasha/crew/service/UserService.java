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

    /** 토큰에서 꺼낸 userId 의 프로필(닉네임/아이디/한줄소개)을 수정하고, 갱신된 프로필을 돌려준다. */
    @Transactional
    public UserProfileResponse updateMyProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "사용자를 찾을 수 없습니다"));
        user.updateProfile(request.nickname(), request.handle(), request.bio());
        return UserProfileResponse.from(user);
    }
}
