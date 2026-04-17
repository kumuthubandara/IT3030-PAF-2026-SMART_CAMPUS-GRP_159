package com.sliit.backend.resource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

/**
 * Seeds demo resources when the MongoDB {@code resources} collection is empty.
 */
@Component
public class ResourceSampleDataLoader implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    public ResourceSampleDataLoader(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public void run(String... args) {
        if (resourceRepository.count() > 0) {
            return;
        }

        Resource r1 = new Resource();
        r1.setName("Computer Lab 1");
        r1.setType("LAB");
        r1.setCapacity(40);
        r1.setLocation("Main Building — Floor 3");
        r1.setStatus("AVAILABLE");
        r1.setAvailableFrom(LocalTime.of(8, 0));
        r1.setAvailableTo(LocalTime.of(18, 0));

        Resource r2 = new Resource();
        r2.setName("Seminar Room B");
        r2.setType("ROOM");
        r2.setCapacity(25);
        r2.setLocation("New Building — Floor 5");
        r2.setStatus("AVAILABLE");
        r2.setAvailableFrom(LocalTime.of(9, 0));
        r2.setAvailableTo(LocalTime.of(17, 0));

        Resource r3 = new Resource();
        r3.setName("Engineering Lab");
        r3.setType("LAB");
        r3.setCapacity(30);
        r3.setLocation("Main Building — Floor 4");
        r3.setStatus("IN_USE");
        r3.setAvailableFrom(LocalTime.of(10, 0));
        r3.setAvailableTo(LocalTime.of(16, 0));

        resourceRepository.save(r1);
        resourceRepository.save(r2);
        resourceRepository.save(r3);
    }
}
