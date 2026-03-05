package com.vanvan.exception;

public class TripNotFoundException extends RuntimeException {
    public TripNotFoundException(String id) {
        super("Viagem não encontrada: " + id);
    }
}
