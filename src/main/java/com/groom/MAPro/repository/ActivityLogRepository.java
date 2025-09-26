package com.groom.MAPro.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.groom.MAPro.entity.ActivityLog;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ActivityLogRepository extends ElasticsearchRepository<ActivityLog, String> {
    Page<ActivityLog> findByUsername(String username, Pageable pageable);
    Page<ActivityLog> findByUserId(Long userId, Pageable pageable);

}
