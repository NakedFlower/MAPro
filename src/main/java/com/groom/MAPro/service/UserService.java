package com.groom.MAPro.service;

import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.util.ActivityLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Transactional
    public User updateUserName(Long userId, String newName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(newName);
        ActivityLogger.log(user, "UPDATE", "사용자 정보가 변경되었습니다.");

        return user;
    }
}
