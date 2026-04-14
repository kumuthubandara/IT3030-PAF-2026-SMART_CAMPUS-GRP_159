package com.sliit.backend.activity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RecentActivityRepository extends JpaRepository<RecentActivity, Long> {
}
