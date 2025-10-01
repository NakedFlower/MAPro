package com.groom.MAPro.entity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "activity_logs")
@Data
public class ActivityLog {

    @Id
    private String id;

    private Long userId;
    private String username;
    private String actionType;
    private String detail;

    @Field(type = FieldType.Date, format = DateFormat.epoch_millis)
    private Instant createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public LocalDateTime getCreatedAt() {
        return createdAt != null
                ? LocalDateTime.ofInstant(createdAt, ZoneId.systemDefault())
                : null;
    }

    @Builder
    public ActivityLog(Long userId, String username, String actionType, String detail, Instant createdAt) {
        this.userId = userId;
        this.username = username;
        this.actionType = actionType;
        this.detail = detail;
        this.createdAt = createdAt;
    }
}
