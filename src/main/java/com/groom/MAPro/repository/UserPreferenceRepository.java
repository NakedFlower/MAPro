package com.groom.MAPro.repository;

import com.groom.MAPro.entity.PreferenceOption;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    List<UserPreference> findByUser(User user);
    Optional<UserPreference> findByUserAndOption(User user, PreferenceOption option);
}
