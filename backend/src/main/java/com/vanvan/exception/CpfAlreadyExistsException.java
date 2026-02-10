package com.vanvan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) //http 409
public class CpfAlreadyExistsException extends RuntimeException {
    public CpfAlreadyExistsException(String cpf) {
        super("CPF already exists: " + cpf);
    }
}