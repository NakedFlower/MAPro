package com.groom.MAPro.Controller;

import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.service.UserService;
import com.groom.MAPro.util.ActivityLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.groom.MAPro.dto.ApiResponse;
import com.groom.MAPro.dto.AuthResponse;
import com.groom.MAPro.dto.LoginRequest;
import com.groom.MAPro.dto.SignUpRequest;
import com.groom.MAPro.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://mapro.cloud:3000"})
public class AuthController {

    @Autowired
    private ActivityLogger activityLogger;


    @Autowired
    private AuthService authService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/")
    public ResponseEntity<ApiResponse<String>> home() {
        return ResponseEntity.ok(ApiResponse.success("MAPro API 서버가 실행중입니다.", "API 문서는 /api/auth/test를 참조하세요."));
    }
    
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        AuthResponse authResponse = authService.signUp(signUpRequest);

        return ResponseEntity.ok(ApiResponse.success("회원가입이 성공적으로 완료되었습니다.", authResponse));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        User findUser = userRepository.findById(authResponse.getUserId()).get();
        activityLogger.log(findUser.getUserId(), findUser.getUsername(), "LOGIN", "로그인했습니다.");
        return ResponseEntity.ok(ApiResponse.success("로그인이 성공적으로 완료되었습니다.", authResponse));
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        return ResponseEntity.ok(ApiResponse.success("API 서버가 정상적으로 동작중입니다.", "MAPro Backend Server"));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validateToken(@RequestHeader("Authorization") String token) {
        try {
            // "Bearer " 제거
            String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            
            // 토큰 유효성 검증
            if (authService.validateToken(jwtToken)) {
                return ResponseEntity.ok(ApiResponse.success("토큰이 유효합니다.", "Valid token"));
            } else {
                return ResponseEntity.status(401).body(ApiResponse.error("유효하지 않은 토큰입니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("토큰 검증 중 오류가 발생했습니다."));
        }
    }
}
