package com.vanvan.model;

import com.vanvan.enums.UserRole;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "passengers")
@NoArgsConstructor//construtor vazio
public class Passenger extends User {



    @ManyToMany(mappedBy = "passengers")
    private List<Trip> trips = new ArrayList<>(); //historico de viagens do passageiro

    public Passenger(String name, String cpf, String phone, String email, String password, LocalDate birthDate) {
        super(name, cpf, phone, email, password, UserRole.PASSENGER, birthDate);
    }


    //metodos do historico
    public void addTrip(Trip trip) {
        this.trips.add(trip);
        trip.getPassengers().add(this);
    }

    public void removeTrip(Trip trip) {
        this.trips.remove(trip);
        trip.getPassengers().remove(this);
    }

    public List<Trip> getTrips() {
        return trips;
    }
}