package com.groom.MAPro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.groom.MAPro.util.JwtUtil;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // 인증 없이 접근 가능한 경로들 (회원가입, 로그인, 헬스체크 등)
                .requestMatchers(
                    "/",
                    "/health",
                    "/api/auth/signup",
                    "/api/auth/login",
                    "/api/auth/test",
                    "/api/auth/",
                    "/api/map/**"
                    
                ).permitAll()
                
                // 로그인이 필요한 경로들 (보호되어야 하는 API들)
                .requestMatchers(
                    "/api/user/**",          // 사용자 정보 관련
                    "/api/profile/**",       // 프로필 관련
                    "/api/protected/**",      // 기타 보호된 리소스
                         "/api/user/**"
                ).authenticated()
                    .anyRequest().authenticated()
            )
                    // JWT 필터 추가 (JWT 인증을 사용한다면)
                     .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // JWT 필터 (나중에 필요할 때 주석 해제)

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

}

/*
현재 설정 설명:

✅ 인증 없이 접근 가능:
- / (홈페이지)
- /health (헬스체크)
- /api/auth/** (회원가입, 로그인 등 인증 관련)

🔒 로그인 필요:
- /api/user/** (사용자 정보)
- /api/profile/** (프로필)
- /api/protected/** (보호된 리소스)
- 기타 정의되지 않은 모든 경로

JWT 사용 시 주의사항:
1. JwtAuthenticationFilter 클래스가 있어야 함
2. JWT 토큰 검증 로직 필요
3. 위 주석 처리된 필터를 활성화해야 함
*/