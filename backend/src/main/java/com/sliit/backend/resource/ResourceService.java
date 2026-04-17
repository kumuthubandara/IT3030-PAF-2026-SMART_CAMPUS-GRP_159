package com.sliit.backend.resource;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

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
        validateUniqueResource(resource, null);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setBuilding(updatedResource.getBuilding());
        existingResource.setFloor(updatedResource.getFloor());
        existingResource.setBlock(updatedResource.getBlock());
        existingResource.setHallNumber(updatedResource.getHallNumber());
        existingResource.setMeetingRoomNumber(updatedResource.getMeetingRoomNumber());
        existingResource.setWorkspaceNumber(updatedResource.getWorkspaceNumber());
        existingResource.setEquipmentName(updatedResource.getEquipmentName());
        existingResource.setAudience(updatedResource.getAudience());
        existingResource.setStatus(updatedResource.getStatus());
        existingResource.setAvailableFrom(updatedResource.getAvailableFrom());
        existingResource.setAvailableTo(updatedResource.getAvailableTo());
        existingResource.setImageUrl(updatedResource.getImageUrl());

        validateUniqueResource(existingResource, id);
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

    private void validateUniqueResource(Resource resource, String currentId) {
        String type = normalize(resource.getType());
        if (type.isEmpty()) return;

        if ("lecture hall".equals(type)) {
            String hallNumber = requirePositiveNumber(resource.getHallNumber(), "Hall number is required.");
            String building = locationKey(resource.getBuilding());
            String floor = locationKey(resource.getFloor());
            String block = locationKey(resource.getBlock());
            boolean exists = currentId == null
                    ? resourceRepository
                            .existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
                                    "Lecture Hall", hallNumber, building, floor, block)
                    : resourceRepository
                            .existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
                                    "Lecture Hall", hallNumber, building, floor, block, currentId);
            if (exists) {
                throw new IllegalArgumentException("This lecture hall already exists at this building, floor, and block");
            }
            return;
        }

        if ("computer lab".equals(type)) {
            String hallNumber = requirePositiveNumber(resource.getHallNumber(), "Lab number is required.");
            String building = locationKey(resource.getBuilding());
            String floor = locationKey(resource.getFloor());
            String block = locationKey(resource.getBlock());
            boolean exists = currentId == null
                    ? resourceRepository
                            .existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
                                    "Computer Lab", hallNumber, building, floor, block)
                    : resourceRepository
                            .existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
                                    "Computer Lab", hallNumber, building, floor, block, currentId);
            if (exists) {
                throw new IllegalArgumentException("This computer lab already exists at this building, floor, and block");
            }
            return;
        }

        if ("meeting room".equals(type)) {
            String roomNumber = requirePositiveNumber(resource.getMeetingRoomNumber(), "Meeting Room Number is required.");
            String building = locationKey(resource.getBuilding());
            String floor = locationKey(resource.getFloor());
            String block = locationKey(resource.getBlock());
            boolean exists = currentId == null
                    ? resourceRepository
                            .existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
                                    "Meeting Room", roomNumber, building, floor, block)
                    : resourceRepository
                            .existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
                                    "Meeting Room", roomNumber, building, floor, block, currentId);
            if (exists) {
                throw new IllegalArgumentException("This meeting room already exists at this building, floor, and block");
            }
            return;
        }

        if ("library workspace".equals(type)) {
            String workspaceNumber = requirePositiveNumber(resource.getWorkspaceNumber(), "Workspace Number is required.");
            String building = locationKey(resource.getBuilding());
            String floor = locationKey(resource.getFloor());
            String block = locationKey(resource.getBlock());
            boolean exists = currentId == null
                    ? resourceRepository
                            .existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
                                    "Library Workspace", workspaceNumber, building, floor, block)
                    : resourceRepository
                            .existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
                                    "Library Workspace", workspaceNumber, building, floor, block, currentId);
            if (exists) {
                throw new IllegalArgumentException("This workspace already exists at this building, floor, and block");
            }
            return;
        }

        if ("equipment".equals(type) || "equipments".equals(type)) {
            String equipmentName = requireNonBlank(resource.getEquipmentName(), "Equipment Name is required.");
            boolean exists = currentId == null
                    ? resourceRepository.existsByTypeIgnoreCaseAndEquipmentNameIgnoreCase("Equipment", equipmentName)
                    || resourceRepository.existsByTypeIgnoreCaseAndEquipmentNameIgnoreCase("Equipments", equipmentName)
                    : resourceRepository.existsByTypeIgnoreCaseAndEquipmentNameIgnoreCaseAndIdNot("Equipment", equipmentName, currentId)
                    || resourceRepository.existsByTypeIgnoreCaseAndEquipmentNameIgnoreCaseAndIdNot("Equipments", equipmentName, currentId);
            if (exists) {
                throw new IllegalArgumentException("This equipment already exists");
            }
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    /** Trimmed location part for composite uniqueness (null → empty string). */
    private static String locationKey(String value) {
        return value == null ? "" : value.trim();
    }

    private String requireNonBlank(String value, String message) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String requirePositiveNumber(String value, String message) {
        String normalized = requireNonBlank(value, message);
        try {
            int parsed = Integer.parseInt(normalized);
            if (parsed < 1) throw new NumberFormatException();
            return String.valueOf(parsed);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(message);
        }
    }
}