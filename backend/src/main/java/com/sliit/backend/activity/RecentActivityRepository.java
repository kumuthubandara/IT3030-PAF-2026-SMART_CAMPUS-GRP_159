package com.sliit.backend.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecentActivityRepository extends JpaRepository<RecentActivity, Long> {

    Page<RecentActivity> findByRelatedUserEmailIgnoreCaseOrderByCreatedAtDesc(String relatedUserEmail, Pageable pageable);

    Page<RecentActivity> findByTechnicianRelevantTrueOrderByCreatedAtDesc(Pageable pageable);
}
