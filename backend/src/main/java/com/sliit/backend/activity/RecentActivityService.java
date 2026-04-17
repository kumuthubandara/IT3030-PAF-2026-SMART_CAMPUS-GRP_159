package com.sliit.backend.activity;

import com.sliit.backend.mongo.MongoSequenceService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

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
        return add(category, message, null, false);
    }

    public RecentActivity add(String category, String message, String relatedUserEmail, boolean technicianRelevant) {
        RecentActivity activity = new RecentActivity();
        activity.setId(sequenceService.next(SEQ_RECENT));
        activity.setCategory(category);
        activity.setMessage(message);
        activity.setRelatedUserEmail(normalizeEmail(relatedUserEmail));
        activity.setTechnicianRelevant(technicianRelevant);
        activity.onCreateDefaults();
        return repository.save(activity);
    }

    public List<RecentActivity> latest(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return repository.findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
    }

    /**
     * Role-based feed: admin = all; student/lecturer = own email only; technician = equipment & contact-related rows.
     */
    public List<RecentActivity> latestForViewer(int limit, String roleRaw, String emailRaw) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        String role = roleRaw != null ? roleRaw.trim().toLowerCase(Locale.ROOT) : "";
        if ("administrator".equals(role) || "admin".equals(role)) {
            return latest(safeLimit);
        }
        if ("student".equals(role) || "lecturer".equals(role)) {
            String email = normalizeEmail(emailRaw);
            if (!StringUtils.hasText(email)) {
                return List.of();
            }
            return repository
                    .findByRelatedUserEmailIgnoreCaseOrderByCreatedAtDesc(
                            email, PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                    .getContent();
        }
        if ("technician".equals(role) || "tech".equals(role)) {
            return repository
                    .findByTechnicianRelevantTrueOrderByCreatedAtDesc(
                            PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
                    .getContent();
        }
        return List.of();
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String t = email.trim().toLowerCase(Locale.ROOT);
        return t.isEmpty() ? null : t;
    }
}
