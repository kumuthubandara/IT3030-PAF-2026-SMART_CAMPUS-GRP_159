package com.sliit.backend.contact;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository repository;

    public ContactMessageService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    public ContactMessage save(ContactMessageRequest request) {
        ContactMessage entity = new ContactMessage();
        entity.setName(request.getName().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setSubject(request.getSubject().trim());
        entity.setMessage(request.getMessage().trim());
        entity.setStatus("NEW");
        return repository.save(entity);
    }

    public List<ContactMessage> findAllLatestFirst() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
