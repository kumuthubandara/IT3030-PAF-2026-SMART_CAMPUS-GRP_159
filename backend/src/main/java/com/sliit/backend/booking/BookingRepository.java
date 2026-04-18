package com.sliit.backend.booking;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByRequesterEmailIgnoreCaseOrderByStartDateTimeDesc(String requesterEmail);

    List<Booking> findByResourceIdAndStatusIn(String resourceId, Collection<BookingStatus> statuses);
}
