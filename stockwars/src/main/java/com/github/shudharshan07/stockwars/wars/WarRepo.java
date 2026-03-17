package com.github.shudharshan07.stockwars.wars;

import com.github.shudharshan07.stockwars.auth.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WarRepo extends JpaRepository<Wars, UUID> {
//    boolean existsByWarCode(String code);
    Optional<Wars> findByWarCode(String code);
    boolean existsByCreatedBy(Users user);
}
