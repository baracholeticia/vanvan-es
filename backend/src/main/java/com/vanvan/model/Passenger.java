package com.vanvan.model;

import com.vanvan.enums.UserRole;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "passengers")
@NoArgsConstructor//construtor vazio
public class Passenger extends User {

    public Passenger(String name, String cpf, String phone, String email, String password) {
        super(name, cpf, phone, email, password, UserRole.PASSENGER);
    }
}