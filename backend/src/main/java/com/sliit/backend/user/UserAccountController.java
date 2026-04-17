package com.sliit.backend.user;

import com.sliit.backend.user.dto.UpdateUserRoleRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class UserAccountController {
    private final UserAccountService userAccountService;

    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public ResponseEntity<List<UserAccount>> getAllUsers() {
        return ResponseEntity.ok(userAccountService.getAllUsers());
    }

    @PatchMapping("/{email}/role")
    public ResponseEntity<UserAccount> updateRole(
            @PathVariable String email,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(userAccountService.updateRole(email, request.getRole()));
    }
}
