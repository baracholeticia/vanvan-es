package com.vanvan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) //http 409
public class CnhAlreadyExistsException extends RuntimeException {
    public CnhAlreadyExistsException(String cnh) {
        super("CNH already exists: " + cnh);
    }
}
