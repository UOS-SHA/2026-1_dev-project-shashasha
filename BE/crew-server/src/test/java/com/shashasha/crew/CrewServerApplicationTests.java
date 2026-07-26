package com.shashasha.crew;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

/**
 * 스프링 컨텍스트가 정상적으로 뜨는지 확인하는 스모크 테스트.
 * 빈 주입이 어긋나면(생성자 인자 추가, 새 @Component 등) 여기서 먼저 걸린다.
 *
 * 실제 DB 연결이 필요하므로 Postgres 가 떠 있지 않으면 건너뛴다.
 *     docker compose up -d
 * 나머지 테스트는 DB 없이 돌아가므로, DB 를 띄우지 않아도 `gradlew test` 는 통과한다.
 * 다만 배포 전에는 DB 를 띄우고 한 번 돌려 이 테스트까지 확인하는 것이 좋다.
 */
@SpringBootTest
@EnabledIf("postgresAvailable")
class CrewServerApplicationTests {

    /** application.properties 의 기본 접속 대상(localhost:5432)이 열려 있는지 확인한다. */
    static boolean postgresAvailable() {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("localhost", 5432), 500);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    @Test
    @DisplayName("애플리케이션 컨텍스트가 뜬다 (Postgres 필요)")
    void contextLoads() {
    }
}
