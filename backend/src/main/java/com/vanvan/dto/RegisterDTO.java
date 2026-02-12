package com.vanvan.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "role",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = RegisterRequestDTO.class, names = {"passenger", "admin"}),
    @JsonSubTypes.Type(value = DriverRegisterRequestDTO.class, name = "driver")
})
public sealed interface RegisterDTO permits RegisterRequestDTO, DriverRegisterRequestDTO {
    String role();
    String name();      // Vamos garantir que todos tenham nome
    String email();
    String password();
    String cpf();
    String phone();
}