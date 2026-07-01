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
}
