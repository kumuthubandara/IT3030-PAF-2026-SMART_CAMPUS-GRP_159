package com.sliit.backend.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByStatusContainingIgnoreCase(String status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
