package com.sliit.backend.activity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
@CrossOrigin(origins = "*")
public class RecentActivityController {

    private final RecentActivityService service;

    public RecentActivityController(RecentActivityService service) {
        this.service = service;
    }

    /**
     * @param email  signed-in user email (for student / lecturer scoped feeds)
     * @param role   student | lecturer | technician | admin — controls filtering
     */
    @GetMapping
    public List<RecentActivity> list(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            return service.latestForViewer(limit, role, email);
        }
        return service.latest(limit);
    }
}
