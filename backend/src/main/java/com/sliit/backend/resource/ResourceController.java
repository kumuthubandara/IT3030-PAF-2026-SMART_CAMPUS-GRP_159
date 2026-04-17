package com.sliit.backend.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.createResource(resource));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id, @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok("Resource deleted successfully");
    }

    @GetMapping("/search/type")
    public ResponseEntity<List<Resource>> searchByType(@RequestParam String type) {
        return ResponseEntity.ok(resourceService.searchByType(type));
    }

    @GetMapping("/search/location")
    public ResponseEntity<List<Resource>> searchByLocation(@RequestParam String location) {
        return ResponseEntity.ok(resourceService.searchByLocation(location));
    }

    @GetMapping("/search/status")
    public ResponseEntity<List<Resource>> searchByStatus(@RequestParam String status) {
        return ResponseEntity.ok(resourceService.searchByStatus(status));
    }

    @GetMapping("/search/capacity")
    public ResponseEntity<List<Resource>> searchByMinimumCapacity(@RequestParam Integer capacity) {
        return ResponseEntity.ok(resourceService.searchByMinimumCapacity(capacity));
    }
}