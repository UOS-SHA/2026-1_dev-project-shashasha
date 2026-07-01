package com.shashasha.crew.service;

import com.shashasha.crew.domain.User;
import com.shashasha.crew.dto.UserProfileResponse;
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
}
