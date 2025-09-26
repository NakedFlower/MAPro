package com.groom.MAPro.util;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import com.groom.MAPro.entity.ActivityLog;
import com.groom.MAPro.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class ActivityLogger {

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    private final ActivityLogRepository repo;
    @Autowired
    private ElasticsearchClient elasticsearchClient;

    public ActivityLogger(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public void log(Long userId, String username, String action, String message) throws IOException {
        IndexRequest request = IndexRequest.of(b -> b
                .index("activity_logs")
                .document(Map.of(
                        "userId", userId,
                        "username", username,
                        "action", action,
                        "message", message,
                        "timestamp", LocalDateTime.now().toString()
                ))
        );

        IndexResponse response = elasticsearchClient.index(request);
        // seqNo() 대신 sequenceNumber() 사용
        System.out.println("Indexed with seqNo: " + response.seqNo());
    }
}
