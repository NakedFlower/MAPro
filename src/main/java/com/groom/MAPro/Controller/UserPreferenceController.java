package com.groom.MAPro.Controller;

import com.groom.MAPro.dto.ApiResponse;
import com.groom.MAPro.entity.PreferenceCategory;
import com.groom.MAPro.entity.UserPreference;
import com.groom.MAPro.repository.jpa.PreferenceCategoryRepository;
import com.groom.MAPro.repository.jpa.UserRepository;
import com.groom.MAPro.service.UserPreferenceService;
import com.groom.MAPro.util.ActivityLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.groom.MAPro.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.Option;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/pfr")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserPreferenceController {
    private final UserRepository userRepository;
    private final UserPreferenceService preferenceService;
    @Autowired
    private PreferenceCategoryRepository preferenceCategoryRepository;

    @Autowired
    ActivityLogger activityLogger;

    public UserPreferenceController(UserRepository userRepository, UserPreferenceService preferenceService) {
        this.userRepository = userRepository;
        this.preferenceService = preferenceService;
    }


    @GetMapping
    public ResponseEntity<?> getAllPreferences() {
        List<PreferenceCategory> categories = preferenceCategoryRepository.findAll(); // 카테고리 조회
        List<Map<String, Object>> result = categories.stream().map(cat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cat.getCategoryId());
            map.put("name", cat.getCategoryName());
            map.put("options", cat.getOptions().stream()
                    .map(opt -> Map.of("id", opt.getOptionId(), "name", opt.getOptionName()))
                    .toList());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }


    // 로그인한 사용자의 성향 저장
    @PostMapping("/save")
    public ResponseEntity<?> savePreferences(@AuthenticationPrincipal UserDetails userDetails,
                                             @RequestBody List<Long> optionIds) throws IOException {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        preferenceService.savePreferences(user, optionIds);

        activityLogger.log(user.getUserId(), user.getUsername(), "UPDATE", "사용자 성향이 변경되었습니다.");

        return ResponseEntity.ok(ApiResponse.success("사용자 성향이 저장되었습니다.", null));
    }

    // 로그인한 사용자의 성향 조회
    @PostMapping
    public ResponseEntity<?> getPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> optionIds = preferenceService.getUserPreferences(user).stream()
                .filter(UserPreference::getIsSelected)
                .map(pref -> pref.getOption().getOptionId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("사용자 성향 조회 성공", optionIds));
    }
}
