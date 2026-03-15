package com.vanvan.service;

import com.vanvan.dto.CreateTripDTO;
import com.vanvan.dto.LocationDTO;
import com.vanvan.dto.TripDetailsDTO;
import com.vanvan.dto.TripHistoryDTO;
import com.vanvan.dto.TripMonitorDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.DriverNotFoundException;
import com.vanvan.exception.InvalidStatusTransitionException;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Location;
import com.vanvan.model.Passenger;
import com.vanvan.model.Pricing;
import com.vanvan.model.Trip;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class TripServiceTest {

    private TripRepository tripRepository;
    private SimpMessagingTemplate messagingTemplate;
    private TripService tripService;
    private DriverRepository driverRepository;
    private PassengerRepository passengerRepository;
    private GeocodingService geocodingService;
    private RoutingService routingService;
    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        tripRepository = mock(TripRepository.class);
        driverRepository = mock(DriverRepository.class);
        passengerRepository = mock(PassengerRepository.class);
        messagingTemplate = mock(SimpMessagingTemplate.class);
        geocodingService = mock(GeocodingService.class);
        routingService = mock(RoutingService.class);
        pricingService = mock(PricingService.class);

        tripService = new TripService(
                tripRepository,
                driverRepository,
                passengerRepository,
                messagingTemplate,
                geocodingService,
                routingService,
                pricingService
        );
    }

    // getTripDetails

    @Test
    void testGetTripDetails_notFound() {
        when(tripRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(TripNotFoundException.class, () -> tripService.getTripDetails(1L));
    }

    // getTripHistory

    @Test
    void testGetTripHistory() {
        Passenger passenger = new Passenger(
                "Allice", "52998224725", "11999999999",
                "allice@email.com", "senha123", LocalDate.of(2000, 1, 1)
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
        trip1.setTotalAmount(100.0);
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
        Passenger passenger1 = new Passenger("Allice", "52998224725", "11999999999",
                "allice@email.com", "senha123", LocalDate.of(2000, 1, 1));
        Passenger passenger2 = new Passenger("Alexandre", "61517247047", "11988888888",
                "alexandre@email.com", "senha123", LocalDate.of(1998, 5, 5));

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
        trip.setTotalAmount(200.0);
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
        assertEquals(Double.valueOf(200.0), dto.getTotalAmount());
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

    // getMonitoringData

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

    // broadcastActiveTrips

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
                .convertAndSend(eq("/topic/monitoring"), ArgumentMatchers.<List<TripMonitorDTO>>any());
    }

    @Test
    void testBroadcastActiveTrips_emptyList_stillBroadcasts() {
        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        tripService.broadcastActiveTrips();

        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/monitoring"), ArgumentMatchers.<List<TripMonitorDTO>>any());
    }

    // createTrip

    @Test
    void createTrip_driverNotFound_throws() {
        CreateTripDTO dto = buildCreateTripDTO(UUID.randomUUID());
        when(driverRepository.findById(dto.getDriverId())).thenReturn(Optional.empty());

        assertThrows(DriverNotFoundException.class, () -> tripService.createTrip(dto));
    }

    @Test
    void createTrip_success() {
        UUID driverId = UUID.randomUUID();
        Driver driver = new Driver();
        driver.setId(driverId);
        driver.setName("Motorista");

        Passenger passenger = new Passenger("Allice", "52998224725", "11999999999",
                "allice@email.com", "senha", LocalDate.of(2000, 1, 1));
        passenger.setId(UUID.randomUUID());

        Pricing pricing = new Pricing();
        pricing.setMinimumFare(10.0);
        pricing.setPerKmRate(1.5);

        CreateTripDTO dto = buildCreateTripDTO(driverId);
        dto.setPassengerIds(List.of(passenger.getId()));

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(geocodingService.getCoordinates("Caruaru")).thenReturn(new double[]{-8.28, -35.97});
        when(geocodingService.getCoordinates("Garanhuns")).thenReturn(new double[]{-8.88, -36.49});
        when(routingService.calculateRoute(any(), any()))
                .thenReturn(new RoutingService.RouteResult(130.0, 90.0));
        when(pricingService.getPricing()).thenReturn(pricing);
        when(passengerRepository.findAllById(any())).thenReturn(List.of(passenger));

        Trip savedTrip = new Trip();
        savedTrip.setId(1L);
        savedTrip.setDriver(driver);
        savedTrip.setDeparture(new Location("Caruaru", "Rua A", ""));
        savedTrip.setArrival(new Location("Garanhuns", "Rua B", ""));
        savedTrip.setDate(dto.getDate());
        savedTrip.setTime(dto.getTime());
        savedTrip.setPassengers(List.of(passenger));
        savedTrip.setStatus(TripStatus.SCHEDULED);
        savedTrip.setTotalAmount(195.0);
        savedTrip.setDistanceKm(130.0);
        savedTrip.setDurationMinutes(90.0);

        when(tripRepository.save(any())).thenReturn(savedTrip);

        TripDetailsDTO result = tripService.createTrip(dto);

        assertNotNull(result);
        assertEquals("Caruaru", result.getDepartureCity());
        assertEquals("Garanhuns", result.getArrivalCity());
        assertEquals(TripStatus.SCHEDULED, result.getStatus());
    }

    @Test
    void createTrip_usesDefaultPerKmRate_whenNotProvided() {
        UUID driverId = UUID.randomUUID();
        Driver driver = new Driver();
        driver.setId(driverId);
        driver.setName("Motorista");

        Passenger passenger = new Passenger("Alexandre", "61517247047", "11988888888",
                "alexandre@email.com", "senha", LocalDate.of(1995, 1, 1));
        passenger.setId(UUID.randomUUID());

        Pricing pricing = new Pricing();
        pricing.setMinimumFare(10.0);
        pricing.setPerKmRate(2.0);

        CreateTripDTO dto = buildCreateTripDTO(driverId);
        dto.setPerKmRate(null);
        dto.setPassengerIds(List.of(passenger.getId()));

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(geocodingService.getCoordinates(any())).thenReturn(new double[]{-8.28, -35.97});
        when(routingService.calculateRoute(any(), any()))
                .thenReturn(new RoutingService.RouteResult(50.0, 60.0));
        when(pricingService.getPricing()).thenReturn(pricing);
        when(passengerRepository.findAllById(any())).thenReturn(List.of(passenger));

        Trip savedTrip = new Trip();
        savedTrip.setId(2L);
        savedTrip.setDriver(driver);
        savedTrip.setDeparture(new Location("Caruaru", "", ""));
        savedTrip.setArrival(new Location("Garanhuns", "", ""));
        savedTrip.setDate(dto.getDate());
        savedTrip.setTime(dto.getTime());
        savedTrip.setPassengers(List.of(passenger));
        savedTrip.setStatus(TripStatus.SCHEDULED);
        savedTrip.setTotalAmount(100.0);

        when(tripRepository.save(any())).thenReturn(savedTrip);

        TripDetailsDTO result = tripService.createTrip(dto);
        assertNotNull(result);
        assertEquals(TripStatus.SCHEDULED, result.getStatus());
    }

    // updateStatus

    @Test
    void updateStatus_tripNotFound_throws() {
        when(tripRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TripNotFoundException.class,
                () -> tripService.updateStatus(99L, TripStatus.IN_PROGRESS));
    }

    @Test
    void updateStatus_invalidTransition_throws() {
        Trip trip = buildTripInProgress();
        trip.setId(1L);
        UUID driverId = UUID.randomUUID();
        trip.getDriver().setId(driverId);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(driverId);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        assertThrows(InvalidStatusTransitionException.class,
                () -> tripService.updateStatus(1L, TripStatus.SCHEDULED));

        SecurityContextHolder.clearContext();
    }

    @Test
    void updateStatus_validTransition_success() {
        Trip trip = buildTripInProgress();
        trip.setId(1L);
        UUID driverId = UUID.randomUUID();
        trip.getDriver().setId(driverId);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(tripRepository.save(any())).thenReturn(trip);
        when(tripRepository.findAll(
                ArgumentMatchers.<Specification<Trip>>any(),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of()));

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(driverId);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        TripDetailsDTO result = tripService.updateStatus(1L, TripStatus.COMPLETED);

        assertNotNull(result);
        assertEquals(TripStatus.COMPLETED, trip.getStatus());
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateStatus_wrongDriver_throws() {
        Trip trip = buildTripInProgress();
        trip.setId(1L);
        trip.getDriver().setId(UUID.randomUUID());

        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));

        UUID outroDriverId = UUID.randomUUID();
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(outroDriverId);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> tripService.updateStatus(1L, TripStatus.COMPLETED));

        SecurityContextHolder.clearContext();
    }

    // exceptions

    @Test
    void invalidStatusTransitionException_message() {
        var ex = new InvalidStatusTransitionException(
                TripStatus.COMPLETED, TripStatus.SCHEDULED);
        assertTrue(ex.getMessage().contains("COMPLETED"));
        assertTrue(ex.getMessage().contains("SCHEDULED"));
    }

    @Test
    void unknownErrorException_message() {
        var ex = new com.vanvan.exception.UnknownErrorException("erro inesperado");
        assertEquals("erro inesperado", ex.getMessage());
    }

    // helpers

    private Trip buildTripInProgress() {
        Vehicle vehicle = mock(Vehicle.class);
        when(vehicle.getModelName()).thenReturn("Sprinter");
        when(vehicle.getLicensePlate()).thenReturn("ABC1D23");

        Driver driver = new Driver();
        driver.setName("Driver Monitor");
        driver.setVehicles(List.of(vehicle));

        Location departure = new Location();
        departure.setCity("OrigemCity");

        Location arrival = new Location();
        arrival.setCity("DestinoCity");

        Passenger p1 = new Passenger("P1", "71428793860", "11111111111",
                "p1@x.com", "pass", LocalDate.of(2000, 1, 1));
        Passenger p2 = new Passenger("P2", "11144477735", "22222222222",
                "p2@x.com", "pass", LocalDate.of(2000, 1, 1));

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

    private CreateTripDTO buildCreateTripDTO(UUID driverId) {
        LocationDTO departure = new LocationDTO();
        departure.setCity("Caruaru");
        departure.setStreet("Rua A");
        departure.setReference("");

        LocationDTO arrival = new LocationDTO();
        arrival.setCity("Garanhuns");
        arrival.setStreet("Rua B");
        arrival.setReference("");

        CreateTripDTO dto = new CreateTripDTO();
        dto.setDriverId(driverId);
        dto.setDate(LocalDate.now().plusDays(1));
        dto.setTime(LocalTime.of(10, 0));
        dto.setDeparture(departure);
        dto.setArrival(arrival);
        dto.setPassengerIds(List.of(UUID.randomUUID()));
        dto.setPerKmRate(1.5);
        return dto;
    }
}