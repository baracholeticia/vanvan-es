package com.vanvan.enums;

public enum UserRole {
    ADMIN("admin"),
    MOTORISTA("motorista"),
    PASSAGEIRO("passageiro");

    private String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
