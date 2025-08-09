package com.groom.MAPro.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;  // email -> username으로 변경
    private String name;

    // 생성자
    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String username, String name) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.name = name;
    }

    // Getter와 Setter
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}