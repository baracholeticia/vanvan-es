package com.vanvan.model;

import com.vanvan.enums.TripStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; //identificador da viagem

    @Embedded
    @AttributeOverride(name = "city", column = @Column(name = "departure_city"))
    @AttributeOverride(name = "street", column = @Column(name = "departure_street"))
    @AttributeOverride(name = "referencePoint", column = @Column(name = "departure_reference_point"))
    private Location departure; //local de saida

    @Embedded
    @AttributeOverride(name = "city", column = @Column(name = "arrival_city"))
    @AttributeOverride(name = "street", column = @Column(name = "arrival_street"))
    @AttributeOverride(name = "referencePoint", column = @Column(name = "arrival_reference_point"))
    private Location arrival; //local de chegada

    @Column(nullable = false)
    private LocalDate date; //data da viagem

    @Column(nullable = false)
    private LocalTime time; //horario da viagem

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver; //motorista responsavel

    @ManyToMany
    @JoinTable(
            name = "trip_passengers",
            joinColumns = @JoinColumn(name = "trip_id"),
            inverseJoinColumns = @JoinColumn(name = "passenger_id")
    )
    private List<Passenger> passengers = new ArrayList<>(); //passageiros da viagem

    @Column(nullable = false)
    private BigDecimal totalAmount; //valor total arrecadado

    @Column(nullable = false)
    private TripStatus status; //status atual da viagem


    //metodos da estrutura de dados
    public void addPassenger(Passenger passenger) {
        this.passengers.add(passenger);
        passenger.getTrips().add(this);
    }

    public void removePassenger(Passenger passenger) {
        this.passengers.remove(passenger);
        passenger.getTrips().remove(this);
    }
}