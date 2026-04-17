package com.sliit.backend.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByStatusContainingIgnoreCase(String status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    boolean existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndIdNot(String type, String hallNumber, String id);

    boolean existsByTypeIgnoreCaseAndHallNumberIgnoreCase(String type, String hallNumber);

    boolean existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCaseAndIdNot(String type, String meetingRoomNumber, String id);

    boolean existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCase(String type, String meetingRoomNumber);

    boolean existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCaseAndIdNot(String type, String workspaceNumber, String id);

    boolean existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCase(String type, String workspaceNumber);

    boolean existsByTypeIgnoreCaseAndEquipmentNameIgnoreCaseAndIdNot(String type, String equipmentName, String id);

    boolean existsByTypeIgnoreCaseAndEquipmentNameIgnoreCase(String type, String equipmentName);
}
