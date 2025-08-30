// src/main/java/com/groom/MAPro/controller/HomeController.java
package com.groom.MAPro.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.groom.MAPro.dto.ApiResponse;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public ResponseEntity<ApiResponse<String>> home() {
        return ResponseEntity.ok(ApiResponse.success("MAPro API 서버가 실행중입니다.", "서버가 정상적으로 동작하고 있습니다."));
    }
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("서버 상태: 정상", "모든 시스템이 정상 작동중입니다."));
    }
}