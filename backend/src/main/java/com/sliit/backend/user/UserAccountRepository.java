package com.sliit.backend.user;

import com.sliit.backend.auth.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends MongoRepository<UserAccount, String> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    List<UserAccount> findByAccountStatus(AccountStatus accountStatus);

    List<UserAccount> findByRole(UserRole role);
}
