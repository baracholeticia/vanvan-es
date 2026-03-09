package com.vanvan.model;

import jakarta.persistence.*;
import com.vanvan.enums.UserRole;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.SQLRestriction;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@Getter
@Setter
public abstract class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)//nome obrigatorio
    private String name;

    @Column(unique = true, nullable = false, length = 11)//cpf obrigatorio
    private String cpf;

    @Column(nullable = false, length = 15)//telefone obrigatorio
    private String phone;

    @Column(unique = true, nullable = false)//email obrigatorio
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private boolean active = true;

    protected User() {
    }

    protected User(String name, String cpf, String phone, String email, String password, UserRole role, LocalDate birthDate) {
        this.name = name;
        this.cpf = cpf;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.role = role;
        this.birthDate = birthDate;
    }

    @Override
    @NullMarked
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == UserRole.DRIVER) {
            return List.of(new SimpleGrantedAuthority("ROLE_DRIVER"));
        }
        if (this.role == UserRole.PASSENGER) {
            return List.of(new SimpleGrantedAuthority("ROLE_PASSENGER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
    }
    @Override
    @NullMarked
    public String getUsername(){
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.active;
    }

}