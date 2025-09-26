package com.groom.MAPro.service;

import com.groom.MAPro.entity.ActivityLog;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.ActivityLogRepository;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.util.ActivityLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
        return user;
    }

    @Autowired
    private ActivityLogRepository activityLogRepositoryrepository;

    public Page<ActivityLog> getUserLogs(String username, int page, int size) {
        return activityLogRepositoryrepository.findByUsername(username, PageRequest.of(page, size));
    }
}
