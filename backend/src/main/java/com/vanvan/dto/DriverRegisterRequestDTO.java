package com.vanvan.dto;

/*
* DTO para cadastrar Driver (composição com DTO de Passenger com mais alguns dados)
* **/
public record DriverRegisterRequestDTO(
    String name,
    String email,
    String password,
    String cpf,
    String phone,
    String role,
    String cnh,
    String pixKey
) implements RegisterDTO {
}