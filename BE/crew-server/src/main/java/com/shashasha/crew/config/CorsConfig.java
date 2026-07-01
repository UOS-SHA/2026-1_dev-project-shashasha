package com.shashasha.crew.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 설정.
 * 브라우저(Expo 웹)는 보안상 "다른 주소의 서버" 호출을 기본 차단하는데,
 * 개발 중에는 모든 곳에서 호출을 허용해 둔다.
 * (네이티브 앱 호출에는 CORS 가 적용되지 않지만, 웹 테스트 편의를 위해 열어둠)
 * 운영 배포 시에는 allowedOrigins 를 실제 앱 주소로 좁히는 게 안전하다.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }
}
