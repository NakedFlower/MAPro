package com.groom.MAPro.Service;

import com.groom.MAPro.dto.AuthResponse;
import com.groom.MAPro.dto.LoginRequest;
import com.groom.MAPro.dto.SignUpRequest;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthServiceTest {
    @Autowired
    AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void 회원가입_성공() {
        // given
        SignUpRequest request = new SignUpRequest("testuser", "password123", "홍길동");

        // when
        AuthResponse response = authService.signUp(request);

        // then
        assertNotNull(response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("홍길동", response.getName());

        // DB에도 저장되었는지 확인
        User saved = userRepository.findByUsername("testuser").orElseThrow();
        assertTrue(saved.getPassword().startsWith("$2a$")); // BCrypt 해싱 여부
    }

    @Test
    void 회원가입_아이디중복체크() {
        // given
        userRepository.save(new User("testuser", "testuser", "encodedPw", "홍길동"));
        SignUpRequest request = new SignUpRequest("testuser", "password123", "아무개");

        // when & then
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.signUp(request));
        assertEquals("이미 사용중인 사용자명입니다.", ex.getMessage());
    }

    @Test
    void 로그인_성공() {
        // given: 회원가입 먼저
        SignUpRequest request = new SignUpRequest("testuser", "password123", "홍길동");
        authService.signUp(request);

        // when
        LoginRequest loginRequest = new LoginRequest("testuser", "password123");
        AuthResponse response = authService.login(loginRequest);

        // then
        assertNotNull(response.getToken());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void 로그인_비밀번호틀렸어() {
        // given
        SignUpRequest request = new SignUpRequest("testuser", "password123", "홍길동");
        authService.signUp(request);

        // when & then
        LoginRequest loginRequest = new LoginRequest("testuser", "wrongPw");
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("비밀번호가 일치하지 않습니다.", ex.getMessage());
    }

    @Test
    void 로그인_아이디존재안해요() {
        // when & then
        LoginRequest loginRequest = new LoginRequest("nouser", "password123");
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("존재하지 않는 사용자명입니다.", ex.getMessage());
    }

    @Test
    void 아이디찾기_성공() {
        // given
        authService.signUp(new SignUpRequest("testuser", "password123", "홍길동"));

        // when
        User user = authService.findByUsername("testuser");

        // then
        assertEquals("testuser", user.getUsername());
        assertEquals("홍길동", user.getName());
    }

    @Test
    void 아이디찾기_찾기실패() {
        // when & then
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.findByUsername("nouser"));
        assertEquals("사용자를 찾을 수 없습니다.", ex.getMessage());
    }
}
