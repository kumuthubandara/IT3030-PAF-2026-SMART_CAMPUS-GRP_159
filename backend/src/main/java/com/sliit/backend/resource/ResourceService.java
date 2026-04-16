package com.sliit.backend.resource;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }

    public List<Resource> searchByType(String type) {
        return resourceRepository.findByTypeContainingIgnoreCase(type);
    }

    public List<Resource> searchByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location);
    }

    public List<Resource> searchByStatus(String status) {
        return resourceRepository.findByStatusContainingIgnoreCase(status);
    }

    public List<Resource> searchByMinimumCapacity(Integer capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }
}