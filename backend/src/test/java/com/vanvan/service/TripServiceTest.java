package com.vanvan.service;

import com.vanvan.dto.TripHistoryDTO;
import com.vanvan.dto.TripMonitorDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.Trip;
import com.vanvan.model.Location;
import com.vanvan.model.Vehicle;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TripServiceTest {

    private TripRepository tripRepository;
    private SimpMessagingTemplate messagingTemplate; // ← campo declarado
    private TripService tripService;

    @BeforeEach
    void setUp() {
        tripRepository = mock(TripRepository.class);
        DriverRepository driverRepository = mock(DriverRepository.class);
        PassengerRepository passengerRepository = mock(PassengerRepository.class);
        messagingTemplate = mock(SimpMessagingTemplate.class); // ← mockado
        tripService = new TripService(tripRepository, driverRepository, passengerRepository, messagingTemplate);
    }

    @Test
    void testGetTripDetails_notFound() {
        when(tripRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(TripNotFoundException.class, () -> tripService.getTripDetails(1L));
    }

    @Test
    void testGetTripHistory() {
        Passenger passenger = new Passenger(
                "Alice", "12345678900", "11999999999",
                "alice@email.com", "senha123", LocalDate.of(2000, 1, 1)
        );

        Trip trip1 = new Trip();
        trip1.setId(1L);
        trip1.setDate(LocalDate.now());

        Driver driver = new Driver();
        driver.setName("Driver1");
        trip1.setDriver(driver);

        Location departure = new Location();
        departure.setCity("CityA");
        trip1.setDeparture(departure);

        Location arrival = new Location();
        arrival.setCity("CityB");
        trip1.setArrival(arrival);

        trip1.setPassengers(List.of(passenger));
        trip1.setTotalAmount(BigDecimal.valueOf(100.0));
        trip1.setStatus(TripStatus.COMPLETED);

        Page<Trip> pageTrips = new PageImpl<>(List.of(trip1));

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(pageTrips);

        Page<TripHistoryDTO> result = tripService.getTripHistory(
                LocalDate.now(), LocalDate.now().plusDays(1),
                null, null, null, null, Pageable.unpaged()
        );

        assertEquals(1, result.getTotalElements());
        TripHistoryDTO dto = result.getContent().getFirst();
        assertEquals("CityA -> CityB", dto.getRoute());
        assertEquals("Driver1", dto.getDriverName());
        assertEquals(1, dto.getPassengerCount());
    }

    @Test
    void testGetTripHistory_multiplePassengers() {
        Passenger passenger1 = new Passenger("Alice","12345678900","11999999999","alice@email.com","senha123", LocalDate.of(2000,1,1));
        Passenger passenger2 = new Passenger("Bob","98765432100","11988888888","bob@email.com","senha123", LocalDate.of(1998,5,5));

        Trip trip = new Trip();
        trip.setId(1L);
        trip.setDate(LocalDate.now());

        Driver driver = new Driver();
        driver.setName("DriverX");
        trip.setDriver(driver);

        Location departure = new Location();
        departure.setCity("CityStart");
        trip.setDeparture(departure);

        Location arrival = new Location();
        arrival.setCity("CityEnd");
        trip.setArrival(arrival);

        trip.setPassengers(List.of(passenger1, passenger2));
        trip.setTotalAmount(new BigDecimal("200.0"));
        trip.setStatus(TripStatus.CANCELLED);

        Page<Trip> pageTrips = new PageImpl<>(List.of(trip));

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(pageTrips);

        Page<TripHistoryDTO> result = tripService.getTripHistory(
                LocalDate.now(), LocalDate.now().plusDays(1),
                null, null, null, null, Pageable.unpaged()
        );

        assertEquals(1, result.getTotalElements());
        TripHistoryDTO dto = result.getContent().getFirst();
        assertEquals("CityStart -> CityEnd", dto.getRoute());
        assertEquals(2, dto.getPassengerCount());
        assertEquals(TripStatus.CANCELLED, dto.getStatus());
        assertEquals(new BigDecimal("200.0"), dto.getTotalAmount());
        assertEquals("DriverX", dto.getDriverName());
    }

    @Test
    void testGetTripHistory_emptyResult() {
        Page<Trip> emptyPage = new PageImpl<>(List.of());

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(emptyPage);

        Page<TripHistoryDTO> result = tripService.getTripHistory(
                LocalDate.now(), LocalDate.now().plusDays(1),
                null, null, null, null, Pageable.unpaged()
        );

        assertTrue(result.isEmpty());
    }

    // ── getMonitoringData ────────────────────────────────────────

    @Test
    void testGetMonitoringData_returnsAllWhenNoStatusFilter() {
        Trip trip = buildTripInProgress();
        Page<Trip> page = new PageImpl<>(List.of(trip));

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(page);

        Page<TripMonitorDTO> result = tripService.getMonitoringData(null, Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        TripMonitorDTO dto = result.getContent().getFirst();
        assertEquals("Driver Monitor", dto.driverName());
        assertEquals("OrigemCity", dto.departureCity());
        assertEquals("DestinoCity", dto.arrivalCity());
        assertEquals(TripStatus.IN_PROGRESS, dto.status());
        assertEquals(2, dto.passengerCount());
    }

    @Test
    void testGetMonitoringData_filteredByStatus() {
        Page<Trip> emptyPage = new PageImpl<>(List.of());

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(emptyPage);

        Page<TripMonitorDTO> result = tripService.getMonitoringData(TripStatus.SCHEDULED, Pageable.unpaged());

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetMonitoringData_vehicleInfoPresentWhenDriverHasVehicle() {
        Trip trip = buildTripInProgress();
        Page<Trip> page = new PageImpl<>(List.of(trip));

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(page);

        Page<TripMonitorDTO> result = tripService.getMonitoringData(null, Pageable.unpaged());

        TripMonitorDTO dto = result.getContent().getFirst();
        assertEquals("Sprinter", dto.vehicleModel());
        assertEquals("ABC1D23", dto.vehicleLicensePlate());
    }

    // ── broadcastActiveTrips ─────────────────────────────────────

    @Test
    void testBroadcastActiveTrips_callsMessagingTemplate() {
        Trip trip = buildTripInProgress();
        Page<Trip> page = new PageImpl<>(List.of(trip));

        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(page);

        tripService.broadcastActiveTrips();

        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/monitoring"), Optional.ofNullable(ArgumentMatchers.any()));
    }

    @Test
    void testBroadcastActiveTrips_emptyList_stillBroadcasts() {
        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        tripService.broadcastActiveTrips();

        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/monitoring"), Optional.ofNullable(ArgumentMatchers.any()));
    }

    // ── helper ───────────────────────────────────────────────────

    private Trip buildTripInProgress() {
        // Vehicle mockado corretamente
        Vehicle vehicle = mock(Vehicle.class);
        when(vehicle.getModelName()).thenReturn("Sprinter");
        when(vehicle.getLicensePlate()).thenReturn("ABC1D23");

        // Driver instanciado normalmente — getVehicles() retorna lista real
        Driver driver = new Driver();
        driver.setName("Driver Monitor");
        driver.setVehicles(List.of(vehicle)); // ← setter direto, sem mock em classe concreta

        Location departure = new Location();
        departure.setCity("OrigemCity");

        Location arrival = new Location();
        arrival.setCity("DestinoCity");

        Passenger p1 = new Passenger("P1","11111111111","TEL1","p1@x.com","pass", LocalDate.of(2000,1,1));
        Passenger p2 = new Passenger("P2","22222222222","TEL2","p2@x.com","pass", LocalDate.of(2000,1,1));

        Trip trip = new Trip();
        trip.setId(99L);
        trip.setDate(LocalDate.now());
        trip.setDriver(driver);
        trip.setDeparture(departure);
        trip.setArrival(arrival);
        trip.setPassengers(List.of(p1, p2));
        trip.setStatus(TripStatus.IN_PROGRESS);

        return trip;
    }
}