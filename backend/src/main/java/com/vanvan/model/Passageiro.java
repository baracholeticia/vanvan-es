package com.vanvan.model;

import com.vanvan.enums.UserRole;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "passageiros")
public class Passageiro extends Usuario {
    
    public Passageiro() {
        super();
    }

    public Passageiro(String nome, String cpf, String telefone, String email, String senha) {
        super(nome, cpf, telefone, email, senha, UserRole.PASSAGEIRO);
    } 
}
