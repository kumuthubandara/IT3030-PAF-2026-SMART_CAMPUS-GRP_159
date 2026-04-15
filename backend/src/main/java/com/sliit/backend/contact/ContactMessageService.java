package com.sliit.backend.contact;

import com.sliit.backend.activity.RecentActivityService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository repository;
    private final RecentActivityService activityService;

    public ContactMessageService(ContactMessageRepository repository, RecentActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    public ContactMessage save(ContactMessageRequest request) {
        ContactMessage entity = new ContactMessage();
        entity.setName(request.getName().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setSubject(request.getSubject().trim());
        entity.setMessage(request.getMessage().trim());
        entity.setStatus("NEW");
        ContactMessage saved = repository.save(entity);
        activityService.add("CONTACT_MESSAGE", "New contact message from " + saved.getName() + ": " + saved.getSubject());
        return saved;
    }

    public List<ContactMessage> findAllLatestFirst() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
