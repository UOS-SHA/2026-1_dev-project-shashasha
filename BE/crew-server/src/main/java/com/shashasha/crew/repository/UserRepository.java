package com.shashasha.crew.repository;

import com.shashasha.crew.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 사용자 데이터의 DB 접근 창구.
 *
 * 메서드 "이름"만 규칙에 맞게 지으면 Spring Data JPA 가 쿼리를 자동으로 만들어준다.
 *   findByEmail   → SELECT * FROM users WHERE email = ?
 *   existsByEmail → 해당 이메일이 있으면 true (회원가입 중복 검사용)
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * 로그인·중복검사는 대소문자를 구분하지 않는다.
     * 예전에 "Kim@example.com" 으로 가입한 계정도 "kim@example.com" 으로 로그인되어야 하고,
     * 대소문자만 다른 이메일로 두 번 가입되어서도 안 된다.
     */
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** @아이디(handle)로 사용자 찾기 (친구 추가 시 사용). 인자는 normalizeHandle() 통과값이어야 한다. */
    Optional<User> findByHandle(String handle);

    boolean existsByHandle(String handle);
}
