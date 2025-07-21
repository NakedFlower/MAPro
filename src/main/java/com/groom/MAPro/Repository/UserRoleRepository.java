package com.groom.MAPro.Repository;

import com.groom.MAPro.Controller.Role;
import com.groom.MAPro.Controller.UserRoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(UserRoleType name);

}
