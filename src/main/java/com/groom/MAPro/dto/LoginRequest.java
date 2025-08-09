package com.groom.MAPro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    @NotBlank(message = "사용자명은 필수입니다.")
    private String username;  // email -> username으로 변경

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    // 생성자
    public LoginRequest() {}

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getter와 Setter
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}