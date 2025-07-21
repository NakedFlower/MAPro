package com.groom.MAPro.Controller;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user")
@Data
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String userId;
    private String password;
    private String name;
    private String email;

    @OneToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "userRole",
            joinColumns = @JoinColumn(name = "id"),
            inverseJoinColumns = @JoinColumn(name = "id")
    )
    private Set<Role> role = new HashSet<>();
}
