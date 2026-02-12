package com.vanvan.dto;

/*
* Como há DTOs diferentes, cria-se essa "herança"
* **/
public record RegisterRequestDTO(
    String name,
    String email,
    String password,
    String cpf,
    String phone,
    String role
) implements RegisterDTO {}