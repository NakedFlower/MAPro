package com.groom.MAPro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignUpRequest {
    @Email(message = "VALID001") // ErrorCode 참조
    @NotBlank(message = "VALID004")
    private String username;

    @NotBlank(message = "VALID004")
    @Size(min = 6, max = 20, message = "VALID002")
    private String password;

    @NotBlank(message = "VALID004")
    @Size(min = 2, max = 50, message = "VALID003")
    private String name;

    // 생성자
    public SignUpRequest() {}

    public SignUpRequest(String username, String password, String name) {
        this.username = username;
        this.password = password;
        this.name = name;
    }

    // Getter와 Setter
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}