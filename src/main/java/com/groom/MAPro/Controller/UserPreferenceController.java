package com.groom.MAPro.Controller;

import com.groom.MAPro.dto.ApiResponse;
import com.groom.MAPro.entity.UserPreference;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.service.UserPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.groom.MAPro.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/pfr")
@CrossOrigin(origins = "http://localhost:3000")
public class UserPreferenceController {
    private final UserRepository userRepository;
    private final UserPreferenceService preferenceService;

    public UserPreferenceController(UserRepository userRepository, UserPreferenceService preferenceService) {
        this.userRepository = userRepository;
        this.preferenceService = preferenceService;
    }

    // 로그인한 사용자의 성향 저장
    @PostMapping("/save")
    public ResponseEntity<?> savePreferences(@AuthenticationPrincipal UserDetails userDetails,
                                             @RequestBody List<Long> optionIds) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        preferenceService.savePreferences(user, optionIds);
        return ResponseEntity.ok(ApiResponse.success("사용자 성향이 저장되었습니다.", null));
    }

    // 로그인한 사용자의 성향 조회
    @GetMapping
    public ResponseEntity<?> getPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var optionIds = preferenceService.getUserPreferences(user).stream()
                .filter(UserPreference::getIsSelected)
                .map(pref -> pref.getOption().getOptionId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("사용자 성향 조회 성공", optionIds));
    }
}
