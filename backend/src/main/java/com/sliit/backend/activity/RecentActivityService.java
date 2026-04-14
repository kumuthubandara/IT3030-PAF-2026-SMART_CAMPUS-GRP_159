package com.sliit.backend.activity;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecentActivityService {

    private final RecentActivityRepository repository;

    public RecentActivityService(RecentActivityRepository repository) {
        this.repository = repository;
    }

    public RecentActivity add(String category, String message) {
        RecentActivity activity = new RecentActivity();
        activity.setCategory(category);
        activity.setMessage(message);
        return repository.save(activity);
    }

    public List<RecentActivity> latest(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return repository.findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
    }
}
