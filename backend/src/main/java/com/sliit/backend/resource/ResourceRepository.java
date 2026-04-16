package com.sliit.backend.resource;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByStatusContainingIgnoreCase(String status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}