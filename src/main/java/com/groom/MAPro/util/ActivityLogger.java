package com.groom.MAPro.util;

import com.groom.MAPro.entity.ActivityLog;
import com.groom.MAPro.repository.ActivityLogRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ActivityLogger {
    private final ActivityLogRepository repo;

    public ActivityLogger(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public void log(Long userId, String username, String action, String s) {
        ActivityLog log = ActivityLog.builder()
                .userId(userId)
                .username(username)
                .actionType(action)
                .createdAt(LocalDateTime.parse(LocalDateTime.now().toString()))
                .detail(s)
                .build();
        repo.save(log);
    }
}
