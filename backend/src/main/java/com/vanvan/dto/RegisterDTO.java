package com.vanvan.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.vanvan.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

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
/*
*  Pai comum para DTOs do sistema, com m
* **/
@Getter
@Setter
@NoArgsConstructor //todas as ferramentas para o Jackson funcionar
@AllArgsConstructor
public abstract class RegisterDTO {

    @NotNull
    @Size(min = 4, max = 120)
    protected String name;

    @Email
    @NotBlank
    protected String email;

    @NotBlank
    @Size(min = 8)//sem complicações aqui por ora
    protected String password;

    @Size(min = 11, max = 11, message = "CPF deve conter 11 dígitos")
    protected String cpf;//CPF agora como opcional

    @Pattern(regexp = "\\d{10,11}")
    @NotBlank
    protected String phone;

    @NotBlank
    protected String role;

    @Past
    @JsonFormat(pattern = "dd/MM/yyyy")
    protected LocalDate birthDate; //validado no service

    public abstract User toEntity();
}