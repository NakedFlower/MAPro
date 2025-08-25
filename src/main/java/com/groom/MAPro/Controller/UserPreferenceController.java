package com.groom.MAPro.Controller;

import com.groom.MAPro.service.UserPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/preference")
public class UserPreferenceController {

    @Autowired
    private UserPreferenceService userPreferenceService;

    /**
     * @@DOC
     * @summary 사용자의 개인 취향(선호 옵션) 저장 API
     * @description
     *  - 사용자가 체크박스로 선택한 옵션 ID 리스트를 전달받아 DB에 저장합니다.
     *  - 기존 선택값은 모두 삭제하고 새로 선택한 옵션으로 갱신합니다.
     *
     * @param userId 저장할 사용자 ID (PathVariable)
     * @param selectedOptionIds 선택한 옵션 ID 리스트 (RequestBody)
     * @response 200 OK "개인 취향이 저장되었습니다."
     * @@DOC
     */
    @PostMapping("/{userId}")
    public ResponseEntity<String> savePreferences(@PathVariable Long userId,
                                                  @RequestBody List<Long> selectedOptionIds) {
        userPreferenceService.saveUserPreferences(userId, selectedOptionIds);
        return ResponseEntity.ok("개인 취향이 저장되었습니다.");
    }


    /**
     * @@DOC
     * @summary 사용자의 개인 취향 조회 API
     * @description
     *  - 사용자가 선택한 옵션 ID 목록을 반환합니다.
     *  - 화면 로딩 시 체크박스에 기본 선택값을 표시하기 위해 사용됩니다.
     *
     * @param userId 조회할 사용자 ID (PathVariable)
     * @response 200 OK 선택된 옵션 ID 리스트
     * @@DOC
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Set<Long>> getUserPreferences(@PathVariable Long userId) {
        Set<Long> selectedOptions = userPreferenceService.getUserSelectedPreferences(userId);
        return ResponseEntity.ok(selectedOptions);
    }
}
