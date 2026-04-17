package com.sliit.backend.contact;

import com.sliit.backend.activity.RecentActivityService;
import com.sliit.backend.mongo.MongoSequenceService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    private static final String SEQ_CONTACT = "contact_messages";

    private final ContactMessageRepository repository;
    private final RecentActivityService activityService;
    private final MongoSequenceService sequenceService;

    public ContactMessageService(ContactMessageRepository repository,
                                 RecentActivityService activityService,
                                 MongoSequenceService sequenceService) {
        this.repository = repository;
        this.activityService = activityService;
        this.sequenceService = sequenceService;
    }

    public ContactMessage save(ContactMessageRequest request) {
        ContactMessage entity = new ContactMessage();
        entity.setId(sequenceService.next(SEQ_CONTACT));
        entity.setName(request.getName().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setSubject(request.getSubject().trim());
        entity.setMessage(request.getMessage().trim());
        entity.setStatus("NEW");
        entity.onCreateDefaults();
        ContactMessage saved = repository.save(entity);
        activityService.add("CONTACT_MESSAGE", "New contact message from " + saved.getName() + ": " + saved.getSubject());
        return saved;
    }

    public List<ContactMessage> findAllLatestFirst() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
