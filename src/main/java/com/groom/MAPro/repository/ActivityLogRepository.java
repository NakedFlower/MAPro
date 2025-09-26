package com.groom.MAPro.repository;

import com.groom.MAPro.entity.ActivityLog;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;


public interface ActivityLogRepository extends ElasticsearchRepository<ActivityLog, String> {

}
