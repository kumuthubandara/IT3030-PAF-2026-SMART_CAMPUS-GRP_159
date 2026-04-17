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

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource createResource(Resource resource) {
        resource.setId(null);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setAvailableFrom(updatedResource.getAvailableFrom());
        existingResource.setAvailableTo(updatedResource.getAvailableTo());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(String id) {
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