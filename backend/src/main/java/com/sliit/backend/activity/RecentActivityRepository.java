package com.sliit.backend.activity;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecentActivityRepository extends MongoRepository<RecentActivity, Long> {
}
