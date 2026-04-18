package com.sliit.backend.activity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
@CrossOrigin(origins = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
        "http://localhost:5176", "http://127.0.0.1:5176",
        "http://localhost:5177", "http://127.0.0.1:5177",
        "http://localhost:5178", "http://127.0.0.1:5178"
})
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
