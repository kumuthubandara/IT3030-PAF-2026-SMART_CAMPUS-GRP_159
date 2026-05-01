package com.sliit.backend.contact;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds three demo contact messages when the {@code contact_messages} collection is empty
 * (local/demo only — does not fire notification emails like {@link ContactMessageService#save}).
 */
@Component
@Order(200)
public class ContactMessageSampleDataLoader implements CommandLineRunner {

    private final ContactMessageRepository repository;

    public ContactMessageSampleDataLoader(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        LocalDateTime base = LocalDateTime.now().minusDays(1);

        ContactMessage m1 = new ContactMessage();
        m1.setName("Thathsara Mendaka");
        m1.setEmail("thathsaramendaka@gmail.com");
        m1.setPhone("0777123456");
        m1.setSubject("Lab booking inquiry for next week");
        m1.setMessage(
                "I would like to know if Computer Lab A is available next Tuesday afternoon for a group project session. Please reply with available slots.");
        m1.setStatus("NEW");
        m1.setCreatedAt(base);
        repository.save(m1);

        ContactMessage m2 = new ContactMessage();
        m2.setName("Mendaka Peiris");
        m2.setEmail("mendakapeiris2003@gmail.com");
        m2.setPhone("0712345678");
        m2.setSubject("Faulty projector in Lecture Hall B");
        m2.setMessage(
                "The projector in Lecture Hall B flickers and shuts down after ten minutes. Several classes were affected today. Kindly schedule a technician visit soon.");
        m2.setStatus("NEW");
        m2.setCreatedAt(base.plusHours(2));
        repository.save(m2);

        ContactMessage m3 = new ContactMessage();
        m3.setName("Campus Faculty Rep");
        m3.setEmail("facultyrep@campus.edu");
        m3.setPhone("+94111222333");
        m3.setSubject("Access card renewal process");
        m3.setMessage(
                "Could you clarify the steps and documents needed to renew staff access cards before the new semester? We need this shared with our faculty reps by Friday.");
        m3.setStatus("NEW");
        m3.setCreatedAt(base.plusHours(5));
        repository.save(m3);
    }
}
