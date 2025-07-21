package com.groom.MAPro.Repository;

import com.groom.MAPro.Controller.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

}
