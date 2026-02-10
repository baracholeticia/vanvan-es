package com.vanvan.model;

import com.vanvan.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "motoristas")
public class Motorista extends Usuario {
    
    @Column(name = "chave_pix")
    private String chavePix;

    @Column(unique = true)
    private String cnh;

    public Motorista() {
        super();
    }

    public Motorista(String nome, String cpf, String telefone, String email, String senha, String chavePix, String cnh) {
        super(nome, cpf, telefone, email, senha, UserRole.MOTORISTA);
        this.chavePix = chavePix;
        this.cnh = cnh;
    }

    public String getChavePix() {
        return chavePix;
    }
    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

    public String getCnh() {
        return cnh;
    }
    public void setCnh(String cnh) {
        this.cnh = cnh;
    }
}
