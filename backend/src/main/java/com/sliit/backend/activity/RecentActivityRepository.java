package com.sliit.backend.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecentActivityRepository extends MongoRepository<RecentActivity, Long> {

    Page<RecentActivity> findByRelatedUserEmailIgnoreCaseOrderByCreatedAtDesc(String relatedUserEmail, Pageable pageable);

    Page<RecentActivity> findByTechnicianRelevantTrueOrderByCreatedAtDesc(Pageable pageable);
}
