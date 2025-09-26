package com.groom.MAPro.entity;

import java.time.LocalDateTime;

import com.groom.MAPro.util.LongToLocalDateTimeConverter;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.elasticsearch.annotations.Document;

@Document(indexName = "activity_logs")
@Data
public class ActivityLog {

    @Id
    private String id;

    private Long userId;
    private String username;
    private String actionType;
    private String detail;

    @Convert(converter = LongToLocalDateTimeConverter.class)
    private LocalDateTime createdAt;

    @Builder
    public ActivityLog(Long userId, String username, String actionType, String detail, LocalDateTime createdAt) {
        this.userId = userId;
        this.username = username;
        this.actionType = actionType;
        this.detail = detail;
        this.createdAt = createdAt;
    }
}
