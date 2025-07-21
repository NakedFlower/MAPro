package com.groom.MAPro.Controller;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="userRole")
@NoArgsConstructor
@Data
public class Role {
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private UserRoleType name;

    public Role(UserRoleType name) {
        this.name = name;
    }
}
