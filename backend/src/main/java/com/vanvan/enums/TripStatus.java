package com.vanvan.enums;

import com.vanvan.exception.InvalidValueException;
import lombok.Getter;

@Getter
public enum TripStatus {

    CANCELLED("cancelada"),
    IN_PROGRESS("em-andamento"),
    COMPLETED("finalizada");

    private final String description;

    TripStatus(String description) {
        this.description = description;
    }

    public static TripStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidValueException("Status da viagem não informado");
        }

        for (TripStatus status : TripStatus.values()) {
            if (status.name().equalsIgnoreCase(value) ||
                    status.description.equalsIgnoreCase(value)) {
                return status;
            }
        }

        throw new InvalidValueException("Status de viagem inválido: " + value);
    }
}