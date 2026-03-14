package com.vanvan.dto;

import com.vanvan.enums.TripStatus;
import com.vanvan.model.Trip;
import com.vanvan.model.Vehicle;

import java.time.LocalDate;
import java.util.List;

public record TripMonitorDTO(
        Long id,
        LocalDate date,
        String driverName,
        String vehicleModel,
        String vehicleLicensePlate,
        String departureCity,
        String arrivalCity,
        int passengerCount,
        TripStatus status
) {
    public static TripMonitorDTO fromEntity(Trip trip) {
        // Pega o primeiro veículo do motorista, se existir
        List<? extends Vehicle> vehicles = trip.getDriver().getVehicles();
        String model = null;
        String plate = null;

        if (vehicles != null && !vehicles.isEmpty()) {
            Vehicle v = vehicles.get(0);
            model = v.getModelName();
            plate = v.getLicensePlate();
        }

        return new TripMonitorDTO(
                trip.getId(),
                trip.getDate(),
                trip.getDriver().getName(),
                model,
                plate,
                trip.getDeparture().getCity(),
                trip.getArrival().getCity(),
                trip.getPassengers().size(),
                trip.getStatus()
        );
    }
}