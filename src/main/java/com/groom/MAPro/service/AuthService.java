package com.groom.MAPro.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.groom.MAPro.dto.AuthResponse;
import com.groom.MAPro.dto.LoginRequest;
import com.groom.MAPro.dto.SignUpRequest;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.util.JwtUtil;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse signUp(SignUpRequest signUpRequest) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다.");
        }
        
        // 사용자 생성
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setName(signUpRequest.getName());
        
        // 데이터베이스에 저장
        User savedUser = userRepository.save(user);
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getUserId());
        
        return new AuthResponse(token, savedUser.getUserId(), savedUser.getEmail(), savedUser.getName());
    }
    
    public AuthResponse login(LoginRequest loginRequest) {
        // 사용자 찾기
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이메일입니다."));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());
        
        return new AuthResponse(token, user.getUserId(), user.getEmail(), user.getName());
    }
    
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}