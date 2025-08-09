package com.groom.MAPro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.groom.MAPro.entity.User;

@Repository
// UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);  // findByEmail -> findByUsername
    boolean existsByUsername(String username);       // existsByEmail -> existsByUsername
}
