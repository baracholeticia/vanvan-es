package com.vanvan.service;

import com.vanvan.dto.*;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.DriverNotFoundException;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Location;
import com.vanvan.model.Trip;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.TripRepository;
import com.vanvan.repository.TripSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final PassengerRepository passengerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TripDetailsDTO createTrip(CreateTripDTO dto) {

        Driver driver = driverRepository.findById(dto.getDriverId())
                .orElseThrow(DriverNotFoundException::new);

        Trip trip = new Trip();

        var departureDTO = dto.getDeparture();
        var departure = new Location(departureDTO.getCity(), departureDTO.getStreet(), departureDTO.getReference());

        var arrivalDTO = dto.getArrival();
        var arrival = new Location(arrivalDTO.getCity(), arrivalDTO.getStreet(), arrivalDTO.getReference());

        trip.setDriver(driver);
        trip.setDeparture(departure);
        trip.setArrival(arrival);
        trip.setDate(dto.getDate());
        trip.setPassengers(passengerRepository.findAllById(dto.getPassengerIds()));
        trip.setStatus(TripStatus.SCHEDULED);

        tripRepository.save(trip);

        return TripDetailsDTO.fromEntity(trip);
    }

    // busca historico de viagens com filtros dinamicos
    public Page<TripHistoryDTO> getTripHistory(
            LocalDate startDate, LocalDate endDate,
            UUID driverId,
            String departureCity,
            String arrivalCity,
            TripStatus status,
            Pageable pageable
    ) {
        return tripRepository.findAll(
                TripSpecification.filter(startDate, endDate, driverId, departureCity, arrivalCity, status),
                pageable
        ).map(this::toHistoryDTO);
    }

    // busca detalhes de uma viagem pelo id
    public TripDetailsDTO getTripDetails(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new TripNotFoundException(id.toString()));

        return toDetailsDTO(trip);
    }

    // retorna snapshot de todas as viagens para o painel de monitoramento do admin
    // status é opcional — sem ele retorna todas
    public Page<TripMonitorDTO> getMonitoringData(TripStatus status, Pageable pageable) {
        return tripRepository.findAll(
                TripSpecification.filter(null, null, null, null, null, status),
                pageable
        ).map(TripMonitorDTO::fromEntity);
    }

    // a cada 15 segundos empurra as viagens IN_PROGRESS para os admins conectados via WebSocket
    @Scheduled(fixedDelay = 15000)
    public void broadcastActiveTrips() {
        var activeTrips = tripRepository.findAll(
                TripSpecification.filter(null, null, null, null, null, TripStatus.IN_PROGRESS),
                Pageable.unpaged()
        ).map(TripMonitorDTO::fromEntity).getContent();

        messagingTemplate.convertAndSend("/topic/monitoring", activeTrips);
    }

    // converte entidade para dto simplificado
    private TripHistoryDTO toHistoryDTO(Trip trip) {
        String route = trip.getDeparture().getCity() + " -> " + trip.getArrival().getCity();

        return new TripHistoryDTO(
                trip.getId(),
                trip.getDate(),
                trip.getDriver().getName(),
                route,
                trip.getPassengers().size(),
                trip.getTotalAmount(),
                trip.getStatus()
        );
    }

    // converte entidade para dto detalhado
    private TripDetailsDTO toDetailsDTO(Trip trip) {
        return new TripDetailsDTO(
                trip.getId(),
                trip.getDate(),
                trip.getTime(),
                trip.getDriver().getName(),
                trip.getPassengers()
                        .stream()
                        .map(p -> new PassengerDTO(p.getId(), p.getName()))
                        .toList(),
                trip.getDeparture().getCity(),
                trip.getArrival().getCity(),
                trip.getTotalAmount(),
                trip.getStatus()
        );
    }
}