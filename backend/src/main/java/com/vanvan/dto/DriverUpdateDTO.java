package com.vanvan.dto;

import com.vanvan.enums.RegistrationStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DriverUpdateDTO(

    @Size(min = 4, max = 120)
    String name,

    @Email
    String email,

    @Pattern(regexp = "\\d{10,11}")
    String phone,

    @Pattern(regexp = "\\d{11}")
    String cnh,

    @Size(min = 11, max = 11, message = "CPF deve conter 11 dígitos")
    String cpf,

    RegistrationStatus registrationStatus
) {}
