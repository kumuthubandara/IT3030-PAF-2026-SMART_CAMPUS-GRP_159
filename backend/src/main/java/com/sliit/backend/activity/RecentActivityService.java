package com.sliit.backend.activity;

import com.sliit.backend.mongo.MongoSequenceService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecentActivityService {

    private static final String SEQ_RECENT = "recent_activities";

    private final RecentActivityRepository repository;
    private final MongoSequenceService sequenceService;

    public RecentActivityService(RecentActivityRepository repository, MongoSequenceService sequenceService) {
        this.repository = repository;
        this.sequenceService = sequenceService;
    }

    public RecentActivity add(String category, String message) {
        RecentActivity activity = new RecentActivity();
        activity.setId(sequenceService.next(SEQ_RECENT));
        activity.setCategory(category);
        activity.setMessage(message);
        activity.onCreateDefaults();
        return repository.save(activity);
    }

    public List<RecentActivity> latest(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return repository.findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
    }
}
