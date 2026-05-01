package com.sliit.backend.activity;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds demo rows into the JPA {@code recent_activities} table when it is empty so dashboards show
 * sample "Recent activity" until real bookings/tickets/contact events append more rows.
 * <p>Note: with the default in-memory H2 profile, this runs on every backend start (fresh DB).</p>
 */
@Component
@Order(150)
public class RecentActivitySampleDataLoader implements CommandLineRunner {

    private final RecentActivityRepository repository;

    public RecentActivitySampleDataLoader(RecentActivityRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        RecentActivity a1 = new RecentActivity();
        a1.setCategory("BOOKING");
        a1.setMessage("New booking request from student.demo@campus.edu for resource Computer Lab 1.");
        a1.setCreatedAt(now.minusMinutes(45));
        repository.save(a1);

        RecentActivity a2 = new RecentActivity();
        a2.setCategory("TICKET");
        a2.setMessage("Comment added on ticket — projector issue in Lecture Hall B.");
        a2.setCreatedAt(now.minusMinutes(25));
        repository.save(a2);

        RecentActivity a3 = new RecentActivity();
        a3.setCategory("CONTACT_MESSAGE");
        a3.setMessage("New contact message from Campus Faculty Rep: Access card renewal process.");
        a3.setCreatedAt(now.minusMinutes(10));
        repository.save(a3);
    }
}
