package com.groom.MAPro.util;

import com.groom.MAPro.repository.ActivityLogRepository;
import org.springframework.stereotype.Component;


@Component
public class ActivityLoggerInitializer {
    public ActivityLoggerInitializer(ActivityLogRepository repository) {
        ActivityLogger.init(repository);
    }
}
