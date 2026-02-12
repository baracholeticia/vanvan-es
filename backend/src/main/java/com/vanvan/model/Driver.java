package com.vanvan.model;

import com.vanvan.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor//construtor sem argumentos
public class Driver extends User {
    
    @Column(name = "pix_key")
    private String pixKey;

    @Column(unique = true)
    private String cnh;

    public Driver(String name, String cpf, String phone, String email, String password,  String cnh, String pixKey) {
        super(name, cpf, phone, email, password, UserRole.DRIVER);
        this.cnh = cnh;
        this.pixKey = pixKey;
    }

}