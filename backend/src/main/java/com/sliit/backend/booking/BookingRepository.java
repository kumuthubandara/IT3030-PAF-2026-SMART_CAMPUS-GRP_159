package com.sliit.backend.booking;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByRequesterEmailIgnoreCaseOrderByCreatedAtDesc(String requesterEmail);

    List<Booking> findAllByOrderByCreatedAtDesc();
}
