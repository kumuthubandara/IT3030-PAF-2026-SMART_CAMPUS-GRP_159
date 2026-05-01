package com.sliit.backend.user;

import com.sliit.backend.config.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-preferences")
@CrossOrigin(origins = "*")
public class NotificationPreferenceController {

    private final UserAccountService userAccountService;

    public NotificationPreferenceController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public ResponseEntity<NotificationPreferences> getMine() {
        String email = SecurityUtils.requireEmail();
        return ResponseEntity.ok(userAccountService.getEffectiveNotificationPreferences(email));
    }

    @PatchMapping
    public ResponseEntity<NotificationPreferences> updateMine(@RequestBody NotificationPreferences body) {
        String email = SecurityUtils.requireEmail();
        if (body == null) {
            body = new NotificationPreferences();
        }
        return ResponseEntity.ok(userAccountService.updateNotificationPreferences(email, body));
    }
}
