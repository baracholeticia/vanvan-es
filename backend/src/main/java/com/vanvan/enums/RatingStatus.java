package com.vanvan.enums;

import lombok.Getter;

@Getter
public enum RatingStatus {
    VISIBLE("visible"),
    HIDDEN("hidden");

    private final String description;

    RatingStatus(String description) {
        this.description = description;
    }
}
