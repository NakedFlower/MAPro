package com.groom.MAPro.Controller;

import com.groom.MAPro.dto.NameUpdateRequest;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    UserService userService;

    // PATCH /api/users/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<User> updateUserName(@PathVariable Long id, @RequestBody NameUpdateRequest request) {
        User updatedUser = userService.updateUserName(id, request.getName());
        return ResponseEntity.ok(updatedUser);
    }

}
