package com.groom.MAPro.dto;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    // 생성자
    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getter와 Setter
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}