package com.groom.MAPro.util;

import com.groom.MAPro.entity.ActivityLog;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.repository.ActivityLogRepository;

import java.time.LocalDateTime;

public class ActivityLogger {
    private static ActivityLogRepository activityLogRepository;

    // Spring Bean 초기화 시 호출
    public static void init(ActivityLogRepository repository) {
        activityLogRepository = repository;
    }

    public static void log(User user, String actionType, String detail) {
        if (activityLogRepository == null) {
            throw new IllegalStateException("ActivityLogRepository is not initialized");
        }

        ActivityLog log = new ActivityLog(
                user.getUserId(),
                user.getUsername(),
                actionType,
                detail,
                LocalDateTime.now()
        );

        activityLogRepository.save(log);
    }
}
