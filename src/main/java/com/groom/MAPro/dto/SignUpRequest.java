package com.groom.MAPro.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignUpRequest {
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 6, max = 20, message = "비밀번호는 6~20자 사이여야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Size(min = 2, max = 50, message = "이름은 2~50자 사이여야 합니다.")
    private String name;

    // 생성자
    public SignUpRequest() {}

    public SignUpRequest(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // Getter와 Setter
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}