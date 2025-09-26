package com.groom.MAPro.Controller;

import com.groom.MAPro.dto.NameUpdateRequest;
import com.groom.MAPro.entity.ActivityLog;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.service.UserService;
import com.groom.MAPro.util.ActivityLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    @Autowired
    UserService userService;
    @Autowired
    private ActivityLogger activityLogger;

    // PATCH /api/users/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<User> updateUserName(@PathVariable Long id, @RequestBody NameUpdateRequest request) throws IOException {
        User updatedUser = userService.updateUserName(id, request.getName());
        activityLogger.log(updatedUser.getUserId(), updatedUser.getUsername(), "UPDATE", "사용자 정보가 변경되었습니다.");
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/logs/{id}")
    public Page<ActivityLog> getLogs(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return userService.getUserLogs(userId, page, size);
    }


}
