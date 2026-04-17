package com.sliit.backend.resource;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalTime;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private String type;

    private Integer capacity;

    private String location;

    private String building;

    private String floor;

    private String block;

    @Field("hall_number")
    private String hallNumber;

    @Field("meeting_room_number")
    private String meetingRoomNumber;

    @Field("workspace_number")
    private String workspaceNumber;

    @Field("equipment_name")
    private String equipmentName;

    private String audience;

    private String status;

    @Field("available_from")
    private LocalTime availableFrom;

    @Field("available_to")
    private LocalTime availableTo;

    /** Optional HTTPS URL shown on QR check-in verification (room/venue photo). */
    @Field("image_url")
    private String imageUrl;

    public Resource() {
    }

    public Resource(
            String id,
            String name,
            String type,
            Integer capacity,
            String location,
            String building,
            String floor,
            String block,
            String hallNumber,
            String meetingRoomNumber,
            String workspaceNumber,
            String equipmentName,
            String audience,
            String status,
            LocalTime availableFrom,
            LocalTime availableTo) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.building = building;
        this.floor = floor;
        this.block = block;
        this.hallNumber = hallNumber;
        this.meetingRoomNumber = meetingRoomNumber;
        this.workspaceNumber = workspaceNumber;
        this.equipmentName = equipmentName;
        this.audience = audience;
        this.status = status;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getHallNumber() {
        return hallNumber;
    }

    public void setHallNumber(String hallNumber) {
        this.hallNumber = hallNumber;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getMeetingRoomNumber() {
        return meetingRoomNumber;
    }

    public void setMeetingRoomNumber(String meetingRoomNumber) {
        this.meetingRoomNumber = meetingRoomNumber;
    }

    public String getWorkspaceNumber() {
        return workspaceNumber;
    }

    public void setWorkspaceNumber(String workspaceNumber) {
        this.workspaceNumber = workspaceNumber;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
