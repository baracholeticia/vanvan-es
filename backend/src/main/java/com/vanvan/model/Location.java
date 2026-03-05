package com.vanvan.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Embeddable
@Getter
@Setter
public class Location {

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String street;

    private String referencePoint;


}
