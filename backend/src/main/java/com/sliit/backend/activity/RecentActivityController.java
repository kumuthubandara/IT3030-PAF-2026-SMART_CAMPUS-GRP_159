package com.sliit.backend.activity;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class RecentActivityController {

    private final RecentActivityService service;

    public RecentActivityController(RecentActivityService service) {
        this.service = service;
    }

    @GetMapping
    public List<RecentActivity> list(@RequestParam(defaultValue = "20") int limit) {
        return service.latest(limit);
    }
}
