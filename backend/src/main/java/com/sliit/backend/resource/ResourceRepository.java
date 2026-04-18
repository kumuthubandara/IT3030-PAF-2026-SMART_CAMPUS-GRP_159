package com.sliit.backend.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByStatusContainingIgnoreCase(String status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    boolean existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
            String type, String hallNumber, String building, String floor, String block);

    boolean existsByTypeIgnoreCaseAndHallNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
            String type, String hallNumber, String building, String floor, String block, String id);

    boolean existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
            String type, String meetingRoomNumber, String building, String floor, String block);

    boolean existsByTypeIgnoreCaseAndMeetingRoomNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
            String type, String meetingRoomNumber, String building, String floor, String block, String id);

    boolean existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCase(
            String type, String workspaceNumber, String building, String floor, String block);

    boolean existsByTypeIgnoreCaseAndWorkspaceNumberIgnoreCaseAndBuildingIgnoreCaseAndFloorIgnoreCaseAndBlockIgnoreCaseAndIdNot(
            String type, String workspaceNumber, String building, String floor, String block, String id);

    boolean existsByTypeIgnoreCaseAndEquipmentNameIgnoreCaseAndIdNot(String type, String equipmentName, String id);

    boolean existsByTypeIgnoreCaseAndEquipmentNameIgnoreCase(String type, String equipmentName);
}
